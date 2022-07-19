/**
 * Handle the change of players in an area.
 * @param {Array} args packet arguments
 */
export const handleARUP = (args: string[]) => {
  args = args.slice(1);
  for (let i = 0; i < args.length - 2; i++) {
    if (this.areas[i]) {
      // the server sends us ARUP before we even get the area list
      const thisarea = document.getElementById(`area${i}`);
      switch (Number(args[0])) {
        case 0: // playercount
          this.areas[i].players = Number(args[i + 1]);
          break;
        case 1: // status
          this.areas[i].status = safeTags(args[i + 1]);
          break;
        case 2:
          this.areas[i].cm = safeTags(args[i + 1]);
          break;
        case 3:
          this.areas[i].locked = safeTags(args[i + 1]);
          break;
      }

      thisarea.className = `area-button area-${this.areas[
        i
      ].status.toLowerCase()}`;

      thisarea.innerText = `${this.areas[i].name} (${this.areas[i].players}) [${this.areas[i].status}]`;

      thisarea.title =
        `Players: ${this.areas[i].players}\n` +
        `Status: ${this.areas[i].status}\n` +
        `CM: ${this.areas[i].cm}\n` +
        `Area lock: ${this.areas[i].locked}`;
    }
  }
};
