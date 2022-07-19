/*
 * Glorious webAO
 * made by sD, refactored by oldmud0 and Qubrick
 * credits to aleks for original idea and source
 */
import { handleFL } from "./client/packetHandler/handleFL";
import { handleSM } from "./client/packetHandler/handleSM";
import { handleSC } from "./client/packetHandler/handleSC";
import { handleRD } from "./client/packetHandler/handleRD";
import { handleRM } from "./client/packetHandler/handleRM";
import { handleRC } from "./client/packetHandler/handleRC";
import { handleHI } from "./client/packetHandler/handleHI";
import { handleSI } from "./client/packetHandler/handleSI";
import { handleaskchaa } from "./client/packetHandler/handleaskchaa";
import { handlePN } from "./client/packetHandler/handlePN";
import { handleID } from "./client/packetHandler/handleID";
import { handleCharsCheck } from "./client/packetHandler/handleCharsCheck";
import { setChatbox } from "./dom/setChatbox";
import { handleASS } from "./client/packetHandler/handleASS";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { handleDONE } from "./client/packetHandler/handleDONE";
import { EventEmitter } from "events";
import tryUrls from "./utils/tryUrls";
import { escapeChat, prepChat, safeTags, unescapeChat } from "./encoding";
import mlConfig from "./utils/aoml";
import { area_click } from "./dom/areaClick";
// Load some defaults for the background and evidence dropdowns
import vanilla_character_arr from "./constants/characters.js";
import vanilla_music_arr from "./constants/music.js";
import vanilla_background_arr from "./constants/backgrounds.js";
import vanilla_evidence_arr from "./constants/evidence.js";
import { showname_click } from "./dom/shownameClick";

import chatbox_arr from "./styles/chatbox/chatboxes.js";
import iniParse from "./iniParse";
import getCookie from "./utils/getCookie.js";
import setCookie from "./utils/setCookie.js";
import { request } from "./services/request.js";
import {
  changeShoutVolume,
  changeSFXVolume,
  changeTestimonyVolume,
} from "./dom/changeVolume.js";
import setEmote from "./client/setEmote.js";
import fileExists from "./utils/fileExists.js";
import queryParser from "./utils/queryParser";
import getAnimLength from "./utils/getAnimLength.js";
import getResources from "./utils/getResources.js";
import transparentPng from "./constants/transparentPng";
import downloadFile from "./services/downloadFile";
import { getFilenameFromPath } from "./utils/paths";
const version = process.env.npm_package_version;
import { viewport, Viewport } from "./viewport";
import { handleMS } from "./client/packetHandler/handleMS";
import { handleCT } from "./client/packetHandler/handleCT";
import { handleMC } from "./client/packetHandler/handleMC";
interface Testimony {
  [key: number]: string;
}

// Get the arguments from the URL bar

let { ip: serverIP, mode, asset, theme } = queryParser();
// Unless there is an asset URL specified, use the wasabi one
const DEFAULT_HOST = "http://attorneyoffline.de/base/";
console.log(asset);
export let AO_HOST = asset || DEFAULT_HOST;
export const setAO_HOST = (val: string) => {
  console.log("Setting host to be" + val);
  AO_HOST = val;
};
const THEME = theme || "default";

export let client: Client;

const attorneyMarkdown = mlConfig(AO_HOST);

export const UPDATE_INTERVAL = 60;

/**
 * Toggles AO1-style loading using paginated music packets for mobile platforms.
 * The old loading uses more smaller packets instead of a single big one,
 * which caused problems on low-memory devices in the past.
 */
export let oldLoading = false;
export const setOldLoading = (val: boolean) => {
  oldLoading = val;
};
// presettings
let selectedMenu = 1;
export let selectedShout = 0;
export const setSelectedShout = (val: number) => {
  selectedShout = val;
};

export let extrafeatures: string[] = [];
export const setExtraFeatures = (val: string[]) => {
  extrafeatures = val;
};

export let playerID = 1;
export const setPlayerID = (val: number) => {
  playerID = val;
};

export let callwords: string[] = [];

let banned: boolean = false;
let hdid: string;

