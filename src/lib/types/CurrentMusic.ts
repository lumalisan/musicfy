import type { Playlist } from "./Playlist";
import type { Song } from "./Song";

export interface CurrentMusic {
    playlist: Playlist | null;
    song: Song | null;
    songsQueue: Song[];
}