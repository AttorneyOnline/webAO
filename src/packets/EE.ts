import { client } from "../client";
import { escapeChat } from "../encoding";

/**
 * Edit-evidence packet. Client-to-server only -- the server broadcasts
 * the resulting evidence list back as an `LE` packet.
 */
export const sendEE = (id: number, name: string, desc: string, img: string) => {
  client.sender.sendServer(
    `EE#${id}#${escapeChat(name)}#${escapeChat(desc)}#${escapeChat(img)}#%`,
  );
};
