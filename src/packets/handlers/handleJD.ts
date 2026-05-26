/**
 * show/hide judge controls
 * @param {number} show either a 1 or a 0
 */
export const handleJD = (args: string[]) => {
  if (Number(args[1]) === 1) {
    document.getElementById("judge_action")!.style.display = "inline-table";
    document.getElementById("no_action")!.style.display = "none";
  } else {
    document.getElementById("judge_action")!.style.display = "none";
    document.getElementById("no_action")!.style.display = "inline-table";
  }
};
