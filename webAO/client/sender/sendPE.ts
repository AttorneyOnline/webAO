import { client } from "../../client.js";
import { escapeChat } from "../../encoding.js";

/**
 * Sends add evidence command.
 * @param {string} evidence name
 * @param {string} evidence description
 * @param {string} evidence image filename
 */
export const sendPE = (name: string, desc: string, img: string) => {
    client.sender.sendServer(
        `PE#${escapeChat(name)}#${escapeChat(desc)}#${escapeChat(img)}#%`
    );
}