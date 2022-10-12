import { setAOhost } from "../../client/aoHost";


/** 
* new asset url!!
* @param {Array} args packet arguments
*/
export const handleASS = (args: string[]) => {
    setAOhost(args[1]);
}