declare global {
  interface Window {
    toggleShout: (shout: number) => void;
    toggleMenu: (menu: number) => void;
    updateBackgroundPreview: () => void;
    redHPP: () => void;
    addHPP: () => void;
    redHPD: () => void;
    addHPD: () => void;
    guilty: () => void;
    notguilty: () => void;
    initCE: () => void;
    initWT: () => void;
    callMod: () => void;
    randomCharacterOOC: () => void;
    changeRoleOOC: () => void;
    changeBackgroundOOC: () => void;
    updateActionCommands: (side: string) => void;
    updateEvidenceIcon: () => void;
    resizeChatbox: () => void;
    setChatbox: (style: string) => void;
    getIndexFromSelect: (select_box: string, value: string) => Number;
    cancelEvidence: () => void;
    deleteEvidence: () => void;
    editEvidence: () => void;
    addEvidence: () => void;
    pickEvidence: (evidence: any) => void;
    pickEmotion: (emo: any) => void;
    pickChar: (ccharacter: any) => void;
    chartable_filter: (_event: any) => void;
    ReconnectButton: (_event: any) => void;
    opusCheck: (channel: HTMLAudioElement) => OnErrorEventHandlerNonNull;
    imgError: (image: any) => void;
    charError: (image: any) => void;
    changeCharacter: (_event: any) => void;
    switchChatOffset: () => void;
    switchAspectRatio: () => void;
    switchPanTilt: (addcheck: number) => void;
    iniedit: () => void;
    modcall_test: () => void;
    reloadTheme: () => void;
    changeCallwords: () => void;
    changeBlipVolume: () => void;
    changeMusicVolume: () => void;
    area_click: (el: any) => void;
    showname_click: (_event: any) => void;
    mutelist_click: (_event: any) => void;
    musiclist_click: (_event: any) => void;
    musiclist_filter: (_event: any) => void;
    resetOffset: (_event: any) => void;
    onEnter: (event: any) => void;
    onReplayGo: (_event: any) => void;
    onOOCEnter: (_event: any) => void;
  }
}

function isLowMemory() {
  if (
    /webOS|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|PlayStation|Nintendo|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    oldLoading = true;
  }
}
const fpPromise = FingerprintJS.load();
fpPromise
  .then((fp) => fp.get())
  .then((result) => {
    hdid = result.visitorId;
    client = new Client(serverIP);

    isLowMemory();
    client.loadResources();
  });
