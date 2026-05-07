import { Positions } from "../interfaces/Positions";
import { Desk } from "../interfaces/Desk";

export const positions: Positions = {
  def: {
    bg: "defenseempty",
    desk: { ao2: "defensedesk", ao1: "bancodefensa" } as Desk,
    speedLines: "defense_speedlines.gif",
  },
  pro: {
    bg: "prosecutorempty",
    desk: { ao2: "prosecutiondesk", ao1: "bancoacusacion" } as Desk,
    speedLines: "prosecution_speedlines.gif",
  },
  hld: {
    bg: "helperstand",
    desk: {} as Desk,
    speedLines: "defense_speedlines.gif",
  },
  hlp: {
    bg: "prohelperstand",
    desk: {} as Desk,
    speedLines: "prosecution_speedlines.gif",
  },
  wit: {
    bg: "witnessempty",
    desk: { ao2: "stand", ao1: "estrado" } as Desk,
    speedLines: "prosecution_speedlines.gif",
  },
  jud: {
    bg: "judgestand",
    desk: { ao2: "judgedesk", ao1: "judgedesk" } as Desk,
    speedLines: "prosecution_speedlines.gif",
  },
  jur: {
    bg: "jurystand",
    desk: { ao2: "jurydesk", ao1: "estrado" } as Desk,
    speedLines: "defense_speedlines.gif",
  },
  sea: {
    bg: "seancestand",
    desk: { ao2: "seancedesk", ao1: "estrado" } as Desk,
    speedLines: "prosecution_speedlines.gif",
  },
};
