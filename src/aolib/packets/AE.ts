/** AE (c2s) — pagination cursor; ask for the next evidence item by id. */
import { packet } from "../schema";
import { num } from "../fields";

export const AE = packet("AE", { id: num() });
