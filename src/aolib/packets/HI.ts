/**
 * HI (c2s) — client identifies itself by hardware id.
 *
 * The first packet a client sends after the server's `decryptor`. The
 * server uses `hdid` for ban lookup and per-device rate limiting; it
 * has no protocol meaning beyond that.
 */

import { packet } from "../schema";
import { str } from "../fields";

export const HI = packet("HI", {
  hdid: str(),
});
