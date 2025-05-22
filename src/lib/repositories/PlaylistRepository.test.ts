import playlistRepository from './PlaylistRepository';
import { searchRepository } from './SearchRepository';
import { AppError, ErrorCode } from '../utils/errorHandling';
import type { PlaylistResult } from '../types/SearchResultItem';
import type { ApiBatchResponse } from '../types/PlaylistSongsAPI';

jest.mock('./SearchRepository', () => ({
  __esModule: true,
  searchRepository: {
    searchPlaylists: jest.fn(),
  },
}));

global.fetch = jest.fn();

const mockPlaylists: PlaylistResult[] = [
  {
    id: 'pl1',
    type: 'playlist',
    name: 'Global Chill Beats',
    owner: 'Musicfy',
    songCount: 15,
    url: '/playlist/pl1',
    image: 'http://example.com/pl1.jpg',
    color: '#1db954',
    isPublic: true,
    songs: [],
    description: 'Description',
    title: 'Title',
  },
  {
    id: 'pl2',
    type: 'playlist',
    name: 'My Awesome Mix',
    owner: 'User123',
    songCount: 30,
    url: '/playlist/pl2',
    image: 'http://example.com/pl2.jpg',
    color: '#ff4500',
    isPublic: false,
    songs: [],
    description: 'Description',
    title: 'Title',
  },
];

const mockApiBatchResponse: ApiBatchResponse = {
  results: [],
  summary: {
    duplicates: 0,
    errors: 0,
    forbidden: 0,
    successfullyAdded: 0,
    totalProcessed: 0,
  },
};

