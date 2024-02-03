import { client } from "../../client.js";

/**
 * Sends a keepalive packet.
 */
export const sendCheck = () => {
    client.sender.sendServer(`CH#${client.charID}#%`);
}
