/** CH (c2s) — client keepalive ping; server replies with CHECK. */
import { packet } from "../schema";
import { num } from "../fields";

export const CH = packet("CH", { char_id: num() });
