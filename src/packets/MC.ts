import { client } from "../client";
import { AO_HOST } from "../client/aoHost";
import { appendICLog } from "../client/appendICLog";
import { req } from "../packets";

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
 * Handles a music change to an arbitrary resource.
 */
export function receiveMC(packet: MCPacketClient) {
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
 * Requests to change the music to the specified track.
 */
export function sendMC(packet: Partial<MCPacketServer>) {
  client.sendPacketToServer(MCPacketServer, packet);
}
