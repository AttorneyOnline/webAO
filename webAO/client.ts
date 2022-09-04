/*
 * Glorious webAO
 * made by sD, refactored by oldmud0 and Qubrick
 * credits to aleks for original idea and source
 */

import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { EventEmitter } from "events";
import tryUrls from "./utils/tryUrls";
import { escapeChat, prepChat, safeTags, unescapeChat } from "./encoding";
// Load some defaults for the background and evidence dropdowns
import vanilla_character_arr from "./constants/characters.js";
import vanilla_music_arr from "./constants/music.js";
import vanilla_background_arr from "./constants/backgrounds.js";
import vanilla_evidence_arr from "./constants/evidence.js";
import chatbox_arr from "./styles/chatbox/chatboxes.js";
import iniParse from "./iniParse";
import getCookie from "./utils/getCookie";
import setCookie from "./utils/setCookie";
import { request } from "./services/request.js";
import {
  changeShoutVolume,
  changeSFXVolume,
  changeTestimonyVolume,
} from "./dom/changeVolume.js";
import fileExists from "./utils/fileExists.js";
import queryParser from "./utils/queryParser";
import getResources from "./utils/getResources.js";
import transparentPng from "./constants/transparentPng";
import downloadFile from "./services/downloadFile";
import { getFilenameFromPath } from "./utils/paths";
const version = process.env.npm_package_version;
import masterViewport, { Viewport } from "./viewport";
import { packetHandler } from './packets/packetHandler'
let { ip: serverIP, mode, asset, theme } = queryParser();
// Unless there is an asset URL specified, use the wasabi one
const DEFAULT_HOST = "http://attorneyoffline.de/base/";
import { showname_click } from './dom/showNameClick'
import { onReplayGo } from './dom/onReplayGo'
import { updateActionCommands } from './dom/updateActionCommands'
export let AO_HOST = asset || DEFAULT_HOST;
export const setAOhost = (val: string) => {
  AO_HOST = val
}
let THEME: string = theme || "default";
let CHATBOX: string;

export let client: Client;

export const UPDATE_INTERVAL = 60;

/**
 * Toggles AO1-style loading using paginated music packets for mobile platforms.
 * The old loading uses more smaller packets instead of a single big one,
 * which caused problems on low-memory devices in the past.
 */
export let oldLoading = false;
export const setOldLoading = (val: boolean) => {
  oldLoading = val
}

// presettings
let selectedMenu = 1;
let selectedShout = 0;

export let extrafeatures: string[] = [];
export const setExtraFeatures = (val: any) => {
  extrafeatures = val
}

export let banned: boolean = false;
export const setBanned = (val: boolean) => {
  banned = val
}
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

