import { client } from "../client";
import * as aolib from "../aolib";

/**
 * Server identity arrival. Some legacy servers (serverD) pack
 * `software` and `version` together in the `software` field separated
 * by `&`; we tolerate that quirk here rather than in the schema.
 *
 * Special case: webAO doesn't push a PN, so we synthesise an empty
 * one locally to keep the UI happy.
 */
export const applyServerIdentity = (packet: aolib.Out<typeof aolib.ID>) => {
  client.playerID = packet.player_count;
  const serverSoftware = packet.software.split("&")[0];
  if (serverSoftware === "webAO") {
    client.server.receive("PN#0#1#%");
  }
};
