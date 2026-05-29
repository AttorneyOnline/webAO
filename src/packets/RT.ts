import { client } from "../client";
import { initTestimonyUpdater } from "../viewport/utils/initTestimonyUpdater";
import type * as aolib from "../aolib";

/**
 * Drive the testimony / judge-ruling state machine for the viewport.
 * `judgeId` is meaningful only when `animation === "judgeruling"`; for
 * `testimony1`, `judgeId === 1` is the "since 2.9" form that hides the
 * indicator instead of showing it.
 */
export const applyTestimonyState = (packet: aolib.Out<typeof aolib.RT>) => {
  const judgeid = packet.judgeId ?? 0;
  switch (packet.animation) {
    case "testimony1":
      if (judgeid === 1) {
        client.viewport.disposeTestimony();
        return;
      }
      client.testimonyID = 1;
      break;
    case "testimony2":
      client.testimonyID = 2;
      break;
    case "judgeruling":
      client.testimonyID = 3 + judgeid;
      break;
    default:
      console.warn("Invalid testimony");
  }
  initTestimonyUpdater();
};
