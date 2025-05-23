import type { ApiBatchResponse } from '../types/PlaylistSongsAPI';
import type { PlaylistResult } from '../types/SearchResultItem';
import { AppError, ErrorCode } from '../utils/errorHandling';

import BaseRepository from './BaseRepository';
import { searchRepository } from './SearchRepository';

export class PlaylistRepository extends BaseRepository<PlaylistResult> {
  constructor() {
    super('/api/playlists');
  }

  /**
   * Search for playlists by name
   * @param query Search query string
   * @returns Promise with an array of playlists matching the query
   */
  async search(query: string): Promise<PlaylistResult[]> {
    if (!query?.trim()) {
      return [];
    }
    return searchRepository.searchPlaylists(query);
  }

  /**
   * Get all global playlists
   * @param limit Optional limit of playlists to fetch
   * @returns Promise with an array of global playlists
   */
  async getGlobalPlaylists(
    origin: string,
    limit: number = 50
  ): Promise<PlaylistResult[]> {
    // Fetches general playlists, not user-specific ones
    try {
      const response = await fetch(
        `${origin}/api/playlists.json?limit=${limit}`
      );
      return this.handleResponse(response);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        'Failed to fetch global playlists',
        ErrorCode.NETWORK_ERROR,
        undefined,
        {
          originalError: error instanceof Error ? error.message : String(error),
        }
      );
    }
  }

  /**
   * Get all user playlists
   * @returns Promise with an array of the current user's playlists
   */
  async getUserPlaylists(
    origin: string,
    headers?: HeadersInit
  ): Promise<PlaylistResult[]> {
    try {
      const response = await fetch(`${origin}/api/user-playlists.json`, {
        headers,
      });
      return this.handleResponse(response);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        'Failed to fetch user playlists',
        ErrorCode.NETWORK_ERROR,
        undefined,
        {
          originalError: error instanceof Error ? error.message : String(error),
        }
      );
    }
  }

  /**
   * Create a new playlist
   * @param name Name of the playlist
   * @param description Optional description
   * @param isPublic Whether the playlist is public
   * @returns Promise with the created playlist
   */
  async createPlaylist(
    name: string,
    firstSongId: string
  ): Promise<PlaylistResult> {
    try {
      const response = await fetch(`/api/user-playlists.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, firstSongId }),
      });
      return this.handleResponse(response);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        'Failed to create playlist',
        ErrorCode.NETWORK_ERROR,
        undefined,
        {
          originalError: error instanceof Error ? error.message : String(error),
        }
      );
    }
  }

  /**
   * Delete a playlist
   * @param playlistId ID of the playlist to delete
   * @returns Promise that resolves to true if successful
   */
  async deletePlaylist(playlistId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `/api/user-playlists.json?id=${encodeURIComponent(playlistId)}`,
        {
          method: 'DELETE',
        }
      );
      return response.ok;
    } catch (error) {
      // For network errors, throw AppError. API errors (response not ok) are handled by returning false.
      if (error instanceof AppError) throw error;
      throw new AppError(
        'Failed to delete playlist due to a network error',
        ErrorCode.NETWORK_ERROR,
        undefined,
        {
          originalError: error instanceof Error ? error.message : String(error),
        }
      );
    }
  }

  /**
   * Add a song to a playlist
   * @param playlistId ID of the playlist
   * @param songId ID of the song to add
   * @returns Promise that resolves to true if successful
   */
  async addSongToPlaylist(
    playlistId: string,
    songIds: string[]
  ): Promise<ApiBatchResponse> {
    try {
      const response = await fetch(`/api/playlist-songs.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId, songIds }),
      });
      return this.handleResponse(response);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        'Failed to add song(s) to playlist',
        ErrorCode.NETWORK_ERROR,
        undefined,
        {
          originalError: error instanceof Error ? error.message : String(error),
        }
      );
    }
  }

  /**
   * Remove a song from a playlist
   * @param playlistId ID of the playlist
   * @param songId ID of the song to remove
   * @returns Promise that resolves to true if successful
   */
  async removeSongFromPlaylist(
    playlistId: string,
    songId: string
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `/api/playlist-songs.json?playlistId=${encodeURIComponent(playlistId)}&songId=${encodeURIComponent(songId)}`,
        {
          method: 'DELETE',
        }
      );
      // DELETE should return 204 No Content on success
      return response.status === 204;
    } catch (error) {
      // For network errors, throw AppError. API errors (status not 204) are handled by returning false.
      if (error instanceof AppError) throw error;
      throw new AppError(
        'Failed to remove song from playlist due to a network error',
        ErrorCode.NETWORK_ERROR,
        undefined,
        {
          originalError: error instanceof Error ? error.message : String(error),
        }
      );
    }
  }

  /**
   * Update an existing playlist's details.
   * @param playlistId ID of the playlist to update.
   * @param name New name for the playlist.
   * @param coverArtUrl Optional new cover art URL.
   * @param color Optional new color.
   * @returns Promise with the updated playlist.
   */
  async updatePlaylist(
    playlistId: string,
    name: string,
    coverArtUrl?: string,
    color?: string
  ): Promise<PlaylistResult> {
    const payload: any = { playlistId, name };
    if (coverArtUrl !== undefined) {
      payload.coverArtUrl = coverArtUrl;
    }
    if (color !== undefined) {
      payload.color = color;
    }

    try {
      const response = await fetch(`/api/user-playlists.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return this.handleResponse(response);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        'Failed to update playlist',
        ErrorCode.NETWORK_ERROR,
        undefined,
        {
          originalError: error instanceof Error ? error.message : String(error),
        }
      );
    }
  }
}

export default new PlaylistRepository();
