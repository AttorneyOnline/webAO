import { client, extrafeatures } from "../../client";

/**
 * Sends call mod command.
 * @param {string} message to mod
 */
export const sendZZ = (msg: string, target: number) => {
  client.sender.sendServer(`ZZ#${msg}#${target}#%`);
};