export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export let lastICMessageTime = new Date(0);
export const setLastICMessageTime = (val: Date) => {
  lastICMessageTime = val;
};
export let chars: any[] = [];
export let charID = -1;
export let areas: any = [];
export let musics_time = false;
export const setMusicsTime = (val: boolean) => {
  musics_time = val;
};
export let music_list_length = 0;
export const setMusicListLength = (val: number) => {
  music_list_length = val;
};
export let evidence_list_length = 0;
export const setEvidenceListLength = (val: number) => {
  evidence_list_length = val;
};
export let char_list_length = 0;
export const setCharListLength = (val: number) => {
  char_list_length = val;
};
class Client extends EventEmitter {
  serv: any;
  hp: number[];
  playerID: number;
  charID: number;
  char_list_length: number;
  evidence_list_length: number;
  music_list_length: number;
  testimonyID: number;
  chars: any;
  emotes: any;
  evidences: any;
  areas: any;
  musics: any;
  musics_time: boolean;
  callwords: string[];
  banned: boolean;
  resources: any;
  selectedEmote: number;
  selectedEvidence: number;
  checkUpdater: any;
  _lastTimeICReceived: any;
  viewport: Viewport;
  constructor(address: string) {
    super();
    if (mode !== "replay") {
      this.serv = new WebSocket(`ws://${address}`);
      // Assign the websocket events
      this.serv.addEventListener("open", this.emit.bind(this, "open"));
      this.serv.addEventListener("close", this.emit.bind(this, "close"));
      this.serv.addEventListener("message", this.emit.bind(this, "message"));
      this.serv.addEventListener("error", this.emit.bind(this, "error"));
    } else {
      this.joinServer();
    }

    this.on("open", this.onOpen.bind(this));
    this.on("close", this.onClose.bind(this));
    this.on("message", this.onMessage.bind(this));
    this.on("error", this.onError.bind(this));

    // Preset some of the variables

    this.hp = [0, 0];

    this.playerID = playerID;
    this.charID = charID;
    this.char_list_length = char_list_length;
    this.evidence_list_length = 0;
    this.music_list_length = 0;
    this.testimonyID = 0;

    this.chars = chars;
    this.emotes = [];
    this.evidences = [];
    this.areas = areas;
    this.musics = [];

    this.musics_time = false;

    this.callwords = callwords;

    this.resources = getResources(THEME);

    this.selectedEmote = -1;
    this.selectedEvidence = 0;

    this.checkUpdater = null;
    this.viewport = viewport(this);
    /**
     * Assign handlers for all commands
     * If you implement a new command, you need to add it here
     */
    this.on("MS", handleMS.bind(this));
    this.on("CT", handleCT.bind(this));
    this.on("MC", handleMC.bind(this));
    // this.on("RMC", handleRMC.bind(this));
    // this.on("CI", handleCI.bind(this));
    this.on("SC", handleSC.bind(this));
    // this.on("EI", handleEI.bind(this));
    this.on("FL", handleFL.bind(this));
    // this.on("LE", handleLE.bind(this));
    // this.on("EM", handleEM.bind(this));
    // this.on("FM", handleFM.bind(this));
    // this.on("FA", handleFA.bind(this));
    this.on("SM", handleSM.bind(this));
    // this.on("MM", handleMM.bind(this));
    // this.on("BD", handleBD.bind(this));
    // this.on("BB", handleBB.bind(this));
    // this.on("KB", handleKB.bind(this));
    // this.on("KK", handleKK.bind(this));
    this.on("DONE", handleDONE.bind(this));
    // this.on("BN", handleBN.bind(this));
    // this.on("HP", handleHP.bind(this));
    // this.on("RT", handleRT.bind(this));
    // this.on("TI", handleTI.bind(this));
    // this.on("ZZ", handleZZ.bind(this));
    this.on("HI", handleHI.bind(this));
    this.on("ID", handleID.bind(this));
    this.on("PN", handlePN.bind(this));
    this.on("SI", handleSI.bind(this));
    // this.on("ARUP", handleARUP.bind(this));
    this.on("askchaa", handleaskchaa.bind(this));
    // this.on("CC", handleCC.bind(this));
    this.on("RC", handleRC.bind(this));
    this.on("RM", handleRM.bind(this));
    this.on("RD", handleRD.bind(this));
    this.on("CharsCheck", handleCharsCheck.bind(this));
    // this.on("PV", handlePV.bind(this));
    this.on("ASS", handleASS.bind(this));
    // this.on("CHECK", () => {});
    // this.on("CH", () => {});

    this._lastTimeICReceived = new Date(0);
  }

  /**
   * Gets the current player's character.
   */
  get character() {
    return chars[this.charID];
  }

  /**
   * Gets the player's currently selected emote.
   */
  get emote() {
    return this.emotes[this.selectedEmote];
  }

  /**
   * Gets the current evidence ID unless the player doesn't want to present any evidence
   */
  get evidence() {
    return document.getElementById("button_present").classList.contains("dark")
      ? this.selectedEvidence
      : 0;
  }

  /**
   * Hook for sending messages to the server
   * @param {string} message the message to send
   */
  sendServer(message: string) {
    mode === "replay" ? this.sendSelf(message) : this.serv.send(message);
  }

  /**
   * Hook for sending messages to the client
   * @param {string} message the message to send
   */
  handleSelf(message: string) {
    const message_event = new MessageEvent("websocket", { data: message });
    setTimeout(() => this.onMessage(message_event), 1);
  }

  /**
   * Hook for sending messages to the client
   * @param {string} message the message to send
   */
  sendSelf(message: string) {
    (<HTMLInputElement>(
      document.getElementById("client_ooclog")
    )).value += `${message}\r\n`;
    this.handleSelf(message);
  }

