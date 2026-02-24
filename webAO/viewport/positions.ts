// ─── Courtroom Positions ─────────────────────────────
// Defines the set of valid courtroom positions along with
// desk/background configuration for each.

/** Standard courtroom position identifiers */
export type Position =
  | "def"
  | "pro"
  | "hld"
  | "hlp"
  | "jud"
  | "wit"
  | "jur"
  | "sea";

/** Desk sprite filenames (AO2 vs AO1 legacy) */
export interface Desk {
  ao2?: string;
  ao1?: string;
}

/** Background, desk, and speed-line configuration for a courtroom position */
export interface PositionConfig {
  bg?: string;
  desk?: Desk;
  speedLines: string;
}

/** Map of position identifiers to their side configuration */
export const positions: Record<Position, PositionConfig> = {
  def: {
    bg: "defenseempty",
    desk: { ao2: "defensedesk.png", ao1: "bancodefensa.png" },
    speedLines: "defense_speedlines.gif",
  },
  pro: {
    bg: "prosecutorempty",
    desk: { ao2: "prosecutiondesk.png", ao1: "bancoacusacion.png" },
    speedLines: "prosecution_speedlines.gif",
  },
  hld: {
    bg: "helperstand",
    desk: {},
    speedLines: "defense_speedlines.gif",
  },
  hlp: {
    bg: "prohelperstand",
    desk: {},
    speedLines: "prosecution_speedlines.gif",
  },
  wit: {
    bg: "witnessempty",
    desk: { ao2: "stand.png", ao1: "estrado.png" },
    speedLines: "prosecution_speedlines.gif",
  },
  jud: {
    bg: "judgestand",
    desk: { ao2: "judgedesk.png", ao1: "judgedesk.gif" },
    speedLines: "prosecution_speedlines.gif",
  },
  jur: {
    bg: "jurystand",
    desk: { ao2: "jurydesk.png", ao1: "estrado.png" },
    speedLines: "defense_speedlines.gif",
  },
  sea: {
    bg: "seancestand",
    desk: { ao2: "seancedesk.png", ao1: "estrado.png" },
    speedLines: "prosecution_speedlines.gif",
  },
};
