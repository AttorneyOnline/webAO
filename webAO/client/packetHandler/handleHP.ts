/**
 * Handles a change in the health bars' states.
 * @param {Array} args packet arguments
 */
export const handleHP = (args: string[]) => {
  const percent_hp = Number(args[2]) * 10;
  let healthbox;
  if (args[1] === "1") {
    // Def hp
    this.hp[0] = Number(args[2]);
    healthbox = document.getElementById("client_defense_hp");
  } else {
    // Pro hp
    this.hp[1] = Number(args[2]);
    healthbox = document.getElementById("client_prosecutor_hp");
  }
  (<HTMLElement>(
    healthbox.getElementsByClassName("health-bar")[0]
  )).style.width = `${percent_hp}%`;
};
