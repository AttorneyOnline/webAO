/*
 * Glorious webAO
 * made by sD, refactored by oldmud0 and Qubrick
 * credits to aleks for original idea and source
 */
import "./styles/client.css";
import "./styles/goldenlayout.css";
import "golden-layout/dist/css/themes/goldenlayout-dark-theme.css";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import queryParser from "./utils/queryParser";
import getResources from "./utils/getResources";
import masterViewport from "./viewport/viewport";
import { Viewport } from "./viewport/interfaces/Viewport";
import { EventEmitter } from "events";
import { onReplayGo } from "./dom/onReplayGo";
import * as aolib from "./aolib";
import { registerProtocol } from "./registerProtocol";
import { appendICNotice } from "./client/appendICNotice";
import { loadResources } from "./client/loadResources";
import { AO_HOST } from "./client/aoHost";
import { installVoiceUI } from "./voice/voiceUI";
import {
  fetchBackgroundList,
  fetchEvidenceList,
  fetchCharacterList,
} from "./client/fetchLists";
const { ip: serverIP, connect, mode, theme, serverName, char: autoChar, area: autoArea } = queryParser();
export { autoChar, autoArea };

document.title = serverName;

export let CHATBOX: string;
export const setCHATBOX = (val: string) => {
  CHATBOX = val;
};
export let client: Client;
export const setClient = (val: Client) => {
  client = val;
};

export const UPDATE_INTERVAL = 60;

// presettings
export let selectedMenu = 1;
export const setSelectedMenu = (val: number) => {
  selectedMenu = val;
};
import { ShoutModifier } from "./aolib";
export let selectedShout: ShoutModifier = ShoutModifier.NONE;
export const setSelectedShout = (val: ShoutModifier) => {
  selectedShout = val;
};
export let extrafeatures: string[] = [];
export const setExtraFeatures = (val: any) => {
  extrafeatures = val;
};


let hdid: string;

const fpPromise = FingerprintJS.load();

fpPromise
  .then((fp) => fp.get())
  .then((result) => {
    hdid = result.visitorId;

    let connectionString = connect;

    if (!connectionString && mode !== "replay") {
      if (serverIP) {
        // if connectionString is not set, try IP
        // and just guess ws, though it could be wss
        connectionString = `ws://${serverIP}`;
      } else {
        alert("No connection string specified!");
        return;
      }
    }

    if (
      window.location.protocol === "https:" &&
      connectionString.startsWith("ws://")
    ) {
      // If protocol is https: and connectionString is ws://
      // We have a problem, since it's impossible to connect to ws:// from https://
      // Connection will fail, but at least warn the user
      alert(
        "WS not supported on HTTPS. Please try removing the s from https:// at the start of the URL bar. (You might have to click inside the URL bar to see it)",
      );
    }

    client = new Client(connectionString);
    client.connect();
    client.hdid = hdid;
    loadResources();
    installVoiceUI();
  });

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export enum clientState {
  NotConnected,
  // Should be set once the client has established a connection
  Connected,
  // Should be set once the client has joined the server (after handshake)
  Joined,
  // Set when a reconnect attempt is in progress
  Reconnecting,
}

export let lastICMessageTime = new Date(0);
export const setLastICMessageTime = (val: Date) => {
  lastICMessageTime = val;
};

class Client extends EventEmitter {
  /**
   * Session representing the remote server. Owns the C2S send side
   * (`server.send.HI(...)`, etc.) and the S2C receive side
   * (`server.on.MS(...)`, registered from `packets.ts`).
   * Initialised in `connect()` once the transport is ready.
   */
  server!: aolib.ServerSession;

  /**
   * Session representing a remote client. Used only in replay /
   * acting-as-server mode where we synthesise server-side packets
   * locally — `clientSession.send.MC(...)` loops back to
   * `server.receive(wire)` as if a real server had sent it.
   */
  clientSession!: aolib.ClientSession;

