import BaseRepository from './BaseRepository';
import { searchRepository } from './SearchRepository';
import type { SongResult } from '../types/SearchResultItem';

export class SongRepository extends BaseRepository<SongResult> {
  constructor() {
    super('/api/songs');
  }

  /**
   * Search for songs by title
   * @param query Search query string
   * @returns Promise with an array of songs matching the query
   */
  async search(query: string): Promise<SongResult[]> {
    if (!query?.trim()) {
      return [];
    }
    return searchRepository.searchSongs(query);
  }

  /**
   * Get songs by album ID
   * @param albumId The ID of the album
   * @returns Promise with an array of songs from the specified album
   */
  async getByAlbum(albumId: string): Promise<SongResult[]> {
    if (!albumId) {
      return [];
    }
    const response = await fetch(
      `${this.baseUrl}.json?album_id=${encodeURIComponent(albumId)}`
    );
    return this.handleResponse(response);
  }

  /**
   * Get songs by artist ID
   * @param artistId The ID of the artist
   * @returns Promise with an array of songs by the specified artist
   */
  async getByArtist(artistId: string): Promise<SongResult[]> {
    if (!artistId) {
      return [];
    }
    const response = await fetch(
      `${this.baseUrl}.json?artist_id=${encodeURIComponent(artistId)}`
    );
    return this.handleResponse(response);
  }
}

const songRepository = new SongRepository();
export default songRepository;
