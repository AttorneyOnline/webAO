import { client } from "../client";
import { version } from "../version";
import * as aolib from "../aolib";



/**
 * Handle the player
 */
export const onClientIdentify = (_packet: aolib.Out<typeof aolib.HI>) => {
  client.server.receive(`ID#1#webAO#${version}#%`);
  client.server.receive(
    "FL#fastloading#yellowtext#cccc_ic_support#flipping#looping_sfx#effects#%",
  );
};
