
/**
 * Update evidence icon.
 */
export function updateActionCommands(side: string) {
    if (side === "jud") {
        document.getElementById("judge_action")!.style.display = "inline-table";
        document.getElementById("no_action")!.style.display = "none";
    } else {
        document.getElementById("judge_action")!.style.display = "none";
        document.getElementById("no_action")!.style.display = "inline-table";
    }

    // Update role selector
    for (
        let i = 0,
            role_select = <HTMLSelectElement>document.getElementById("role_select");
        i < role_select.options.length;
        i++
    ) {
        if (side === role_select.options[i].value) {
            role_select.options.selectedIndex = i;
            return;
        }
    }
}
// @ts-ignore
window.updateActionCommands = updateActionCommands;
