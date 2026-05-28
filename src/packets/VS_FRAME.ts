import type { PacketCodec } from "../packets";

/**
 * Client -> server voice frame. Carries a base64-encoded Opus packet; the
 * server attaches the source uid and rebroadcasts as `VS_AUDIO`. There is
 * no Server -> Client form, so this codec is send-only.
 *
 * Wire: `VS_FRAME#<b64_opus>#%`.
 */
export interface VS_FRAMEPacket {
  payload: string;
}

export const VS_FRAME: PacketCodec<VS_FRAMEPacket> = {
  header: "VS_FRAME",
  decode() {
    throw new Error("VS_FRAME is send-only");
  },
  encode(packet) {
    return `VS_FRAME#${packet.payload}#%`;
  },
};
