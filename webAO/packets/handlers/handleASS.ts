import { setAOhost } from "../../client/aoHost";
import { renderPlayerList } from "../../dom/renderPlayerList";

/**
 * new asset url!!
 * @param {Array} args packet arguments
 */
export const handleASS = (args: string[]) => {
  if (args[1] !== "None") setAOhost(args[1]);
  renderPlayerList();
};
