import BaseRepository from './BaseRepository';
import type { Song } from '../types/Song';
import { AppError, ErrorCode } from '../utils/errorHandling';

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
    try {
      const response = await fetch(
        `${origin}${this.baseUrl}/${itemId}.json?type=${encodeURIComponent(itemType)}`,
        { headers }
      );
      return this.handleResponse(response);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        `Failed to fetch playback details for ${itemType} ${itemId}`,
        ErrorCode.NETWORK_ERROR,
        undefined,
        {
          originalError: error instanceof Error ? error.message : String(error),
        }
      );
    }
  }
}

const playbackRepository = new PlaybackRepository();
export default playbackRepository;
