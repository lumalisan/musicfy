import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/db/supabase';
import type { MediaItem } from '@/lib/types/MediaItem';

export const GET: APIRoute = async (context) => {
  try {
    // Get all albums from the database
    const artistId = context.url.searchParams.get('artist_id');

    let query = supabaseAdmin.from('albums').select(
      `
          id,
          title,
          cover_art_url,
          color,
          release_date,
          artists!inner(id, name) 
        `
    );

    if (artistId) {
      query = query.eq('artists.id', artistId);
    }

    query = query.order('release_date', { ascending: false });

    const { data: rawAlbums, error } = await query;

    if (error) {
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch albums',
          details: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const albums: MediaItem[] = (rawAlbums || []).map((album) => {
      let albumArtists: string[] = ['Unknown Artist'];
      if (album.artists && (album.artists as any).name) {
        albumArtists = [(album.artists as any).name];
      } else if (Array.isArray(album.artists) && album.artists.length > 0) {
        albumArtists = album.artists
          .map((artist: any) => artist.name)
          .filter(Boolean);
      }
      if (albumArtists.length === 0) albumArtists = ['Unknown Artist'];

      return {
        id: album.id,
        title: album.title,
        coverArtUrl: album.cover_art_url,
        artists: albumArtists,
        href: `/album/${album.id}`,
        type: 'album',
        color: album.color,
      };
    });

    return new Response(JSON.stringify(albums), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('Exception in GET /api/albums:', e);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: e.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
