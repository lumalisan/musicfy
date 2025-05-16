import type { APIRoute, APIContext } from 'astro';
import { supabaseAdmin } from '@/lib/db/supabase';
import type { Song } from '@/lib/types/Song';

export const GET: APIRoute = async (context: APIContext) => {
  const searchQuery = context.url.searchParams.get('q');

  if (
    !searchQuery ||
    typeof searchQuery !== 'string' ||
    searchQuery.trim() === ''
  ) {
    return new Response(
      JSON.stringify({
        error: 'Search query parameter "q" is required and cannot be empty.',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Query the 'songs' table for titles matching the search query.
    const { data: songs, error } = await supabaseAdmin
      .from('songs')
      .select(
        `
        id,
        title,
        duration_seconds,
        file_url,
        album:albums (
          id,
          title,
          cover_art_url
        ),
        artist:artists (
          id,
          name
        )
      `
      )
      .ilike('title', `%${searchQuery.trim()}%`)
      .limit(20);

    if (error) {
      return new Response(
        JSON.stringify({
          error: 'Error fetching songs.',
          details: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const songsResponse: Song[] = songs.map((song: any) => ({
      id: song.id,
      title: song.title,
      image: song.album.cover_art_url,
      artists: [song.artist.name],
      album: song.album,
      duration: song.duration_seconds,
      url: song.file_url,
    }));

    return new Response(JSON.stringify(songsResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('Exception in GET /api/songs:', e);
    return new Response(
      JSON.stringify({ error: 'Internal server error.', details: e.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
