import { escapeChat, unescapeChat } from "../../encoding";
import type { PacketCodec } from "./index";

/**
 * Wire format (server -> client): `ID#{player_number}#{software}#{version}#%`.
 * Some legacy servers (notably serverD) pack `software` and `version` together
 * in the second field separated by `&`; that quirk is handled in the handler,
 * not the codec.
 */
export interface IDPacket {
  playerNumber: number;
  software: string;
  version?: string;
}

export const ID: PacketCodec<IDPacket> = {
  decode(args) {
    const packet: IDPacket = {
      playerNumber: Number(args[1]),
      software: unescapeChat(args[2] ?? ""),
    };
    if (args[3] !== undefined) {
      packet.version = unescapeChat(args[3]);
    }
    return packet;
  },
  encode(packet) {
    const software = escapeChat(packet.software);
    if (packet.version !== undefined) {
      return `ID#${packet.playerNumber}#${software}#${escapeChat(packet.version)}#%`;
    }
    return `ID#${packet.playerNumber}#${software}#%`;
  },
};
