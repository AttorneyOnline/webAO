import { client } from "../../client";
import { AO_HOST } from "../../client/aoHost";
import { prepChat, safeTags } from "../../encoding";

/**
 * Handles incoming evidence list, all evidences at once
 * item per packet.
 *
 * @param {Array} args packet arguments
 */
export const handleLE = (args: string[]) => {
  client.evidences = [];
  for (let i = 1; i < args.length; i++) {
    if (!args[i].includes("&")) break;
    const arg = args[i].split("&");
    client.evidences[i - 1] = {
      name: prepChat(arg[0]),
      desc: prepChat(arg[1]),
      filename: arg[2],
      icon: `${AO_HOST}evidence/${encodeURI(arg[2].toLowerCase())}`,
    };
  }

  const evidence_box = document.getElementById("evidences");
  evidence_box.innerHTML = "";
  for (let i = 0; i <= client.evidences.length - 1; i++) {
    const evi_item = new Image();
    evi_item.id = "evi_" + i;
    evi_item.className = "evi_icon";
    evi_item.src = client.evidences[i].icon;
    evi_item.alt = client.evidences[i].name;
    evi_item.onclick = () => {
      window.pickEvidence(i);
    };
    evidence_box.appendChild(evi_item);
  }
};
