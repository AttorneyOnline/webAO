/* eslint no-await-in-loop: "warn" */
/* eslint no-restricted-syntax: "off" */

import calculatorHandler from './calculatorHandler';
import fileExists from './fileExists';
import { requestBuffer } from '@/services/request';

/**
 * Gets animation length. If the animation cannot be found, it will
 * silently fail and return 0 instead.
 * @param url
 */
export default async function getAnimLength(url) {
    const extensions = ['.gif', '.webp', '.apng'];

    // Create an array of promises
    const promises = extensions.map(async (extension) => {
        const urlWithExtension = url + extension;
        const exists = await fileExists(urlWithExtension);

        if (exists) {
            const fileBuffer = await requestBuffer(urlWithExtension);
            const length = calculatorHandler[extension](fileBuffer);
            return length;
        }

        return 0;
    });

    // Use Promise.all to wait for all promises to resolve
    const results = await Promise.all(promises);

    // Extract the first non-zero result
    const firstNonZeroResult = results.find(result => result !== 0);

    // Return the first non-zero result or 0 if none found
    return firstNonZeroResult || 0;
}
