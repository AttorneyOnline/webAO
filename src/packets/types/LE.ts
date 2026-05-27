import { escapeChat, unescapeChat } from "../../encoding";
import type { PacketCodec } from "./index";

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