  /**
   * Sends an out-of-character chat message.
   * @param {string} message the message to send
   */
  sendOOC(message: string) {
    setCookie(
      "OOC_name",
      (<HTMLInputElement>document.getElementById("OOC_name")).value
    );
    const oocName = `${escapeChat(
      (<HTMLInputElement>document.getElementById("OOC_name")).value
    )}`;
    const oocMessage = `${escapeChat(message)}`;

    const commands = {
      "/save_chatlog": this.saveChatlogHandle,
    };
    const commandsMap = new Map(Object.entries(commands));

    if (oocMessage && commandsMap.has(oocMessage.toLowerCase())) {
      try {
        commandsMap.get(oocMessage.toLowerCase())();
      } catch (e) {
        // Command Not Recognized
      }
    } else {
      this.sendServer(`CT#${oocName}#${oocMessage}#%`);
    }
  }

  /**
   * Sends an in-character chat message.
   * @param {number} deskmod controls the desk
   * @param {string} speaking who is speaking
   * @param {string} name the name of the current character
   * @param {string} silent whether or not it's silent
   * @param {string} message the message to be sent
   * @param {string} side the name of the side in the background
   * @param {string} sfx_name the name of the sound effect
   * @param {number} emote_modifier whether or not to zoom
   * @param {number} sfx_delay the delay (in milliseconds) to play the sound effect
   * @param {number} objection_modifier the number of the shout to play
   * @param {string} evidence the filename of evidence to show
   * @param {boolean} flip change to 1 to reverse sprite for position changes
   * @param {boolean} realization screen flash effect
   * @param {number} text_color text color
   * @param {string} showname custom name to be displayed (optional)
   * @param {number} other_charid paired character (optional)
   * @param {number} self_offset offset to paired character (optional)
   * @param {number} noninterrupting_preanim play the full preanim (optional)
   */
  sendIC(
    deskmod: number,
    preanim: string,
    name: string,
    emote: string,
    message: string,
    side: string,
    sfx_name: string,
    emote_modifier: number,
    sfx_delay: number,
    objection_modifier: number,
    evidence: number,
    flip: boolean,
    realization: boolean,
    text_color: number,
    showname: string,
    other_charid: string,
    self_hoffset: number,
    self_yoffset: number,
    noninterrupting_preanim: boolean,
    looping_sfx: boolean,
    screenshake: boolean,
    frame_screenshake: string,
    frame_realization: string,
    frame_sfx: string,
    additive: boolean,
    effect: string
  ) {
    let extra_cccc = "";
    let other_emote = "";
    let other_offset = "";
    let extra_27 = "";
    let extra_28 = "";

    if (extrafeatures.includes("cccc_ic_support")) {
      const self_offset = extrafeatures.includes("y_offset")
        ? `${self_hoffset}<and>${self_yoffset}`
        : self_hoffset; // HACK: this should be an & but client fucked it up and all the servers adopted it
      if (mode === "replay") {
        other_emote = "##";
        other_offset = "#0#0";
      }
      extra_cccc = `${escapeChat(
        showname
      )}#${other_charid}${other_emote}#${self_offset}${other_offset}#${Number(
        noninterrupting_preanim
      )}#`;

      if (extrafeatures.includes("looping_sfx")) {
        extra_27 = `${Number(looping_sfx)}#${Number(
          screenshake
        )}#${frame_screenshake}#${frame_realization}#${frame_sfx}#`;
        if (extrafeatures.includes("effects")) {
          extra_28 = `${Number(additive)}#${escapeChat(effect)}#`;
        }
      }
    }

    const serverMessage =
      `MS#${deskmod}#${escapeChat(preanim)}#${escapeChat(name)}#${escapeChat(
        emote
      )}` +
      `#${escapeChat(message)}#${escapeChat(side)}#${escapeChat(
        sfx_name
      )}#${emote_modifier}` +
      `#${this.charID}#${sfx_delay}#${Number(objection_modifier)}#${Number(
        evidence
      )}#${Number(flip)}#${Number(
        realization
      )}#${text_color}#${extra_cccc}${extra_27}${extra_28}%`;

    this.sendServer(serverMessage);
    if (mode === "replay") {
      (<HTMLInputElement>(
        document.getElementById("client_ooclog")
      )).value += `wait#${
        (<HTMLInputElement>document.getElementById("client_replaytimer")).value
      }#%\r\n`;
    }
  }

