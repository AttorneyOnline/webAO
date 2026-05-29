/**
 * VS_PEERS (s2c) — initial voice-peer list for the joining client.
 * `uids` is the set of remote voice-active peers; the client opens an
 * RTC connection to each.
 */
import { packet } from "../schema";
import { num, array } from "../fields";

export const VS_PEERS = packet("VS_PEERS", {
  uids: array(num()),
});
