import { AO_HOST, client } from '../../client'
import { prepChat, safeTags } from '../../encoding';

/**
 * Handles incoming evidence list, all evidences at once
 * item per packet.
 *
 * @param {Array} args packet arguments
 */
export const handleLE = (args: string[]) => {
    client.evidences = [];
    for (let i = 1; i < args.length - 1; i++) {
        (<HTMLProgressElement>(
            document.getElementById("client_loadingbar")
        )).value = client.char_list_length + i;
        const arg = args[i].split("&");
        client.evidences[i - 1] = {
            name: prepChat(arg[0]),
            desc: prepChat(arg[1]),
            filename: safeTags(arg[2]),
            icon: `${AO_HOST}evidence/${encodeURI(arg[2].toLowerCase())}`,
        };
    }

    const evidence_box = document.getElementById("evidences")!;
    evidence_box.innerHTML = "";
    for (let i = 1; i <= client.evidences.length; i++) {
        evidence_box.innerHTML += `<img src="${client.evidences[i - 1].icon}" 
				id="evi_${i}" 
				alt="${client.evidences[i - 1].name}"
				class="evi_icon"
				onclick="pickEvidence(${i})">`;
    }
}