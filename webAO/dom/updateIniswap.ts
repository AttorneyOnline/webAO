/**
 * Update iniswap drowdown
 */
export function updateIniswap() {
    const ini_select = <HTMLSelectElement>(
        document.getElementById("evi_select")
    );
    const ini_name = <HTMLInputElement>(
        document.getElementById("evi_filename")
    );

    if (ini_select.selectedIndex === 0) {
        ini_name.style.display = "initial";
    } else {
        ini_name.style.display = "none";
    }
}
window.updateIniswap = updateIniswap;
