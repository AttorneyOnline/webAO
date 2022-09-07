/**
 * Find index of anything in select box.
 * @param {string} select_box the select element name
 * @param {string} value the value that need to be compared
 */
export function getIndexFromSelect(select_box: string, value: string) {
    // Find if icon alraedy existed in select box
    const select_element = <HTMLSelectElement>document.getElementById(select_box);
    for (let i = 1; i < select_element.length; ++i) {
        if (select_element.options[i].value === value) {
            return i;
        }
    }
    return 0;
}
window.getIndexFromSelect = getIndexFromSelect;