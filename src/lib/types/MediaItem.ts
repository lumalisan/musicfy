export type MediaItem = {
  id: string | number;
  title: string;
  coverArtUrl: string | null;
  artists: string[];
  href: string;
  type: 'playlist' | 'album';
  color?: string | null;
};
