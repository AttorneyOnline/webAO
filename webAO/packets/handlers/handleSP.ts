import { updateActionCommands } from '../../dom/updateActionCommands.js'
/**
* position change
* @param {string} pos new position
*/
export const handleSP = (pos: string[]) => {
    updateActionCommands(pos[1]);
}
