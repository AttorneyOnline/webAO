import { Positions } from '../interfaces/Positions.js'
import { Desk } from '../interfaces/Desk.js';

export const positions: Positions = {
    def: {
        bg: "defenseempty",
        desk: { ao2: "defensedesk.png", ao1: "bancodefensa.png" } as Desk,
        speedLines: "defense_speedlines.gif",
    },
    pro: {
        bg: "prosecutorempty",
        desk: { ao2: "prosecutiondesk.png", ao1: "bancoacusacion.png" } as Desk,
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
        desk: { ao2: "stand.png", ao1: "estrado.png" } as Desk,
        speedLines: "prosecution_speedlines.gif",
    },
    jud: {
        bg: "judgestand",
        desk: { ao2: "judgedesk.png", ao1: "judgedesk.gif" } as Desk,
        speedLines: "prosecution_speedlines.gif",
    },
    jur: {
        bg: "jurystand",
        desk: { ao2: "jurydesk.png", ao1: "estrado.png" } as Desk,
        speedLines: "defense_speedlines.gif",
    },
    sea: {
        bg: "seancestand",
        desk: { ao2: "seancedesk.png", ao1: "estrado.png" } as Desk,
        speedLines: "prosecution_speedlines.gif",
    },
};