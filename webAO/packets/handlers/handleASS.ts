import { setAOhost } from "../../client/aoHost";

/**
 * new asset url!!
 * @param {Array} args packet arguments
 */
export const handleASS = (args: string[]) => {
  if (args[1] !== "None") setAOhost(args[1]);
};
