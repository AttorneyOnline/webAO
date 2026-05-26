import { client } from "../../client";
import { version } from "../../version";

/**
 * Handle the player
 * @param {Array} args packet arguments
 */
export const handleHI = (_args: string[]) => {
  client.sender.sendSelf(`ID#1#webAO#${version}#%`);
  client.sender.sendSelf(
    "FL#fastloading#yellowtext#cccc_ic_support#flipping#looping_sfx#effects#%",
  );
};
