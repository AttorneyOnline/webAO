import { client } from '../../client.js'
import { handleCharacterInfo } from '../../client/handleCharacterInfo.js'
/**
   * Handles incoming character information, bundling multiple characters
   * per packet.
   * CI#0#Phoenix&description&&&&&#1#Miles ...
   * @param {Array} args packet arguments
   */
export const handleCI = (args: string[]) => {
    // Loop through the 10 characters that were sent
    document.getElementById(
        "client_loadingtext"
    )!.innerHTML = `Loading Character ${args[1]}/${client.char_list_length}`;
    for (let i = 2; i <= args.length - 2; i++) {
        if (i % 2 === 0) {            
            const chargs = args[i].split("&");
            const charid = Number(args[i - 1]);
            setTimeout(() => handleCharacterInfo(chargs, charid), 500);
        }
    }
    // Request the next pack
    client.sender.sendServer(`AN#${Number(args[1]) / 10 + 1}#%`);
}