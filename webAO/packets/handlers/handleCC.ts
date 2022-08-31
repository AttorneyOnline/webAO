import { client } from "../../client";

/**
 * What? you want a character??
 * @param {Array} args packet arguments
 */
export const handleCC = (args: string[]) => {
    client.sendSelf(`PV#1#CID#${args[2]}#%`);
}