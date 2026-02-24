import type { RenderContext } from "../executeRenderSequence";

export interface Viewport {
  getLastEvidence: () => number;
  setLastEvidence: (val: number) => void;
  setLastCharacter: (val: string) => void;
  getLastCharacter: () => string;
  getTheme: () => string;
  setTheme: (val: string) => void;
  setTestimonyTimer: (val: number) => void;
  getTestimonyTimer: () => number;
  setTestimonyUpdater: (val: any) => void;
  getTestimonyUpdater: () => any;
  testimonyAudio: HTMLAudioElement;
  playSFX: (sfxname: string, looping: boolean) => Promise<void>;
  set_side: (options: { position: string; showSpeedLines: boolean; showDesk: boolean }) => void;
  updateTestimony: () => void;
  disposeTestimony: () => void;
  getSfxAudio: () => HTMLAudioElement;
  setSfxAudio: (value: HTMLAudioElement) => void;
  getBackgroundFolder: () => string;
  getBackgroundName: () => string;
  setBackgroundName: (value: string) => void;
  blipChannels: HTMLAudioElement[];
  music: any;
  getRenderContext: () => RenderContext;
}
