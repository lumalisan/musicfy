import playbackRepository, { PlaybackRepository } from './PlaybackRepository';
import type {
  PlaybackDetailsResponse,
  PlaybackItemInfo,
} from './PlaybackRepository';
import { AppError, ErrorCode } from '../utils/errorHandling';
import type { Song } from '../types/Song';

const mockHandleResponse = jest.fn();
Object.setPrototypeOf(PlaybackRepository.prototype, {
  ...Object.getPrototypeOf(PlaybackRepository.prototype),
  handleResponse: mockHandleResponse,
});

global.fetch = jest.fn();

describe('PlaybackRepository', () => {
  const origin = 'http://localhost:4321';
  const baseUrl = '/api/item-details';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPlaybackDetails', () => {
    const itemId = 'item-123';
    const mockSongs: Song[] = [
      {
        id: 's1',
        title: 'Song 1',
        duration: 180,
        url: '/song/s1',
        artists: ['Artist 1'],
        album: 'Album 1',
        image: 'http://example.com/s1.jpg',
      },
      {
        id: 's2',
        title: 'Song 2',
        duration: 240,
        url: '/song/s2',
        artists: ['Artist 1', 'Artist 2'],
        album: 'Album 1',
        image: 'http://example.com/s2.jpg',
      },
    ];
    const mockItemDetailsPlaylist: PlaybackItemInfo = {
      id: itemId,
      type: 'playlist',
      name: 'Test Playlist',
      artists: null,
      coverArtUrl: 'http://example.com/playlist.jpg',
      color: '#aabbcc',
      creatorUserId: 'user-abc',
    };
    const mockPlaybackDetailsResponsePlaylist: PlaybackDetailsResponse = {
      songs: mockSongs,
      itemDetails: mockItemDetailsPlaylist,
    };

    const mockItemDetailsAlbum: PlaybackItemInfo = {
      id: itemId,
      type: 'album',
      name: 'Test Album',
      artists: ['Artist 1', 'Artist 2'],
      coverArtUrl: 'http://example.com/album.jpg',
      color: '#ccbbaa',
    };
    const mockPlaybackDetailsResponseAlbum: PlaybackDetailsResponse = {
      songs: mockSongs,
      itemDetails: mockItemDetailsAlbum,
    };

    it('should fetch playlist details and return parsed response', async () => {
      const itemType = 'playlist';
      mockHandleResponse.mockResolvedValueOnce(
        mockPlaybackDetailsResponsePlaylist
      );
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      } as Response);

      const result = await playbackRepository.getPlaybackDetails(
        origin,
        itemId,
        itemType
      );

      expect(global.fetch).toHaveBeenCalledWith(
        `${origin}${baseUrl}/${itemId}.json?type=${encodeURIComponent(itemType)}`,
        { headers: undefined }
      );
      expect(mockHandleResponse).toHaveBeenCalledWith({ ok: true });
      expect(result).toEqual(mockPlaybackDetailsResponsePlaylist);
    });

    it('should fetch album details with custom headers and return parsed response', async () => {
      const itemType = 'album';
      const customHeaders = { 'X-Custom-Header': 'TestValue' };
      mockHandleResponse.mockResolvedValueOnce(
        mockPlaybackDetailsResponseAlbum
      );
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      } as Response);

      const result = await playbackRepository.getPlaybackDetails(
        origin,
        itemId,
        itemType,
        customHeaders
      );

      expect(global.fetch).toHaveBeenCalledWith(
        `${origin}${baseUrl}/${itemId}.json?type=${encodeURIComponent(itemType)}`,
        { headers: customHeaders }
      );
      expect(mockHandleResponse).toHaveBeenCalledWith({ ok: true });
      expect(result).toEqual(mockPlaybackDetailsResponseAlbum);
    });

    it('should propagate AppError from handleResponse', async () => {
      const itemType = 'playlist';
      const apiError = new AppError('API Error', ErrorCode.SERVER_ERROR, 500);
      mockHandleResponse.mockRejectedValueOnce(apiError);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      await expect(
        playbackRepository.getPlaybackDetails(origin, itemId, itemType)
      ).rejects.toThrow(apiError);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(mockHandleResponse).toHaveBeenCalledTimes(1);
    });

    it('should throw AppError on network error (fetch rejects)', async () => {
      const itemType = 'album';
      const networkError = new Error('Network failed');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(
        playbackRepository.getPlaybackDetails(origin, itemId, itemType)
      ).rejects.toThrow(
        new AppError(
          `Failed to fetch playback details for ${itemType} ${itemId}`,
          ErrorCode.NETWORK_ERROR,
          undefined,
          { originalError: networkError.message }
        )
      );
      expect(mockHandleResponse).not.toHaveBeenCalled();
    });

    it('should re-throw AppError if fetch itself throws an AppError', async () => {
      const itemType = 'playlist';
      const initialAppError = new AppError(
        'Fetch failed with AppError',
        ErrorCode.UNAUTHORIZED,
        401
      );
      (global.fetch as jest.Mock).mockRejectedValueOnce(initialAppError);

      await expect(
        playbackRepository.getPlaybackDetails(origin, itemId, itemType)
      ).rejects.toThrow(initialAppError);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(mockHandleResponse).not.toHaveBeenCalled();
    });
  });
});
