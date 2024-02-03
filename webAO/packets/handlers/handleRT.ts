import { client } from "../../client.js";
import { initTestimonyUpdater } from '../../viewport/utils/initTestimonyUpdater.js'

/**
  * Handles a testimony states.
  * @param {Array} args packet arguments
  */
export const handleRT = (args: string[]) => {
    const judgeid = Number(args[2]);
    switch (args[1]) {
        case "testimony1":
            client.testimonyID = 1;
            break;
        case "testimony2":
            // Cross Examination
            client.testimonyID = 2;
            break;
        case "judgeruling":
            client.testimonyID = 3 + judgeid;
            break;
        default:
            console.warn("Invalid testimony");
    }
    initTestimonyUpdater();
}