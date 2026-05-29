import { Testimony } from "../interfaces/Testimony";
import { client, UPDATE_INTERVAL } from "../../client";
/**
 * Intialize testimony updater
 */
export const initTestimonyUpdater = () => {
  const testimonyFilenames: Testimony = {
    1: "witnesstestimony",
    2: "crossexamination",
    3: "notguilty",
    4: "guilty",
  };

  const testimony = testimonyFilenames[client.testimonyID];
  if (!testimony) {
    console.warn(`Invalid testimony ID ${client.testimonyID}`);
    return;
  }

  client.viewport.testimonyAudio.src = client.resources[testimony].sfx;
  client.viewport.testimonyAudio.play().catch(() => {});

  const testimonyOverlay = <HTMLImageElement>(
    document.getElementById("client_testimony")
  );
  testimonyOverlay.src = client.resources[testimony].src;
  testimonyOverlay.style.opacity = "1";

  client.viewport.setTestimonyTimer(0);
  client.viewport.setTestimonyUpdater(
    setTimeout(() => client.viewport.updateTestimony(), UPDATE_INTERVAL),
  );
};

import type * as aolib from "../../aolib";

/**
 * RT: drive the testimony / judge-ruling state machine. `judgeId` is
 * meaningful only for `judgeruling`; `testimony1#1` (since 2.9) hides
 * the indicator instead of showing it.
 */
export const applyTestimonyState = (packet: aolib.RTPacket) => {
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
