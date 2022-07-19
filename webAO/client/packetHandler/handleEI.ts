/**
 * Handles incoming evidence information, containing only one evidence
 * item per packet.
 *
 * EI#id#name&description&type&image&##%
 *
 * @param {Array} args packet arguments
 */
export const handleEI = (args: string[]) => {
  document.getElementById(
    "client_loadingtext"
  ).innerHTML = `Loading Evidence ${args[1]}/${this.evidence_list_length}`;
  const evidenceID = Number(args[1]);
  (<HTMLProgressElement>document.getElementById("client_loadingbar")).value =
    this.char_list_length + evidenceID;

  const arg = args[2].split("&");
  this.evidences[evidenceID] = {
    name: prepChat(arg[0]),
    desc: prepChat(arg[1]),
    filename: safeTags(arg[3]),
    icon: `${AO_HOST}evidence/${encodeURI(arg[3].toLowerCase())}`,
  };

  this.sendServer("AE" + (evidenceID + 1) + "#%");
};
