import type { ItemInfo } from './ItemInfo';
import type { Song } from './Song';

export interface CurrentMusic {
  itemInfo?: ItemInfo | null;
  song?: Song | null;
  songsQueue: Song[];
}
