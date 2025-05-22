import type { APIRoute, APIContext } from 'astro';
import { supabaseAdmin } from '@/lib/db/supabase';

interface SongAddResult {
  songId: string;
  status: 'added' | 'duplicate' | 'error' | 'forbidden';
  message: string;
}

// Add songs to a playlist
export const POST: APIRoute = async (context: APIContext) => {
  const { userId: clerkUserId } = context.locals.auth();

  if (!clerkUserId) {
    return new Response(
      JSON.stringify({ error: 'Unauthorised. User must be logged in.' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const body = await context.request.json();
    const { playlistId, songIds } = body;

    if (!playlistId || typeof playlistId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'playlistId (string) is required.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (
      !Array.isArray(songIds) ||
      songIds.length === 0 ||
      !songIds.every((id) => typeof id === 'string')
    ) {
      return new Response(
        JSON.stringify({
          error: 'songIds (array of strings) is required and cannot be empty.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 1. Get internal user ID
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (userError || !userData) {
      console.error('Error finding user:', userError);
      return new Response(JSON.stringify({ error: 'User not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const internalUserId = userData.id;

    // 2. Verify playlist ownership
    const { data: playlistData, error: playlistError } = await supabaseAdmin
      .from('playlists')
      .select('user_id')
      .eq('id', playlistId)
      .single();

    if (playlistError || !playlistData) {
      console.error(
        'Error fetching playlist or playlist not found:',
        playlistError
      );
      return new Response(JSON.stringify({ error: 'Playlist not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (playlistData.user_id !== internalUserId) {
      // If user does not own the playlist, all songs will be marked as forbidden.
      const results: SongAddResult[] = songIds.map((id) => ({
        songId: id,
        status: 'forbidden',
        message: 'Forbidden. You do not own this playlist.',
      }));
      return new Response(
        JSON.stringify({
          error: 'Forbidden. You do not own this playlist.',
          results,
          summary: {
            totalProcessed: songIds.length,
            successfullyAdded: 0,
            duplicates: 0,
            forbidden: songIds.length,
            errors: 0,
          },
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Fetch existing songs in the playlist to check for duplicates and get max order
    const { data: existingPlaylistSongsData, error: fetchExistingError } =
      await supabaseAdmin
        .from('playlist_songs')
        .select('song_id, order_in_playlist')
        .eq('playlist_id', playlistId)
        .order('order_in_playlist', { ascending: false });

    if (fetchExistingError) {
      console.error(
        'Error fetching existing songs in playlist:',
        fetchExistingError
      );
      return new Response(
        JSON.stringify({ error: 'Error verifying songs in playlist.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const existingSongIds = new Set(
      existingPlaylistSongsData.map((s) => s.song_id)
    );
    let currentMaxOrder = -1;
    if (existingPlaylistSongsData.length > 0) {
      currentMaxOrder = existingPlaylistSongsData[0].order_in_playlist;
    }

    const songsToInsert: {
      playlist_id: string;
      song_id: string;
      order_in_playlist: number;
    }[] = [];
    const results: SongAddResult[] = [];
    let nextOrderInPlaylist = currentMaxOrder + 1;

    for (const songId of songIds) {
      if (existingSongIds.has(songId)) {
        results.push({
          songId,
          status: 'duplicate',
          message: 'Song already exists in this playlist.',
        });
      } else {
        // Mark for insertion, actual status will be determined after insert attempt
        songsToInsert.push({
          playlist_id: playlistId,
          song_id: songId,
          order_in_playlist: nextOrderInPlaylist,
        });
        nextOrderInPlaylist++;
      }
    }

    let successfullyAddedCount = 0;
    let errorCount = 0;

    if (songsToInsert.length > 0) {
      const { data: insertedSongs, error: insertError } = await supabaseAdmin
        .from('playlist_songs')
        .insert(songsToInsert)
        .select('song_id');

      if (insertError) {
        console.error(
          'Error inserting songs into playlist_songs:',
          insertError
        );
        // If batch insert fails, mark all songs intended for this batch as errored.
        songsToInsert.forEach((song) => {
          results.push({
            songId: song.song_id,
            status: 'error',
            message: `Failed to add song to playlist. Details: ${insertError.message}`,
          });
        });
        errorCount = songsToInsert.length;
      } else {
        // All songs in songsToInsert were successfully added
        insertedSongs?.forEach((insertedSong) => {
          results.push({
            songId: insertedSong.song_id,
            status: 'added',
            message: 'Song added to playlist successfully.',
          });
        });
        successfullyAddedCount = insertedSongs?.length || 0;
      }
    }

    const finalSummary = {
      totalProcessed: songIds.length,
      successfullyAdded: successfullyAddedCount,
      duplicates: results.filter((r) => r.status === 'duplicate').length,
      forbidden: 0,
      errors: errorCount,
    };

    // Determine overall status code
    // 207 Multi-Status is appropriate for batch operations with mixed results.
    // 201 Created if all new songs were added successfully.
    // 409 Conflict if all songs were duplicates (and no new ones attempted or failed).
    let httpStatus = 207; // Multi-Status
    if (
      successfullyAddedCount === songsToInsert.length &&
      songsToInsert.length > 0 &&
      errorCount === 0 &&
      finalSummary.duplicates === 0
    ) {
      httpStatus = 201; // All new songs added
    } else if (
      finalSummary.duplicates === songIds.length &&
      songIds.length > 0
    ) {
      httpStatus = 409; // All were duplicates
    }

    return new Response(
      JSON.stringify({
        results,
        summary: finalSummary,
      }),
      {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Server error adding songs to playlist:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error.',
        details: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// Remove a song from a playlist
export const DELETE: APIRoute = async (context: APIContext) => {
  const { userId: clerkUserId } = context.locals.auth();

  if (!clerkUserId) {
    return new Response(
      JSON.stringify({ error: 'Unauthorised. User must be logged in.' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const playlistId = context.url.searchParams.get('playlistId');
    const songId = context.url.searchParams.get('songId');

    if (!playlistId || typeof playlistId !== 'string') {
      return new Response(
        JSON.stringify({
          error: 'playlistId (string) query parameter is required.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!songId || typeof songId !== 'string') {
      return new Response(
        JSON.stringify({
          error: 'songId (string) query parameter is required.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 1. Get internal user ID
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (userError || !userData) {
      console.error('Error finding user:', userError);
      return new Response(JSON.stringify({ error: 'User not found.' }), {
        status: userError?.code === 'PGRST116' ? 404 : 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const internalUserId = userData.id;

    // 2. Verify playlist ownership
    const { data: playlistData, error: playlistError } = await supabaseAdmin
      .from('playlists')
      .select('user_id')
      .eq('id', playlistId)
      .single();

    if (playlistError || !playlistData) {
      console.error(
        'Error fetching playlist or playlist not found:',
        playlistError
      );
      return new Response(JSON.stringify({ error: 'Playlist not found.' }), {
        status: playlistError?.code === 'PGRST116' ? 404 : 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (playlistData.user_id !== internalUserId) {
      return new Response(
        JSON.stringify({ error: 'Forbidden. You do not own this playlist.' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Get the song's order in the playlist before deleting
    const { data: songToRemoveData, error: fetchSongError } =
      await supabaseAdmin
        .from('playlist_songs')
        .select('order_in_playlist')
        .eq('playlist_id', playlistId)
        .eq('song_id', songId)
        .single();

    if (fetchSongError || !songToRemoveData) {
      console.error(
        'Error fetching song to remove or song not in playlist:',
        fetchSongError
      );
      return new Response(
        JSON.stringify({ error: 'Song not found in this playlist.' }),
        {
          status: 404, // PGRST116 would mean "no rows found"
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    const deletedSongOrder = songToRemoveData.order_in_playlist;

    // 4. Delete the song from the playlist
    const { error: deleteError, count: deletedCount } = await supabaseAdmin
      .from('playlist_songs')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('song_id', songId);

    if (deleteError) {
      console.error('Error deleting song from playlist_songs:', deleteError);
      return new Response(
        JSON.stringify({
          error: 'Failed to remove song from playlist.',
          details: deleteError.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (deletedCount === 0) {
      return new Response(
        JSON.stringify({
          error: 'Song not found in playlist or already removed.',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 5. Update order of subsequent songs by calling the RPC function
    const { error: rpcError } = await supabaseAdmin.rpc(
      'decrement_playlist_song_orders_after_delete',
      {
        p_playlist_id: playlistId,
        p_deleted_song_order: deletedSongOrder,
      }
    );

    if (rpcError) {
      console.error(
        'Error calling decrement_playlist_song_orders_after_delete RPC:',
        rpcError
      );
    }

    return new Response(null, { status: 204 });
  } catch (error: any) {
    console.error('Server error removing song from playlist:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error.',
        details: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
