import { client } from "../client";
import { AO_HOST } from "../client/aoHost";
import { appendICLog } from "../client/appendICLog";
import { decodeChat, safeTags } from "../encoding";
import { makeCodec } from "../packets";

/**
 * Music/area change. Two wire variants per spec:
 *
 *   - Server -> Client (`MCClient`): all 6 fields.
 *     `MC#{name}#{char_id}#{showname}#{looping}#{channel}#{effects}#%`
 *   - Client -> Server (`MCServer`): omits `looping` and `channel`.
 *     `MC#{name}#{char_id}#{showname}#{effects}#%`
 */
export interface MCPacketClient {
  name: string;
  char_id: number;
  showname: string;
  looping: number;
  channel: number;
  effects: number;
}

/**
 * Outgoing form. Fields are partial because the factory fills in defaults
 * on encode, so callers can pass just `{name, char_id}` when they don't
 * need to override the rest.
 */
export interface MCPacketServer {
  name: string;
  char_id: number;
  showname?: string;
  effects?: number;
}

export const MCClient = makeCodec<MCPacketClient>("MC", [
  { name: "name", type: "string" },
  { name: "char_id", type: "number" },
  { name: "showname", type: "string" },
  { name: "looping", type: "number" },
  { name: "channel", type: "number" },
  { name: "effects", type: "number" },
]);

export const MCServer = makeCodec<MCPacketServer>("MC", [
  { name: "name", type: "string" },
  { name: "char_id", type: "number" },
  { name: "showname", type: "string" },
  { name: "effects", type: "number" },
]);

/**
 * Handles a music change to an arbitrary resource.
 */
export const receiveMC = (packet: MCPacketClient) => {
  const track = safeTags(decodeChat(packet.name));
  let charID = packet.char_id;
  const { showname, channel } = packet;
  const looping = Boolean(packet.looping);
  // const fading = packet.effects; // unused in web

  const music = client.viewport.music[channel];
  let musicname;
  music.pause();
  if (track.startsWith("http")) {
    music.src = track;
  } else {
    music.src = `${AO_HOST}sounds/music/${encodeURI(track.toLowerCase())}`;
  }
  music.loop = looping;
  music.play().catch(() => {});

  try {
    musicname = client.chars[charID].name;
  } catch (e) {
    charID = -1;
  }

  let looptext = "";

  if (looping)
    looptext = "(looping)";

  if (charID >= 0) {
    musicname = client.chars[charID].name;
    appendICLog(`changed music to ${track} ${looptext}`, showname, musicname);
  } else {
    appendICLog(`The music was changed to ${track} ${looptext}`, showname);
  }

  document.getElementById("client_trackstatustext")!.innerText = track;
};

/**
 * Requests to change the music to the specified track.
 */
export const sendMC = (packet: MCPacketServer) => {
  client.sendPacketToServer(MCServer, packet);
};
