import BaseRepository from './BaseRepository';
import { searchRepository } from './SearchRepository';
import type { PlaylistResult } from '../types/SearchResultItem';
import type { ApiBatchResponse } from '../types/PlaylistSongsAPI';

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
  async getGlobalPlaylists(origin: string, limit: number = 50): Promise<PlaylistResult[]> {
    // Fetches general playlists, not user-specific ones
    const response = await fetch(`${origin}/api/playlists.json?limit=${limit}`);
    return this.handleResponse(response);
  }

  /**
   * Get all user playlists
   * @returns Promise with an array of the current user's playlists
   */
  async getUserPlaylists(origin: string, headers?: HeadersInit): Promise<PlaylistResult[]> {
    const response = await fetch(`${origin}/api/user-playlists.json`, { headers });
    return this.handleResponse(response);
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
    const response = await fetch(`/api/user-playlists.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, firstSongId }),
    });
    return this.handleResponse(response);
  }

  /**
   * Delete a playlist
   * @param playlistId ID of the playlist to delete
   * @returns Promise that resolves to true if successful
   */
  async deletePlaylist(playlistId: string): Promise<boolean> {
    const response = await fetch(
      `/api/user-playlists.json?id=${encodeURIComponent(playlistId)}`,
      {
        method: 'DELETE',
      }
    );
    return response.ok;
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
    const response = await fetch(`/api/playlist-songs.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playlistId, songIds }),
    });
    return this.handleResponse(response);
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
    const response = await fetch(
      `/api/playlist-songs.json?playlistId=${encodeURIComponent(playlistId)}&songId=${encodeURIComponent(songId)}`,
      {
        method: 'DELETE',
      }
    );
    // DELETE should return 204 No Content on success
    return response.status === 204;
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

    const response = await fetch(`/api/user-playlists.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return this.handleResponse(response);
  }
}

export default new PlaylistRepository();
