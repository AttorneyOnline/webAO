/** RD (c2s) — handshake complete; server sends background + DONE. */
import { packet } from "../schema";

export const RD = packet("RD", {});
