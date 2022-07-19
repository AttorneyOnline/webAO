import { setAO_HOST } from "../../client";
/**
 * new asset url!!
 * @param {Array} args packet arguments
 */
export const handleASS = (args: string[]) => {
  setAO_HOST(args[1]);
};
