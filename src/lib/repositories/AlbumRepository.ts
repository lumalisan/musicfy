import BaseRepository from './BaseRepository';
import { searchRepository } from './SearchRepository';
import type { AlbumResult } from '../types/SearchResultItem';
import { AppError, ErrorCode } from '../utils/errorHandling';

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
  async getAll(origin: string): Promise<AlbumResult[]> {
    try {
      const response = await fetch(`${origin}${this.baseUrl}.json`);
      return this.handleResponse(response);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      // For generic errors (like network errors), wrap them in an AppError
      throw new AppError(
        'A network error occurred while fetching all albums. Please check your connection.',
        ErrorCode.NETWORK_ERROR,
        undefined,
        {
          originalError: error instanceof Error ? error.message : String(error),
        }
      );
    }
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
    try {
      const response = await fetch(
        `${this.baseUrl}.json?artist_id=${encodeURIComponent(artistId)}`
      );
      return this.handleResponse(response);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      // For generic errors (like network errors), wrap them in an AppError
      throw new AppError(
        'A network error occurred while fetching albums by artist. Please check your connection.',
        ErrorCode.NETWORK_ERROR,
        undefined,
        {
          originalError: error instanceof Error ? error.message : String(error),
        }
      );
    }
  }
}

const albumRepository = new AlbumRepository();
export default albumRepository;
