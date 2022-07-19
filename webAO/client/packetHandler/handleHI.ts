import { client } from "../../client";
const version = process.env.npm_package_version;

/**
 * Handle the player
 * @param {Array} args packet arguments
 */
export const handleHI = (_args: string[]) => {
  client.sendSelf(`ID#1#webAO#${version}#%`);
  client.sendSelf(
    "FL#fastloading#yellowtext#cccc_ic_support#flipping#looping_sfx#effects#%"
  );
};
