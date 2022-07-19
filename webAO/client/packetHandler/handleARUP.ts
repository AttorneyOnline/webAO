import { areas } from "../../client";
import { safeTags } from "../../encoding";

/**
 * Handle the change of players in an area.
 * @param {Array} args packet arguments
 */

export const handleARUP = (args: string[]) => {
  args = args.slice(1);
  for (let i = 0; i < args.length - 2; i++) {
    if (areas[i]) {
      // the server sends us ARUP before we even get the area list
      const thisarea = document.getElementById(`area${i}`)!;
      switch (Number(args[0])) {
        case 0: // playercount
          areas[i].players = Number(args[i + 1]);
          break;
        case 1: // status
          areas[i].status = safeTags(args[i + 1]);
          break;
        case 2:
          areas[i].cm = safeTags(args[i + 1]);
          break;
        case 3:
          areas[i].locked = safeTags(args[i + 1]);
          break;
      }

      thisarea.className = `area-button area-${areas[i].status.toLowerCase()}`;

      thisarea.innerText = `${areas[i].name} (${areas[i].players}) [${areas[i].status}]`;

      thisarea.title =
        `Players: ${areas[i].players}\n` +
        `Status: ${areas[i].status}\n` +
        `CM: ${areas[i].cm}\n` +
        `Area lock: ${areas[i].locked}`;
    }
  }
};
