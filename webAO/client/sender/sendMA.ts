import { client } from "../../client";

/**
 * Sends mod command.
 * @param {number} id player id
 * @param {number} length in hours
 * @param {string} reason player message
 */
export const sendMA = (id: number, length: number, reason: string) => {
    client.sender.sendServer(`MA#${id}#${length}#${reason}#%`);
}