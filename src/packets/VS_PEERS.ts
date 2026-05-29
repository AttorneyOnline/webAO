import { handleInitialPeers } from "../voice/voice";
import * as aolib from "../aolib";

/**
 * Undocumented voice subsystem packet. Wire format:
 * `VS_PEERS#<csv_uids>#%`. The comma-separated list is intentionally kept as
 * a single string here so the handler can preserve its own empty/invalid
 * filtering semantics.
 */


export const applyVoicePeerList = (packet: aolib.Out<typeof aolib.VS_PEERS>) => {
  void handleInitialPeers(packet.uids);
};
