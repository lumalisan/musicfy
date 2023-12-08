import { playlists, songs } from '@/lib/data';
import type { Params } from 'astro';

export async function GET({
  params,
  request,
}: {
  params: Params;
  request: Request;
}) {
  const { url } = request;
  const urlObj = new URL(url);
  const id = Number.parseInt(urlObj.searchParams.get('id') ?? '0');

  const playlist = playlists.find((playlist) => playlist.id === id);
  const filteredSongs = songs.filter(
    (song) => song.playlistId === playlist?.id
  );

  return new Response(JSON.stringify({ playlist, songs: filteredSongs }), {
    headers: { 'content-type': 'application/json' },
  });
}
