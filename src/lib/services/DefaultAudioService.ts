import type { AudioService } from '../types/AudioService';

export class DefaultAudioService implements AudioService {
  async play(audio: HTMLAudioElement): Promise<void> {
    try {
      await audio.play();
    } catch (error) {
      console.error("AudioService: Error when playing", error);
      throw error;
    }
  }

  pause(audio: HTMLAudioElement): void {
    audio.pause();
  }

  setVolume(audio: HTMLAudioElement, volume: number): void {
    audio.volume = Math.max(0, Math.min(1, volume));
  }

  setSrc(audio: HTMLAudioElement, src: string): void {
    audio.src = src;
  }

  load(audio: HTMLAudioElement): void {
    audio.load();
  }
}
