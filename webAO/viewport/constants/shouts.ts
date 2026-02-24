// ─── Shout Definitions ──────────────────────────────
// Defines the set of valid shouts along with their
// image, duration, and sound configuration.

import type { ShoutModifier } from "../../packets/parseMSPacket";

/** Valid shout identifiers */
export type Shout = "holdit" | "objection" | "takethat" | "custom";

/** Asset paths (relative to aoHost) and timing for a shout */
export interface ShoutConfig {
  readonly image: string;
  readonly duration: number;
  readonly sfx: string;
}

/** Map of shout names to their configuration */
export const shouts: Record<Shout, ShoutConfig> = {
  holdit: {
    image: "misc/default/holdit_bubble.png",
    duration: 720,
    sfx: "misc/default/holdit.opus",
  },
  objection: {
    image: "misc/default/objection_bubble.png",
    duration: 720,
    sfx: "misc/default/objection.opus",
  },
  takethat: {
    image: "misc/default/takethat_bubble.png",
    duration: 840,
    sfx: "misc/default/takethat.opus",
  },
  custom: {
    image: "",
    duration: 840,
    sfx: "",
  },
};

/** Maps ShoutModifier enum values to shout names */
const shoutsByModifier: readonly (Shout | undefined)[] =
  [undefined, "holdit", "objection", "takethat", "custom"];

/** Look up shout name and config by ShoutModifier value */
export function getShoutConfig(modifier: ShoutModifier): { name: Shout; config: ShoutConfig } | undefined {
  const name = shoutsByModifier[modifier];
  if (!name) return undefined;
  return { name, config: shouts[name] };
}
