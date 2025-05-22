import songRepository from './SongRepository';
import { searchRepository } from './SearchRepository';
import { AppError, ErrorCode } from '../utils/errorHandling';
import type { SongResult } from '../types/SearchResultItem';

jest.mock('./SearchRepository', () => ({
  __esModule: true,
  searchRepository: {
    searchSongs: jest.fn(),
  },
}));

global.fetch = jest.fn();

const mockSongResults: SongResult[] = [
  {
    id: 's1',
    type: 'song',
    title: 'Song Alpha',
    artists: ['Artist X'],
    album: 'Album One',
    duration: 180,
    image: 'http://example.com/cover_one.jpg',
    url: '/song/s1',
    albumId: 'alb1',
    artistId: 'art1',
    color: '#123456',
    year: 2023,
  },
  {
    id: 's2',
    type: 'song',
    title: 'Song Beta',
    artists: ['Artist X'],
    album: 'Album One',
    duration: 210,
    image: 'http://example.com/cover_one.jpg',
    url: '/song/s2',
    albumId: 'alb1',
    artistId: 'art1',
    color: '#abcdef',
    year: 2023,
  },
  {
    id: 's3',
    type: 'song',
    title: 'Song Gamma',
    artists: ['Artist Y'],
    album: 'Album Two',
    duration: 240,
    image: 'http://example.com/cover_two.jpg',
    url: '/song/s3',
    albumId: 'alb2',
    artistId: 'art2',
    color: '#fedcba',
    year: 2024,
  },
];

describe('SongRepository', () => {
  const baseUrl = '/api/songs';
  beforeEach(() => {
    // Reset mocks before each test
    (searchRepository.searchSongs as jest.Mock).mockReset();
    (global.fetch as jest.Mock).mockReset();
  });

  // Tests for search method
  describe('search', () => {
    it('should call searchRepository.searchSongs with the query and return its result', async () => {
      const query = 'Test Song';
      (searchRepository.searchSongs as jest.Mock).mockResolvedValue(
        mockSongResults
      );

      const result = await songRepository.search(query);

      expect(searchRepository.searchSongs).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockSongResults);
    });

    it('should return an empty array if query is empty', async () => {
      const result = await songRepository.search('');
      expect(result).toEqual([]);
      expect(searchRepository.searchSongs).not.toHaveBeenCalled();
    });

    it('should return an empty array if query is whitespace', async () => {
      const result = await songRepository.search('   ');
      expect(result).toEqual([]);
      expect(searchRepository.searchSongs).not.toHaveBeenCalled();
    });

    it('should propagate errors from searchRepository.searchSongs', async () => {
      const query = 'Error Query';
      const expectedError = new Error('Search failed');
      (searchRepository.searchSongs as jest.Mock).mockRejectedValue(
        expectedError
      );

      await expect(songRepository.search(query)).rejects.toThrow(
        'Search failed'
      );
      expect(searchRepository.searchSongs).toHaveBeenCalledWith(query);
    });
  });

  // Tests for getByAlbum method
  describe('getByAlbum', () => {
    const albumId = 'alb1';

    it('should fetch songs with the correct album_id parameter and return parsed songs', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSongResults.filter((s) => s.album_id === albumId),
        status: 200,
      });

      const result = await songRepository.getByAlbum(albumId);

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/songs.json?album_id=${encodeURIComponent(albumId)}`
      );
      expect(result).toEqual(
        mockSongResults.filter((s) => s.album_id === albumId)
      );
    });

    it('should return an empty array if albumId is empty', async () => {
      const result = await songRepository.getByAlbum('');
      expect(result).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should throw AppError on fetch API error (e.g., 404)', async () => {
      const apiErrorResponse = {
        message: 'Album not found',
        code: 'NOT_FOUND',
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => apiErrorResponse,
        status: 404,
        statusText: 'Not Found',
      });

      try {
        await songRepository.getByAlbum(albumId);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        if (error instanceof AppError) {
          expect(error.message).toBe(apiErrorResponse.message);
          expect(error.statusCode).toBe(404);
          expect(error.code).toBe(ErrorCode.NOT_FOUND);
        }
      }
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/songs.json?album_id=${encodeURIComponent(albumId)}`
      );
    });

    it('should throw AppError on network error', async () => {
      const networkError = new Error('Network connection failed');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      try {
        await songRepository.getByAlbum(albumId);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        if (error instanceof AppError) {
          expect(error.message).toBe(
            'A network error occurred. Please check your connection.'
          );
          expect(error.code).toBe(ErrorCode.NETWORK_ERROR);
        }
      }
    });

    it('should re-throw AppError if handleResponse throws an AppError', async () => {
      const albumId = 'album1';
      const apiError = new AppError('API Error', ErrorCode.SERVER_ERROR, 500, {
        detail: 'Album service unavailable',
      });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({
          message: 'API Error',
          detail: 'Album service unavailable',
        }),
        statusText: 'Internal Server Error',
      } as unknown as Response);

      await expect(songRepository.getByAlbum(albumId)).rejects.toThrow(
        apiError
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}.json?album_id=${encodeURIComponent(albumId)}`
      );
    });
  });

  // Tests for getByArtist method
  describe('getByArtist', () => {
    const artistId = 'art1';

    it('should fetch songs with the correct artist_id parameter and return parsed songs', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () =>
          mockSongResults.filter((s) => s.artist_id === artistId),
        status: 200,
      });

      const result = await songRepository.getByArtist(artistId);

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/songs.json?artist_id=${encodeURIComponent(artistId)}`
      );
      expect(result).toEqual(
        mockSongResults.filter((s) => s.artist_id === artistId)
      );
    });

    it('should return an empty array if artistId is empty', async () => {
      const result = await songRepository.getByArtist('');
      expect(result).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should throw AppError on fetch API error (e.g., 500)', async () => {
      const apiErrorResponse = {
        message: 'Internal Server Error',
        code: 'SERVER_ERROR',
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => apiErrorResponse,
        status: 500,
        statusText: 'Internal Server Error',
      });

      try {
        await songRepository.getByArtist(artistId);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        if (error instanceof AppError) {
          expect(error.message).toBe(apiErrorResponse.message);
          expect(error.statusCode).toBe(500);
          expect(error.code).toBe(ErrorCode.SERVER_ERROR);
        }
      }
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/songs.json?artist_id=${encodeURIComponent(artistId)}`
      );
    });

    it('should throw AppError on network error', async () => {
      const networkError = new Error('Failed to fetch');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      try {
        await songRepository.getByArtist(artistId);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        if (error instanceof AppError) {
          expect(error.message).toBe(
            'A network error occurred. Please check your connection.'
          );
          expect(error.code).toBe(ErrorCode.NETWORK_ERROR);
        }
      }
    });

    it('should re-throw AppError if handleResponse throws an AppError', async () => {
      const artistId = 'artist1';
      const apiError = new AppError('API Error', ErrorCode.SERVER_ERROR, 500, {
        detail: 'Artist service unavailable',
      });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({
          message: 'API Error',
          detail: 'Artist service unavailable',
        }),
        statusText: 'Internal Server Error',
      } as unknown as Response);

      await expect(songRepository.getByArtist(artistId)).rejects.toThrow(
        apiError
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}.json?artist_id=${encodeURIComponent(artistId)}`
      );
    });
  });
});
