import { client } from "../../client";
import { CC } from "../../packets/CC";

/**
 * Requests to play as a specified character.
 * @param {number} character the character ID
 */
export const sendCharacter = (character: number) => {
  if (character === -1 || client.chars[character].name) {
    client.sender.sendServer(
      CC.encode({ playerId: client.playerID, charId: character, charPw: "web" }),
    );
  }
};
