import { client } from "../../client";
import { RT } from "../../packets/types/RT";

/**
 * Sends testimony command.
 * @param {string} testimony type
 */
export const sendRT = (testimony: string) => {
  client.sender.sendServer(RT.encode({ animation: testimony }));
};
