import BaseRepository from './BaseRepository';
import type { Song } from '../types/Song';

export interface PlaybackItemInfo {
  id: string;
  type: 'playlist' | 'album';
  name: string;
  artists: string[] | null;
  coverArtUrl: string | null;
  color: string | null;
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
    itemId: string,
    itemType: 'playlist' | 'album'
  ): Promise<PlaybackDetailsResponse> {
    const response = await fetch(
      `${this.baseUrl}/${itemId}.json?type=${encodeURIComponent(itemType)}`
    );
    return this.handleResponse(response);
  }
}

const playbackRepository = new PlaybackRepository();
export default playbackRepository;
