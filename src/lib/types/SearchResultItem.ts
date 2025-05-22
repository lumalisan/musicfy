/**
 * Base interface for all search result items
 */
export interface SearchResultItem {
  /** Unique identifier for the item */
  id: string;
  /** Type of the media item */
  type: 'song' | 'album' | 'playlist';
  /** Title of the item */
  title: string;
  /** URL to the item's cover art image */
  image: string | null;
  /** URL to the item's detail page */
  url: string;
  /** Additional properties that might be present on the item */
  [key: string]: any;
}

/**
 * Represents a song in search results
 */
export interface SongResult extends SearchResultItem {
  type: 'song';
  /** Name(s) of the artist(s) */
  artists: string[];
  /** Name of the album this song belongs to */
  album: string;
  /** Duration in seconds */
  duration: number;
  /** Optional accent color for UI theming */
  color?: string;
  /** Optional release year */
  year?: number;
  /** Optional album ID for navigation */
  albumId?: string;
  /** Optional artist ID for navigation */
  artistId?: string;
}

/**
 * Represents an album in search results
 */
export interface AlbumResult extends SearchResultItem {
  type: 'album';
  /** Name(s) of the artist(s) */
  artists: string[];
  /** Release year */
  year: number | null;
  /** Optional accent color for UI theming */
  color?: string;
  /** Optional artist ID for navigation */
  artistId?: string;
  /** Optional track count */
  trackCount?: number;
}

/**
 * Represents a playlist in search results
 */
export interface PlaylistResult extends SearchResultItem {
  type: 'playlist';
  /** Playlist description */
  description: string;
  /** Optional accent color for UI theming */
  color?: string;
  /** Optional creator user ID */
  creatorId?: string;
  /** Optional creator display name */
  creatorName?: string;
  /** Optional track count */
  trackCount?: number;
}

/**
 * Collection of search results grouped by type
 */
export interface SearchResult {
  /** Array of song results */
  songs: SongResult[];
  /** Array of album results */
  albums: AlbumResult[];
  /** Array of playlist results */
  playlists: PlaylistResult[];
  /** Optional error messages for each search type */
  errors?: {
    songs?: string;
    albums?: string;
    playlists?: string;
  };
}
