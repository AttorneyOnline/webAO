/** AN (c2s) — pagination cursor; ask for the next character-list batch. */
import { packet } from "../schema";
import { num } from "../fields";

export const AN = packet("AN", { batch: num() });
