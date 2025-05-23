export type ItemInfo = {
  id: string;
  type: 'playlist' | 'album';
  name?: string;
  coverArtUrl?: string | null;
  artists?: string[];
  color?: string | null;
  description?: string;
  creatorUserId?: string;
};
