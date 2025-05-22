import BaseRepository from './BaseRepository';
import { AppError, ErrorCode } from '../utils/errorHandling';
import type {
  SearchResult,
  SongResult,
  AlbumResult,
  PlaylistResult,
} from '../types/SearchResultItem';

export interface SearchOptions {
  query: string;
  type?: 'all' | 'songs' | 'albums' | 'playlists';
  limit?: number;
  offset?: number;
}

export class SearchRepository extends BaseRepository<SearchResult> {
  private static instance: SearchRepository;

  private constructor() {
    super('/api/search');
  }

  public static getInstance(): SearchRepository {
    if (!SearchRepository.instance) {
      SearchRepository.instance = new SearchRepository();
    }
    return SearchRepository.instance;
  }

  /**
   * Search for songs, albums, and playlists
   * @param options Search options including query, type, and limit
   * @returns Promise with search results
   */
  async search({
    query,
    type = 'all',
    limit = 20,
    offset = 0,
  }: SearchOptions): Promise<SearchResult> {
    if (!query?.trim()) {
      return { songs: [], albums: [], playlists: [] };
    }

    const params = new URLSearchParams({
      q: query.trim(),
      type,
      limit: limit.toString(),
      offset: offset.toString(),
    });

    try {
      const response = await fetch(`${this.baseUrl}.json?${params.toString()}`);
      return await this.handleResponse(response);
    } catch (error: unknown) {
      // Type guard to check if the error has the structure of an AppError or similar
      const isAppErrorLike = (
        e: any
      ): e is { name: string; code: any; message: string } => {
        return (
          e &&
          typeof e.name === 'string' &&
          typeof e.code !== 'undefined' &&
          typeof e.message === 'string'
        );
      };

      if (isAppErrorLike(error) && error.name === 'AppError') {
        // If it's already an AppError (or looks like one), re-throw it
        throw error;
      } else {
        // For other errors, wrap in a new AppError
        const originalErrorMessage =
          error instanceof Error ? error.message : 'An unknown error occurred';
        throw new AppError(
          `Search failed for query "${query.trim()}"`,
          ErrorCode.UNEXPECTED_ERROR,
          undefined,
          { originalError: originalErrorMessage }
        );
      }
    }
  }

  /**
   * Search for songs
   * @param query Search query
   * @param limit Maximum number of results to return
   * @param offset Pagination offset
   * @returns Promise with song results
   */
  async searchSongs(
    query: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<SongResult[]> {
    const result = await this.search({ query, type: 'songs', limit, offset });
    return result.songs || [];
  }

  /**
   * Search for albums
   * @param query Search query
   * @param limit Maximum number of results to return
   * @param offset Pagination offset
   * @returns Promise with album results
   */
  async searchAlbums(
    query: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<AlbumResult[]> {
    const result = await this.search({ query, type: 'albums', limit, offset });
    return result.albums || [];
  }

  /**
   * Search for playlists
   * @param query Search query
   * @param limit Maximum number of results to return
   * @param offset Pagination offset
   * @returns Promise with playlist results
   */
  async searchPlaylists(
    query: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<PlaylistResult[]> {
    const result = await this.search({
      query,
      type: 'playlists',
      limit,
      offset,
    });
    return result.playlists || [];
  }

  /**
   * Get all search results (songs, albums, playlists)
   * @param query Search query
   * @param limitPerType Maximum number of results per type
   * @returns Promise with all search results
   */
  async searchAll(
    query: string,
    limitPerType: number = 10
  ): Promise<SearchResult> {
    return this.search({
      query,
      type: 'all',
      limit: limitPerType,
      offset: 0,
    });
  }
}

export const searchRepository = SearchRepository.getInstance();
export default searchRepository;
