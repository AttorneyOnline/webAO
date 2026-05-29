import { Packet } from "../Packet";
import { client, json_mode } from "../client";
import { decode, encode, lit, req, Wire } from "../packets";
import { PVPacket } from "./PV";

/**
 * Choose character. Client requests to play as char_id; server acks
 * with PV. Wire: `CC#0#{char_id}#{char_pw}#%`:
 *   - position 0: spec-mandated literal `0` (webAO has historically
 *     sent playerID here in violation of the spec)
 *   - position 2: char_pw, deprecated — we always emit empty
 */

// Receiver: Server
export class CCPacketServer extends Packet {
  static $header = "CC";
  _zero = lit(0);
  char_id = req("number");
  _char_pw_deprecated = lit("");
}

// Request to play as char_id. Caller is responsible for validating
// that the char_id refers to a real slot.
export function sendCC(packet: Partial<Wire<CCPacketServer>>) {
  client.sendString(encode(CCPacketServer, packet, json_mode));
}

// Receive character choice from client; ack with PV.
export function receiveCC(body: string) {
  const packet = decode(CCPacketServer, body);
  client.sendToSelf(encode(PVPacket, { player_id: 1, char_id: packet.char_id }));
}
