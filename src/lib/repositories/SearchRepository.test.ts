global.fetch = jest.fn();

import searchRepository, {
  SearchRepository as SearchRepositoryClass,
} from './SearchRepository';
import type {
  SearchResult,
  SongResult,
  AlbumResult,
  PlaylistResult,
} from '../types/SearchResultItem';
import { AppError, ErrorCode } from '../utils/errorHandling';

const mockHandleResponse = jest.fn();

Object.setPrototypeOf(SearchRepositoryClass.prototype, {
  ...Object.getPrototypeOf(SearchRepositoryClass.prototype),
  handleResponse: mockHandleResponse,
});

describe('SearchRepository', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch');
    mockHandleResponse.mockClear();
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  const baseUrl = '/api/search';
  const mockQuery = 'test query';

  const mockSongs: SongResult[] = [
    {
      id: 's1',
      title: 'Song 1',
      type: 'song',
      artists: ['Artist A'],
      album: 'Album X',
      image: 's1.jpg',
      duration: 180,
      url: '/song/s1',
    },
    {
      id: 's2',
      title: 'Song 2',
      type: 'song',
      artists: ['Artist B'],
      album: 'Album Y',
      image: 's2.jpg',
      duration: 220,
      url: '/song/s2',
      year: 2022,
      color: '#ff0000',
    },
  ];
  const mockAlbums: AlbumResult[] = [
    {
      id: 'a1',
      title: 'Album Alpha',
      type: 'album',
      artists: ['Artist C'],
      image: 'a1.jpg',
      url: '/album/a1',
      year: 2021,
    },
    {
      id: 'a2',
      title: 'Album Beta',
      type: 'album',
      artists: ['Artist D'],
      image: 'a2.jpg',
      url: '/album/a2',
      year: null,
      trackCount: 12,
    },
  ];
  const mockPlaylists: PlaylistResult[] = [
    {
      id: 'p1',
      title: 'Playlist Hits',
      type: 'playlist',
      image: 'p1.jpg',
      url: '/playlist/p1',
      description: 'Top hits playlist',
      creatorName: 'User E',
    },
    {
      id: 'p2',
      title: 'Chill Vibes',
      type: 'playlist',
      image: 'p2.jpg',
      url: '/playlist/p2',
      description: 'Relaxing tunes',
      creatorId: 'user-f',
      trackCount: 15,
      color: '#00ff00',
    },
  ];
  const mockSearchResult: SearchResult = {
    songs: mockSongs,
    albums: mockAlbums,
    playlists: mockPlaylists,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = SearchRepositoryClass.getInstance();
      expect(instance1).toBeInstanceOf(SearchRepositoryClass);
    });
  });

  describe('search', () => {
    it('should return empty result if query is empty', async () => {
      const result = await searchRepository.search({ query: '' });
      expect(result).toEqual({ songs: [], albums: [], playlists: [] });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return empty result if query is whitespace', async () => {
      const result = await searchRepository.search({ query: '   ' });
      expect(result).toEqual({ songs: [], albums: [], playlists: [] });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should call fetch with correct params and return parsed response for type "all"', async () => {
      const options = {
        query: mockQuery,
        type: 'all' as const,
        limit: 5,
        offset: 0,
      };
      mockHandleResponse.mockResolvedValueOnce(mockSearchResult);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      } as Response);

      const result = await searchRepository.search(options);

      const expectedParams = new URLSearchParams({
        q: mockQuery,
        type: 'all',
        limit: '5',
        offset: '0',
      });
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}.json?${expectedParams.toString()}`
      );
      expect(mockHandleResponse).toHaveBeenCalledWith({ ok: true });
      expect(result).toEqual(mockSearchResult);
    });

    it('should use default limit and offset if not provided', async () => {
      const options = { query: mockQuery, type: 'songs' as const };
      mockHandleResponse.mockResolvedValueOnce({
        songs: mockSongs,
        albums: [],
        playlists: [],
      });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      } as Response);

      await searchRepository.search(options);

      const expectedParams = new URLSearchParams({
        q: mockQuery,
        type: 'songs',
        limit: '20',
        offset: '0',
      });
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}.json?${expectedParams.toString()}`
      );
    });

    it('should propagate AppError from handleResponse', async () => {
      const apiError = new AppError('API Error', ErrorCode.SERVER_ERROR, 500);
      mockHandleResponse.mockRejectedValueOnce(apiError);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      await expect(
        searchRepository.search({ query: mockQuery })
      ).rejects.toThrow(apiError);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(mockHandleResponse).toHaveBeenCalledTimes(1);
    });

    it('should throw AppError on network error (fetch rejects)', async () => {
      const networkError = new Error('Network failed');
      fetchSpy.mockRejectedValueOnce(networkError);

      await expect(
        searchRepository.search({ query: mockQuery })
      ).rejects.toThrow(
        new AppError(
          `Search failed for query "${mockQuery}"`,
          ErrorCode.NETWORK_ERROR,
          undefined,
          { originalError: networkError.message }
        )
      );
      expect(mockHandleResponse).not.toHaveBeenCalled();
    });

    it('should re-throw AppError if fetch itself throws an AppError', async () => {
      const initialAppError = new AppError(
        'Fetch failed with AppError',
        ErrorCode.UNAUTHORIZED,
        401
      );
      (global.fetch as jest.Mock).mockRejectedValueOnce(initialAppError);

      await expect(
        searchRepository.search({ query: mockQuery })
      ).rejects.toThrow(initialAppError);
      expect(mockHandleResponse).not.toHaveBeenCalled();
    });
  });

  describe('searchSongs', () => {
    const query = 'test songs';
    const limit = 5;
    const offset = 1;

    it('should call search with type "songs" and return songs array', async () => {
      const expectedSongs = mockSearchResult.songs;
      // Mock the main search method
      const searchSpy = jest
        .spyOn(searchRepository, 'search')
        .mockResolvedValueOnce({
          songs: expectedSongs,
          albums: [],
          playlists: [],
        });

      const result = await searchRepository.searchSongs(query, limit, offset);

      expect(searchSpy).toHaveBeenCalledWith({
        query,
        type: 'songs',
        limit,
        offset,
      });
      expect(result).toEqual(expectedSongs);
      searchSpy.mockRestore();
    });

    it('should return empty array if search result has no songs', async () => {
      const searchSpy = jest
        .spyOn(searchRepository, 'search')
        .mockResolvedValueOnce({ songs: [], albums: [], playlists: [] });
      const result = await searchRepository.searchSongs(query, limit, offset);
      expect(result).toEqual([]);
      searchSpy.mockRestore();
    });
  });

  describe('searchAlbums', () => {
    const query = 'test albums';
    const limit = 7;
    const offset = 2;

    it('should call search with type "albums" and return albums array', async () => {
      const expectedAlbums = mockSearchResult.albums;
      const searchSpy = jest
        .spyOn(searchRepository, 'search')
        .mockResolvedValueOnce({
          songs: [],
          albums: expectedAlbums,
          playlists: [],
        });

      const result = await searchRepository.searchAlbums(query, limit, offset);

      expect(searchSpy).toHaveBeenCalledWith({
        query,
        type: 'albums',
        limit,
        offset,
      });
      expect(result).toEqual(expectedAlbums);
      searchSpy.mockRestore();
    });

    it('should return empty array if search result has no albums', async () => {
      const searchSpy = jest
        .spyOn(searchRepository, 'search')
        .mockResolvedValueOnce({ songs: [], albums: [], playlists: [] });
      const result = await searchRepository.searchAlbums(query, limit, offset);
      expect(result).toEqual([]);
      searchSpy.mockRestore();
    });
  });

  describe('searchPlaylists', () => {
    const query = 'test playlists';
    const limit = 10;
    const offset = 0;

    it('should call search with type "playlists" and return playlists array', async () => {
      const expectedPlaylists = mockSearchResult.playlists;
      const searchSpy = jest
        .spyOn(searchRepository, 'search')
        .mockResolvedValueOnce({
          songs: [],
          albums: [],
          playlists: expectedPlaylists,
        });

      const result = await searchRepository.searchPlaylists(
        query,
        limit,
        offset
      );

      expect(searchSpy).toHaveBeenCalledWith({
        query,
        type: 'playlists',
        limit,
        offset,
      });
      expect(result).toEqual(expectedPlaylists);
      searchSpy.mockRestore();
    });

    it('should return empty array if search result has no playlists', async () => {
      const searchSpy = jest
        .spyOn(searchRepository, 'search')
        .mockResolvedValueOnce({ songs: [], albums: [], playlists: [] });
      const result = await searchRepository.searchPlaylists(
        query,
        limit,
        offset
      );
      expect(result).toEqual([]);
      searchSpy.mockRestore();
    });
  });

  describe('searchAll', () => {
    const query = 'test all';
    const limitPerType = 3;

    it('should call search with type "all" and return the full search result', async () => {
      const searchSpy = jest
        .spyOn(searchRepository, 'search')
        .mockResolvedValueOnce(mockSearchResult);

      const result = await searchRepository.searchAll(query, limitPerType);

      expect(searchSpy).toHaveBeenCalledWith({
        query,
        type: 'all',
        limit: limitPerType,
        offset: 0,
      });
      expect(result).toEqual(mockSearchResult);
      searchSpy.mockRestore();
    });

    it('should call search with type "all" and default limitPerType when not provided', async () => {
      const query = 'test default limit';
      const defaultLimitPerTypeInSearchAll = 10;
      const searchSpy = jest
        .spyOn(searchRepository, 'search')
        .mockResolvedValueOnce(mockSearchResult);

      await searchRepository.searchAll(query);

      expect(searchSpy).toHaveBeenCalledWith({
        query,
        type: 'all',
        limit: defaultLimitPerTypeInSearchAll,
        offset: 0,
      });
      searchSpy.mockRestore();
    });
  });

  it('search - should correctly create AppError when handleResponse (text path) throws non-AppError', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Headers({ 'Content-Type': 'text/plain' }),
      text: jest.fn().mockRejectedValueOnce(new Error('Failed to parse text')),
      json: jest.fn(),
    } as unknown as Response;

    fetchSpy.mockResolvedValue(mockResponse as Response);

    mockHandleResponse.mockImplementationOnce(async (res: Response) => {
      if (res.headers.get('Content-Type')?.includes('text/plain')) {
        throw new Error('Failed to parse JSON');
      }
      return Promise.reject(
        new Error('Mocked handleResponse called with unexpected content type')
      );
    });

    try {
      await searchRepository.search({ query: mockQuery });
      fail('Should have thrown an error');
    } catch (e: any) {
      expect(e.name).toBe('AppError');
      expect(e.message).toBe(`Search failed for query "${mockQuery}"`);
      expect(e.code).toBe(ErrorCode.UNEXPECTED_ERROR);
      expect(e.details?.originalError).toBe('Failed to parse JSON');
    }
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it('searchAll - should call search with type "all" and default limitPerType when not provided', async () => {
    const query = 'test default limit';
    const defaultLimitPerTypeInSearchAll = 10;
    const searchSpy = jest
      .spyOn(searchRepository, 'search')
      .mockResolvedValueOnce(mockSearchResult);

    await searchRepository.searchAll(query);

    expect(searchSpy).toHaveBeenCalledWith({
      query,
      type: 'all',
      limit: defaultLimitPerTypeInSearchAll,
      offset: 0,
    });
    searchSpy.mockRestore();
  });
});
