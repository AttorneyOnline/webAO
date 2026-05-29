import { client } from "../client";
import vanilla_character_arr from "../constants/characters";
import { Packet } from "../Packet";
import { decode } from "../packets";

/**
 * "Ask for characters." Client -> Server, empty payload. In replay
 * mode the server-side handler synthesises an `SC` response from the
 * vanilla character list.
 */

// Wire shape is the same in both directions.
export class RCPacket extends Packet {
  static $header = "RC";
}

// Receiver: Server (server-emulation in replay mode).
export function receiveRC(body: string) {
  decode(RCPacket, body);
  client.receiveData(`SC#${vanilla_character_arr.join("#")}#%`);
}
