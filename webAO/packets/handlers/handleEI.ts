import { client } from "../../client";
import { AO_HOST } from "../../client/aoHost";
import { prepChat } from "../../encoding";

/**
 * Handles incoming evidence information, containing only one evidence
 * item per packet.
 *
 * EI#id#name&description&type&image&##%
 *
 * @param {Array} args packet arguments
 */
export const handleEI = (args: string[]) => {
  document.getElementById("client_loadingtext")!.innerHTML =
    `Loading Evidence ${args[1]}/${client.evidence_list_length}`;
  const evidenceID = Number(args[1]);
  const arg = args[2].split("&");
  client.evidences[evidenceID] = {
    name: prepChat(arg[0]),
    desc: prepChat(arg[1]),
    filename: arg[3],
    icon: `${AO_HOST}evidence/${encodeURI(arg[3].toLowerCase())}`,
  };

  client.sender.sendServer("AE" + (evidenceID + 1) + "#%");
};
