import { client, extrafeatures, oldLoading } from "../../client";


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
        const demothing = document.createElement("img");

        demothing.className = "demothing";
        demothing.id = `demo_${i}`;
        const demoonclick = document.createAttribute("onclick");
        demoonclick.value = `pickChar(${i})`;
        demothing.setAttributeNode(demoonclick);

        document.getElementById("client_chartable")!.appendChild(demothing);
    }

    // this is determined at the top of this file
    if (!oldLoading && extrafeatures.includes("fastloading")) {
        client.sender.sendServer("RC#%");
    } else {
        client.sender.sendServer("askchar2#%");
    }
}