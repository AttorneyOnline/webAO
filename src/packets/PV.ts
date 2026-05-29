import { client, json_mode } from "../client";
import { changeChar } from "../client/changeChar";
import { Packet } from "../Packet";
import { decode, encode, lit, req, Wire } from "../packets";

/**
 * Server assigns a character to the player. Wire:
 * `PV#{player_id}#CID#{char_id}#%` — the `CID` literal at position 1
 * is a protocol-mandated padding token.
 */

// Receiver: Client
export class PVPacket extends Packet {
  static $header = "PV";
  player_id = req("number");
  _cid = lit("CID");
  char_id = req("number");
}

// Emit a PV as a server (loopback to the client receive path).
export function sendPV(packet: Partial<Wire<PVPacket>>) {
  client.sendDataAsServer(encode(PVPacket, packet, json_mode));
}

// Apply the server's character assignment.
export function receivePV(body: string) {
  const packet = decode(PVPacket, body);
  changeChar(packet.char_id);
}
