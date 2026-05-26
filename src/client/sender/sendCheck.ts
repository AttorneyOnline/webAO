import { client } from "../../client";

/**
 * Sends a keepalive packet.
 */
export const sendCheck = () => {
  client.sender.sendServer(`CH#${client.charID}#%`);
};
