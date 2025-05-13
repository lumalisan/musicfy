export interface MediaItem {
  id: string | number;
  title: string;
  cover_art_url: string | null;
  artists: string[];
  href: string;
  type: 'playlist' | 'album';
  color?: string | null;
}
