/** JD (s2c) — toggle judge action panel; 1 = show, anything else = hide. */
import { packet } from "../schema";
import { num } from "../fields";

export const JD = packet("JD", { state: num() });
