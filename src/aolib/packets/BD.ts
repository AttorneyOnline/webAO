/** BD (s2c) — banned-on-reconnect screen with a reason message. */
import { packet } from "../schema";
import { str } from "../fields";

export const BD = packet("BD", { reason: str() });
