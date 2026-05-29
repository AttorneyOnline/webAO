/** KB (s2c) — kicked and banned. `reason` is shown on the ban screen. */
import { packet } from "../schema";
import { str } from "../fields";

export const KB = packet("KB", { reason: str() });
