import albumRepository from './AlbumRepository';
import { searchRepository } from './SearchRepository';
import { AppError, ErrorCode } from '../utils/errorHandling';
import type { AlbumResult } from '../types/SearchResultItem';

// Mock SearchRepository
jest.mock('./SearchRepository', () => ({
  __esModule: true,
  searchRepository: {
    searchAlbums: jest.fn(),
  },
}));

// Mock global fetch
global.fetch = jest.fn();

const mockAlbums: AlbumResult[] = [
  {
    id: 'alb1',
    type: 'album',
    title: 'Album Alpha',
    artists: ['Artist X'],
    image: 'http://example.com/album_alpha.jpg',
    url: '/album/alb1',
    artistId: 'art1',
    color: '#aabbcc',
    year: 2022,
    songs: [
      {
        id: 's1',
        title: 'Track 1',
        duration: 180,
        url: '/song/s1',
        artists: ['Artist X'],
        album: 'Album Alpha',
        type: 'song',
        albumId: 'alb1',
        artistId: 'art1',
        image: '',
        color: '',
        year: 2022,
      },
    ],
  },
  {
    id: 'alb2',
    type: 'album',
    title: 'Album Beta',
    artists: ['Artist Y'],
    image: 'http://example.com/album_beta.jpg',
    url: '/album/alb2',
    artistId: 'art2',
    color: '#ddeeff',
    year: 2023,
    songs: [
      {
        id: 's2',
        title: 'Track A',
        duration: 200,
        url: '/song/s2',
        artists: ['Artist Y'],
        album: 'Album Beta',
        type: 'song',
        albumId: 'alb2',
        artistId: 'art2',
        image: '',
        color: '',
        year: 2023,
      },
    ],
  },
];

describe('AlbumRepository', () => {
  const baseUrl = '/api/albums';

  beforeEach(() => {
    // Reset mocks before each test
    (searchRepository.searchAlbums as jest.Mock).mockReset();
    (global.fetch as jest.Mock).mockReset();
  });

  // Tests for search method
  describe('search', () => {
    it('should call searchRepository.searchAlbums with the query and return its result', async () => {
      const query = 'Test Album';
      (searchRepository.searchAlbums as jest.Mock).mockResolvedValue(
        mockAlbums
      );

      const result = await albumRepository.search(query);

      expect(searchRepository.searchAlbums).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockAlbums);
    });

    it('should return an empty array if query is empty', async () => {
      const result = await albumRepository.search('');
      expect(result).toEqual([]);
      expect(searchRepository.searchAlbums).not.toHaveBeenCalled();
    });

    it('should return an empty array if query is whitespace', async () => {
      const result = await albumRepository.search('   ');
      expect(result).toEqual([]);
      expect(searchRepository.searchAlbums).not.toHaveBeenCalled();
    });

    it('should propagate errors from searchRepository.searchAlbums', async () => {
      const query = 'Error Query';
      const expectedError = new Error('Search failed');
      (searchRepository.searchAlbums as jest.Mock).mockRejectedValue(
        expectedError
      );

      await expect(albumRepository.search(query)).rejects.toThrow(
        'Search failed'
      );
      expect(searchRepository.searchAlbums).toHaveBeenCalledWith(query);
    });
  });

  // Tests for getAll method
  describe('getAll', () => {
    const origin = 'http://localhost:3000';

    it('should fetch all albums with the provided origin and return parsed albums', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAlbums,
        status: 200,
      } as Response);

      const result = await albumRepository.getAll(origin);

      expect(global.fetch).toHaveBeenCalledWith(`${origin}${baseUrl}.json`);
      expect(result).toEqual(mockAlbums);
    });

    it('should throw AppError if handleResponse throws (e.g., API error)', async () => {
      const apiError = new AppError('API Error', ErrorCode.SERVER_ERROR, 500);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({ message: 'Server Error' }),
        statusText: 'Internal Server Error',
      } as unknown as Response);

      const originalHandleResponse =
        Object.getPrototypeOf(albumRepository).handleResponse;
      Object.getPrototypeOf(albumRepository).handleResponse = jest
        .fn()
        .mockRejectedValue(apiError);

      await expect(albumRepository.getAll(origin)).rejects.toThrow(apiError);
      expect(global.fetch).toHaveBeenCalledWith(`${origin}${baseUrl}.json`);

      Object.getPrototypeOf(albumRepository).handleResponse =
        originalHandleResponse;
    });

    it('should throw AppError on network error (fetch rejects)', async () => {
      const networkError = new Error('Network failed');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(albumRepository.getAll(origin)).rejects.toThrow(AppError);
      expect(global.fetch).toHaveBeenCalledWith(`${origin}${baseUrl}.json`);
    });
  });

  // Tests for getByArtist method
  describe('getByArtist', () => {
    const artistId = 'art1';

    it('should fetch albums with the correct artist_id parameter and return parsed albums', async () => {
      const expectedAlbums = mockAlbums.filter((a) => a.artistId === artistId);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => expectedAlbums,
        status: 200,
      } as Response);

      const result = await albumRepository.getByArtist(artistId);

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}.json?artist_id=${encodeURIComponent(artistId)}`
      );
      expect(result).toEqual(expectedAlbums);
    });

    it('should return an empty array if artistId is empty', async () => {
      const result = await albumRepository.getByArtist('');
      expect(result).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should throw AppError if handleResponse throws (e.g., API error for non-existent artist)', async () => {
      const apiError = new AppError('Not Found', ErrorCode.NOT_FOUND, 404);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValue({ message: 'Artist not found' }),
        statusText: 'Not Found',
      } as unknown as Response);

      const originalHandleResponse =
        Object.getPrototypeOf(albumRepository).handleResponse;
      Object.getPrototypeOf(albumRepository).handleResponse = jest
        .fn()
        .mockRejectedValue(apiError);

      await expect(albumRepository.getByArtist(artistId)).rejects.toThrow(
        apiError
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}.json?artist_id=${encodeURIComponent(artistId)}`
      );

      Object.getPrototypeOf(albumRepository).handleResponse =
        originalHandleResponse;
    });

    it('should throw AppError on network error (fetch rejects)', async () => {
      const networkError = new Error('Network connection lost');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(albumRepository.getByArtist(artistId)).rejects.toThrow(
        AppError
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}.json?artist_id=${encodeURIComponent(artistId)}`
      );
    });
  });
});
