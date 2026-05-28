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
import { packetRegistry, type PacketCodec } from "./packets";
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

export const encode_packets_as_json = false;

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
  temp_packet: string;
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
    this.temp_packet = "";
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
   * Hook for sending messages to the client
   * @param {string} message the message to send
   */
  handleSelf(message: string) {
    const message_event = new MessageEvent("websocket", { data: message });
    setTimeout(() => this.onMessage(message_event), 1);
  }

  /**
   * Echoes a wire message back into our own dispatcher. Used by handlers
   * that synthesize follow-up packets (e.g. RD -> BN/DONE) and by replay
   * mode to feed pre-recorded packets through.
   */
  sendToSelf(message: string) {
    (<HTMLInputElement>document.getElementById("client_ooclog")).value +=
      `${message}\r\n`;
    this.handleSelf(message);
  }

  /**
   * Writes a raw wire-format string to the server. Escape hatch for senders
   * that build the wire bytes inline without going through a codec. In
   * replay mode the websocket isn't live, so outgoing packets loop back
   * through `sendToSelf` to drive the local dispatcher.
   */
  sendStringToServer(message: string) {
    console.debug("C: " + message);
    if (mode === "replay") {
      this.sendToSelf(message);
    } else {
      this.serv.send(message);
    }
  }

  /**
   * Sends a typed packet using `codec`. JSON mode produces
   * `{"$header": codec.header, ...packet}`; legacy mode delegates to
   * `codec.encode(packet)`.
   */
  sendPacketToServer<T>(codec: PacketCodec<T>, packet: T) {
    if (encode_packets_as_json) {
      this.sendStringToServer(JSON.stringify({ $header: codec.header, ...packet }));
      return;
    }
    if (!codec.encode) {
      throw new Error(`No encoder defined for codec ${codec.header}`);
    }
    this.sendStringToServer(codec.encode(packet));
  }

  /**
   * Begins the handshake process by sending an identifier
   * to the server.
   */
  joinServer() {
    this.sendPacketToServer(HI, { hdid });
    if (mode !== "replay") {
      this.checkUpdater = setInterval(
        () => sendCH({ char_id: this.charID }),
        5000,
      );
    }
  }

  /**
   * Triggered when a connection is established to the server.
   */
  onOpen(_e: Event) {
    client.state = clientState.Connected;
    document.getElementById("client_error_overlay").style.display = "none";
    document.getElementById("client_waiting").style.display = "block";
    document.getElementById("client_loading").style.display = "block";
    document.getElementById("client_charselect").style.display = "none";
    appendICNotice("Connected");
    client.joinServer();
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
    this.handleServerPacket(msg);
  }

  /**
   * Splits a server chunk on the `%` packet terminator and dispatches each
   * complete packet. A trailing incomplete packet (no terminator yet) is
   * buffered in `temp_packet` for the next chunk.
   */
  handleServerPacket(chunk: string) {
    const segments = (this.temp_packet + chunk).split("%");
    this.temp_packet = segments.pop() ?? "";
    for (const segment of segments) this.dispatchPacket(segment);
  }

  /** Decodes a single complete packet body (sans `%` terminator) and dispatches it. */
  dispatchPacket(packet: string) {
    if (packet === "") return;

    // Packet should always end with #; parse anyway if it somehow doesn't.
    const body = packet.endsWith("#") ? packet.slice(0, -1) : packet;
    const args = body.split("#");
    const header = args[0];
    if (header === "") {
      console.warn("WARNING: Empty packet received from server, skipping...");
      return;
    }

    // packetRegistry maps header -> { codec, receive?, send? }: decode the
    // wire args into a typed packet, then dispatch to the receiver. Decode
    // and receive are guarded individually so a single malformed/buggy packet
    // can't poison its siblings in the same WebSocket frame.
    const entry = packetRegistry.get(header);
    if (!entry) {
      console.warn(`Invalid packet header ${header}`);
      return;
    }
    if (!entry.receive) {
      console.warn(`Received ${header} but no receiver is registered`);
      return;
    }

    let decoded;
    try {
      decoded = entry.codec.decode(args);
    } catch (err) {
      console.error(`Failed to decode ${header} packet:`, err, { body });
      return;
    }

    try {
      entry.receive(decoded);
    } catch (err) {
      console.error(`Receiver for ${header} threw:`, err, { body });
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
   * @param {*} args packet arguments
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
