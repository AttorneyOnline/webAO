import { ChatMsg } from "./ChatMsg";
export interface Viewport {
    chat_tick: Function;
    changeMusicVolume: Function;
    reloadTheme: Function;
    playSFX: Function;
    set_side: Function;
    initTestimonyUpdater: Function;
    updateTestimony: Function;
    disposeTestimony: Function;
    handle_ic_speaking: Function;
    handleTextTick: Function;
    theme: string;
    chatmsg: ChatMsg;
    setSfxAudio: Function;
    getSfxAudio: Function;
    getBackgroundFolder: Function;
    blipChannels: HTMLAudioElement[];
    music: any;
    musicVolume: number;
    setBackgroundName: Function;
    lastChar: string;
    getBackgroundName: Function;
}