  /**
   * Sends add evidence command.
   * @param {string} evidence name
   * @param {string} evidence description
   * @param {string} evidence image filename
   */
  sendPE(name: string, desc: string, img: string) {
    this.sendServer(
      `PE#${escapeChat(name)}#${escapeChat(desc)}#${escapeChat(img)}#%`
    );
  }

  /**
   * Sends edit evidence command.
   * @param {number} evidence id
   * @param {string} evidence name
   * @param {string} evidence description
   * @param {string} evidence image filename
   */
  sendEE(id: number, name: string, desc: string, img: string) {
    this.sendServer(
      `EE#${id}#${escapeChat(name)}#${escapeChat(desc)}#${escapeChat(img)}#%`
    );
  }

  /**
   * Sends delete evidence command.
   * @param {number} evidence id
   */
  sendDE(id: number) {
    this.sendServer(`DE#${id}#%`);
  }

  /**
   * Sends health point command.
   * @param {number} side the position
   * @param {number} hp the health point
   */
  sendHP(side: number, hp: number) {
    this.sendServer(`HP#${side}#${hp}#%`);
  }

  /**
   * Sends call mod command.
   * @param {string} message to mod
   */
  sendZZ(msg: string) {
    if (extrafeatures.includes("modcall_reason")) {
      this.sendServer(`ZZ#${msg}#%`);
    } else {
      this.sendServer("ZZ#%");
    }
  }

  /**
   * Sends testimony command.
   * @param {string} testimony type
   */
  sendRT(testimony: string) {
    if (chars[this.charID].side === "jud") {
      this.sendServer(`RT#${testimony}#%`);
    }
  }

  /**
   * Begins the handshake process by sending an identifier
   * to the server.
   */
  joinServer() {
    this.sendServer(`HI#${hdid}#%`);
    this.sendServer("ID#webAO#webAO#%");
    if (mode !== "replay") {
      this.checkUpdater = setInterval(() => this.sendCheck(), 5000);
    }
  }

  /**
   * Load game resources and stored settings.
   */
  loadResources() {
    document.getElementById("client_version").innerText = `version ${version}`;

    // Load background array to select
    const background_select = <HTMLSelectElement>(
      document.getElementById("bg_select")
    );
    background_select.add(new Option("Custom", "0"));
    vanilla_background_arr.forEach((background) => {
      background_select.add(new Option(background));
    });

    // Load evidence array to select
    const evidence_select = <HTMLSelectElement>(
      document.getElementById("evi_select")
    );
    evidence_select.add(new Option("Custom", "0"));
    vanilla_evidence_arr.forEach((evidence) => {
      evidence_select.add(new Option(evidence));
    });

    // Read cookies and set the UI to its values
    (<HTMLInputElement>document.getElementById("OOC_name")).value =
      getCookie("OOC_name") ||
      `web${String(Math.round(Math.random() * 100 + 10))}`;

    // Read cookies and set the UI to its values
    const cookietheme = getCookie("theme") || "default";

    (<HTMLOptionElement>(
      document.querySelector(`#client_themeselect [value="${cookietheme}"]`)
    )).selected = true;
    this.viewport.reloadTheme();

    const cookiechatbox = getCookie("chatbox") || "dynamic";

    (<HTMLOptionElement>(
      document.querySelector(`#client_chatboxselect [value="${cookiechatbox}"]`)
    )).selected = true;
    setChatbox(cookiechatbox);

    (<HTMLInputElement>document.getElementById("client_mvolume")).value =
      getCookie("musicVolume") || "1";
    this.viewport.changeMusicVolume();
    (<HTMLAudioElement>document.getElementById("client_sfxaudio")).volume =
      Number(getCookie("sfxVolume")) || 1;
    changeSFXVolume();
    (<HTMLAudioElement>document.getElementById("client_shoutaudio")).volume =
      Number(getCookie("shoutVolume")) || 1;
    changeShoutVolume();
    (<HTMLAudioElement>(
      document.getElementById("client_testimonyaudio")
    )).volume = Number(getCookie("testimonyVolume")) || 1;
    changeTestimonyVolume();
    (<HTMLInputElement>document.getElementById("client_bvolume")).value =
      getCookie("blipVolume") || "1";
    this.viewport.changeBlipVolume();

    (<HTMLInputElement>document.getElementById("ic_chat_name")).value =
      getCookie("ic_chat_name");
    (<HTMLInputElement>document.getElementById("showname")).checked = Boolean(
      getCookie("showname")
    );

    showname_click(null);

    (<HTMLInputElement>document.getElementById("client_callwords")).value =
      getCookie("callwords");
  }

