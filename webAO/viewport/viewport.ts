import { client } from "../client";
import { UPDATE_INTERVAL } from "../client";
import { AO_HOST } from "../client/aoHost";
import { Viewport } from "./interfaces/Viewport";
import { createBlipsChannels } from "./utils/createBlipChannels";
import { createMusic } from "./utils/createMusic";
import { createSfxAudio } from "./utils/createSfxAudio";
import { createShoutAudio } from "./utils/createShoutAudio";
import { createTestimonyAudio } from "./utils/createTestimonyAudio";
import { testimonies } from "./constants/testimony";
import { set_side } from "./utils/setSide";
import type { RenderContext } from "./executeRenderSequence";

const viewport = (): Viewport => {
  const blipChannels = createBlipsChannels();
  let lastChar = "";
  let lastEvi = 0;
  const music = createMusic();
  let sfxAudio = createSfxAudio();
  const shoutaudio = createShoutAudio();
  const testimonyAudio = createTestimonyAudio();
  let testimonyTimer = 0;
  let testimonyUpdater: any;
  let theme: string;
  let backgroundName = "";

  const getSfxAudio = () => sfxAudio;
  const setSfxAudio = (value: HTMLAudioElement) => {
    sfxAudio = value;
  };
  const getBackgroundName = () => backgroundName;
  const setBackgroundName = (value: string) => {
    backgroundName = value;
  };
  const getBackgroundFolder = () =>
    `${AO_HOST}background/${encodeURI(backgroundName.toLowerCase())}/`;
  const getLastEvidence = () => lastEvi;
  const setLastEvidence = (val: number) => {
    lastEvi = val;
  };
  const setLastCharacter = (val: string) => {
    lastChar = val;
  };
  const getLastCharacter = () => lastChar;
  const getTheme = () => theme;
  const setTheme = (val: string) => {
    theme = val;
  };
  const getTestimonyTimer = () => testimonyTimer;
  const setTestimonyTimer = (val: number) => {
    testimonyTimer = val;
  };
  const setTestimonyUpdater = (val: any) => {
    testimonyUpdater = val;
  };
  const getTestimonyUpdater = () => testimonyUpdater;
  const playSFX = async (sfxname: string, looping: boolean) => {
    sfxAudio.pause();
    sfxAudio.loop = looping;
    sfxAudio.src = sfxname;
    sfxAudio.play().catch(() => {});
  };

  /**
   * Updates the testimony overlay
   */
  const updateTestimony = () => {
    // Update timer
    testimonyTimer += UPDATE_INTERVAL;

    if (!client.testimony) {
      disposeTestimony();
      return;
    }

    const config = testimonies[client.testimony];
    if (testimonyTimer >= config.duration) {
      disposeTestimony();
    } else {
      testimonyUpdater = setTimeout(() => updateTestimony(), UPDATE_INTERVAL);
    }
  };

  /**
   * Dispose the testimony overlay
   */
  const disposeTestimony = () => {
    client.testimony = null;
    testimonyTimer = 0;
    document.getElementById("client_testimony").style.opacity = "0";
    clearTimeout(testimonyUpdater);
  };

  const getRenderContext = (): RenderContext => ({
    aoHost: AO_HOST,
    blipChannels,
    sfxAudio,
    shoutAudio: shoutaudio,
    testimonyAudio,
    playSFX,
    setSide: set_side,
    getLastCharacter,
    setLastCharacter,
    getLastEvidence,
    setLastEvidence,
  });

  return {
    getLastEvidence,
    setLastEvidence,
    setLastCharacter,
    getLastCharacter,
    setTheme,
    getTheme,
    setTestimonyTimer,
    getTestimonyTimer,
    setTestimonyUpdater,
    getTestimonyUpdater,
    testimonyAudio,
    playSFX,
    set_side,
    setBackgroundName,
    updateTestimony,
    disposeTestimony,
    getBackgroundFolder,
    getBackgroundName,
    getSfxAudio,
    setSfxAudio,
    blipChannels,
    music,
    getRenderContext,
  };
};

export default viewport;
