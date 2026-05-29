import { client } from "../client";

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
