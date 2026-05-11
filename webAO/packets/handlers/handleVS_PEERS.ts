import { handleInitialPeers } from "../../voice/voice";

// VS_PEERS#<csv_uids>#%  — initial roster on join. Empty roster arrives as VS_PEERS##%.
export const handleVS_PEERS = (args: string[]) => {
  const csv = args[1] || "";
  const uids: number[] = [];
  if (csv.length > 0) {
    const parts = csv.split(",");
    for (let i = 0; i < parts.length; i++) {
      const n = Number(parts[i]);
      if (Number.isFinite(n)) uids.push(n);
    }
  }
  void handleInitialPeers(uids);
};
