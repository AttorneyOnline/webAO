import { escapeChat, unescapeChat } from "../../encoding";
import type { PacketCodec } from "./index";

/**
 * Modcall packet. `reason` is per the AO spec; `target` is a non-spec
 * extension used by AO2-Client (and supported by tsuserver/akashi) to
 * direct the modcall at a specific player id (or `-1` for any mod).
 *
 * Servers only ever send `reason` to clients, so `target` is outbound-only
 * in practice -- but `decode` accepts it for symmetry.
 */
export interface ZZPacket {
  reason: string;
  target?: number;
}

export const ZZ: PacketCodec<ZZPacket> = {
  decode(args) {
    const packet: ZZPacket = { reason: unescapeChat(args[1] ?? "") };
    if (args[2] !== undefined && args[2] !== "") {
      packet.target = Number(args[2]);
    }
    return packet;
  },
  encode(packet) {
    const reason = escapeChat(packet.reason);
    if (packet.target !== undefined) {
      return `ZZ#${reason}#${packet.target}#%`;
    }
    if (reason !== "") {
      return `ZZ#${reason}#%`;
    }
    return `ZZ#%`;
  },
};