  /**
   * Requests to play as a specified character.
   * @param {number} character the character ID
   */
  sendCharacter(character: number) {
    if (character === -1 || chars[character].name) {
      this.sendServer(`CC#${this.playerID}#${character}#web#%`);
    }
  }

  /**
   * Requests to select a music track.
   * @param {number?} song the song to be played
   */
  sendMusic(song: string) {
    this.sendServer(`MC#${song}#${this.charID}#%`);
  }

  /**
   * Sends a keepalive packet.
   */
  sendCheck() {
    this.sendServer(`CH#${this.charID}#%`);
  }

  /**
   * Triggered when a connection is established to the server.
   */
  onOpen(_e: Event) {
    client.joinServer();
  }

  /**
   * Triggered when the connection to the server closes.
   * @param {CloseEvent} e
   */
  onClose(e: CloseEvent) {
    console.error(`The connection was closed: ${e.reason} (${e.code})`);
    if (extrafeatures.length == 0 && banned === false) {
      document.getElementById("client_errortext").textContent =
        "Could not connect to the server";
    }
    document.getElementById("client_waiting").style.display = "block";
    document.getElementById("client_error").style.display = "flex";
    document.getElementById("client_loading").style.display = "none";
    document.getElementById("error_id").textContent = String(e.code);
    this.cleanup();
  }

  /**
   * Triggered when a packet is received from the server.
   * @param {MessageEvent} e
   */
  onMessage(e: MessageEvent) {
    const msg = e.data;
    console.debug(`S: ${msg}`);

    const lines = msg.split("%");

    for (const msg of lines) {
      if (msg === "") {
        break;
      }

      const args = msg.split("#");
      const header = args[0];

      if (!this.emit(header, args)) {
        console.warn(`Invalid packet header ${header}`);
      }
    }
  }

  /**
   * Triggered when an network error occurs.
   * @param {ErrorEvent} e
   */
  onError(e: ErrorEvent) {
    console.error(`A network error occurred`);
    document.getElementById("client_error").style.display = "flex";
    this.cleanup();
  }

  /**
   * Stop sending keepalives to the server.
   */
  cleanup() {
    clearInterval(this.checkUpdater);

    this.serv.close();
  }

  /**
   * Parse the lines in the OOC and play them
   * @param {*} args packet arguments
   */
  handleReplay() {
    const ooclog = <HTMLInputElement>document.getElementById("client_ooclog");
    const rawLog = false;
    let rtime: number = Number(
      (<HTMLInputElement>document.getElementById("client_replaytimer")).value
    );

    const clines = ooclog.value.split(/\r?\n/);
    if (clines[0]) {
      const currentLine = String(clines[0]);
      this.handleSelf(currentLine);
      ooclog.value = clines.slice(1).join("\r\n");
      if (currentLine.substr(0, 4) === "wait" && rawLog === false) {
        rtime = Number(currentLine.split("#")[1]);
      } else if (currentLine.substr(0, 2) !== "MS") {
        rtime = 0;
      }

      setTimeout(() => onReplayGo(null), rtime);
    }
  }

  saveChatlogHandle = async () => {
    const clientLog = document.getElementById("client_log");
    const icMessageLogs = clientLog.getElementsByTagName("p");
    const messages = [];

    for (let i = 0; i < icMessageLogs.length; i++) {
      const SHOWNAME_POSITION = 0;
      const TEXT_POSITION = 2;
      const showname = icMessageLogs[i].children[SHOWNAME_POSITION].innerHTML;
      const text = icMessageLogs[i].children[TEXT_POSITION].innerHTML;
      const message = `${showname}: ${text}`;
      messages.push(message);
    }
    const d = new Date();
    let ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
    let mo = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
    let da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);

    const filename = `chatlog-${da}-${mo}-${ye}`.toLowerCase();
    downloadFile(messages.join("\n"), filename);

