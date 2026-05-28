import { client, encode_packets_as_json } from "../client";
import { AO_HOST } from "../client/aoHost";
import { appendICLog } from "../client/appendICLog";
import { decode, encode, req } from "../packets";

/**
 * Music/area change. Two wire variants per spec:
 *
 *   - Server -> Client (`MCPacketClient`): all 6 fields.
 *     `MC#{name}#{char_id}#{showname}#{looping}#{channel}#{effects}#%`
 *   - Client -> Server (`MCPacketServer`): omits `looping` and `channel`.
 *     `MC#{name}#{char_id}#{showname}#{effects}#%`
 */
export class MCPacketClient {
  static header = "MC";
  name = req("string");
  char_id = req("number");
  showname = "";
  looping = false;
  channel = 0;
  effects = 0;
}

export class MCPacketServer {
  static header = "MC";
  name = req("string");
  char_id = req("number");
  showname = "";
  effects = 0;
}

/**
 * Type/defaults layer — wire string to typed packet. This is the seam
 * where a future schema/codec library could plug in; `receiveMC` and the
 * dispatcher only ever call `decodeMC`, never the generic `decode` directly.
 */
export function decodeMC(body: string): MCPacketClient {
  return decode(MCPacketClient, body);
}

/**
 * Type/defaults layer — typed packet to wire string. Matching seam for
 * outbound. `sendMC` only ever calls `encodeMC`, never `encode` directly.
 */
export function encodeMC(packet: Partial<MCPacketServer>): string {
  return encode("MC", MCPacketServer, packet, encode_packets_as_json);
}

/**
 * Inverse of `sendMC`: decode the body into a typed packet, then apply the
 * music change.
 */
export function receiveMC(body: string) {
  const packet = decodeMC(body);
  const music = client.viewport.music[packet.channel];
  music.pause();
  if (packet.name.startsWith("http")) {
    music.src = packet.name;
  } else {
    music.src = `${AO_HOST}sounds/music/${encodeURI(packet.name.toLowerCase())}`;
  }
  music.loop = packet.looping;
  music.play().catch(() => {});

  const musicname: string | undefined = client.chars[packet.char_id]?.name;
  const looptext = packet.looping ? "(looping)" : "";
  if (musicname) {
    appendICLog(`changed music to ${packet.name} ${looptext}`, packet.showname, musicname);
  } else {
    appendICLog(`The music was changed to ${packet.name} ${looptext}`, packet.showname);
  }

  document.getElementById("client_trackstatustext")!.innerText = packet.name;
}

/**
 * Encode the packet via `encodeMC` and transmit.
 */
export function sendMC(packet: Partial<MCPacketServer>) {
  client.sendString(encodeMC(packet));
}
