import type { APIRoute, APIContext } from 'astro';
import { getAverageColor } from 'fast-average-color-node';

import { supabaseAdmin } from '@/lib/db/supabase';
import type { MediaItem } from '@/lib/types/MediaItem';
import type { Playlist } from '@/lib/types/Playlist';

// Get all playlists of the authenticated user
export const GET: APIRoute = async (context: APIContext) => {
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
    // Call the RPC function, passing the clerkUserId
    const { data, error } = await supabaseAdmin.rpc(
      'get_user_playlists_by_clerk_id',
      {
        p_clerk_user_id: clerkUserId,
      }
    );

    if (error) {
      console.error('Error calling get_user_playlists_by_clerk_id RPC:', error);
      return new Response(
        JSON.stringify({
          error: 'Error getting playlists.',
          details: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const playlists: MediaItem[] =
      data?.map((playlist: any) => {
        return {
          id: playlist.id,
          title: playlist.name,
          coverArtUrl: playlist.cover_art_url,
          artists: playlist.artist_names || ['Various Artists'],
          href: `/playlist/${playlist.id}`,
          type: 'playlist',
          color: playlist.color,
          userId: playlist.user_id,
        };
      }) || [];

    // Return empty array if data is null
    return new Response(JSON.stringify(playlists), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('Exception in GET /api/playlists:', e);
    return new Response(
      JSON.stringify({ error: 'Internal server error.', details: e.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// Create a new playlist
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
    const { name, firstSongId } = body;

    // Validate inputs
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'The name of the playlist is required.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Song IDs are UUIDs (strings)
    if (!firstSongId || typeof firstSongId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'A valid firstSongId is required.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 1. Get user's internal UUID from the 'users' table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (userError || !userData) {
      // PGRST116 is "No rows found"
      const status = userError?.code === 'PGRST116' ? 404 : 500;
      console.error('Error finding user or user not found:', userError);
      return new Response(
        JSON.stringify({
          error: 'User not found in the system.',
          details: userError?.message,
        }),
        {
          status: status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    const internalUserId = userData.id;

    // 2. Get album cover art URL from the first song
    let albumCoverArtUrl = null;
    let derivedColor = '#CCCCCC';

    const { data: songData, error: songError } = await supabaseAdmin
      .from('songs')
      .select('album_id')
      .eq('id', firstSongId)
      .single();

    if (songError || !songData || !songData.album_id) {
      console.warn(
        `Could not find album for songId ${firstSongId}. Playlist will have no cover/default color. Error: ${songError?.message}`
      );
    } else {
      const { data: albumData, error: albumError } = await supabaseAdmin
        .from('albums')
        .select('cover_art_url')
        .eq('id', songData.album_id)
        .single();

      if (albumError || !albumData || !albumData.cover_art_url) {
        console.warn(
          `Could not find cover art for albumId ${songData.album_id}. Playlist will have no cover/default color. Error: ${albumError?.message}`
        );
      } else {
        albumCoverArtUrl = albumData.cover_art_url;

        // 3. Derive color from the album cover art URL
        if (albumCoverArtUrl) {
          try {
            const colorInfo = await getAverageColor(albumCoverArtUrl);
            if (colorInfo.hex) {
              derivedColor = colorInfo.hex;
            }
          } catch (colorError: any) {
            console.warn(
              `Could not derive color from image ${albumCoverArtUrl}. Using default. Error: ${colorError.message}`
            );
          }
        }
      }
    }

    // 4. Insert the new playlist
    const { data: newPlaylist, error: insertPlaylistError } =
      await supabaseAdmin
        .from('playlists')
        .insert({
          name: name.trim(),
          user_id: internalUserId,
          color: derivedColor,
          cover_art_url: albumCoverArtUrl,
        })
        .select()
        .single();

    if (insertPlaylistError) {
      console.error(
        'Error inserting playlist into Supabase:',
        insertPlaylistError
      );
      return new Response(
        JSON.stringify({
          error: 'Error creating the playlist.',
          details: insertPlaylistError.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 5. Add the first song to the playlist_songs table
    if (newPlaylist) {
      const { error: insertSongError } = await supabaseAdmin
        .from('playlist_songs')
        .insert({
          playlist_id: newPlaylist.id,
          song_id: firstSongId,
          order_in_playlist: 0,
        });

      if (insertSongError) {
        console.error(
          `Playlist ${newPlaylist.id} created, but failed to add song ${firstSongId}:`,
          insertSongError
        );
      }
    }

    const newPlaylistResponse: Playlist = {
      id: newPlaylist.id,
      name: newPlaylist.name,
      description: newPlaylist.description,
      coverArtUrl: newPlaylist.cover_art_url,
      createdAt: newPlaylist.created_at,
      updatedAt: newPlaylist.updated_at,
      color: newPlaylist.color,
      userId: newPlaylist.user_id,
    };

    return new Response(JSON.stringify(newPlaylistResponse), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('Exception in POST /api/playlists:', e);
    if (e instanceof SyntaxError && e.message.includes('JSON')) {
      return new Response(
        JSON.stringify({ error: 'Malformed JSON request body.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    return new Response(
      JSON.stringify({ error: 'Internal server error.', details: e.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// Update an existing playlist
export const PUT: APIRoute = async (context: APIContext) => {
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
    const { playlistId, name, coverArtUrl, color } = body;

    if (!playlistId || typeof playlistId !== 'string') {
      return new Response(
        JSON.stringify({
          error: 'A valid playlistId is required in the request body.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (userError || !userData) {
      const status = userError?.code === 'PGRST116' ? 404 : 500;

      return new Response(
        JSON.stringify({
          error: 'User not found in the system.',
          details: userError?.message,
        }),
        {
          status: status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const internalUserId = userData.id;

    const updateData: {
      name?: string;
      coverArtUrl?: string | null;
      color?: string;
    } = {};
    let hasUpdates = false;

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return new Response(
          JSON.stringify({
            error: 'Playlist name must be a non-empty string.',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      updateData.name = name.trim();
      hasUpdates = true;
    }

    if (!coverArtUrl) {
      return new Response(
        JSON.stringify({ error: 'coverArtUrl can not be empty.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Basic hex color validation (case-insensitive)
    if (
      !color ||
      typeof color !== 'string' ||
      !/^#[0-9A-Fa-f]{6}$/i.test(color)
    ) {
      return new Response(
        JSON.stringify({
          error: 'Color must be a valid hex string (e.g., #RRGGBB).',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!hasUpdates) {
      return new Response(
        JSON.stringify({ error: 'No updateable fields provided.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: updatedPlaylist, error: updateError } = await supabaseAdmin
      .from('playlists')
      .update(updateData)
      .eq('id', playlistId)
      .eq('user_id', internalUserId)
      .select()
      .single();

    if (updateError) {
      // This implies the playlistId was not found OR it didn't belong to this user.
      if (updateError.code === 'PGRST116') {
        return new Response(
          JSON.stringify({
            error:
              'Playlist not found or you do not have permission to update it.',
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      console.error('Error updating playlist:', updateError);
      return new Response(
        JSON.stringify({
          error: 'Error updating playlist.',
          details: updateError.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const updatedPlaylistResponse: Playlist = {
      id: updatedPlaylist.id,
      name: updatedPlaylist.name,
      description: updatedPlaylist.description,
      coverArtUrl: updatedPlaylist.cover_art_url,
      createdAt: updatedPlaylist.created_at,
      updatedAt: updatedPlaylist.updated_at,
      color: updatedPlaylist.color,
      userId: updatedPlaylist.user_id,
    };

    return new Response(JSON.stringify(updatedPlaylistResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('Exception in PUT /api/playlists:', e);
    if (e instanceof SyntaxError && e.message.toLowerCase().includes('json')) {
      return new Response(
        JSON.stringify({ error: 'Malformed JSON request body.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    return new Response(
      JSON.stringify({ error: 'Internal server error.', details: e.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// Delete a playlist
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
    const playlistId = context.url.searchParams.get('id');

    if (!playlistId || typeof playlistId !== 'string') {
      return new Response(
        JSON.stringify({
          error:
            'A valid playlist ID must be provided as a query parameter "id".',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (userError || !userData) {
      const status = userError?.code === 'PGRST116' ? 404 : 500;

      return new Response(
        JSON.stringify({
          error: 'User not found in the system.',
          details: userError?.message,
        }),
        {
          status: status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    const internalUserId = userData.id;

    // 1. Verify playlist exists and belongs to the user before attempting to delete dependencies
    const { data: playlistData, error: fetchPlaylistError } =
      await supabaseAdmin
        .from('playlists')
        .select('id, user_id')
        .eq('id', playlistId)
        .single();

    if (fetchPlaylistError || !playlistData) {
      const status = fetchPlaylistError?.code === 'PGRST116' ? 404 : 500;
      return new Response(
        JSON.stringify({
          error: 'Playlist not found.',
          details: fetchPlaylistError?.message,
        }),
        {
          status: status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
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

    // 2. Delete the playlist
    const { error: deletePlaylistError, count: deletedPlaylistCount } =
      await supabaseAdmin.from('playlists').delete().eq('id', playlistId);

    if (deletePlaylistError) {
      return new Response(
        JSON.stringify({
          error: 'Error deleting playlist.',
          details: deletePlaylistError.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (deletedPlaylistCount === 0) {
      return new Response(
        JSON.stringify({ error: 'Playlist not found or already deleted.' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(null, {
      status: 204,
    });
  } catch (e: any) {
    console.error('Exception in DELETE /api/playlists:', e);
    return new Response(
      JSON.stringify({ error: 'Internal server error.', details: e.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
