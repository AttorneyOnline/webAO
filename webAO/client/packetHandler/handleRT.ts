import { setTestimonyID } from "../../client";
import { initTestimonyUpdater } from "../../viewport";

/**
 * Handles a testimony states.
 * @param {Array} args packet arguments
 */

export const handleRT = (args: string[]) => {
  const judgeid = Number(args[2]);
  switch (args[1]) {
    case "testimony1":
      setTestimonyID(1);
      break;
    case "testimony2":
      // Cross Examination
      setTestimonyID(2);
      break;
    case "judgeruling":
      setTestimonyID(3 + judgeid);
      break;
    default:
      console.warn("Invalid testimony");
  }

  // initTestimonyUpdater();
};
