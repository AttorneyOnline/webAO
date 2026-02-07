import { setAOhost } from "../../client/aoHost";
import { client } from "../../client";

/**
 * new asset url!!
 * @param {Array} args packet arguments
 */
export const handleASS = (args: string[]) => {
  const host = args[1] !== "None" ? setAOhost(args[1]) : args[1];

  // Re-apply playerlist icon srcs that were set before AO_HOST was known
  const iconExt = client.charicon_extensions[0] || ".png";
  for (const [playerID, player] of client.players) {
    if (player.charId >= 0) {
      const char = client.chars[player.charId];
      if (char) {
        const img = document.querySelector<HTMLImageElement>(
          `#client_playerlist_entry${playerID} img`
        );
        if (img) {
          img.src = `${host}characters/${encodeURI(char.name.toLowerCase())}/char_icon${iconExt}`;
        }
      }
    }
  }
};
