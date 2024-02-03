import { client } from '../../client.js'
import { createArea } from '../../client/createArea.js';
import { safeTags } from '../../encoding.js';

/**
 * Handles updated area list
 * @param {Array} args packet arguments
 */
export const handleFA = (args: string[]) => {
    client.resetAreaList();

    for (let i = 1; i < args.length; i++) {
        createArea(i - 1, safeTags(args[i]));
    }
}
