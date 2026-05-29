import { client } from "../client";
import { handleBans } from "../client/handleBans";
import { Packet } from "../Packet";
import { decode, req } from "../packets";

/**
 * Kicked-and-banned. Server is kicking the client and adding a
 * persistent ban. Reason is shown in the ban screen.
 */

// Receiver: Client
export class KBPacket extends Packet {
  static $header = "KB";
  reason = req("string");
}

export function receiveKB(body: string) {
  const packet = decode(KBPacket, body);
  client.banned = true;
  handleBans("Banned", packet.reason);
}
