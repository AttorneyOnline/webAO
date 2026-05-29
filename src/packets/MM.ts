import { Packet } from "../Packet";
import { decode } from "../packets";

/**
 * "MusicMode" packet. Not in the official spec and unused by the
 * current client — kept as a no-op for registry completeness. Modern
 * servers gate music changes server-side instead.
 */

// Receiver: Client
export class MMPacket extends Packet {
  static $header = "MM";
}

export function receiveMM(body: string) {
  decode(MMPacket, body);
}
