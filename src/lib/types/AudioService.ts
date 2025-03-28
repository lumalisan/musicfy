export interface AudioService {
  play(audio: HTMLAudioElement): void;
  pause(audio: HTMLAudioElement): void;
  setVolume(audio: HTMLAudioElement, volume: number): void;
  setSrc(audio: HTMLAudioElement, src: string): void;
}
