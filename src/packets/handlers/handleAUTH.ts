import type { AUTHPacket } from "../types/AUTH";

/**
 * i am mod now
 */
export const handleAUTH = (packet: AUTHPacket) => {
  if (packet.authState === 1) {
    (<HTMLAnchorElement>document.getElementById("mod_ui")).href =
      `styles/mod.css`;
  }
};
