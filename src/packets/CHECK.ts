import { Packet } from "../Packet";
import { decode } from "../packets";

/**
 * Keepalive ack. Server's response to the client's `CH`. No fields,
 * no client-side action — just keeps the connection from idling.
 */

// Receiver: Client
export class CHECKPacket extends Packet {
  static $header = "CHECK";
}

export function receiveCHECK(body: string) {
  decode(CHECKPacket, body);
}
