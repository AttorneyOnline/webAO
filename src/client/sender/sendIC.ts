import { client } from "../../client";
import {
  Flip,
  MSClient,
  MSServer,
  type MSPacketServer,
} from "../../packets/MS";
import queryParser from "../../utils/queryParser";
const { mode } = queryParser();

/**
 * Sends an in-character chat message. The packet variant depends on
 * whether we're talking to a real server (Server-receiver form, no
 * `paired_name` / `paired_emote`) or replaying to ourselves
 * (Client-receiver form, fields included with empty values).
 */
export const sendIC = (packet: MSPacketServer) => {
  // In replay mode, sendServer routes the wire back through the local
  // dispatcher -- which expects Client-receiver form (with `paired_*`
  // fields). Fill those in as zero/empty when self-sending.
  const wire =
    mode === "replay"
      ? MSClient.encode({
        ...packet,
        paired_name: "",
        paired_emote: "",
        paired_offset: { x: 0, y: 0 },
        paired_flip: Flip.NONE,
      })
      : MSServer.encode(packet);

  client.sender.sendServer(wire);
  if (mode === "replay") {
    (<HTMLInputElement>document.getElementById("client_ooclog")).value +=
      `wait#${
        (<HTMLInputElement>document.getElementById("client_replaytimer")).value
      }#%\r\n`;
  }
};
