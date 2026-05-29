import { changeChar } from "../client/changeChar";
import { Packet } from "../Packet";
import { decode, req } from "../packets";

/**
 * Server assigns a character to the player. Wire:
 * `PV#{player_id}#CID#{char_id}#%` — the `CID` literal at position 1
 * is a protocol-mandated padding token, kept inside `toArgs`/`fromArgs`
 * so callers only see `player_id` and `char_id`.
 */

// Receiver: Client
export class PVPacket extends Packet {
  static $header = "PV";
  player_id: number = req("number");
  char_id: number = req("number");

  static toArgs(p: PVPacket): string[] {
    return [String(p.player_id), "CID", String(p.char_id)];
  }

  static fromArgs(args: string[]): Partial<PVPacket> {
    return {
      player_id: Number(args[0]),
      char_id: Number(args[2]),
    };
  }
}

// Apply the server's character assignment.
export function receivePV(body: string) {
  const packet = decode(PVPacket, body);
  changeChar(packet.char_id);
}
