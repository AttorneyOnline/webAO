import { client } from "../client";
import { handleBans } from "../client/handleBans";
import { Packet } from "../Packet";
import { decode, req } from "../packets";

/**
 * Ban-on-reconnect. Server rejects the connection because the client
 * is banned; the reason is shown in the ban screen.
 */

// Receiver: Client
export class BDPacket extends Packet {
  static $header = "BD";
  reason = req("string");
}

export function receiveBD(body: string) {
  const packet = decode(BDPacket, body);
  client.banned = true;
  handleBans("Banned", packet.reason);
}
