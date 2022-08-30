import { client } from '../../client'
import { safeTags } from '../../encoding';

/**
 * Handles updated area list
 * @param {Array} args packet arguments
 */
export const handleFA = (args: string[]) => {
    client.resetAreaList();

    for (let i = 1; i < args.length - 1; i++) {
        client.createArea(i - 1, safeTags(args[i]));
    }
}
