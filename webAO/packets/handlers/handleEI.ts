import { client } from '../../client'
import { AO_HOST } from '../../client/aoHost';
import { prepChat, safeTags } from '../../encoding';

/**
 * Handles incoming evidence information, containing only one evidence
 * item per packet.
 *
 * EI#id#name&description&type&image&##%
 *
 * @param {Array} args packet arguments
 */
export const handleEI = (args: string[]) => {
    document.getElementById(
        "client_loadingtext"
    )!.innerHTML = `Loading Evidence ${args[1]}/${client.evidence_list_length}`;
    const evidenceID = Number(args[1]);
    (<HTMLProgressElement>document.getElementById("client_loadingbar")).value =
        client.char_list_length + evidenceID;

    const arg = args[2].split("&");
    client.evidences[evidenceID] = {
        name: prepChat(arg[0]),
        desc: prepChat(arg[1]),
        filename: safeTags(arg[3]),
        icon: `${AO_HOST}evidence/${encodeURI(arg[3].toLowerCase())}`,
    };

    client.sendServer("AE" + (evidenceID + 1) + "#%");
}