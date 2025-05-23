import type { APIRoute } from 'astro';

import { supabaseAdmin } from '@/lib/db/supabase';
import type { ItemInfo } from '@/lib/types/ItemInfo';
import type { Song } from '@/lib/types/Song';

export const GET: APIRoute = async ({ params, url }) => {
  const itemId = params.id;
  const itemType = url.searchParams.get('type') as 'playlist' | 'album';

  if (!itemId) {
    return new Response(JSON.stringify({ error: 'Item ID is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!itemType || !['playlist', 'album'].includes(itemType)) {
    return new Response(
      JSON.stringify({
        error: 'Valid item type (playlist or album) is required.',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    let itemDetailsData: any = null;
    let songsData: any[] = [];
    let rpcItemDetailsError: any = null;
    let rpcSongsError: any = null;

    if (itemType === 'playlist') {
      // 1. Fetch playlist details
      ({ data: itemDetailsData, error: rpcItemDetailsError } =
        await supabaseAdmin.rpc('get_playlist_item_details', {
          p_playlist_id: itemId,
        }));

      if (rpcItemDetailsError || !itemDetailsData) {
        console.error(
          `Error fetching playlist details for ${itemId}:`,
          rpcItemDetailsError
        );
        return new Response(
          JSON.stringify({
            error: 'Playlist not found or error fetching details.',
            details: rpcItemDetailsError?.message,
          }),
          {
            status:
              rpcItemDetailsError && rpcItemDetailsError.code !== 'PGRST116'
                ? 500
                : 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      itemDetailsData = Array.isArray(itemDetailsData)
        ? itemDetailsData[0]
        : itemDetailsData;

      // 2. Fetch songs for this playlist
      ({ data: songsData, error: rpcSongsError } = await supabaseAdmin.rpc(
        'get_songs_for_playlist',
        { p_playlist_id: itemId }
      ));
    } else if (itemType === 'album') {
      // 1. Fetch album details
      ({ data: itemDetailsData, error: rpcItemDetailsError } =
        await supabaseAdmin.rpc('get_album_item_details', {
          p_album_id: itemId,
        }));

      if (rpcItemDetailsError || !itemDetailsData) {
        console.error(
          `Error fetching album details for ${itemId}:`,
          rpcItemDetailsError
        );
        return new Response(
          JSON.stringify({
            error: 'Album not found or error fetching details.',
            details: rpcItemDetailsError?.message,
          }),
          {
            status:
              rpcItemDetailsError && rpcItemDetailsError.code !== 'PGRST116'
                ? 500
                : 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      itemDetailsData = Array.isArray(itemDetailsData)
        ? itemDetailsData[0]
        : itemDetailsData;

      // 2. Fetch songs for this album
      ({ data: songsData, error: rpcSongsError } = await supabaseAdmin.rpc(
        'get_songs_for_album',
        { p_album_id: itemId }
      ));
    }

    if (rpcSongsError) {
      return new Response(
        JSON.stringify({
          error: `Failed to fetch songs for ${itemType}.`,
          details: rpcSongsError.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const itemDetails: ItemInfo = {
      id: itemDetailsData.id,
      type: itemType,
      name:
        itemType === 'playlist' ? itemDetailsData.name : itemDetailsData.title,
      coverArtUrl: itemDetailsData.cover_art_url,
      artists:
        songsData
          .map((s: any) => s.song_artists)
          .flat()
          .filter(
            (artist: string, index: number, self: string[]) =>
              self.indexOf(artist) === index
          ) || [],
      color: itemDetailsData.color,
      description:
        itemType === 'playlist' ? itemDetailsData.description : undefined,
      creatorUserId:
        itemType === 'playlist' ? itemDetailsData.creator_user_id : undefined,
    };

    const songs: Song[] = (songsData || []).map((s: any) => ({
      id: s.song_id,
      title: s.song_title,
      artists: s.song_artists || ['Unknown Artist'],
      album: s.album_title,
      image: s.song_image_url,
      duration: s.duration,
      url: s.song_url,
    }));

    return new Response(JSON.stringify({ itemDetails, songs }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error(
      `Exception in GET /api/item-details/${itemId}?type=${itemType}:`,
      error
    );
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
