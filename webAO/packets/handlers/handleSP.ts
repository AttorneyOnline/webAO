import { updateActionCommands } from "../../client";

/**
* position change
* @param {string} pos new position
*/
export const handleSP = (args: string[]) => {
    updateActionCommands(args[1]);
}