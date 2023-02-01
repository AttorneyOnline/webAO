import { client } from '../../client'
import { createArea } from '../../client/createArea';
import { safeTags } from '../../encoding';

/**
 * Handles updated area list
 * @param {Array} args packet arguments
 */
export const handleFA = (args: string[]) => {
    client.resetAreaList();

    for (let i = 1; i < args.length - 1; i++) {
        createArea(i - 1, safeTags(args[i]));
    }
}
