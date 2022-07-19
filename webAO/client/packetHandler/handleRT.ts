/**
 * Handles a testimony states.
 * @param {Array} args packet arguments
 */
export const handleRT = (args: string[]) => {
  const judgeid = Number(args[2]);
  switch (args[1]) {
    case "testimony1":
      this.testimonyID = 1;
      break;
    case "testimony2":
      // Cross Examination
      this.testimonyID = 2;
      break;
    case "judgeruling":
      this.testimonyID = 3 + judgeid;
      break;
    default:
      console.warn("Invalid testimony");
  }
  this.viewport.initTestimonyUpdater();
};
