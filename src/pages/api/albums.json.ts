import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/db/supabase';
import type { MediaItem } from '@/lib/types/MediaItem';

export const GET: APIRoute = async () => {
  try {
    // Get all albums from the database
    const { data: rawAlbums, error } = await supabaseAdmin
      .from('albums')
      .select(
        `
                id,
                title,
                cover_art_url,
                color,
                release_date,
                artists (name)
            `
      )
      .order('release_date', { ascending: false });

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
      if (album.artists) {
        albumArtists = [(album.artists as any).name].filter(Boolean);
      }
      if (albumArtists.length === 0) albumArtists = ['Unknown Artist'];

      return {
        id: album.id,
        title: album.title,
        cover_art_url: album.cover_art_url,
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
