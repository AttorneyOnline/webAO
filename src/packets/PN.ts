import { client } from "../client";
import type * as aolib from "../aolib";

/**
 * Server population announcement. Once we know the count we ask the
 * server for the character roster.
 */
export const applyServerInfo = (_packet: aolib.Out<typeof aolib.PN>) => {
  client.server.send.askchaa({});
};
