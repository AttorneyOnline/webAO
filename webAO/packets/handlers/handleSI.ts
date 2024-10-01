import { client, oldLoading } from "../../client";


/**
   * Received when the server announces its server info,
   * but we use it as a cue to begin retrieving characters.
   * @param {Array} args packet arguments
   */
export const handleSI = (args: string[]) => {
    client.char_list_length = Number(args[1]);
    client.evidence_list_length = Number(args[2]);
    client.music_list_length = Number(args[3]);

    // create the charselect grid, to be filled by the character loader
    document.getElementById("client_chartable")!.innerHTML = "";

    for (let i = 0; i < client.char_list_length; i++) {
        const charButtonElement: HTMLDivElement = document.createElement("div");

        charButtonElement.className = "demothing";

        charButtonElement.id = `demo_${i}`;
        const charButtonOnClick = document.createAttribute("onclick");
        charButtonOnClick.value = `pickChar(${i})`;

        charButtonElement.setAttributeNode(charButtonOnClick);

        document.getElementById("client_chartable")!.appendChild(charButtonElement);
    }

    if (!oldLoading) {
        client.sender.sendServer("RC#%");
    } else {
        client.sender.sendServer("askchar2#%");
    }
}
