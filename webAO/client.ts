/*
 * Glorious webAO
 * made by sD, refactored by oldmud0 and Qubrick
 * credits to aleks for original idea and source
 */
import { isLowMemory } from './client/isLowMemory'
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { sender, ISender } from './client/sender/index'
import queryParser from "./utils/queryParser";
import getResources from "./utils/getResources.js";
import masterViewport from "./viewport/viewport";
import { Viewport } from './viewport/interfaces/Viewport';
import { EventEmitter } from "events";
import { onReplayGo } from './dom/onReplayGo'
import { packetHandler } from './packets/packetHandler'
import { loadResources } from './client/loadResources'
import { AO_HOST } from './client/aoHost'
import { fetchBackgroundList, fetchEvidenceList, fetchCharacterList } from './client/fetchLists'
import getCookie from "./utils/getCookie";
import setCookie from "./utils/setCookie";
const { ip: serverIP, connect, mode, theme, serverName } = queryParser();

document.title = serverName;

export let CHATBOX: string;
export const setCHATBOX = (val: string) => {
    CHATBOX = val
}
export let client: Client;
export const setClient = (val: Client) => {
    client = val
}

export const UPDATE_INTERVAL = 60;

/**
 * Toggles AO1-style loading using paginated music packets for mobile platforms.
 * The old loading uses more smaller packets instead of a single big one,
 * which caused problems on low-memory devices in the past.
 */
export let oldLoading = false;
export const setOldLoading = (val: boolean) => {
    console.warn("old loading set to " + val)
    oldLoading = val
}

// presettings
export let selectedMenu = 1;
export const setSelectedMenu = (val: number) => {
    selectedMenu = val
}
export let selectedShout = 0;
export const setSelectedShout = (val: number) => {
    selectedShout = val
}
export let extrafeatures: string[] = [];
export const setExtraFeatures = (val: any) => {
    extrafeatures = val
}

export let banned: boolean = false;
export const setBanned = (val: boolean) => {
    banned = val
}
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

        if (window.location.protocol === "https:" && connectionString.startsWith("ws://")) {
            // If protocol is https: and connectionString is ws://
            // We have a problem, since it's impossible to connect to ws:// from https://
            // Connection will fail, but at least warn the user
            alert('WS not supported on HTTPS. Please try removing the s from https:// at the start of the URL bar. (You might have to click inside the URL bar to see it)')
        }

        client = new Client(connectionString);
        client.connect()
        client.hdid = hdid;
        isLowMemory();
        loadResources();
    });

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export enum clientState {
    NotConnected,
    // Should be set once the client has established a connection
    Connected,
    // Should be set once the client has joined the server (after handshake)
    Joined
}

export let lastICMessageTime = new Date(0);
export const setLastICMessageTime = (val: Date) => {
    lastICMessageTime = val
}
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
    sender: ISender;
    checkUpdater: any;
    _lastTimeICReceived: any;
    manifest: string[];
    viewport: Viewport;
    partial_packet: boolean;
    temp_packet: string;
    state: clientState;
    connect: () => void;
    loadResources: () => void
    isLowMemory: () => void
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
        }

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
        this.manifest = [];
        this.resources = getResources(AO_HOST, theme);
        this.selectedEmote = -1;
        this.selectedEvidence = -1;
        this.checkUpdater = null;
        this.sender = sender
        this.viewport = masterViewport();
        this._lastTimeICReceived = new Date(0);
        this.partial_packet = false;
        this.temp_packet = "";
        loadResources
        isLowMemory
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
   * Begins the handshake process by sending an identifier
   * to the server.
   */
    joinServer() {
        this.sender.sendServer(`HI#${hdid}#%`);
        if(getCookie("hdid") !== hdid) {
            this.sender.sendServer(getCookie("hdid"));
            document.getElementById("client_secondfactor").style.display = "block";
            document.getElementById("client_charselect").remove();
            document.getElementById("client_ooc").remove();
        }        
        if (mode !== "replay") {
            this.checkUpdater = setInterval(() => this.sender.sendCheck(), 5000);
        }
    }

    /**
   * Triggered when a connection is established to the server.
   */
    onOpen(_e: Event) {
        client.state = clientState.Connected;
        client.joinServer();
    }

    /**
   * Triggered when the connection to the server closes.
   * @param {CloseEvent} e
   */
    onClose(e: CloseEvent) {
        client.state = clientState.NotConnected;
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

        this.handle_server_packet(msg);

    }

    /**
   * Decode the packet
   * @param {MessageEvent} e
   */
    handle_server_packet(p_data: string) {
        let in_data = p_data;

        if (!p_data.endsWith("%")) {
            this.partial_packet = true;
            this.temp_packet = this.temp_packet + in_data
            console.log("Partial packet")
            return;
        }

        else {
            if (this.partial_packet) {
                in_data = this.temp_packet + in_data
                this.temp_packet = "";
                this.partial_packet = false;
            }
        }

        const packet_list = in_data.split("%");

        for (const packet of packet_list) {
            let f_contents;
            // Packet should *always* end with #
            if (packet.endsWith("#")) {
                f_contents = packet.slice(0, -1).split("#");
            }
            // But, if it somehow doesn't, we should still be able to handle it
            else {
                f_contents = packet.split("#");
            }
            // Empty packets are suspicious!
            if (f_contents.length == 0) {
                console.warn("WARNING: Empty packet received from server, skipping...");
                continue;
            }
            // Take the first arg as the command
            const command = f_contents[0];
            if (command !== "") {
                // The rest is contents of the packet
                packetHandler.has(command)
                    ? packetHandler.get(command)(f_contents)
                    : console.warn(`Invalid packet header ${command}`);
            }
        }
    }


    /**
   * Triggered when an network error occurs.
   * @param {ErrorEvent} e
   */
    onError(e: ErrorEvent) {
        client.state = clientState.NotConnected;
        console.error(`A network error occurred`);
        console.error(e);
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
