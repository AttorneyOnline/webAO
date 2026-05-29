/**
 * ID — identity packet. Bidirectional with asymmetric shapes:
 *
 *   Server -> client (ID): `ID#<player_id>#<software>#<version>#%`.
 *     Server identifies itself in response to HI and assigns the
 *     client its player slot id (NOT a population count — that's PN).
 *
 *   Client -> server (IDRequest): `ID#<software>#<version>#%`.
 *     The client identifies itself back. Most legacy servers (akashi,
 *     tsuserver, KFO) gate the rest of the handshake on receiving
 *     this; without it the server stops sending packets after its own
 *     ID. webAO is the lone exception — it never expects this reply
 *     and the client synthesises a local PN instead.
 */

import { packet } from "../schema";
import { str, num } from "../fields";

/** Server -> client: the server identifies itself and assigns a slot. */
export const ID = packet("ID", {
  player_id: num(),
  software: str(),
  version: str(),
});

/** Client -> server: the client identifies itself back. */
export const IDRequest = packet("ID", {
  software: str(),
  version: str(),
});
