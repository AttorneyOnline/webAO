import { setAOhost } from "../../client";


/** 
* new asset url!!
* @param {Array} args packet arguments
*/
export const handleASS = (args: string[]) => {
    setAOhost(args[1]);
}
