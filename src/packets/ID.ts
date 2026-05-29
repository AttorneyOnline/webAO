import pkg from "../../package.json";
import { client } from "../client";
import { escapeFanta, unescapeFanta } from "../escaping";
import type { PacketCodec } from "../packets";

const version = pkg.version;

/**
 * `ID` has two wire variants depending on the direction:
 *
 *   - Server -> Client (`ID (Client)` in the spec): all three fields.
 *     Modeled by `IDPacketClient` + `IDClient` (used by the dispatcher).
 *     Wire: `ID#{player_count}#{software}#{version}#%`.
 *
 *   - Client -> Server (`ID (Server)` in the spec): omits `player_count`.
 *     Modeled by `IDPacketServer` + `IDServer`.
 *     Wire: `ID#{software}#{version}#%`.
 *
 * Some legacy servers (notably serverD) pack `software` and `version` together
 * in the second field separated by `&`; that quirk is handled in the handler,
 * not the codec, so `version` is optional on the Client-receiver form.
 */
export interface IDPacketClient {
  player_count: number;
  software: string;
  version?: string;
}

export type IDPacketServer = Omit<IDPacketClient, "player_count"> & {
  version: string;
};

export const IDClient: PacketCodec<IDPacketClient> = {
  header: "ID",
  decode(args) {
    const packet: IDPacketClient = {
      player_count: Number(args[1]),
      software: unescapeFanta(args[2] ?? ""),
    };
    if (args[3] !== undefined) {
      packet.version = unescapeFanta(args[3]);
    }
    return packet;
  },
  encode(packet) {
    const software = escapeFanta(packet.software);
    if (packet.version !== undefined) {
      return `ID#${packet.player_count}#${software}#${escapeFanta(packet.version)}#%`;
    }
    return `ID#${packet.player_count}#${software}#%`;
  },
};

export const IDServer: PacketCodec<IDPacketServer> = {
  header: "ID",
  decode(args) {
    return {
      software: unescapeFanta(args[1] ?? ""),
      version: unescapeFanta(args[2] ?? ""),
    };
  },
  encode(packet) {
    return `ID#${escapeFanta(packet.software)}#${escapeFanta(packet.version)}#%`;
  },
};

/**
 * Identifies the server and issues a playerID
 */
export const receiveID = (packet: IDPacketClient) => {
  client.playerID = packet.player_count;
  // Some legacy servers pack software+version together in the software field
  // separated by `&`. Split here rather than in the codec since this is a
  // serverD-specific quirk, not the documented protocol.
  const softwareParts = packet.software.split("&");
  const serverSoftware = softwareParts[0];
  if (serverSoftware === "webAO") {
    client.receiveData("PN#0#1#%");
  } else {
    client.sendPacket(IDServer, { software: "webAO", version });
  }
};
