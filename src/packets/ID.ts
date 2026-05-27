import pkg from "../../package.json";
import { client, setOldLoading } from "../client";
import { escapeChat, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";

const version = pkg.version;

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

/**
 * Identifies the server and issues a playerID
 */
export const handleID = (packet: IDPacket) => {
  client.playerID = packet.playerNumber;
  // Some legacy servers pack software+version together in the software field
  // separated by `&`. Split here rather than in the codec since this is a
  // serverD-specific quirk, not the documented protocol.
  const softwareParts = packet.software.split("&");
  const serverSoftware = softwareParts[0];
  let serverVersion;
  if (serverSoftware === "serverD") {
    serverVersion = softwareParts[1];
  } else if (serverSoftware === "webAO") {
    setOldLoading(false);
    client.sender.sendSelf("PN#0#1#%");
  } else {
    serverVersion = packet.version;
  }

  if (serverSoftware === "serverD" && serverVersion === "1377.152") {
    setOldLoading(true);
  } // bugged version

  if (serverSoftware !== "webAO") {
    client.sender.sendServer(`ID#webAO#${version}#%`);
  }
};
