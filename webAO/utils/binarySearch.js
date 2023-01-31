/* Returns the index of `needle' in `haystack', or `null' if it wasn't found. */
export function binarySearch(haystack,
                             needle,
                             cmp = (a, b) => a < b ? -1 : a > b ? 1 : 0) {
    let start = 0;
    let end = haystack.length - 1;

    while (start <= end) {
        const middle = Math.floor((start + end) / 2);
        const comparison = cmp(haystack[middle], needle);

        if (comparison == 0)
            return middle;
        else if (comparison < 0)
            start = middle + 1;
        else
            end = middle - 1;
    }

    return null;
}
