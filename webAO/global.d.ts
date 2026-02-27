export {};

declare global {
  interface Window {
    area_click: (el: HTMLElement) => void;
    banPlayer: (id: number) => void;
    changeBlipVolume: () => void;
    changeMusicVolume: (volume?: number) => void;
    getIndexFromSelect: (select_box: string, value: string) => number;
    kickPlayer: (id: number) => void;
    onReplayGo: (_event: Event) => void;
    opusCheck: (channel: HTMLAudioElement) => OnErrorEventHandlerNonNull;
    pickEmotion: (emo: number) => void;
    pickEvidence: (evidence: number) => void;
    reloadTheme: () => void;
    resizeChatbox: () => void;
    setChatbox: (setstyle: string) => void;
    showname_click: (_event: Event | null) => void;
    switchPanTilt: () => Promise<void>;
    updateActionCommands: (side: string) => void;
    updateBackgroundPreview: () => void;
  }
}
