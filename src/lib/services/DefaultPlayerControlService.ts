import type { CurrentMusic } from '../types/CurrentMusic';
import type { PlayerControlService } from '../types/PlayerControlService';

export class DefaultPlayerControlService implements PlayerControlService {
  handlePlayPause(isPlaying: boolean, setIsPlaying: (isPlaying: boolean) => void): void {
    setIsPlaying(!isPlaying);
  }

  handleNext(
    currentMusic: CurrentMusic,
    setCurrentMusic: (currentMusic: CurrentMusic) => void
  ): void {
    const { song, songsQueue } = currentMusic;

    if (!song || !songsQueue || songsQueue.length === 0) {
      console.warn('handleNext: No current song or queue of songs.');
      return;
    }

    const currentIndex = songsQueue.findIndex(s => s.id === song.id);

    if (currentIndex === -1) {
      console.warn('handleNext: The current song was not found in the queue.');
      return;
    }

    if (currentIndex < songsQueue.length - 1) {
      setCurrentMusic({
        ...currentMusic,
        song: songsQueue[currentIndex + 1],
      });
    } else {
      console.log('handleNext: It\'s already the last song in the queue.');
    }
  }

  handlePrevious(
    currentMusic: CurrentMusic,
    setCurrentMusic: (currentMusic: CurrentMusic) => void
  ): void {
    const { song, songsQueue } = currentMusic;

    if (!song || !songsQueue || songsQueue.length === 0) {
      console.warn('handlePrevious: No current song or queue of songs.');
      return;
    }

    const currentIndex = songsQueue.findIndex(s => s.id === song.id);

    if (currentIndex === -1) {
      console.warn('handlePrevious: The current song was not found in the queue.');
      return;
    }

    if (currentIndex > 0) {
      setCurrentMusic({
        ...currentMusic,
        song: songsQueue[currentIndex - 1],
      });
    } else {
      console.log('handlePrevious: It\'s already the first song in the queue.');
    }
  }

  handleRepeat(isRepeat: boolean, setIsRepeat: (isRepeat: boolean) => void): void {
    setIsRepeat(!isRepeat);
  }

  handleShuffle(isRandom: boolean, setIsRandom: (isRandom: boolean) => void): void {
    setIsRandom(!isRandom);
  }
}
