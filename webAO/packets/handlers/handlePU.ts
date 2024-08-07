import { getCharIcon } from "../../client/handleCharacterInfo";

/**
  * Handles a playerlist update
  * @param {Array} args packet arguments
  */
export const handlePU = (args: string[]) => {
    const playerID = Number(args[1]);
}