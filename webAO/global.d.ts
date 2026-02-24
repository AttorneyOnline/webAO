interface Window {
  area_click(el: HTMLElement): void;
  changeBlipVolume(): void;
  changeMusicVolume(volume?: number): void;
  getIndexFromSelect(select_box: string, value: string): number;
  onReplayGo(event: Event): void;
  opusCheck(channel: HTMLAudioElement): void;
  pickEmotion(emo: number): void;
  pickEvidence(i: number): void;
  reloadTheme(): void;
  resizeChatbox(): void;
  setChatbox(setstyle: string): void;
  showname_click(event: Event | null): void;
  switchPanTilt(): Promise<void>;
  updateActionCommands(side: string): void;
  updateBackgroundPreview(): void;
  kickPlayer(playerID: number): void;
  banPlayer(playerID: number): void;
}
