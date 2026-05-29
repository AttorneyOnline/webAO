/** AM (c2s) — pagination cursor; ask for the next music-list batch. */
import { packet } from "../schema";
import { num } from "../fields";

export const AM = packet("AM", { batch: num() });
