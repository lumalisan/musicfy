export interface ItemInfo {
  id: string;
  type: 'playlist' | 'album';
  name?: string;
  cover_art_url?: string | null;
  artists?: string[];
  color?: string | null;
  description?: string;
}
