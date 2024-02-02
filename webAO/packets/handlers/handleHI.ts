import { client } from "../../client.js";
import { clientVersion } from "../../constants/clientVersion.js";


/**
 * Handle the player
 * @param {Array} _args packet arguments
 */
export const handleHI = (_args: string[]) => {
    client.sender.sendSelf(`ID#1#webAO#${clientVersion}#%`);
    client.sender.sendSelf(
        "FL#fastloading#yellowtext#cccc_ic_support#flipping#looping_sfx#effects#%"
    );
}
