import { client } from "../../client.js";
import { escapeChat } from "../../encoding.js";


/**
 * Sends edit evidence command.
 * @param {number} evidence id
 * @param {string} evidence name
 * @param {string} evidence description
 * @param {string} evidence image filename
 */
export const sendEE = (id: number, name: string, desc: string, img: string) => {
    client.sender.sendServer(
        `EE#${id}#${escapeChat(name)}#${escapeChat(desc)}#${escapeChat(img)}#%`
    );
}