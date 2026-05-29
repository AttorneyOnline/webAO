import { client } from "../client";
import { handleBans } from "../client/handleBans";
import { Packet } from "../Packet";
import { decode, req } from "../packets";

/**
 * Kicked (no ban). Server is dropping the connection with a reason
 * but won't refuse a subsequent reconnect.
 */

// Receiver: Client
export class KKPacket extends Packet {
  static $header = "KK";
  reason: string = req("string");
}

export function receiveKK(body: string) {
  const packet = decode(KKPacket, body);
  client.banned = true;
  handleBans("Kicked", packet.reason);
}
