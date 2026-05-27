import { client } from "../client";
import { AO_HOST } from "../client/aoHost";
import { escapeChat, safeTags, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";

export interface EvidenceData {
  name: string;
  description: string;
  image: string;
}

export interface LEPacket {
  evidence: EvidenceData[];
}

export const LE: PacketCodec<LEPacket> = {
  decode(args) {
    const evidence: EvidenceData[] = [];
    for (let i = 1; i < args.length; i++) {
      // Trailing empty entry from the wire-format split, or any otherwise
      // malformed cell (no `&` subfield separators) terminates the list --
      // this matches the legacy handler's behavior.
      if (!args[i].includes("&")) break;
      const parts = args[i].split("&");
      evidence.push({
        name: unescapeChat(parts[0] ?? ""),
        description: unescapeChat(parts[1] ?? ""),
        image: unescapeChat(parts[2] ?? ""),
      });
    }
    return { evidence };
  },
  encode(packet) {
    const parts = packet.evidence
      .map(
        (e) =>
          `${escapeChat(e.name)}&${escapeChat(e.description)}&${escapeChat(e.image)}`,
      )
      .join("#");
    return `LE#${parts}#%`;
  },
};

/**
 * Handles incoming evidence list, all evidences at once
 * item per packet.
 */
export const handleLE = (packet: LEPacket) => {
  client.evidences = [];
  for (let i = 0; i < packet.evidence.length; i++) {
    const ev = packet.evidence[i];
    client.evidences[i] = {
      name: safeTags(ev.name),
      desc: safeTags(ev.description),
      filename: ev.image,
      icon: `${AO_HOST}evidence/${encodeURI(ev.image.toLowerCase())}`,
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
