export interface Album {
  id: string;
  title: string;
  cover_art_url?: string;
  color?: string;
  release_date?: string;
  artist_id?: string;
  artists?: { name: string };
}
