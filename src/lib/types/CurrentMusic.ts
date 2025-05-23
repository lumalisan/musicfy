import type { ItemInfo } from './ItemInfo';
import type { Song } from './Song';

export type CurrentMusic = {
  itemInfo?: ItemInfo | null;
  song?: Song | null;
  songsQueue: Song[];
};
