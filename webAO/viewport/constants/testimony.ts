// ─── Testimony Definitions ───────────────────────────
// Defines the set of valid testimony overlays along with
// their timing and sound configuration.

/** Valid testimony identifiers */
export type Testimony = "witnesstestimony" | "crossexamination" | "notguilty" | "guilty";

/** Testimony overlay configuration */
export interface TestimonyConfig {
  /** Image filename (combined with theme path at runtime) */
  readonly image: string;
  readonly duration: number;
  /** Sound path relative to aoHost */
  readonly sfx: string;
}

/** Map of testimony names to their configuration */
export const testimonies: Record<Testimony, TestimonyConfig> = {
  witnesstestimony: {
    image: "witnesstestimony_bubble.gif",
    duration: 1560,
    sfx: "sounds/general/sfx-testimony.opus",
  },
  crossexamination: {
    image: "crossexamination_bubble.gif",
    duration: 1600,
    sfx: "sounds/general/sfx-testimony2.opus",
  },
  notguilty: {
    image: "notguilty_bubble.gif",
    duration: 2440,
    sfx: "sounds/general/sfx-notguilty.opus",
  },
  guilty: {
    image: "guilty_bubble.gif",
    duration: 2870,
    sfx: "sounds/general/sfx-guilty.opus",
  },
};

