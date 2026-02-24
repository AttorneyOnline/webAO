import { client } from "../../client";
import { initTestimonyUpdater } from "../../viewport/utils/initTestimonyUpdater";
import type { Testimony } from "../../viewport/constants/testimony";

function parseRTPacket(args: readonly string[]): Testimony | null {
  const type = args[1];
  const judgeId = Number(args[2]);

  switch (type) {
    case "testimony1":
      return "witnesstestimony";
    case "testimony2":
      return "crossexamination";
    case "judgeruling":
      return judgeId === 0 ? "notguilty" : "guilty";
    default:
      return null;
  }
}

/**
 * Handles testimony states.
 * @param {Array} args packet arguments
 */
export const handleRT = (args: string[]) => {
  const testimony = parseRTPacket(args);

  if (!testimony) {
    console.warn("Invalid testimony");
    return;
  }

  client.testimony = testimony;
  initTestimonyUpdater();
};
