import { client } from "../client";
import { renderPlayerList } from "../dom/renderPlayerList";
import * as aolib from "../aolib";

/** Player roster change. type 0 = join, 1 = leave. */
export function applyPlayerRosterChange(packet: aolib.Out<typeof aolib.PR>) {
  if (packet.type === 0) {
    client.playerlist.set(packet.id, { charId: -1, charName: "", showName: "", name: "", area: 0 });
  } else if (packet.type === 1) {
    client.playerlist.delete(packet.id);
  }
  renderPlayerList();
}