  /**
   * When true, we synthesise the server locally instead of talking
   * to a real one. In this mode, outbound from `server.send` is
   * looped back into `clientSession.receive` so the synthesised
   * server can react.
   */
  acting_as_server = false;

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
  area: number;
  areas: any;
  musics: any;
  musics_time: boolean;
  callwords: string[];
  banned: boolean;
  hdid: string;
  resources: any;
  selectedEmote: number;
  selectedEvidence: number;
  checkUpdater: any;
  _lastTimeICReceived: any;
  viewport: Viewport;
  state: clientState;
  connect: () => void;
  loadResources: () => void;
  /** Maps player ID to player data */
  playerlist: Map<number, { charId: number; charName: string; showName: string; name: string; area: number }>;
  charicon_extensions: string[];
  emote_extensions: string[];
  emotions_extensions: string[];
  background_extensions: string[];
  constructor(connectionString: string) {
    super();

    this.acting_as_server = mode === "replay";
    this.state = clientState.NotConnected;
    this.connect = () => {
      this.on("open", this.onOpen.bind(this));
      this.on("close", this.onClose.bind(this));
      this.on("message", this.onMessage.bind(this));
      this.on("error", this.onError.bind(this));

      // Wire the aolib sessions. Both must exist before handlers are
      // registered so the wrong-direction guard sees the full picture.
      // server.send.X ships outbound; in replay mode it loops back to
      // clientSession.receive instead of going to the wire.
      // clientSession.send.X is used only in replay mode (to synthesise
      // server -> client packets) — its output always loops to
      // server.receive.
      this.server = aolib.server({
        send: (wire) => {
          console.debug(`C: ${wire}`);
          if (this.acting_as_server) {
            this.clientSession.receive(wire);
          } else {
            this.serv.send(wire);
          }
        },
        onUnknownHeader: (header, wire) => {
          console.warn(`[aolib] unknown s2c header '${header}'`, { wire });
        },
        onDecodeError: (header, err, wire) => {
          console.error(`[aolib] decode error for '${header}':`, err, { wire });
        },
        onHandlerError: (header, err) => {
          console.error(`[aolib] handler for '${header}' threw:`, err);
        },
      });
      this.clientSession = aolib.client({
        send: (wire) => {
          console.debug(`S: ${wire}`);
          this.server.receive(wire);
        },
        onUnknownHeader: (header, wire) => {
          console.warn(`[aolib] unknown c2s header '${header}'`, { wire });
        },
        onDecodeError: (header, err, wire) => {
          console.error(`[aolib] decode error for '${header}':`, err, { wire });
        },
        onHandlerError: (header, err) => {
          console.error(`[aolib] server-side handler for '${header}' threw:`, err);
        },
      });
      registerProtocol(this.server, this.clientSession);

      if (mode !== "replay") {
        this.serv = new WebSocket(connectionString);
        // Assign the websocket events
        this.serv.addEventListener("open", this.emit.bind(this, "open"));
        this.serv.addEventListener("close", this.emit.bind(this, "close"));
        this.serv.addEventListener("message", this.emit.bind(this, "message"));
        this.serv.addEventListener("error", this.emit.bind(this, "error"));

        // If the client is still not connected 5 seconds after attempting to join
        // It's fair to assume that the server is not reachable
        setTimeout(() => {
          if (this.state === clientState.NotConnected) {
            this.serv.close();
          }
        }, 5000);
      } else {
        this.joinServer();
      }
    };

    this.banned = false;
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
    this.area = 0;
    this.areas = [];
    this.musics = [];
    this.musics_time = false;
    this.callwords = [];
    this.resources = getResources(AO_HOST, theme);
    this.selectedEmote = -1;
    this.selectedEvidence = -1;
    this.checkUpdater = null;
    this.viewport = masterViewport();
    this._lastTimeICReceived = new Date(0);
    this.playerlist = new Map();
    this.charicon_extensions = [".png", ".webp"];
    this.emote_extensions = [".gif", ".png", ".apng", ".webp", ".webp.static"];
    this.emotions_extensions = [".png", ".webp"];
    this.background_extensions = [".png", ".gif"];
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
      : -1;
  }

