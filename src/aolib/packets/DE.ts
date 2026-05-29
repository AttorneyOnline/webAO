/** DE (c2s) — delete an evidence item by id. Server broadcasts the result as LE. */
import { packet } from "../schema";
import { num } from "../fields";

export const DE = packet("DE", { id: num() });
