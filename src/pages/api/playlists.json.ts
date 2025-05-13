import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/db/supabase';
import type { MediaItem } from '@/lib/types/MediaItem';

export const GET: APIRoute = async () => {
  try {
    const { data: rawPlaylists, error: rpcError } = await supabaseAdmin.rpc(
      'get_playlists_with_artists'
    );

    if (rpcError) {
      console.error('Error calling get_playlists_with_artists RPC:', rpcError);
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch playlists',
          details: rpcError.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const playlists: MediaItem[] = (rawPlaylists || []).map(
      (playlist: any) => ({
        id: playlist.id,
        title: playlist.name,
        cover_art_url: playlist.cover_art_url,
        artists: playlist.artist_names || ['Various Artists'],
        href: `/playlist/${playlist.id}`,
        type: 'playlist',
        color: playlist.color,
        description: playlist.description,
      })
    );

    return new Response(JSON.stringify(playlists), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('Exception in GET /api/playlists (public):', e);
    return new Response(
      JSON.stringify({ error: 'Internal server error.', details: e.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
