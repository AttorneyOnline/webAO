import { client } from "../client";

/**
 * Delete-evidence packet. Client-to-server only -- the server broadcasts
 * the resulting evidence list back as an `LE` packet.
 */
export const sendDE = (id: number) => {
  client.sender.sendServer(`DE#${id}#%`);
};
