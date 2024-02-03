import { client } from "../../client.js";

/**
 * Sends testimony command.
 * @param {string} testimony type
 */
export const sendRT = (testimony: string) => {
    client.sender.sendServer(`RT#${testimony}#%`);
}