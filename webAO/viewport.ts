import tryUrls from "./utils/tryUrls";
import fileExists from "./utils/fileExists";
import Client, { delay } from "./client";
import {opusCheck} from './dom/opusCheck'
import { UPDATE_INTERVAL } from "./client";
import { setChatbox } from "./dom/setChatbox";
import { resizeChatbox } from "./dom/resizeChatbox";
import transparentPng from "./constants/transparentPng";
import mlConfig from "./utils/aoml";
import { appendICLog } from "./client";
import { checkCallword } from "./client";
import setEmote from "./client/setEmote";
import getAnimLength from "./utils/getAnimLength";
import { safeTags } from "./encoding";
import setCookie from "./utils/setCookie";
import { AO_HOST } from "./client/aoHost";
interface ChatMsg {
  content: string;
  objection: number;
  sound: string;
  startpreanim: boolean;
  startspeaking: boolean;
  side: any;
  color: number;
  snddelay: number;
  preanimdelay: number;
  speed: number;
  blips: string;
  self_offset?: number[];
  other_offset?: number[];
  showname?: string;
  nameplate?: string;
  flip?: number;
  other_flip?: number;
  effects?: string[];
  deskmod?: number;
  preanim?: string;
  other_name?: string;
  sprite?: string;
  name?: string;
  chatbox?: string;
  other_emote?: string;
  parsed?: HTMLSpanElement[];
  screenshake?: number;
  flash?: number;
  type?: number;
  evidence?: number;
  looping_sfx?: boolean;
  noninterrupting_preanim?: number;
}
interface Testimony {
  [key: number]: string;
}
export interface Viewport {
  chat_tick: Function;
  changeMusicVolume: Function;
  changeBlipVolume: Function;
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
const SHOUTS = [undefined, "holdit", "objection", "takethat", "custom"];

const COLORS = [
  "white",
  "green",
  "red",
  "orange",
  "blue",
  "yellow",
  "pink",
  "cyan",
  "grey",
];
const createMusic = () => {
  const audioChannels = document.getElementsByClassName(
    "audioChannel"
  ) as HTMLCollectionOf<HTMLAudioElement>;
  let music = [...audioChannels];
  music.forEach((channel: HTMLAudioElement) => (channel.volume = 0.5));
  music.forEach(
    (channel: HTMLAudioElement) => (channel.onerror = opusCheck(channel))
  );
  return music;
};
const createTestimonyAudio = () => {
  const testimonyAudio = document.getElementById(
    "client_testimonyaudio"
  ) as HTMLAudioElement;
  testimonyAudio.src = `${AO_HOST}sounds/general/sfx-guilty.opus`;
  return testimonyAudio;
};

const createShoutAudio = () => {
  const shoutAudio = document.getElementById(
    "client_shoutaudio"
  ) as HTMLAudioElement;
  shoutAudio.src = `${AO_HOST}misc/default/objection.opus`;
  return shoutAudio;
};
const createSfxAudio = () => {
  const sfxAudio = document.getElementById(
    "client_sfxaudio"
  ) as HTMLAudioElement;
  sfxAudio.src = `${AO_HOST}sounds/general/sfx-realization.opus`;
  return sfxAudio;
};
const createBlipsChannels = () => {
  const blipSelectors = document.getElementsByClassName(
    "blipSound"
  ) as HTMLCollectionOf<HTMLAudioElement>;

  const blipChannels = [...blipSelectors];
  // Allocate multiple blip audio channels to make blips less jittery
  blipChannels.forEach((channel: HTMLAudioElement) => (channel.volume = 0.5));
  blipChannels.forEach(
    (channel: HTMLAudioElement) => (channel.onerror = opusCheck(channel))
  );
  return blipChannels;
};
const defaultChatMsg = {
  content: "",
  objection: 0,
  sound: "",
  startpreanim: true,
  startspeaking: false,
  side: null,
  color: 0,
  snddelay: 0,
  preanimdelay: 0,
  speed: UPDATE_INTERVAL,
} as ChatMsg;
interface Desk {
  ao2?: string;
  ao1?: string;
}
interface Position {
  bg?: string;
  desk?: Desk;
  speedLines: string;
}

interface Positions {
  [key: string]: Position;
}

const positions: Positions = {
  def: {
    bg: "defenseempty",
    desk: { ao2: "defensedesk.png", ao1: "bancodefensa.png" } as Desk,
    speedLines: "defense_speedlines.gif",
  },
  pro: {
    bg: "prosecutorempty",
    desk: { ao2: "prosecutiondesk.png", ao1: "bancoacusacion.png" } as Desk,
    speedLines: "prosecution_speedlines.gif",
  },
  hld: {
    bg: "helperstand",
    desk: null as Desk,
    speedLines: "defense_speedlines.gif",
  },
  hlp: {
    bg: "prohelperstand",
    desk: null as Desk,
    speedLines: "prosecution_speedlines.gif",
  },
  wit: {
    bg: "witnessempty",
    desk: { ao2: "stand.png", ao1: "estrado.png" } as Desk,
    speedLines: "prosecution_speedlines.gif",
  },
  jud: {
    bg: "judgestand",
    desk: { ao2: "judgedesk.png", ao1: "judgedesk.gif" } as Desk,
    speedLines: "prosecution_speedlines.gif",
  },
  jur: {
    bg: "jurystand",
    desk: { ao2: "jurydesk.png", ao1: "estrado.png" } as Desk,
    speedLines: "defense_speedlines.gif",
  },
  sea: {
    bg: "seancestand",
    desk: { ao2: "seancedesk.png", ao1: "estrado.png" } as Desk,
    speedLines: "prosecution_speedlines.gif",
  },
};
const viewport = (masterClient: Client): Viewport => {
  let animating = false;
  let attorneyMarkdown = mlConfig(AO_HOST);
  let blipChannels = createBlipsChannels();
  let chatmsg = defaultChatMsg;
  let client = masterClient;
  let currentBlipChannel = 0;
  let lastChar = "";
  let lastEvi = 0;
  let music = createMusic();
  let musicVolume = 0;
  let sfxAudio = createSfxAudio();
  let sfxplayed = 0;
  let shoutTimer = 0;
  let shoutaudio = createShoutAudio();
  let startFirstTickCheck: boolean;
  let startSecondTickCheck: boolean;
  let startThirdTickCheck: boolean;
  let testimonyAudio = createTestimonyAudio();
  let testimonyTimer = 0;
  let testimonyUpdater: any;
  let textnow = "";
  let theme: string;
  let tickTimer = 0;
  let updater: any;
  let backgroundName = "";
  const getSfxAudio = () => sfxAudio;
  const setSfxAudio = (value: HTMLAudioElement) => (sfxAudio = value);
  const getBackgroundName = () => backgroundName;
  const setBackgroundName = (value: string) => (backgroundName = value);
  const getBackgroundFolder = () =>
    `${AO_HOST}background/${encodeURI(backgroundName.toLowerCase())}/`;

  const playSFX = async (sfxname: string, looping: boolean) => {
    sfxAudio.pause();
    sfxAudio.loop = looping;
    sfxAudio.src = sfxname;
    sfxAudio.play();
  };

  /**
   * Changes the viewport background based on a given position.
   *
   * Valid positions: `def, pro, hld, hlp, wit, jud, jur, sea`
   * @param {string} position the position to change into
   */
  const set_side = async ({
    position,
    showSpeedLines,
    showDesk,
  }: {
    position: string;
    showSpeedLines: boolean;
    showDesk: boolean;
  }) => {
    const view = document.getElementById("client_fullview");

    let bench: HTMLImageElement;
    if ("def,pro,wit".includes(position)) {
      bench = <HTMLImageElement>(
        document.getElementById(`client_${position}_bench`)
      );
    } else {
      bench = <HTMLImageElement>document.getElementById("client_bench_classic");
    }

    let court: HTMLImageElement;
    if ("def,pro,wit".includes(position)) {
      court = <HTMLImageElement>(
        document.getElementById(`client_court_${position}`)
      );
    } else {
      court = <HTMLImageElement>document.getElementById("client_court_classic");
    }

    let bg;
    let desk;
    let speedLines;

    if ("def,pro,hld,hlp,wit,jud,jur,sea".includes(position)) {
      bg = positions[position].bg;
      desk = positions[position].desk;
      speedLines = positions[position].speedLines;
    } else {
      bg = `${position}`;
      desk = { ao2: `${position}_overlay.png`, ao1: "_overlay.png" };
      speedLines = "defense_speedlines.gif";
    }

    if (showSpeedLines === true) {
      court.src = `${AO_HOST}themes/default/${encodeURI(speedLines)}`;
    } else {
      court.src = await tryUrls(getBackgroundFolder() + bg);
    }

    if (showDesk === true && desk) {
      const deskFilename = (await fileExists(getBackgroundFolder() + desk.ao2))
        ? desk.ao2
        : desk.ao1;
      bench.src = getBackgroundFolder() + deskFilename;
      bench.style.opacity = "1";
    } else {
      bench.style.opacity = "0";
    }

    if ("def,pro,wit".includes(position)) {
      view.style.display = "";
      document.getElementById("client_classicview").style.display = "none";
      switch (position) {
        case "def":
          view.style.left = "0";
          break;
        case "wit":
          view.style.left = "-200%";
          break;
        case "pro":
          view.style.left = "-400%";
          break;
      }
    } else {
      view.style.display = "none";
      document.getElementById("client_classicview").style.display = "";
    }
  };

  /**
   * Intialize testimony updater
   */
  const initTestimonyUpdater = () => {
    const testimonyFilenames: Testimony = {
      1: "witnesstestimony",
      2: "crossexamination",
      3: "notguilty",
      4: "guilty",
    };

    const testimony = testimonyFilenames[masterClient.testimonyID];
    if (!testimony) {
      console.warn(`Invalid testimony ID ${masterClient.testimonyID}`);
      return;
    }

    testimonyAudio.src = masterClient.resources[testimony].sfx;
    testimonyAudio.play();

    const testimonyOverlay = <HTMLImageElement>(
      document.getElementById("client_testimony")
    );
    testimonyOverlay.src = masterClient.resources[testimony].src;
    testimonyOverlay.style.opacity = "1";

    testimonyTimer = 0;
    testimonyUpdater = setTimeout(() => updateTestimony(), UPDATE_INTERVAL);
  };

  /**
   * Updates the testimony overaly
   */
  const updateTestimony = () => {
    const testimonyFilenames: Testimony = {
      1: "witnesstestimony",
      2: "crossexamination",
      3: "notguilty",
      4: "guilty",
    };

    // Update timer
    testimonyTimer += UPDATE_INTERVAL;

    const testimony = testimonyFilenames[masterClient.testimonyID];
    const resource = masterClient.resources[testimony];
    if (!resource) {
      disposeTestimony();
      return;
    }

    if (testimonyTimer >= resource.duration) {
      disposeTestimony();
    } else {
      testimonyUpdater = setTimeout(() => updateTestimony(), UPDATE_INTERVAL);
    }
  };

  /**
   * Dispose the testimony overlay
   */
  const disposeTestimony = () => {
    masterClient.testimonyID = 0;
    testimonyTimer = 0;
    document.getElementById("client_testimony").style.opacity = "0";
    clearTimeout(testimonyUpdater);
  };

  /**
   * Sets a new emote.
   * This sets up everything before the tick() loops starts
   * a lot of things can probably be moved here, like starting the shout animation if there is one
   * TODO: the preanim logic, on the other hand, should probably be moved to tick()
   * @param {object} chatmsg the new chat message
   */
  const handle_ic_speaking = async (playerChatMsg: ChatMsg) => {
    chatmsg = playerChatMsg;
    client.viewport.chatmsg = playerChatMsg;

    textnow = "";
    sfxplayed = 0;
    tickTimer = 0;
    animating = true;
    startFirstTickCheck = true;
    startSecondTickCheck = false;
    startThirdTickCheck = false;
    let charLayers = document.getElementById("client_char");
    let pairLayers = document.getElementById("client_pair_char");
    // stop updater
    clearTimeout(updater);

    // stop last sfx from looping any longer
    sfxAudio.loop = false;

    const fg = <HTMLImageElement>document.getElementById("client_fg");
    const gamewindow = document.getElementById("client_gamewindow");
    const waitingBox = document.getElementById("client_chatwaiting");

    // Reset CSS animation
    gamewindow.style.animation = "";
    waitingBox.style.opacity = "0";

    const eviBox = document.getElementById("client_evi");

    if (lastEvi !== chatmsg.evidence) {
      eviBox.style.opacity = "0";
      eviBox.style.height = "0%";
    }
    lastEvi = chatmsg.evidence;

    const validSides: string[] = ["def", "pro", "wit"]; // these are for the full view pan, the other positions use 'client_char'
    if (validSides.includes(chatmsg.side)) {
      charLayers = document.getElementById(`client_${chatmsg.side}_char`);
      pairLayers = document.getElementById(`client_${chatmsg.side}_pair_char`);
    }

    const chatContainerBox = document.getElementById("client_chatcontainer");
    const nameBoxInner = document.getElementById("client_inner_name");
    const chatBoxInner = document.getElementById("client_inner_chat");

    const displayname =
      (<HTMLInputElement>document.getElementById("showname")).checked &&
      chatmsg.showname !== ""
        ? chatmsg.showname
        : chatmsg.nameplate;

    // Clear out the last message
    chatBoxInner.innerText = textnow;
    nameBoxInner.innerText = displayname;

    if (lastChar !== chatmsg.name) {
      charLayers.style.opacity = "0";
      pairLayers.style.opacity = "0";
    }

    lastChar = chatmsg.name;
    client.viewport.lastChar = chatmsg.name;

    appendICLog(chatmsg.content, chatmsg.showname, chatmsg.nameplate);

    checkCallword(chatmsg.content, sfxAudio);

    setEmote(
      AO_HOST,
      client,
      chatmsg.name.toLowerCase(),
      chatmsg.sprite,
      "(a)",
      false,
      chatmsg.side
    );

    if (chatmsg.other_name) {
      setEmote(
        AO_HOST,
        client,
        chatmsg.other_name.toLowerCase(),
        chatmsg.other_emote,
        "(a)",
        false,
        chatmsg.side
      );
    }

    // gets which shout shall played
    const shoutSprite = <HTMLImageElement>(
      document.getElementById("client_shout")
    );
    const shout = SHOUTS[chatmsg.objection];
    if (shout) {
      // Hide message box
      chatContainerBox.style.opacity = "0";
      if (chatmsg.objection === 4) {
        shoutSprite.src = `${AO_HOST}characters/${encodeURI(
          chatmsg.name.toLowerCase()
        )}/custom.gif`;
      } else {
        shoutSprite.src = masterClient.resources[shout].src;
        shoutSprite.style.animation = "bubble 700ms steps(10, jump-both)";
      }
      shoutSprite.style.opacity = "1";

      shoutaudio.src = `${AO_HOST}characters/${encodeURI(
        chatmsg.name.toLowerCase()
      )}/${shout}.opus`;
      shoutaudio.play();
      shoutTimer = masterClient.resources[shout].duration;
    } else {
      shoutTimer = 0;
    }

    chatmsg.startpreanim = true;
    let gifLength = 0;

    if (chatmsg.type === 1 && chatmsg.preanim !== "-") {
      //we have a preanim
      chatContainerBox.style.opacity = "0";
      gifLength = await getAnimLength(
        `${AO_HOST}characters/${encodeURI(
          chatmsg.name.toLowerCase()
        )}/${encodeURI(chatmsg.preanim)}`
      );
      console.debug("preanim is " + gifLength + " long");
      chatmsg.startspeaking = false;
    } else {
      chatmsg.startspeaking = true;
      if (chatmsg.content !== "") chatContainerBox.style.opacity = "1";
    }
    chatmsg.preanimdelay = gifLength;
    const setAside = {
      position: chatmsg.side,
      showSpeedLines: false,
      showDesk: false,
    };
    let skipoffset: boolean = false;
    if (chatmsg.type === 5) {
      setAside.showSpeedLines = true;
      setAside.showDesk = false;
      set_side(setAside);
    } else {
      switch (Number(chatmsg.deskmod)) {
        case 0: //desk is hidden
          setAside.showSpeedLines = false;
          setAside.showDesk = false;
          set_side(setAside);
          break;
        case 1: //desk is shown
          setAside.showSpeedLines = false;
          setAside.showDesk = true;
          set_side(setAside);
          break;
        case 2: //desk is hidden during preanim, but shown during idle/talk
          setAside.showSpeedLines = false;
          setAside.showDesk = false;
          set_side(setAside);
          break;
        case 3: //opposite of 2
          setAside.showSpeedLines = false;
          setAside.showDesk = false;
          set_side(setAside);
          break;
        case 4: //desk is hidden, character offset is ignored, pair character is hidden during preanim, normal behavior during idle/talk
          setAside.showSpeedLines = false;
          setAside.showDesk = false;
          set_side(setAside);
          skipoffset = true;
          break;
        case 5: //opposite of 4
          setAside.showSpeedLines = false;
          setAside.showDesk = true;
          set_side(setAside);
          break;
        default:
          setAside.showSpeedLines = false;
          setAside.showDesk = true;
          set_side(setAside);
          break;
      }
    }

    setChatbox(chatmsg.chatbox);
    resizeChatbox();

    if (!skipoffset) {
      // Flip the character
      charLayers.style.transform =
        chatmsg.flip === 1 ? "scaleX(-1)" : "scaleX(1)";
      pairLayers.style.transform =
        chatmsg.other_flip === 1 ? "scaleX(-1)" : "scaleX(1)";

      // Shift by the horizontal offset
      switch (chatmsg.side) {
        case "wit":
          pairLayers.style.left = `${200 + Number(chatmsg.other_offset[0])}%`;
          charLayers.style.left = `${200 + Number(chatmsg.self_offset[0])}%`;
          break;
        case "pro":
          pairLayers.style.left = `${400 + Number(chatmsg.other_offset[0])}%`;
          charLayers.style.left = `${400 + Number(chatmsg.self_offset[0])}%`;
          break;
        default:
          pairLayers.style.left = `${Number(chatmsg.other_offset[0])}%`;
          charLayers.style.left = `${Number(chatmsg.self_offset[0])}%`;
          break;
      }

      // New vertical offsets
      pairLayers.style.top = `${Number(chatmsg.other_offset[1])}%`;
      charLayers.style.top = `${Number(chatmsg.self_offset[1])}%`;
    }

    blipChannels.forEach(
      (channel: HTMLAudioElement) =>
        (channel.src = `${AO_HOST}sounds/general/sfx-blip${encodeURI(
          chatmsg.blips.toLowerCase()
        )}.opus`)
    );

    // process markup
    if (chatmsg.content.startsWith("~~")) {
      chatBoxInner.style.textAlign = "center";
      chatmsg.content = chatmsg.content.substring(2, chatmsg.content.length);
    } else {
      chatBoxInner.style.textAlign = "inherit";
    }

    // apply effects
    fg.style.animation = "";
    const effectName = chatmsg.effects[0].toLowerCase();
    const badEffects = ["", "-", "none"];
    if (effectName.startsWith("rain") ) {
      (<HTMLLinkElement>document.getElementById("effect_css")).href = "styles/effects/rain.css";
      let intensity = 200;
      if(effectName.endsWith("weak")) {
        intensity = 100;
      } else if (effectName.endsWith("strong")) {
        intensity = 400;
      }
      if ( intensity < fg.childElementCount)
        fg.innerHTML = '';
      else
        intensity = intensity - fg.childElementCount;

      for (let i = 0; i < intensity; i++) {
        let drop = document.createElement("p");
        drop.style.left = (Math.random() * 100) + "%";
        drop.style.animationDelay = String(Math.random())+"s";
        fg.appendChild(drop)
      } 
    } else if (
      chatmsg.effects[0] &&
      !badEffects.includes(effectName)
    ) {
      (<HTMLLinkElement>document.getElementById("effect_css")).href = "";
      fg.innerHTML = '';
      const baseEffectUrl = `${AO_HOST}themes/default/effects/`;
      fg.src = `${baseEffectUrl}${encodeURI(effectName)}.webp`;
    } else {
      fg.innerHTML = '';
      fg.src = transparentPng;
    }

    charLayers.style.opacity = "1";

    const soundChecks = ["0", "1", "", undefined];
    if (soundChecks.some((check) => chatmsg.sound === check)) {
      chatmsg.sound = chatmsg.effects[2];
    }
    chatmsg.parsed = await attorneyMarkdown.applyMarkdown(
      chatmsg.content,
      COLORS[chatmsg.color]
    );
    chat_tick();
  };

  const handleTextTick = async (charLayers: HTMLImageElement) => {
    const chatBox = document.getElementById("client_chat");
    const waitingBox = document.getElementById("client_chatwaiting");
    const chatBoxInner = document.getElementById("client_inner_chat");
    const charName = chatmsg.name.toLowerCase();
    const charEmote = chatmsg.sprite.toLowerCase();

    if (chatmsg.content.charAt(textnow.length) !== " ") {
      blipChannels[currentBlipChannel].play();
      currentBlipChannel++;
      currentBlipChannel %= blipChannels.length;
    }
    textnow = chatmsg.content.substring(0, textnow.length + 1);
    const characterElement = chatmsg.parsed[textnow.length - 1];
    if (characterElement) {
      const COMMAND_IDENTIFIER = "\\";

      const nextCharacterElement = chatmsg.parsed[textnow.length];
      const flash = async () => {
        const effectlayer = document.getElementById("client_fg");
        playSFX(`${AO_HOST}sounds/general/sfx-realization.opus`, false);
        effectlayer.style.animation = "flash 0.4s 1";
        await delay(400);
        effectlayer.style.removeProperty("animation");
      };

      const shake = async () => {
        const gamewindow = document.getElementById("client_gamewindow");
        playSFX(`${AO_HOST}sounds/general/sfx-stab.opus`, false);
        gamewindow.style.animation = "shake 0.2s 1";
        await delay(200);
        gamewindow.style.removeProperty("animation");
      };

      const commands = new Map(
        Object.entries({
          s: shake,
          f: flash,
        })
      );
      const textSpeeds = new Set(["{", "}"]);

      // Changing Text Speed
      if (textSpeeds.has(characterElement.innerHTML)) {
        // Grab them all in a row
        const MAX_SLOW_CHATSPEED = 120;
        for (let i = textnow.length; i < chatmsg.content.length; i++) {
          const currentCharacter = chatmsg.parsed[i - 1].innerHTML;
          if (currentCharacter === "}") {
            if (chatmsg.speed > 0) {
              chatmsg.speed -= 20;
            }
          } else if (currentCharacter === "{") {
            if (chatmsg.speed < MAX_SLOW_CHATSPEED) {
              chatmsg.speed += 20;
            }
          } else {
            // No longer at a speed character
            textnow = chatmsg.content.substring(0, i);
            break;
          }
        }
      }

      if (
        characterElement.innerHTML === COMMAND_IDENTIFIER &&
        commands.has(nextCharacterElement?.innerHTML)
      ) {
        textnow = chatmsg.content.substring(0, textnow.length + 1);
        await commands.get(nextCharacterElement.innerHTML)();
      } else {
        chatBoxInner.appendChild(chatmsg.parsed[textnow.length - 1]);
      }
    }
    // scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;

    if (textnow === chatmsg.content) {
      animating = false;
      setEmote(
        AO_HOST,
        client,
        charName,
        charEmote,
        "(a)",
        false,
        chatmsg.side
      );
      charLayers.style.opacity = "1";
      waitingBox.style.opacity = "1";
      clearTimeout(updater);
    }
  };
  /**
   * Updates the chatbox based on the given text.
   *
   * OK, here's the documentation on how this works:
   *
   * 1 _animating
   * If we're not done with this characters animation, i.e. his text isn't fully there, set a timeout for the next tick/step to happen
   *
   * 2 startpreanim
   * If the shout timer is over it starts with the preanim
   * The first thing it checks for is the shake effect (TODO on client this is handled by the @ symbol and not a flag )
   * Then is the flash/realization effect
   * After that, the shout image set to be transparent
   * and the main characters preanim gif is loaded
   * If pairing is supported the paired character will just stand around with his idle sprite
   *
   * 3 preanimdelay over
   * this animates the evidence popup and finally shows the character name and message box
   * it sets the text color and the character speaking sprite
   *
   * 4 textnow != content
   * this adds a character to the textbox and stops the animations if the entire message is present in the textbox
   *
   * 5 sfx
   * independent of the stuff above, this will play any sound effects specified by the emote the character sent.
   * happens after the shout delay + an sfx delay that comes with the message packet
   *
   * XXX: This relies on a global variable `chatmsg`!
   */
  const chat_tick = async () => {
    // note: this is called fairly often
    // do not perform heavy operations here

    await delay(chatmsg.speed);
    if (textnow === chatmsg.content) {
      return;
    }

    const gamewindow = document.getElementById("client_gamewindow");
    const waitingBox = document.getElementById("client_chatwaiting");
    const eviBox = <HTMLImageElement>document.getElementById("client_evi");
    const shoutSprite = <HTMLImageElement>(
      document.getElementById("client_shout")
    );
    const effectlayer = <HTMLImageElement>document.getElementById("client_fg");
    const chatBoxInner = document.getElementById("client_inner_chat");
    let charLayers = <HTMLImageElement>document.getElementById("client_char");
    let pairLayers = <HTMLImageElement>(
      document.getElementById("client_pair_char")
    );

    const validSides: string[] = ["def", "pro", "wit"]; // these are for the full view pan, the other positions use 'client_char'
    if (validSides.includes(chatmsg.side)) {
      charLayers = <HTMLImageElement>(
        document.getElementById(`client_${chatmsg.side}_char`)
      );
      pairLayers = <HTMLImageElement>(
        document.getElementById(`client_${chatmsg.side}_pair_char`)
      );
    }

    const charName = chatmsg.name.toLowerCase();
    const charEmote = chatmsg.sprite.toLowerCase();

    const pairName = chatmsg.other_name.toLowerCase();
    const pairEmote = chatmsg.other_emote.toLowerCase();

    // TODO: preanims sometimes play when they're not supposed to
    const isShoutOver = tickTimer >= shoutTimer;
    const isShoutAndPreanimOver =
      tickTimer >= shoutTimer + chatmsg.preanimdelay;
    if (isShoutOver && startFirstTickCheck) {
      // Effect stuff
      if (chatmsg.screenshake === 1) {
        // Shake screen
        playSFX(`${AO_HOST}sounds/general/sfx-stab.opus`, false);
        gamewindow.style.animation = "shake 0.2s 1";
      }
      if (chatmsg.flash === 1) {
        // Flash screen
        playSFX(`${AO_HOST}sounds/general/sfx-realization.opus`, false);
        effectlayer.style.animation = "flash 0.4s 1";
      }

      // Pre-animation stuff
      if (chatmsg.preanimdelay > 0) {
        shoutSprite.style.opacity = "0";
        shoutSprite.style.animation = "";
        const preanim = chatmsg.preanim.toLowerCase();
        setEmote(AO_HOST, client, charName, preanim, "", false, chatmsg.side);
      }

      if (chatmsg.other_name) {
        pairLayers.style.opacity = "1";
      } else {
        pairLayers.style.opacity = "0";
      }
      // Done with first check, move to second
      startFirstTickCheck = false;
      startSecondTickCheck = true;

      chatmsg.startpreanim = false;
      chatmsg.startspeaking = true;
    }

    const hasNonInterruptingPreAnim = chatmsg.noninterrupting_preanim === 1;
    if (textnow !== chatmsg.content && hasNonInterruptingPreAnim) {
      const chatContainerBox = document.getElementById("client_chatcontainer");
      chatContainerBox.style.opacity = "1";
      await handleTextTick(charLayers);
    } else if (isShoutAndPreanimOver && startSecondTickCheck) {
      if (chatmsg.startspeaking) {
        chatmsg.startspeaking = false;

        // Evidence Bullshit
        if (chatmsg.evidence > 0) {
          // Prepare evidence
          eviBox.src = safeTags(
            masterClient.evidences[chatmsg.evidence - 1].icon
          );

          eviBox.style.width = "auto";
          eviBox.style.height = "36.5%";
          eviBox.style.opacity = "1";

          testimonyAudio.src = `${AO_HOST}sounds/general/sfx-evidenceshoop.opus`;
          testimonyAudio.play();

          if (chatmsg.side === "def") {
            // Only def show evidence on right
            eviBox.style.right = "1em";
            eviBox.style.left = "initial";
          } else {
            eviBox.style.right = "initial";
            eviBox.style.left = "1em";
          }
        }
        chatBoxInner.className = `text_${COLORS[chatmsg.color]}`;

        if (chatmsg.preanimdelay === 0) {
          shoutSprite.style.opacity = "0";
          shoutSprite.style.animation = "";
        }

        switch (Number(chatmsg.deskmod)) {
          case 2:
            set_side({
              position: chatmsg.side,
              showSpeedLines: false,
              showDesk: true,
            });
            break;
          case 3:
            set_side({
              position: chatmsg.side,
              showSpeedLines: false,
              showDesk: false,
            });
            break;
          case 4:
            set_side({
              position: chatmsg.side,
              showSpeedLines: false,
              showDesk: true,
            });
            break;
          case 5:
            set_side({
              position: chatmsg.side,
              showSpeedLines: false,
              showDesk: false,
            });
            break;
        }

        if (chatmsg.other_name) {
          setEmote(
            AO_HOST,
            client,
            pairName,
            pairEmote,
            "(a)",
            true,
            chatmsg.side
          );
          pairLayers.style.opacity = "1";
        } else {
          pairLayers.style.opacity = "0";
        }

        setEmote(
          AO_HOST,
          client,
          charName,
          charEmote,
          "(b)",
          false,
          chatmsg.side
        );
        charLayers.style.opacity = "1";

        if (textnow === chatmsg.content) {
          setEmote(
            AO_HOST,
            client,
            charName,
            charEmote,
            "(a)",
            false,
            chatmsg.side
          );
          charLayers.style.opacity = "1";
          waitingBox.style.opacity = "1";
          animating = false;
          clearTimeout(updater);
          return;
        }
      } else if (textnow !== chatmsg.content) {
        const chatContainerBox = document.getElementById(
          "client_chatcontainer"
        );
        chatContainerBox.style.opacity = "1";
        await handleTextTick(charLayers);
      }
    }

    if (!sfxplayed && chatmsg.snddelay + shoutTimer >= tickTimer) {
      sfxplayed = 1;
      if (
        chatmsg.sound !== "0" &&
        chatmsg.sound !== "1" &&
        chatmsg.sound !== "" &&
        chatmsg.sound !== undefined &&
        (chatmsg.type == 1 || chatmsg.type == 2 || chatmsg.type == 6)
      ) {
        playSFX(
          `${AO_HOST}sounds/general/${encodeURI(
            chatmsg.sound.toLowerCase()
          )}.opus`,
          chatmsg.looping_sfx
        );
      }
    }
    if (animating) {
      chat_tick();
    }
    tickTimer += UPDATE_INTERVAL;
  };
  /**
   * Triggered by the theme selector.
   */
  function reloadTheme() {
    theme = (<HTMLSelectElement>document.getElementById("client_themeselect"))
      .value;

    setCookie("theme", theme);
    (<HTMLAnchorElement>(
      document.getElementById("client_theme")
    )).href = `styles/${theme}.css`;
  }
  window.reloadTheme = reloadTheme;
  /**
   * Triggered by the blip volume slider.
   */
  function changeBlipVolume() {
    const blipVolume = (<HTMLInputElement>(
      document.getElementById("client_bvolume")
    )).value;
    blipChannels.forEach(
      (channel: HTMLAudioElement) => (channel.volume = Number(blipVolume))
    );
    setCookie("blipVolume", blipVolume);
  }
  window.changeBlipVolume = changeBlipVolume;

  const changeMusicVolume = (volume: number = -1) => {
    const clientVolume = Number(
      (<HTMLInputElement>document.getElementById("client_mvolume")).value
    );
    let musicVolume = volume === -1 ? clientVolume : volume;
    music.forEach(
      (channel: HTMLAudioElement) => (channel.volume = musicVolume)
    );
    setCookie("musicVolume", String(musicVolume));
  };
  window.changeMusicVolume = changeMusicVolume;

  return {
    chat_tick,
    changeMusicVolume,
    changeBlipVolume,
    reloadTheme,
    playSFX,
    set_side,
    setBackgroundName,
    initTestimonyUpdater,
    updateTestimony,
    disposeTestimony,
    handle_ic_speaking,
    handleTextTick,
    getBackgroundFolder,
    getBackgroundName,
    getSfxAudio,
    setSfxAudio,
    theme,
    chatmsg,
    blipChannels,
    lastChar,
    music,
    musicVolume,
  };
};

export default viewport;
