import { client } from "../client";
import { renderPlayerList } from "../dom/renderPlayerList";
import { Packet } from "../Packet";
import { decode, req } from "../packets";

/**
 * Player roster change. `type === 0` = player `id` joined; `type === 1`
 * = player `id` left. Anything else is currently ignored.
 */

// Receiver: Client
export class PRPacket extends Packet {
  static $header = "PR";
  id = req("number");
  type = req("number");
}

export function receivePR(body: string) {
  const packet = decode(PRPacket, body);
  if (packet.type === 0) {
    client.playerlist.set(packet.id, { charId: -1, charName: "", showName: "", name: "", area: 0 });
  } else if (packet.type === 1) {
    client.playerlist.delete(packet.id);
  }
  renderPlayerList();
}
