export interface Album {
  id: string;
  title: string;
  coverArtUrl?: string;
  color?: string;
  releaseDate?: string;
  artistId?: string;
  artists?: { name: string };
}
