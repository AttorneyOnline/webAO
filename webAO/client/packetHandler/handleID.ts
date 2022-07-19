/**
 * Identifies the server and issues a playerID
 * @param {Array} args packet arguments
 */

import { client, setOldLoading, setPlayerID } from "../../client";
export const handleID = (args: string[]) => {
  setPlayerID(Number(args[1]));
  const serverSoftware = args[2].split("&")[0];
  let serverVersion;
  if (serverSoftware === "serverD") {
    serverVersion = args[2].split("&")[1];
  } else if (serverSoftware === "webAO") {
    setOldLoading(false);

    client.sendSelf("PN#0#1#%");
  } else {
    serverVersion = args[3];
  }

  if (serverSoftware === "serverD" && serverVersion === "1377.152") {
    setOldLoading(true);
  } // bugged version
};
