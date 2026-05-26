import { client } from "../../client";

/**
 * Sends testimony command.
 * @param {string} testimony type
 */
export const sendRT = (testimony: string) => {
  client.sender.sendServer(`RT#${testimony}#%`);
};
