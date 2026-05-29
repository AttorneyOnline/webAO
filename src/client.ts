/*
 * Glorious webAO
 * made by sD, refactored by oldmud0 and Qubrick
 * credits to aleks for original idea and source
 */
import "./styles/client.css";
import "./styles/goldenlayout.css";
import "golden-layout/dist/css/themes/goldenlayout-dark-theme.css";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { sendCH } from "./packets/CH";
import { HI } from "./packets/HI";
import queryParser from "./utils/queryParser";
import getResources from "./utils/getResources";
import masterViewport from "./viewport/viewport";
import { Viewport } from "./viewport/interfaces/Viewport";
import { EventEmitter } from "events";
import { onReplayGo } from "./dom/onReplayGo";
import {
  clientReceive,
  clientSend,
  type Packet,
  type PacketCodec,
  type Schema,
  encodePacket,
  readHeader,
  encode,
  serverReceive,
  serverSend,
} from "./packets";
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
import { ShoutModifier } from "./packets/MS";
export let selectedShout: ShoutModifier = ShoutModifier.NONE;
export const setSelectedShout = (val: ShoutModifier) => {
  selectedShout = val;
};
export let extrafeatures: string[] = [];
export const setExtraFeatures = (val: any) => {
  extrafeatures = val;
};

/**
 * Wire-format mode for both directions. Starts in fantacode; flips to
 * JSON when the server sends `decryptor#JSON#%` during the handshake.
 * Outgoing packets use this to choose how to encode; the receive path
 * uses it to choose how to frame incoming bytes (JSON arrives as whole
 * envelopes per socket frame; fanta needs `%`-splitting + buffering).
 * Per-packet `decode` auto-detects regardless.
 */
export let json_mode = false;
export const setJsonMode = (v: boolean) => {
  json_mode = v;
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
  // Sender registry
  send = clientSend;

  // Receiver registry
  receive = clientReceive;

  // Sender as Server registry
  sendAsServer = serverSend;

  // Receiver as Server registry
  receiveAsServer = serverReceive;

  /**
   * When true, we synthesise the server locally instead of talking
   * to a real one
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
   * Sends a typed packet, picking the wire format from
   * `json_mode`. Accepts either a legacy `PacketCodec` or a
   * class-schema constructor (e.g. `MCPacketServer`). Class-schema
   * constructors must expose a `static $header: string`.
   */
  sendPacket<T>(codec: PacketCodec<T>, packet: T): void;
  sendPacket<T extends Packet>(
    SchemaClass: Schema<T> & { $header: string },
    packet: Partial<T>,
  ): void;
  // The impl signature is loose because the type discipline lives on the
  // two overloads above; the runtime branch picks which encoder to call.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendPacket(schema: any, packet: any) {
    if (typeof schema === "function") {
      this.sendData(encode(schema, packet, json_mode));
    } else {
      this.sendData(encodePacket(schema, packet, json_mode));
    }
  }

  /**
   * Begins the handshake process by sending an identifier
   * to the server.
   */
  joinServer() {
    this.sendPacket(HI, { hdid });
    if (mode !== "replay") {
      this.checkUpdater = setInterval(
        () => sendCH({ char_id: this.charID }),
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

  /**
   * Transmit a wire frame to the server. Loop back to ourselves if acting as server.
   */
  sendData(message: string) {
    console.debug("C: " + message);
    if (this.acting_as_server) {
      this.receiveDataAsServer(message);
    } else {
      this.serv.send(message);
    }
  }

  /**
   * Emit a wire frame as if we were the server. The header is
   * validated against `serverSend` (so we don't accidentally
   * synthesise a packet a server wouldn't legitimately send), then
   * the frame loops back through `receiveData` so the client side
   * processes it normally.
   */
  sendDataAsServer(message: string) {
    console.debug("S: " + message);
    this.receiveData(message);
  }

  /** Triggered when a packet (or chunk thereof) is received from the server. */
  onMessage(e: MessageEvent) {
    const msg = e.data;
    console.debug(`S: ${msg}`);
    this.receiveData(msg);
  }

  /**
   * Receive data as a client
   */
  receiveData(data: string) {
    this.dispatchFrame(data, "Client");
  }

  /**
   * Mirror of `receiveData` for the opposite direction: receive data as if we're a server
   */
  receiveDataAsServer(data: string) {
    this.dispatchFrame(data, "Server");
  }

  private dispatchFrame(
    data: string,
    role: "Client" | "Server",
  ) {
    // Widen the per-table key type to plain `string` so we can look up
    // an unknown header without TS complaining about index access.
    const receiverLookup: Record<string, (body: string) => void> =
      role === "Client" ? this.receive : this.receiveAsServer;
    let header: string;
    try {
      header = readHeader(data);
    } catch (err) {
      console.error(`Failed to read packet header:`, err, { body: data });
      return;
    }
    if (header === "") {
      console.warn(`WARNING: Empty header received, skipping...`);
      return;
    }
    const receiver = receiverLookup[header];
    if (!receiver) {
      console.warn(`Unknown packet header for ${role} receiver:`, header);
      return;
    }
    try {
      receiver(data);
    } catch (err) {
      console.error(`Receiver for ${header} threw:`, err, { body: data });
    }
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
      this.receiveData(currentLine);
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
