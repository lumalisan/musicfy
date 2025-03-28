import type { AudioService } from "../types/AudioService";

export class DefaultAudioService implements AudioService {
    play(audio: HTMLAudioElement) {
        audio.play();
    }

    pause(audio: HTMLAudioElement) {
        audio.pause();
    }

    setVolume(audio: HTMLAudioElement, volume: number) {
        audio.volume = volume;
    }

    setSrc(audio: HTMLAudioElement, src: string) {
        audio.src = src;
    }
}