import BaseRepository from './BaseRepository';
import type { Song } from '../types/Song';

export interface PlaybackItemInfo {
  id: string;
  type: 'playlist' | 'album';
  name: string;
  artists: string[] | null;
  coverArtUrl: string | null;
  color: string | null;
  creatorUserId?: string;
}

export interface PlaybackDetailsResponse {
  songs: Song[];
  itemDetails: PlaybackItemInfo;
}

export class PlaybackRepository extends BaseRepository<PlaybackDetailsResponse> {
  constructor() {
    super('/api/item-details');
  }

  async getPlaybackDetails(
    origin: string,
    itemId: string,
    itemType: 'playlist' | 'album',
    headers?: HeadersInit
  ): Promise<PlaybackDetailsResponse> {
    const response = await fetch(
      `${origin}${this.baseUrl}/${itemId}.json?type=${encodeURIComponent(itemType)}`,
      { headers }
    );
    return this.handleResponse(response);
  }
}

const playbackRepository = new PlaybackRepository();
export default playbackRepository;
