import { client } from "../client";
import type * as aolib from "../aolib";

/**
 * Requests to play as a character.
 * @param {number} ccharacter the character ID; -1 means spectator. Any
 * other value that doesn't map to a real slot is silently dropped.
 */
export function pickChar(ccharacter: number) {
  if (ccharacter !== -1 && !client.chars[ccharacter]?.name) return;
  if (ccharacter === -1) {
    // Spectator
    document.getElementById("client_waiting")!.style.display = "none";
    document.getElementById("client_charselect")!.style.display = "none";
  }
  client.server.send.CC({
    char_id: ccharacter,
  });
}

/** CharsCheck: server reports which character slots are taken vs free. */
export function applyCharacterAvailability(packet: aolib.CharsCheckPacket) {
  for (let i = 0; i < client.char_list_length; i++) {
    const img = document.getElementById(`demo_${i}`)!;
    if (packet.taken[i] === -1) {
      img.style.opacity = "0.25";
    } else if (packet.taken[i] === 0) {
      img.style.opacity = "1";
    }
  }
}
