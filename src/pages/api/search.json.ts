import type { APIRoute } from 'astro';

import { supabaseAdmin } from '@/lib/db/supabase';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q')?.trim() || '';
    const type = url.searchParams.get('type') || 'all';

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Search query is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const searchPromises = [];
    
    if (type === 'all' || type === 'songs') {
      searchPromises.push(
        supabaseAdmin
          .from('songs')
          .select('*, artists(name), albums(title, cover_art_url, color)')
          .ilike('title', `%${query}%`)
          .limit(10)
      );
    } else {
      searchPromises.push(Promise.resolve({ data: [], error: null }));
    }

    if (type === 'all' || type === 'albums') {
      searchPromises.push(
        supabaseAdmin
          .from('albums')
          .select('*, artists(name)')
          .ilike('title', `%${query}%`)
          .limit(10)
      );
    } else {
      searchPromises.push(Promise.resolve({ data: [], error: null }));
    }

    if (type === 'all' || type === 'playlists') {
      searchPromises.push(
        supabaseAdmin
          .from('playlists')
          .select('*')
          .ilike('name', `%${query}%`)
          .limit(10)
      );
    } else {
      searchPromises.push(Promise.resolve({ data: [], error: null }));
    }

    // Wait for all searches to complete
    const [songsResult, albumsResult, playlistsResult] = await Promise.all(searchPromises);

    // Check for errors
    if (songsResult.error || albumsResult.error || playlistsResult.error) {
      console.error('Search error:', { songsResult, albumsResult, playlistsResult });
      throw new Error('Error searching data');
    }

    // Format the results
    const results = {
      songs: (songsResult.data || []).map(song => ({
        id: song.id,
        type: 'song',
        title: song.title,
        artist: song.artists?.name || 'Unknown Artist',
        album: song.albums?.title || 'Unknown Album',
        image: song.albums?.cover_art_url || null,
        duration: song.duration_seconds || 0,
        color: song.albums?.color || null,
        url: song.file_url
      })),
      albums: (albumsResult.data || []).map(album => ({
        id: album.id,
        type: 'album',
        title: album.title,
        artist: album.artists?.name || 'Unknown Artist',
        image: album.cover_art_url || null,
        color: album.color || null,
        year: album.release_year || null,
        url: `/album/${album.id}`
      })),
      playlists: (playlistsResult.data || []).map(playlist => ({
        id: playlist.id,
        type: 'playlist',
        title: playlist.name,
        image: playlist.cover_art_url || null,
        description: playlist.description || '',
        color: playlist.color || null,
        url: `/playlist/${playlist.id}`
      }))
    };

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Search API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
