import { client } from "../client";
import { AO_HOST } from "../client/aoHost";
import { appendICLog } from "../client/appendICLog";
import { decodeChat, escapeChat, safeTags, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";

/**
 * Music/area change. Per spec:
 *   Server-receiver: `MC#{track}#{char_id}#{showname}#{effects}#%`
 *   Client-receiver: `MC#{track}#{char_id}#{showname}#{looping}#{channel}#{effects}#%`
 * All fields past `char_id` are modeled as optional so the same codec covers
 * both directions and tolerates servers that omit later fields.
 */
export interface MCPacket {
  track: string;
  charId: number;
  showname?: string;
  looping?: number;
  channel?: number;
  effects?: number;
}

export const MC: PacketCodec<MCPacket> = {
  decode(args) {
    const packet: MCPacket = {
      track: unescapeChat(args[1] ?? ""),
      charId: Number(args[2]),
    };
    if (args[3] !== undefined) packet.showname = unescapeChat(args[3]);
    if (args[4] !== undefined) packet.looping = Number(args[4]);
    if (args[5] !== undefined) packet.channel = Number(args[5]);
    if (args[6] !== undefined) packet.effects = Number(args[6]);
    return packet;
  },
  encode(packet) {
    let out = `MC#${escapeChat(packet.track)}#${packet.charId}`;
    if (packet.showname !== undefined) out += `#${escapeChat(packet.showname)}`;
    if (packet.looping !== undefined) out += `#${packet.looping}`;
    if (packet.channel !== undefined) out += `#${packet.channel}`;
    if (packet.effects !== undefined) out += `#${packet.effects}`;
    return `${out}#%`;
  },
};

/**
 * Handles a music change to an arbitrary resource.
 */
export const receiveMC = (packet: MCPacket) => {
  const track = safeTags(decodeChat(packet.track));
  let charID = packet.charId;
  const showname = packet.showname || "";
  const looping = Boolean(packet.looping);
  const channel = packet.channel ?? 0;
  // const fading = packet.effects ?? 0; // unused in web

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
export const sendMC = (packet: MCPacket) => {
  client.sendToServer(MC.encode(packet));
};
