import { client, encode_packets_as_json } from "../client";
import { AO_HOST } from "../client/aoHost";
import { appendICLog } from "../client/appendICLog";
import { decodeChat, safeTags } from "../encoding";
import { encode, req } from "../packets";

/**
 * Music/area change. Two wire variants per spec:
 *
 *   - Server -> Client (`MCPacketClient`): all 6 fields.
 *     `MC#{name}#{char_id}#{showname}#{looping}#{channel}#{effects}#%`
 *   - Client -> Server (`MCPacketServer`): omits `looping` and `channel`.
 *     `MC#{name}#{char_id}#{showname}#{effects}#%`
 */
export class MCPacketClient {
  name = req("string");
  char_id = req("number");
  showname = "";
  looping = 0;
  channel = 0;
  effects = 0;
}

export class MCPacketServer {
  name = req("string");
  char_id = req("number");
  showname = "";
  effects = 0;
}

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
 * Requests to change the music to the specified track. Callers can pass a
 * partial packet — the schema's defaults fill in any omitted fields.
 */
export const sendMC = (packet: Partial<MCPacketServer>) => {
  const wire = encode("MC", MCPacketServer, packet, encode_packets_as_json);
  client.sendStringToServer(wire);
};
