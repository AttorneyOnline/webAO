import { client, extrafeatures } from "../../client";

/**
 * Sends call mod command.
 * @param {string} message to mod
 */
export const sendZZ = (msg: string) => {
    if (extrafeatures.includes("modcall_reason")) {
        client.sender.sendServer(`ZZ#${msg}#%`);
    } else {
        client.sender.sendServer("ZZ#%");
    }
}