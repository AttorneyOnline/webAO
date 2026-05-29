/**
 * DONE (s2c) — server signals end of the handshake / area-list sequence.
 *
 * Zero-field marker packet. On the wire: `DONE#%`. The session-level
 * encoder still produces the terminator even though there are no slots.
 */

import { packet } from "../schema";

export const DONE = packet("DONE", {});
