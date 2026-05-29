import { client, json_mode } from "../client";
import { AO_HOST } from "../client/aoHost";
import { appendICLog } from "../client/appendICLog";
import { Packet } from "../Packet";
import { decode, encode, req } from "../packets";

/**
 * Music/area change.
 */

// Receiver: Client
export class MCPacketClient extends Packet {
  static $header = "MC";
  name = req("string");
  char_id = req("number");
  showname = "";
  looping = false;
  channel = 0;
  effects = 0;
}

// Receiver: Server
export class MCPacketServer extends Packet {
  static $header = "MC";
  name = req("string");
  char_id = req("number");
  showname = "";
  effects = 0;
}

// Send music/area change request to server
export function sendMC(packet: Partial<MCPacketServer>) {
  client.sendData(encode(MCPacketServer, packet, json_mode));
}

// Receive music change request from server
export function receiveMC(body: string) {
  const packet = decode(MCPacketClient, body);
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
