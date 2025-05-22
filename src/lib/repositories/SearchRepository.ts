import BaseRepository from './BaseRepository';
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
      return this.handleResponse(response);
    } catch (error) {
      console.error('Search fetch error:', error);
      throw error; 
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
    });
  }
}

export const searchRepository = SearchRepository.getInstance();
export default searchRepository;