    // Reset Chatbox to Empty
    (<HTMLInputElement>document.getElementById("client_inputbox")).value = "";
  };

  resetMusicList() {
    this.musics = [];
    document.getElementById("client_musiclist").innerHTML = "";
  }

  resetAreaList() {
    this.areas = [];
    document.getElementById("areas").innerHTML = "";

    this.fetchBackgroundList();
    this.fetchEvidenceList();
  }

  async fetchBackgroundList() {
    try {
      const bgdata = await request(`${AO_HOST}backgrounds.json`);
      const bg_array = JSON.parse(bgdata);
      // the try catch will fail before here when there is no file

      const bg_select = <HTMLSelectElement>document.getElementById("bg_select");
      bg_select.innerHTML = "";

      bg_select.add(new Option("Custom", "0"));
      bg_array.forEach((background: string) => {
        bg_select.add(new Option(background));
      });
    } catch (err) {
      console.warn("there was no backgrounds.json file");
    }
  }

  async fetchCharacterList() {
    try {
      const chardata = await request(`${AO_HOST}characters.json`);
      const char_array = JSON.parse(chardata);
      // the try catch will fail before here when there is no file

      const char_select = <HTMLSelectElement>(
        document.getElementById("client_ininame")
      );
      char_select.innerHTML = "";

      char_array.forEach((character: string) => {
        char_select.add(new Option(character));
      });
    } catch (err) {
      console.warn("there was no characters.json file");
    }
  }

  async fetchEvidenceList() {
    try {
      const evidata = await request(`${AO_HOST}evidence.json`);
      const evi_array = JSON.parse(evidata);
      // the try catch will fail before here when there is no file

      const evi_select = <HTMLSelectElement>(
        document.getElementById("evi_select")
      );
      evi_select.innerHTML = "";

      evi_array.forEach((evi: string) => {
        evi_select.add(new Option(evi));
      });
      evi_select.add(new Option("Custom", "0"));
    } catch (err) {
      console.warn("there was no evidence.json file");
    }
  }

  isAudio(trackname: string) {
    const audioEndings = [".wav", ".mp3", ".ogg", ".opus"];
    return (
      audioEndings.filter((ending) => trackname.endsWith(ending)).length === 1
    );
  }

  addTrack(trackname: string) {
    const newentry = <HTMLOptionElement>document.createElement("OPTION");
    const songName = getFilenameFromPath(trackname);
    newentry.text = unescapeChat(songName);
    newentry.value = trackname;
    (<HTMLSelectElement>(
      document.getElementById("client_musiclist")
    )).options.add(newentry);
    this.musics.push(trackname);
  }

  createArea(id: number, name: string) {
    const thisarea = {
      name,
      players: 0,
      status: "IDLE",
      cm: "",
      locked: "FREE",
    };

    this.areas.push(thisarea);

    // Create area button
    const newarea = document.createElement("SPAN");
    newarea.className = "area-button area-default";
    newarea.id = `area${id}`;
    newarea.innerText = thisarea.name;
    newarea.title =
      `Players: ${thisarea.players}\n` +
      `Status: ${thisarea.status}\n` +
      `CM: ${thisarea.cm}\n` +
      `Area lock: ${thisarea.locked}`;
    newarea.onclick = function () {
      area_click(newarea);
    };

    document.getElementById("areas").appendChild(newarea);
  }

  /**
   * Area list fuckery
   */
  fix_last_area() {
    if (this.areas.length > 0) {
      const malplaced = this.areas.pop().name;
      const areas = document.getElementById("areas");
      areas.removeChild(areas.lastChild);
      this.addTrack(malplaced);
    }
  }

  /**
   * Handles the kicked packet
   * @param {string} type is it a kick or a ban
   * @param {string} reason why
   */
  handleBans(type: string, reason: string) {
    document.getElementById("client_error").style.display = "flex";
    document.getElementById(
      "client_errortext"
    ).innerHTML = `${type}:<br>${reason.replace(/\n/g, "<br />")}`;
    (<HTMLElement>(
      document.getElementsByClassName("client_reconnect")[0]
    )).style.display = "none";
    (<HTMLElement>(
      document.getElementsByClassName("client_reconnect")[1]
    )).style.display = "none";
  }
}

