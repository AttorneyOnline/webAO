import { client } from "../../client.js";

/**
 * Sends health point command.
 * @param {number} side the position
 * @param {number} hp the health point
 */
export const sendHP = (side: number, hp: number) => {
    client.sender.sendServer(`HP#${side}#${hp}#%`);
}