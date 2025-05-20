interface SearchResultItem {
  id: string;
  type: 'song' | 'album' | 'playlist';
  title: string;
  image: string | null;
  url: string;
  [key: string]: any;
}

interface SongResult extends SearchResultItem {
  type: 'song';
  artist: string;
  album: string;
  duration: number;
}

interface AlbumResult extends SearchResultItem {
  type: 'album';
  artist: string;
  year: number | null;
}

interface PlaylistResult extends SearchResultItem {
  type: 'playlist';
  description: string;
}

export interface SearchResult {
  songs: SongResult[];
  albums: AlbumResult[];
  playlists: PlaylistResult[];
}
