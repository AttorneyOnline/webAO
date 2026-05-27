import { client, setOldLoading } from "../../client";
import pkg from "../../../package.json";
import type { IDPacket } from "../types/ID";

const version = pkg.version;

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
