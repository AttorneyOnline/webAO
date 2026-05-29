/** askchaa (c2s) — request character list. Server responds with SI. */
import { packet } from "../schema";

export const askchaa = packet("askchaa", {});