  /**
   * Begins the handshake process by sending an identifier
   * to the server.
   */
  joinServer() {
    this.server.send.HI({ hdid });
    if (mode !== "replay") {
      this.checkUpdater = setInterval(
        () => this.server.send.CH({ char_id: this.charID }),
        5000,
      );
    }
  }

  /**
   * Triggered when a connection is established to the server.
   * @param {Event} _e
   */
  onOpen(_e: Event) {
    client.state = clientState.Connected;
    document.getElementById("client_error_overlay").style.display = "none";
    document.getElementById("client_waiting").style.display = "block";
    document.getElementById("client_loading").style.display = "block";
    document.getElementById("client_charselect").style.display = "none";
    appendICNotice("Connected");
  }

  /**
   * Triggered when the connection to the server closes.
   * @param {CloseEvent} e
   */
  onClose(e: CloseEvent) {
    console.error(`The connection was closed: ${e.reason} (${e.code})`);
    if (this.state === clientState.Reconnecting) return;
    client.state = clientState.NotConnected;
    if (this.banned === false) {
      if (this.areas.length > 0) {
        document.getElementById("client_errortext").textContent =
          "You were disconnected from the server.";
        appendICNotice("Disconnected");
      } else {
        document.getElementById("client_errortext").textContent =
          "Could not connect to the server.";
      }
      (<HTMLElement>document.getElementById("client_reconnect")).style.display = "";
    }
    document.getElementById("client_error_overlay").style.display = "flex";
    document.getElementById("client_loading").style.display = "none";
    document.getElementById("error_id").textContent = String(e.code);
    this.cleanup();
  }

  /** Triggered when a packet (or chunk thereof) is received from the server. */
  onMessage(e: MessageEvent) {
    const msg = e.data;
    console.debug(`S: ${msg}`);
    this.server.receive(msg);
  }

  /**
   * Triggered when an network error occurs.
   * @param {ErrorEvent} e
   */
  onError(e: ErrorEvent) {
    console.error(`A network error occurred`);
    console.error(e);
    if (this.state === clientState.Reconnecting) return;
    client.state = clientState.NotConnected;
    document.getElementById("client_errortext").textContent =
      "Could not connect to the server.";
    (<HTMLElement>document.getElementById("client_reconnect")).style.display = "";
    document.getElementById("client_error_overlay").style.display = "flex";
    this.cleanup();
  }

  /**
   * Stop sending keepalives to the server.
   */
  cleanup() {
    clearInterval(this.checkUpdater);
    if (this.serv) this.serv.close();
  }

  /**
   * Parse the lines in the OOC and play them
   */
  handleReplay() {
    const ooclog = <HTMLInputElement>document.getElementById("client_ooclog");
    const rawLog = false;
    let rtime: number = Number(
      (<HTMLInputElement>document.getElementById("client_replaytimer")).value,
    );

    const clines = ooclog.value.split(/\r?\n/);
    if (clines[0]) {
      const currentLine = String(clines[0]);
      this.server.receive(currentLine);
      ooclog.value = clines.slice(1).join("\r\n");
      if (currentLine.substr(0, 4) === "wait" && rawLog === false) {
        rtime = Number(currentLine.split("#")[1]);
      } else if (currentLine.substr(0, 2) !== "MS") {
        rtime = 0;
      }

      setTimeout(() => onReplayGo(null), rtime);
    }
  }

  resetMusicList() {
    this.musics = [];
    document.getElementById("client_musiclist").innerHTML = "";
  }

  resetAreaList() {
    this.areas = [];
    document.getElementById("areas").innerHTML = "";
    fetchBackgroundList();
    fetchEvidenceList();
    fetchCharacterList();
  }
}

export default Client;
