import { client, json_mode } from "../client";
import { Packet } from "../Packet";
import { decode, encode, req } from "../packets";

/**
 * Choose character. Client requests to play as char_id; server acks
 * the selection (we emulate the ack with PV).
 */

// Receiver: Server
export class CCPacketServer extends Packet {
  static $header = "CC";
  player_id = req("number");
  char_id = req("number");
  char_pw = "";
}

// Request to play as char_id. Gatekeeps unknown char_ids so we don't
// ask for a slot that isn't real.
export function sendCC(packet: Partial<CCPacketServer>) {
  if (packet.char_id !== -1 && !client.chars[packet.char_id!]?.name) return;
  client.sendString(encode(CCPacketServer, packet, json_mode));
}

// Receive character choice from client; ack with PV.
export function receiveCC(body: string) {
  const packet = decode(CCPacketServer, body);
  client.sendToSelf(`PV#1#CID#${packet.char_id}#%`);
}
