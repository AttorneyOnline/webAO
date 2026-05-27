import { handleInitialPeers } from "../../voice/voice";
import type { VS_PEERSPacket } from "../types/VS_PEERS";

export const handleVS_PEERS = (packet: VS_PEERSPacket) => {
  void handleInitialPeers(packet.uids);
};
