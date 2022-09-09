import { client } from "../../client";
import { escapeChat } from "../../encoding";

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