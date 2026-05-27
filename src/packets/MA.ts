import { client } from "../client";

/**
 * Mod-action packet (mute/ban). Client-to-server only.
 */
export const sendMA = (id: number, length: number, reason: string) => {
  client.sender.sendServer(`MA#${id}#${length}#${reason}#%`);
};
