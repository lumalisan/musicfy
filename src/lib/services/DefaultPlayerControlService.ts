import type { CurrentMusic } from "../types/CurrentMusic";
import type { PlayerControlService } from "../types/PlayerControlService";

export class DefaultPlayerControlService implements PlayerControlService {
    handlePlayPause(isPlaying: boolean) {
        return !isPlaying;
    }

    handleNext(currentMusic: CurrentMusic, setCurrentMusic: (currentMusic: CurrentMusic) => void) {
        const { song, songsQueue } = currentMusic;
        if (
            song &&
            songsQueue.length &&
            song.id !== songsQueue[songsQueue.length - 1].id
        ) {
            setCurrentMusic({
                ...currentMusic,
                song: songsQueue[songsQueue.indexOf(song) + 1],
            });
        }
    }

    handlePrevious(currentMusic: CurrentMusic, setCurrentMusic: (currentMusic: CurrentMusic) => void) {
        const { song, songsQueue } = currentMusic;
        if (song && songsQueue.length && song.id !== songsQueue[0].id) {
            setCurrentMusic({
                ...currentMusic,
                song: songsQueue[songsQueue.indexOf(song) - 1],
            });
        }
    }

    handleRepeat(isRepeat: boolean, setIsRepeat: (isRepeat: boolean) => void) {
        setIsRepeat(!isRepeat);
    }

    handleShuffle(isRandom: boolean, setIsRandom: (isRandom: boolean) => void) {
        setIsRandom(!isRandom);
    }
}