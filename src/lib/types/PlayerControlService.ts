import type { CurrentMusic } from "./CurrentMusic";

export interface PlayerControlService {
    handlePlayPause(isPlaying: boolean): boolean;
    handleNext(currentMusic: CurrentMusic, setCurrentMusic: (currentMusic: CurrentMusic) => void): void;
    handlePrevious(currentMusic: CurrentMusic, setCurrentMusic: (currentMusic: CurrentMusic) => void): void;
    handleRepeat(isRepeat: boolean, setIsRepeat: (isRepeat: boolean) => void): void;
    handleShuffle(isRandom: boolean, setIsRandom: (isRandom: boolean) => void): void;
}