let lastICMessageTime = new Date(0);

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

    this.playerID = 1;
    this.charID = -1;
    this.char_list_length = 0;
    this.evidence_list_length = 0;
    this.music_list_length = 0;
    this.testimonyID = 0;

    this.chars = [];
    this.emotes = [];
    this.evidences = [];
    this.areas = [];
    this.musics = [];

    this.musics_time = false;

    this.callwords = [];

    this.resources = getResources(AO_HOST, THEME);

    this.selectedEmote = -1;
    this.selectedEvidence = 0;

    this.checkUpdater = null;
    this.viewport = masterViewport(this);

    this._lastTimeICReceived = new Date(0);
  }

  /**
   * Gets the current player's character.
   */
  get character() {
    return this.chars[this.charID];
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
      )).value += `wait#${(<HTMLInputElement>document.getElementById("client_replaytimer")).value
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
    this.sendServer(`RT#${testimony}#%`);
  }

  /**
   * Requests to change the music to the specified track.
   * @param {string} track the track ID
   */
  sendMusicChange(track: string) {
    this.sendServer(`MC#${track}#${this.charID}#%`);
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
    if (character === -1 || this.chars[character].name) {
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

    const data = msg.split("%")[0];
    const splitPacket = data.split('#')
    const packetHeader = splitPacket[0];

    packetHandler.has(packetHeader)
      ? packetHandler.get(packetHeader)(splitPacket)
      : console.warn(`Invalid packet header ${packetHeader}`);

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

  /**
   * Handles the incoming character information, and downloads the sprite + ini for it
   * @param {Array} chargs packet arguments
   * @param {Number} charid character ID
   */
  async handleCharacterInfo(chargs: string[], charid: number) {
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
            img.title = chargs[0];
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

      this.chars[charid] = {
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
        this.chars[charid].blips === "male" &&
        this.chars[charid].gender !== "male" &&
        this.chars[charid].gender !== ""
      ) {
        this.chars[charid].blips = this.chars[charid].gender;
      }

    } else {
      console.warn(`missing charid ${charid}`);
      img.style.display = "none";
    }
  }







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
 * Triggered when the Return key is pressed on the in-character chat input box.
 * @param {KeyboardEvent} event
 */
export function onEnter(event: KeyboardEvent) {
  if (event.keyCode === 13) {
    const mychar = client.character;
    const myemo = client.emote;
    const evi = client.evidence;
    const flip = Boolean(
      document.getElementById("button_flip").classList.contains("dark")
    );
    const flash = Boolean(
      document.getElementById("button_flash").classList.contains("dark")
    );
    const screenshake = Boolean(
      document.getElementById("button_shake").classList.contains("dark")
    );
    const noninterrupting_preanim = Boolean(
      (<HTMLInputElement>document.getElementById("check_nonint")).checked
    );
    const looping_sfx = Boolean(
      (<HTMLInputElement>document.getElementById("check_loopsfx")).checked
    );
    const color = Number(
      (<HTMLInputElement>document.getElementById("textcolor")).value
    );
    const showname = escapeChat(
      (<HTMLInputElement>document.getElementById("ic_chat_name")).value
    );
    const text = (<HTMLInputElement>document.getElementById("client_inputbox"))
      .value;
    const pairchar = (<HTMLInputElement>document.getElementById("pair_select"))
      .value;
    const pairoffset = Number(
      (<HTMLInputElement>document.getElementById("pair_offset")).value
    );
    const pairyoffset = Number(
      (<HTMLInputElement>document.getElementById("pair_y_offset")).value
    );
    const myrole = (<HTMLInputElement>document.getElementById("role_select"))
      .value
      ? (<HTMLInputElement>document.getElementById("role_select")).value
      : mychar.side;
    const additive = Boolean(
      (<HTMLInputElement>document.getElementById("check_additive")).checked
    );
    const effect = (<HTMLInputElement>document.getElementById("effect_select"))
      .value;

    let sfxname = "0";
    let sfxdelay = 0;
    let emote_mod = myemo.zoom;
    if ((<HTMLInputElement>document.getElementById("sendsfx")).checked) {
      sfxname = myemo.sfx;
      sfxdelay = myemo.sfxdelay;
    }

    // not to overwrite a 5 from the ini or anything else
    if ((<HTMLInputElement>document.getElementById("sendpreanim")).checked) {
      if (emote_mod === 0) {
        emote_mod = 1;
      }
    } else if (emote_mod === 1) {
      emote_mod = 0;
    }

    client.sendIC(
      myemo.deskmod,
      myemo.preanim,
      mychar.name,
      myemo.emote,
      text,
      myrole,
      sfxname,
      emote_mod,
      sfxdelay,
      selectedShout,
      evi,
      flip,
      flash,
      color,
      showname,
      pairchar,
      pairoffset,
      pairyoffset,
      noninterrupting_preanim,
      looping_sfx,
      screenshake,
      "-",
      "-",
      "-",
      additive,
      effect
    );
  }
  return false;
}
window.onEnter = onEnter;

/**
 * Resets the IC parameters for the player to enter a new chat message.
 * This should only be called when the player's previous chat message
 * was successfully sent/presented.
 */
export function resetICParams() {
  (<HTMLInputElement>document.getElementById("client_inputbox")).value = "";
  document.getElementById("button_flash").className = "client_button";
  document.getElementById("button_shake").className = "client_button";

  (<HTMLInputElement>document.getElementById("sendpreanim")).checked = false;
  (<HTMLInputElement>document.getElementById("sendsfx")).checked = false;

  if (selectedShout) {
    document.getElementById(`button_${selectedShout}`).className =
      "client_button";
    selectedShout = 0;
  }
}


/**
 * Triggered when an item on the area list is clicked.
 * @param {HTMLElement} el
 */
export function area_click(el: HTMLElement) {
  const area = client.areas[el.id.substr(4)].name;
  client.sendMusicChange(area);

  const areaHr = document.createElement("div");
  areaHr.className = "hrtext";
  areaHr.textContent = `switched to ${el.textContent}`;
  document.getElementById("client_log").appendChild(areaHr);
}
window.area_click = area_click;

/**
 * Triggered by a changed callword list
 */
export function changeCallwords() {
  client.callwords = (<HTMLInputElement>(
    document.getElementById("client_callwords")
  )).value.split("\n");
  setCookie("callwords", client.callwords.join("\n"));
}
window.changeCallwords = changeCallwords;

/**
 * Triggered by the modcall sfx dropdown
 */
export function modcall_test() {
  packetHandler.get("ZZ")("test#test".split("#"));
}
window.modcall_test = modcall_test;

/**
 * Triggered by the ini button.
 */
export async function iniedit() {
  const ininame = (<HTMLInputElement>document.getElementById("client_ininame"))
    .value;
  const inicharID = client.charID;
  await client.handleCharacterInfo(ininame.split("&"), inicharID);
  packetHandler.get("PV")(`PV#0#CID#${inicharID}`.split("#"));
}
window.iniedit = iniedit;

/**
 * Triggered by the pantilt checkbox
 */
export async function switchPanTilt() {
  const fullview = document.getElementById("client_fullview");
  const checkbox = <HTMLInputElement>document.getElementById("client_pantilt");

  if (checkbox.checked) {
    fullview.style.transition = "0.5s ease-in-out";
  } else {
    fullview.style.transition = "none";
  }

  return;
}
window.switchPanTilt = switchPanTilt;

/**
 * Triggered by the change aspect ratio checkbox
 */
export async function switchAspectRatio() {
  const background = document.getElementById("client_gamewindow");
  const offsetCheck = <HTMLInputElement>(
    document.getElementById("client_hdviewport_offset")
  );
  if (
    (<HTMLInputElement>document.getElementById("client_hdviewport")).checked
  ) {
    background.style.paddingBottom = "56.25%";
    offsetCheck.disabled = false;
  } else {
    background.style.paddingBottom = "75%";
    offsetCheck.disabled = true;
  }
}
window.switchAspectRatio = switchAspectRatio;

/**
 * Triggered by the change aspect ratio checkbox
 */
export async function switchChatOffset() {
  const container = document.getElementById("client_chatcontainer");
  if (
    (<HTMLInputElement>document.getElementById("client_hdviewport_offset"))
      .checked
  ) {
    container.style.width = "80%";
    container.style.left = "10%";
  } else {
    container.style.width = "100%";
    container.style.left = "0";
  }
}
window.switchChatOffset = switchChatOffset;

/**
 * Triggered when a character icon is clicked in the character selection menu.
 * @param {MouseEvent} event
 */
export function changeCharacter(_event: Event) {
  document.getElementById("client_waiting").style.display = "block";
  document.getElementById("client_charselect").style.display = "block";
  document.getElementById("client_emo").innerHTML = "";
}
window.changeCharacter = changeCharacter;

/**
 * Triggered when there was an error loading a character sprite.
 * @param {HTMLImageElement} image the element containing the missing image
 */
export function charError(image: HTMLImageElement) {
  console.warn(`${image.src} is missing from webAO`);
  image.src = transparentPng;
  return true;
}
window.charError = charError;

/**
 * Triggered when there was an error loading a generic sprite.
 * @param {HTMLImageElement} image the element containing the missing image
 */
export function imgError(image: HTMLImageElement) {
  image.onerror = null;
  image.src = ""; // unload so the old sprite doesn't persist
  return true;
}
window.imgError = imgError;

/**
 * Triggered when there was an error loading a sound
 * @param {HTMLAudioElement} image the element containing the missing sound
 */
export function opusCheck(
  channel: HTMLAudioElement
): OnErrorEventHandlerNonNull {
  const audio = channel.src;
  if (audio === "") {
    return;
  }
  console.info(`failed to load sound ${channel.src}`);
  let oldsrc = "";
  let newsrc = "";
  oldsrc = channel.src;
  if (!oldsrc.endsWith(".opus")) {
    newsrc = oldsrc.replace(".mp3", ".opus");
    newsrc = newsrc.replace(".wav", ".opus");
    channel.src = newsrc; // unload so the old sprite doesn't persist
  }
}
window.opusCheck = opusCheck;

/**
 * Triggered when the reconnect button is pushed.
 */
export function ReconnectButton() {
  client.cleanup();
  client = new Client(serverIP);

  if (client) {
    document.getElementById("client_error").style.display = "none";
  }
}
window.ReconnectButton = ReconnectButton;

/**
 * Appends a message to the in-character chat log.
 * @param {string} msg the string to be added
 * @param {string} name the name of the sender
 */
export function appendICLog(
  msg: string,
  showname = "",
  nameplate = "",
  time = new Date()
) {
  const entry = document.createElement("p");
  const shownameField = document.createElement("span");
  const nameplateField = document.createElement("span");
  const textField = document.createElement("span");
  nameplateField.className = "iclog_name iclog_nameplate";
  nameplateField.appendChild(document.createTextNode(nameplate));

  shownameField.className = "iclog_name iclog_showname";
  if (showname === "" || !showname) {
    shownameField.appendChild(document.createTextNode(nameplate));
  } else {
    shownameField.appendChild(document.createTextNode(showname));
  }

  textField.className = "iclog_text";
  textField.appendChild(document.createTextNode(msg));

  entry.appendChild(shownameField);
  entry.appendChild(nameplateField);
  entry.appendChild(textField);

  // Only put a timestamp if the minute has changed.
  if (lastICMessageTime.getMinutes() !== time.getMinutes()) {
    const timeStamp = document.createElement("span");
    timeStamp.className = "iclog_time";
    timeStamp.innerText = time.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    entry.appendChild(timeStamp);
  }

  const clientLog = document.getElementById("client_log");
  clientLog.appendChild(entry);

  /* This is a little buggy - some troubleshooting might be desirable */
  if (clientLog.scrollTop > clientLog.scrollHeight - 800) {
    clientLog.scrollTop = clientLog.scrollHeight;
  }

  lastICMessageTime = new Date();
}

/**
 * check if the message contains an entry on our callword list
 * @param {string} message
 */
export function checkCallword(message: string, sfxAudio: HTMLAudioElement) {
  client.callwords.forEach(testCallword);
  function testCallword(item: string) {
    if (item !== "" && message.toLowerCase().includes(item.toLowerCase())) {
      sfxAudio.pause();
      sfxAudio.src = `${AO_HOST}sounds/general/sfx-gallery.opus`;
      sfxAudio.play();
    }
  }
}

/**
 * Triggered when the music search bar is changed
 * @param {MouseEvent} event
 */
export function chartable_filter(_event: Event) {
  const searchname = (<HTMLInputElement>(
    document.getElementById("client_charactersearch")
  )).value;

  client.chars.forEach((character: any, charid: number) => {
    const demothing = document.getElementById(`demo_${charid}`);
    if (character.name.toLowerCase().indexOf(searchname.toLowerCase()) === -1) {
      demothing.style.display = "none";
    } else {
      demothing.style.display = "inline-block";
    }
  });
}
window.chartable_filter = chartable_filter;

/**
 * Requests to play as a character.
 * @param {number} ccharacter the character ID; if this is a large number,
 * then spectator is chosen instead.
 */
export function pickChar(ccharacter: number) {
  if (ccharacter === -1) {
    // Spectator
    document.getElementById("client_waiting").style.display = "none";
    document.getElementById("client_charselect").style.display = "none";
  }
  client.sendCharacter(ccharacter);
}
window.pickChar = pickChar;

/**
 * Highlights and selects an emotion for in-character chat.
 * @param {string} emo the new emotion to be selected
 */
export function pickEmotion(emo: number) {
  try {
    if (client.selectedEmote !== -1) {
      document.getElementById(`emo_${client.selectedEmote}`).className =
        "emote_button";
    }
  } catch (err) {
    // do nothing
  }
  client.selectedEmote = emo;
  document.getElementById(`emo_${emo}`).className = "emote_button dark";

  (<HTMLInputElement>document.getElementById("sendsfx")).checked =
    client.emote.sfx.length > 1;

  (<HTMLInputElement>document.getElementById("sendpreanim")).checked =
    client.emote.zoom == 1;
}
window.pickEmotion = pickEmotion;

/**
 * Highlights and selects an evidence for in-character chat.
 * @param {string} evidence the evidence to be presented
 */
export function pickEvidence(evidence: number) {
  if (client.selectedEvidence !== evidence) {
    // Update selected evidence
    if (client.selectedEvidence > 0) {
      document.getElementById(`evi_${client.selectedEvidence}`).className =
        "evi_icon";
    }
    document.getElementById(`evi_${evidence}`).className = "evi_icon dark";
    client.selectedEvidence = evidence;

    // Show evidence on information window
    (<HTMLInputElement>document.getElementById("evi_name")).value =
      client.evidences[evidence - 1].name;
    (<HTMLInputElement>document.getElementById("evi_desc")).value =
      client.evidences[evidence - 1].desc;

    // Update icon
    const icon_id = getIndexFromSelect(
      "evi_select",
      client.evidences[evidence - 1].filename
    );
    (<HTMLSelectElement>document.getElementById("evi_select")).selectedIndex =
      icon_id;
    if (icon_id === 0) {
      (<HTMLInputElement>document.getElementById("evi_filename")).value =
        client.evidences[evidence - 1].filename;
    }
    updateEvidenceIcon();

    // Update button
    document.getElementById("evi_add").className =
      "client_button hover_button inactive";
    document.getElementById("evi_edit").className =
      "client_button hover_button";
    document.getElementById("evi_cancel").className =
      "client_button hover_button";
    document.getElementById("evi_del").className = "client_button hover_button";
  } else {
    cancelEvidence();
  }
}
window.pickEvidence = pickEvidence;

/**
 * Add evidence.
 */
export function addEvidence() {
  const evidence_select = <HTMLSelectElement>(
    document.getElementById("evi_select")
  );
  client.sendPE(
    (<HTMLInputElement>document.getElementById("evi_name")).value,
    (<HTMLInputElement>document.getElementById("evi_desc")).value,
    evidence_select.selectedIndex === 0
      ? (<HTMLInputElement>document.getElementById("evi_filename")).value
      : evidence_select.options[evidence_select.selectedIndex].text
  );
  cancelEvidence();
}
window.addEvidence = addEvidence;

/**
 * Edit selected evidence.
 */
export function editEvidence() {
  const evidence_select = <HTMLSelectElement>(
    document.getElementById("evi_select")
  );
  const id = client.selectedEvidence - 1;
  client.sendEE(
    id,
    (<HTMLInputElement>document.getElementById("evi_name")).value,
    (<HTMLInputElement>document.getElementById("evi_desc")).value,
    evidence_select.selectedIndex === 0
      ? (<HTMLInputElement>document.getElementById("evi_filename")).value
      : evidence_select.options[evidence_select.selectedIndex].text
  );
  cancelEvidence();
}
window.editEvidence = editEvidence;

/**
 * Delete selected evidence.
 */
export function deleteEvidence() {
  const id = client.selectedEvidence - 1;
  client.sendDE(id);
  cancelEvidence();
}
window.deleteEvidence = deleteEvidence;

/**
 * Cancel evidence selection.
 */
export function cancelEvidence() {
  // Clear evidence data
  if (client.selectedEvidence > 0) {
    document.getElementById(`evi_${client.selectedEvidence}`).className =
      "evi_icon";
  }
  client.selectedEvidence = 0;

  // Clear evidence on information window
  (<HTMLSelectElement>document.getElementById("evi_select")).selectedIndex = 0;
  updateEvidenceIcon(); // Update icon widget
  (<HTMLInputElement>document.getElementById("evi_filename")).value = "";
  (<HTMLInputElement>document.getElementById("evi_name")).value = "";
  (<HTMLInputElement>document.getElementById("evi_desc")).value = "";
  (<HTMLImageElement>(
    document.getElementById("evi_preview")
  )).src = `${AO_HOST}misc/empty.png`; // Clear icon

  // Update button
  document.getElementById("evi_add").className = "client_button hover_button";
  document.getElementById("evi_edit").className =
    "client_button hover_button inactive";
  document.getElementById("evi_cancel").className =
    "client_button hover_button inactive";
  document.getElementById("evi_del").className =
    "client_button hover_button inactive";
}
window.cancelEvidence = cancelEvidence;

/**
 * Find index of anything in select box.
 * @param {string} select_box the select element name
 * @param {string} value the value that need to be compared
 */
export function getIndexFromSelect(select_box: string, value: string) {
  // Find if icon alraedy existed in select box
  const select_element = <HTMLSelectElement>document.getElementById(select_box);
  for (let i = 1; i < select_element.length; ++i) {
    if (select_element.options[i].value === value) {
      return i;
    }
  }
  return 0;
}
window.getIndexFromSelect = getIndexFromSelect;

/**
 * Set the style of the chatbox
 */
export function setChatbox(style: string) {
  const chatbox_theme = <HTMLAnchorElement>(
    document.getElementById("chatbox_theme")
  );
  const themeselect = <HTMLSelectElement>(
    document.getElementById("client_chatboxselect")
  );
  CHATBOX = themeselect.value;

  setCookie("chatbox", CHATBOX);
  if (CHATBOX === "dynamic") {
    if (chatbox_arr.includes(style)) {
      chatbox_theme.href = `styles/chatbox/${style}.css`;
    } else {
      chatbox_theme.href = "styles/chatbox/aa.css";
    }
  } else {
    chatbox_theme.href = `styles/chatbox/${CHATBOX}.css`;
  }
}
window.setChatbox = setChatbox;

/**
 * Set the font size for the chatbox
 */
export function resizeChatbox() {
  const chatContainerBox = document.getElementById("client_chatcontainer");
  const gameHeight = document.getElementById("client_background").offsetHeight;

  chatContainerBox.style.fontSize = `${(gameHeight * 0.0521).toFixed(1)}px`;

  const trackstatus = <HTMLMarqueeElement>(document.getElementById("client_trackstatustext"));
  trackstatus.width = (trackstatus.offsetWidth - 1) + "px";


  //clock
  const now = new Date();
  let weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  document.getElementById("client_clock_month").innerText = month[now.getMonth()];
  console.debug(CHATBOX);
  if (CHATBOX == "acww") {
    weekday = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    document.getElementById("client_clock_weekday").innerText = weekday[now.getDay()];
    document.getElementById("client_clock_date").innerText = now.getDay() + "/" + now.getMonth();
    document.getElementById("client_clock_time").innerText = now.getHours() + ":" + now.getMinutes();
  } else if (CHATBOX == "key") {
    weekday = ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."];
    document.getElementById("client_clock_weekday").innerText = weekday[now.getDay()];
    document.getElementById("client_clock_date").innerText = String(now.getDay());
  }

}
window.resizeChatbox = resizeChatbox;

/**
 * Update evidence icon.
 */
export function updateEvidenceIcon() {
  const evidence_select = <HTMLSelectElement>(
    document.getElementById("evi_select")
  );
  const evidence_filename = <HTMLInputElement>(
    document.getElementById("evi_filename")
  );
  const evidence_iconbox = <HTMLImageElement>(
    document.getElementById("evi_preview")
  );

  if (evidence_select.selectedIndex === 0) {
    evidence_filename.style.display = "initial";
    evidence_iconbox.src = `${AO_HOST}evidence/${encodeURI(
      evidence_filename.value.toLowerCase()
    )}`;
  } else {
    evidence_filename.style.display = "none";
    evidence_iconbox.src = `${AO_HOST}evidence/${encodeURI(
      evidence_select.value.toLowerCase()
    )}`;
  }
}
window.updateEvidenceIcon = updateEvidenceIcon;





/**
 * Change role via OOC.
 */
export function changeRoleOOC() {
  const roleselect = <HTMLInputElement>document.getElementById("role_select");

  client.sendOOC(`/pos ${roleselect.value}`);
  client.sendServer(`SP#${roleselect.value}#%`);
  updateActionCommands(roleselect.value);
}
window.changeRoleOOC = changeRoleOOC;

/**
 * Random character via OOC.
 */
export function randomCharacterOOC() {
  client.sendOOC(`/randomchar`);
}
window.randomCharacterOOC = randomCharacterOOC;

/**
 * Call mod.
 */
export function callMod() {
  let modcall;
  if (extrafeatures.includes("modcall_reason")) {
    modcall = prompt("Please enter the reason for the modcall", "");
  }
  if (modcall == null || modcall === "") {
    // cancel
  } else {
    client.sendZZ(modcall);
  }
}
window.callMod = callMod;

/**
 * Declare witness testimony.
 */
export function initWT() {
  client.sendRT("testimony1");
}
window.initWT = initWT;

/**
 * Declare cross examination.
 */
export function initCE() {
  client.sendRT("testimony2");
}
window.initCE = initCE;

/**
 * Declare the defendant not guilty
 */
export function notguilty() {
  client.sendRT("judgeruling#0");
}
window.notguilty = notguilty;

/**
 * Declare the defendant not guilty
 */
export function guilty() {
  client.sendRT("judgeruling#1");
}
window.guilty = guilty;

/**
 * Increment defense health point.
 */
export function addHPD() {
  client.sendHP(1, client.hp[0] + 1);
}
window.addHPD = addHPD;

/**
 * Decrement defense health point.
 */
export function redHPD() {
  client.sendHP(1, client.hp[0] - 1);
}
window.redHPD = redHPD;

/**
 * Increment prosecution health point.
 */
export function addHPP() {
  client.sendHP(2, client.hp[1] + 1);
}
window.addHPP = addHPP;

/**
 * Decrement prosecution health point.
 */
export function redHPP() {
  client.sendHP(2, client.hp[1] - 1);
}
window.redHPP = redHPP;

/**
 * Highlights and selects a menu.
 * @param {number} menu the menu to be selected
 */
export function toggleMenu(menu: number) {
  if (menu !== selectedMenu) {
    document.getElementById(`menu_${menu}`).className = "menu_button active";
    document.getElementById(`content_${menu}`).className =
      "menu_content active";
    document.getElementById(`menu_${selectedMenu}`).className = "menu_button";
    document.getElementById(`content_${selectedMenu}`).className =
      "menu_content";
    selectedMenu = menu;
  }
}
window.toggleMenu = toggleMenu;

/**
 * Highlights and selects a shout for in-character chat.
 * If the same shout button is selected, then the shout is canceled.
 * @param {number} shout the new shout to be selected
 */
export function toggleShout(shout: number) {
  if (shout === selectedShout) {
    document.getElementById(`button_${shout}`).className = "client_button";
    selectedShout = 0;
  } else {
    document.getElementById(`button_${shout}`).className = "client_button dark";
    if (selectedShout) {
      document.getElementById(`button_${selectedShout}`).className =
        "client_button";
    }
    selectedShout = shout;
  }
}
window.toggleShout = toggleShout;

export default Client;
