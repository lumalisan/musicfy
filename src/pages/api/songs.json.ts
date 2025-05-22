import type { APIRoute, APIContext } from 'astro';
import { supabaseAdmin } from '@/lib/db/supabase';
import type { Song } from '@/lib/types/Song';

export const GET: APIRoute = async (context: APIContext) => {
  const albumId = context.url.searchParams.get('album_id');
  const artistId = context.url.searchParams.get('artist_id');
  const searchQuery = context.url.searchParams.get('q');

  let query = supabaseAdmin.from('songs').select(
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
  );

  if (albumId) {
    if (typeof albumId !== 'string' || albumId.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'album_id must be a non-empty string.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    query = query.eq('album_id', albumId);
  } else if (artistId) {
    if (typeof artistId !== 'string' || artistId.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'artist_id must be a non-empty string.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    query = query.eq('artist_id', artistId);
  } else if (searchQuery) {
    if (typeof searchQuery !== 'string' || searchQuery.trim() === '') {
      return new Response(
        JSON.stringify({
          error:
            'Search query parameter "q" must be a non-empty string if provided.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    query = query.ilike('title', `%${searchQuery.trim()}%`);
  } else {
    return new Response(
      JSON.stringify({
        error: 'A filter (album_id, artist_id, or q) is required.',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const { data: songs, error } = await query.limit(50);

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
