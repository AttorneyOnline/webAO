/**
 * i am mod now
 * @param {Array} args packet arguments
 */
export const handleAUTH = (args: string[]) => {
  if (args[1] === "1") {
    (<HTMLAnchorElement>document.getElementById("mod_ui")).href =
      `styles/mod.css`;
  }
};