/**
 * Triggered when the Return key is pressed on the out-of-character chat input box.
 * @param {KeyboardEvent} event
 */
export function onOOCEnter(event: KeyboardEvent) {
  if (event.keyCode === 13) {
    client.sendOOC(
      (<HTMLInputElement>document.getElementById("client_oocinputbox")).value
    );
    (<HTMLInputElement>document.getElementById("client_oocinputbox")).value =
      "";
  }
}
window.onOOCEnter = onOOCEnter;

/**
 * Triggered when the user click replay GOOOOO
 * @param {KeyboardEvent} event
 */
export function onReplayGo(_event: Event) {
  client.handleReplay();
}
window.onReplayGo = onReplayGo;
/**
 * Handles the incoming character information, and downloads the sprite + ini for it
 * @param {Array} chargs packet arguments
 * @param {Number} charid character ID
 */
export const handleCharacterInfo = async (chargs: string[], charid: number) => {
  const img = <HTMLImageElement>document.getElementById(`demo_${charid}`);
  if (chargs[0]) {
    let cini: any = {};
    const getCharIcon = async () => {
      const extensions = [".png", ".webp"];
      img.alt = chargs[0];
      const charIconBaseUrl = `${AO_HOST}characters/${encodeURI(
        chargs[0].toLowerCase()
      )}/char_icon`;
      for (let i = 0; i < extensions.length; i++) {
        const fileUrl = charIconBaseUrl + extensions[i];
        const exists = await fileExists(fileUrl);
        if (exists) {
          img.alt = chargs[0];
          img.src = fileUrl;
          return;
        }
      }
    };
    getCharIcon();

    // If the ini doesn't exist on the server this will throw an error
    try {
      const cinidata = await request(
        `${AO_HOST}characters/${encodeURI(chargs[0].toLowerCase())}/char.ini`
      );
      cini = iniParse(cinidata);
    } catch (err) {
      cini = {};
      img.classList.add("noini");
      console.warn(`character ${chargs[0]} is missing from webAO`);
      // If it does, give the user a visual indication that the character is unusable
    }

    const mute_select = <HTMLSelectElement>(
      document.getElementById("mute_select")
    );
    mute_select.add(new Option(safeTags(chargs[0]), String(charid)));
    const pair_select = <HTMLSelectElement>(
      document.getElementById("pair_select")
    );
    pair_select.add(new Option(safeTags(chargs[0]), String(charid)));

    // sometimes ini files lack important settings
    const default_options = {
      name: chargs[0],
      showname: chargs[0],
      side: "def",
      blips: "male",
      chat: "",
      category: "",
    };
    cini.options = Object.assign(default_options, cini.options);

    // sometimes ini files lack important settings
    const default_emotions = {
      number: 0,
    };
    cini.emotions = Object.assign(default_emotions, cini.emotions);

    chars[charid] = {
      name: safeTags(chargs[0]),
      showname: safeTags(cini.options.showname),
      desc: safeTags(chargs[1]),
      blips: safeTags(cini.options.blips).toLowerCase(),
      gender: safeTags(cini.options.gender).toLowerCase(),
      side: safeTags(cini.options.side).toLowerCase(),
      chat:
        cini.options.chat === ""
          ? safeTags(cini.options.category).toLowerCase()
          : safeTags(cini.options.chat).toLowerCase(),
      evidence: chargs[3],
      icon: img.src,
      inifile: cini,
      muted: false,
    };

    if (
      chars[charid].blips === "male" &&
      chars[charid].gender !== "male" &&
      chars[charid].gender !== ""
    ) {
      chars[charid].blips = chars[charid].gender;
    }

    const iniedit_select = <HTMLSelectElement>(
      document.getElementById("client_ininame")
    );
    iniedit_select.add(new Option(safeTags(chargs[0])));
  } else {
    console.warn(`missing charid ${charid}`);
    img.style.display = "none";
  }
};
/**
 * Requests to change the music to the specified track.
 * @param {string} track the track ID
 */
export const sendMusicChange = (track: string) => {
  client.sendServer(`MC#${track}#${charID}#%`);
};
export default Client;
