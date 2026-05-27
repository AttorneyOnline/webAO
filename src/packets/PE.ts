import { client } from "../client";
import { escapeChat } from "../encoding";

/**
 * Add-evidence packet. Client-to-server only -- the server broadcasts
 * the resulting evidence list back as an `LE` packet.
 */
export const sendPE = (name: string, desc: string, img: string) => {
  client.sender.sendServer(
    `PE#${escapeChat(name)}#${escapeChat(desc)}#${escapeChat(img)}#%`,
  );
};
