import { client } from "../../client";
import { safeTags } from "../../encoding";

/**
   * Handle the change of players in an area.
   * @param {Array} args packet arguments
   */
export const handleARUP = (args: string[]) => {
    args = args.slice(1);
    for (let i = 0; i < args.length - 2; i++) {
        if (client.areas[i]) {
            // the server sends us ARUP before we even get the area list
            const thisarea = document.getElementById(`area${i}`)!;
            switch (Number(args[0])) {
                case 0: // playercount
                    client.areas[i].players = Number(args[i + 1]);
                    break;
                case 1: // status
                    client.areas[i].status = safeTags(args[i + 1]);
                    break;
                case 2:
                    client.areas[i].cm = safeTags(args[i + 1]);
                    break;
                case 3:
                    client.areas[i].locked = safeTags(args[i + 1]);
                    break;
            }

            thisarea.className = `area-button area-${client.areas[
                i
            ].status.toLowerCase()}`;

            thisarea.innerText = `${client.areas[i].name} (${client.areas[i].players}) [${client.areas[i].status}]`;

            thisarea.title =
                `Players: ${client.areas[i].players}\n` +
                `Status: ${client.areas[i].status}\n` +
                `CM: ${client.areas[i].cm}\n` +
                `Area lock: ${client.areas[i].locked}`;
        }
    }
}