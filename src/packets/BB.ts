import { Packet } from "../Packet";
import { decode, req } from "../packets";

/**
 * Warning. Server pushes a message; the client shows it in an
 * alert box the user can't dismiss for 2 seconds.
 */

// Receiver: Client
export class BBPacket extends Packet {
  static $header = "BB";
  message = req("string");
}

// Show the server's warning to the user.
export function receiveBB(body: string) {
  const packet = decode(BBPacket, body);
  alert(packet.message);
}
