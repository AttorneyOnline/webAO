import fileExists from "./fileExists.js";

/**
 * This function takes a list of urls and returns the first one that exists.
 * It checks all the URLs in parallel.
 * @param urls the list of URLs to check
 * @returns either the first URL that exists or null if none were found
 */
export default async function filesExist(urls: string[]): Promise<string | null> {
    const promises = urls.map(async (url) => {
        if (await fileExists(url)) {
            return url;
        }
        return null;
    });

    // Run all in parallel
    const results = await Promise.all(promises);

    // Find the first URL that exists (not null) or return null if none exist
    for (const result of results) {
        if (result !== null) {
            return result;
        }
    }

    return null; // None of the URLs exist
}
