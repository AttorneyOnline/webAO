import { client, json_mode } from "../client";
import vanilla_music_arr from "../constants/music";
import { Packet } from "../Packet";
import { decode, encode } from "../packets";

/**
 * "Ask for music." Client -> Server, empty payload. In replay mode
 * the server-side handler synthesises an `SM` response from the
 * vanilla music list.
 */

// Wire shape is the same in both directions.
export class RMPacket extends Packet {
  static $header = "RM";
}

export function sendRM(packet: Partial<RMPacket>) {
  client.sendData(encode(RMPacket, packet, json_mode));
}

// Receiver: Server (server-emulation in replay mode).
export function receiveRM(body: string) {
  decode(RMPacket, body);
  client.receiveData(`SM#${vanilla_music_arr.join("#")}#%`);
}
