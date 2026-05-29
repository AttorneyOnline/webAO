import { changeChar } from "../client/changeChar";
import { Packet } from "../Packet";
import { decode, lit, req } from "../packets";

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

// Apply the server's character assignment.
export function receivePV(body: string) {
  const packet = decode(PVPacket, body);
  changeChar(packet.char_id);
}
