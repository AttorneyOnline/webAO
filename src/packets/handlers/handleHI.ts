import { client } from "../../client";
import { version } from "../../version";
import type { HIPacket } from "../types/HI";

/**
 * Handle the player
 */
export const handleHI = (_packet: HIPacket) => {
  client.sender.sendSelf(`ID#1#webAO#${version}#%`);
  client.sender.sendSelf(
    "FL#fastloading#yellowtext#cccc_ic_support#flipping#looping_sfx#effects#%",
  );
};