describe('PlaylistRepository', () => {
  const userPlaylistsApiUrl = '/api/user-playlists.json';
  const playlistSongsApiUrl = '/api/playlist-songs.json';
  const origin = 'http://localhost:3000';

  beforeEach(() => {
    (searchRepository.searchPlaylists as jest.Mock).mockReset();
    (global.fetch as jest.Mock).mockReset();
    const originalHandleResponse =
      Object.getPrototypeOf(playlistRepository).constructor.prototype
        .handleResponse;
    if (jest.isMockFunction(originalHandleResponse)) {
      originalHandleResponse.mockRestore();
    }
  });

  describe('search', () => {
    it('should call searchRepository.searchPlaylists with the query and return its result', async () => {
      const query = 'Chill';
      (searchRepository.searchPlaylists as jest.Mock).mockResolvedValue([
        mockPlaylists[0],
      ]);
      const result = await playlistRepository.search(query);
      expect(searchRepository.searchPlaylists).toHaveBeenCalledWith(query);
      expect(result).toEqual([mockPlaylists[0]]);
    });

    it('should return an empty array if query is empty', async () => {
      const result = await playlistRepository.search('');
      expect(result).toEqual([]);
      expect(searchRepository.searchPlaylists).not.toHaveBeenCalled();
    });

    it('should return an empty array if query is whitespace', async () => {
      const result = await playlistRepository.search('   ');
      expect(result).toEqual([]);
      expect(searchRepository.searchPlaylists).not.toHaveBeenCalled();
    });

    it('should propagate errors from searchRepository.searchPlaylists', async () => {
      const query = 'Error Query';
      const expectedError = new Error('Search failed');
      (searchRepository.searchPlaylists as jest.Mock).mockRejectedValue(
        expectedError
      );
      await expect(playlistRepository.search(query)).rejects.toThrow(
        'Search failed'
      );
    });
  });

  describe('getGlobalPlaylists', () => {
    it('should fetch global playlists with default limit and return parsed playlists', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockPlaylists[0]],
        status: 200,
      } as Response);
      const result = await playlistRepository.getGlobalPlaylists(origin);
      expect(global.fetch).toHaveBeenCalledWith(
        `${origin}/api/playlists.json?limit=50`
      );
      expect(result).toEqual([mockPlaylists[0]]);
    });

    it('should fetch global playlists with specified limit', async () => {
      const limit = 10;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockPlaylists[0]],
        status: 200,
      } as Response);
      const result = await playlistRepository.getGlobalPlaylists(origin, limit);
      expect(global.fetch).toHaveBeenCalledWith(
        `${origin}/api/playlists.json?limit=${limit}`
      );
      expect(result).toEqual([mockPlaylists[0]]);
    });

    it('should throw AppError if handleResponse throws (API error)', async () => {
      const apiError = new AppError('API Error', ErrorCode.SERVER_ERROR, 500);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'err' }),
      } as Response);
      const originalHandleResponse =
        Object.getPrototypeOf(playlistRepository).handleResponse;
      Object.getPrototypeOf(playlistRepository).handleResponse = jest
        .fn()
        .mockRejectedValue(apiError);
      await expect(
        playlistRepository.getGlobalPlaylists(origin)
      ).rejects.toThrow(apiError);
      Object.getPrototypeOf(playlistRepository).handleResponse =
        originalHandleResponse;
    });

    it('should throw AppError on network error (fetch rejects)', async () => {
      const networkError = new Error('Network failed');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);
      await expect(
        playlistRepository.getGlobalPlaylists(origin)
      ).rejects.toThrow(
        new AppError(
          'Failed to fetch global playlists',
          ErrorCode.NETWORK_ERROR,
          undefined,
          { originalError: networkError.message }
        )
      );
    });
  });

  describe('getUserPlaylists', () => {
    const headers = { Authorization: 'Bearer token' };
    it('should fetch user playlists with headers and return parsed playlists', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockPlaylists[1]],
        status: 200,
      } as Response);
      const result = await playlistRepository.getUserPlaylists(origin, headers);
      expect(global.fetch).toHaveBeenCalledWith(
        `${origin}/api/user-playlists.json`,
        { headers }
      );
      expect(result).toEqual([mockPlaylists[1]]);
    });

    it('should fetch user playlists without specific headers if not provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockPlaylists[1]],
        status: 200,
      } as Response);
      const result = await playlistRepository.getUserPlaylists(origin);
      expect(global.fetch).toHaveBeenCalledWith(
        `${origin}/api/user-playlists.json`,
        { headers: undefined }
      );
      expect(result).toEqual([mockPlaylists[1]]);
    });

    it('should throw AppError if handleResponse throws (API error)', async () => {
      const apiError = new AppError('API Error', ErrorCode.UNAUTHORIZED, 401);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'err' }),
      } as Response);
      const originalHandleResponse =
        Object.getPrototypeOf(playlistRepository).handleResponse;
      Object.getPrototypeOf(playlistRepository).handleResponse = jest
        .fn()
        .mockRejectedValue(apiError);
      await expect(
        playlistRepository.getUserPlaylists(origin, headers)
      ).rejects.toThrow(apiError);
      Object.getPrototypeOf(playlistRepository).handleResponse =
        originalHandleResponse;
    });

    it('should throw AppError on network error (fetch rejects)', async () => {
      const networkError = new Error('Network failed');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);
      await expect(
        playlistRepository.getUserPlaylists(origin, headers)
      ).rejects.toThrow(
        new AppError(
          'Failed to fetch user playlists',
          ErrorCode.NETWORK_ERROR,
          undefined,
          { originalError: networkError.message }
        )
      );
    });
  });

  describe('createPlaylist', () => {
    const playlistName = 'New Chill Mix';
    const firstSongId = 's123';
    const createdPlaylist: PlaylistResult = {
      id: 'pl-new',
      type: 'playlist',
      name: playlistName,
      title: playlistName,
      description: '',
      owner: 'CurrentUser',
      songCount: 1,
      url: '/playlist/pl-new',
      image: 'http://example.com/default.jpg',
      color: '#cccccc',
      isPublic: false,
      songs: [
        {
          id: firstSongId,
          title: 'First Song',
          duration: 180,
          url: `/song/${firstSongId}`,
          artists: [],
          album: '',
          type: 'song',
          albumId: '',
          artistId: '',
          image: '',
          color: '',
          year: 2024,
        },
      ],
    };

    it('should POST to create playlist and return the new playlist', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => createdPlaylist,
        status: 201,
      } as Response);
      const result = await playlistRepository.createPlaylist(
        playlistName,
        firstSongId
      );
      expect(global.fetch).toHaveBeenCalledWith(userPlaylistsApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playlistName, firstSongId }),
      });
      expect(result).toEqual(createdPlaylist);
    });

    it('should throw AppError if handleResponse throws (API error)', async () => {
      const apiError = new AppError(
        'Creation Failed',
        ErrorCode.SERVER_ERROR,
        500
      );
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'err' }),
      } as Response);
      const originalHandleResponse =
        Object.getPrototypeOf(playlistRepository).handleResponse;
      Object.getPrototypeOf(playlistRepository).handleResponse = jest
        .fn()
        .mockRejectedValue(apiError);
      await expect(
        playlistRepository.createPlaylist(playlistName, firstSongId)
      ).rejects.toThrow(apiError);
      Object.getPrototypeOf(playlistRepository).handleResponse =
        originalHandleResponse;
    });

    it('should throw AppError on network error (fetch rejects)', async () => {
      const networkError = new Error('Network failed');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);
      await expect(
        playlistRepository.createPlaylist(playlistName, firstSongId)
      ).rejects.toThrow(
        new AppError(
          'Failed to create playlist',
          ErrorCode.NETWORK_ERROR,
          undefined,
          { originalError: networkError.message }
        )
      );
    });
  });

  describe('deletePlaylist', () => {
    const playlistIdToDelete = 'pl-to-delete';

    it('should send DELETE request and return true on success (200 OK)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response);
      const result =
        await playlistRepository.deletePlaylist(playlistIdToDelete);
      expect(global.fetch).toHaveBeenCalledWith(
        `${userPlaylistsApiUrl}?id=${encodeURIComponent(playlistIdToDelete)}`,
        {
          method: 'DELETE',
        }
      );
      expect(result).toBe(true);
    });

    it('should send DELETE request and return true on success (204 No Content)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      } as Response);
      const result =
        await playlistRepository.deletePlaylist(playlistIdToDelete);
      expect(global.fetch).toHaveBeenCalledWith(
        `${userPlaylistsApiUrl}?id=${encodeURIComponent(playlistIdToDelete)}`,
        {
          method: 'DELETE',
        }
      );
      expect(result).toBe(true);
    });

    it('should return false if API indicates failure (e.g., 404 Not Found)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);
      const result =
        await playlistRepository.deletePlaylist(playlistIdToDelete);
      expect(result).toBe(false);
    });

    it('should throw AppError on network error (fetch rejects)', async () => {
      const networkError = new Error('Network failed');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);
      await expect(
        playlistRepository.deletePlaylist(playlistIdToDelete)
      ).rejects.toThrow(
        new AppError(
          'Failed to delete playlist due to a network error',
          ErrorCode.NETWORK_ERROR,
          undefined,
          { originalError: networkError.message }
        )
      );
    });
  });

  describe('addSongToPlaylist', () => {
    const playlistId = 'pl1';
    const songIdsToAdd = ['s100', 's101'];

    it('should POST to add songs and return API batch response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiBatchResponse,
        status: 200,
      } as Response);
      const result = await playlistRepository.addSongToPlaylist(
        playlistId,
        songIdsToAdd
      );
      expect(global.fetch).toHaveBeenCalledWith(playlistSongsApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId, songIds: songIdsToAdd }),
      });
      expect(result).toEqual(mockApiBatchResponse);
    });

    it('should throw AppError if handleResponse throws (API error)', async () => {
      const apiError = new AppError(
        'Add Song Failed',
        ErrorCode.SERVER_ERROR,
        500
      );
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'err' }),
      } as Response);
      const originalHandleResponse =
        Object.getPrototypeOf(playlistRepository).handleResponse;
      Object.getPrototypeOf(playlistRepository).handleResponse = jest
        .fn()
        .mockRejectedValue(apiError);
      await expect(
        playlistRepository.addSongToPlaylist(playlistId, songIdsToAdd)
      ).rejects.toThrow(apiError);
      Object.getPrototypeOf(playlistRepository).handleResponse =
        originalHandleResponse;
    });

    it('should throw AppError on network error (fetch rejects)', async () => {
      const networkError = new Error('Network failed');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);
      await expect(
        playlistRepository.addSongToPlaylist(playlistId, songIdsToAdd)
      ).rejects.toThrow(
        new AppError(
          'Failed to add song(s) to playlist',
          ErrorCode.NETWORK_ERROR,
          undefined,
          { originalError: networkError.message }
        )
      );
    });
  });

  describe('removeSongFromPlaylist', () => {
    const playlistId = 'pl1';
    const songIdToRemove = 's100';

    it('should send DELETE request and return true on success (204 No Content)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      } as Response);
      const result = await playlistRepository.removeSongFromPlaylist(
        playlistId,
        songIdToRemove
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${playlistSongsApiUrl}?playlistId=${encodeURIComponent(playlistId)}&songId=${encodeURIComponent(songIdToRemove)}`,
        {
          method: 'DELETE',
        }
      );
      expect(result).toBe(true);
    });

    it('should return false if API indicates failure (e.g., 404 Not Found, not 204)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);
      const result = await playlistRepository.removeSongFromPlaylist(
        playlistId,
        songIdToRemove
      );
      expect(result).toBe(false);
    });

    it('should return false if API returns 200 OK but not 204 (unexpected success)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response);
      const result = await playlistRepository.removeSongFromPlaylist(
        playlistId,
        songIdToRemove
      );
      expect(result).toBe(false);
    });

    it('should throw AppError on network error (fetch rejects)', async () => {
      const networkError = new Error('Network failed');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);
      await expect(
        playlistRepository.removeSongFromPlaylist(playlistId, songIdToRemove)
      ).rejects.toThrow(
        new AppError(
          'Failed to remove song from playlist due to a network error',
          ErrorCode.NETWORK_ERROR,
          undefined,
          { originalError: networkError.message }
        )
      );
    });
  });

  describe('updatePlaylist', () => {
    const playlistId = 'pl-existing';
    const newName = 'Updated Playlist Name';
    const newCoverArtUrl = 'http://example.com/new-image.jpg';
    const newColor = '#00FF00';

    const expectedPayload = {
      playlistId,
      name: newName,
      coverArtUrl: newCoverArtUrl,
      color: newColor,
    };

    const mockApiUpdateResponse: PlaylistResult = {
      id: playlistId,
      type: 'playlist',
      name: newName,
      title: newName,
      description: 'Some description',
      owner: 'CurrentUser',
      songCount: 5,
      url: `/playlist/${playlistId}`,
      image: newCoverArtUrl,
      color: newColor,
      isPublic: false,
      songs: [],
    };

    it('should PUT to update playlist and return the updated playlist details', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiUpdateResponse,
        status: 200,
      } as Response);

      const result = await playlistRepository.updatePlaylist(
        playlistId,
        newName,
        newCoverArtUrl,
        newColor
      );

      expect(global.fetch).toHaveBeenCalledWith(userPlaylistsApiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expectedPayload),
      });
      expect(result).toEqual(mockApiUpdateResponse);
    });

    it('should correctly call updatePlaylist with only name', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockApiUpdateResponse,
          name: newName,
          image: undefined,
          color: undefined,
        }),
        status: 200,
      } as Response);

      const result = await playlistRepository.updatePlaylist(
        playlistId,
        newName
      );

      expect(global.fetch).toHaveBeenCalledWith(userPlaylistsApiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId, name: newName }),
      });
      expect(result.name).toEqual(newName);
    });

    it('should throw AppError if handleResponse throws (API error)', async () => {
      const apiError = new AppError(
        'Update Playlist Failed',
        ErrorCode.SERVER_ERROR,
        500
      );
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'err' }),
      } as Response);
      const originalHandleResponse =
        Object.getPrototypeOf(playlistRepository).handleResponse;
      Object.getPrototypeOf(playlistRepository).handleResponse = jest
        .fn()
        .mockRejectedValue(apiError);

      await expect(
        playlistRepository.updatePlaylist(
          playlistId,
          newName,
          newCoverArtUrl,
          newColor
        )
      ).rejects.toThrow(apiError);

      Object.getPrototypeOf(playlistRepository).handleResponse =
        originalHandleResponse;
    });

    it('should throw AppError on network error (fetch rejects)', async () => {
      const networkError = new Error('Network connection failed');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(
        playlistRepository.updatePlaylist(
          playlistId,
          newName,
          newCoverArtUrl,
          newColor
        )
      ).rejects.toThrow(
        new AppError(
          'Failed to update playlist',
          ErrorCode.NETWORK_ERROR,
          undefined,
          { originalError: networkError.message }
        )
      );
    });
  });
});
