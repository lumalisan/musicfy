import BaseRepository from './BaseRepository';
import { searchRepository } from './SearchRepository';
import type { AlbumResult } from '../types/SearchResultItem';

export class AlbumRepository extends BaseRepository<AlbumResult> {
  constructor() {
    super('/api/albums');
  }

  /**
   * Search for albums by title
   * @param query Search query string
   * @returns Promise with an array of albums matching the query
   */
  async search(query: string): Promise<AlbumResult[]> {
    if (!query?.trim()) {
      return [];
    }
    return searchRepository.searchAlbums(query);
  }

  /**
   * Get all albums
   * @returns Promise with an array of all albums
   */
  async getAll(): Promise<AlbumResult[]> {
    const response = await fetch(`${this.baseUrl}.json`);
    return this.handleResponse(response);
  }

  /**
   * Get albums by artist ID
   * @param artistId The ID of the artist
   * @returns Promise with an array of albums by the specified artist
   */
  async getByArtist(artistId: string): Promise<AlbumResult[]> {
    if (!artistId) {
      return [];
    }
    const response = await fetch(
      `${this.baseUrl}.json?artist_id=${encodeURIComponent(artistId)}`
    );
    return this.handleResponse(response);
  }
}

const albumRepository = new AlbumRepository();
export default albumRepository;
