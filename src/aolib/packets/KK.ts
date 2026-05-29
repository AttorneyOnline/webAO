/** KK (s2c) — kicked (transient); reason shown but reconnect is allowed. */
import { packet } from "../schema";
import { str } from "../fields";

export const KK = packet("KK", { reason: str() });
