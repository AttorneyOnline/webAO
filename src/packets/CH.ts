import { client } from "../client";
import type { PacketCodec } from "../packets";

/**
 * Client keepalive ping. The server resets the timeout timer on receipt and
 * responds with `CHECK`. As a client we never receive `CH`, but the registry
 * still includes it so an echo is silently ignored rather than warned about.
 */
export interface CHPacket {
  charId: number;
}

export const CH: PacketCodec<CHPacket> = {
  decode: (args) => ({ charId: Number(args[1]) }),
  encode: (packet) => `CH#${packet.charId}#%`,
};

export const receiveCH = () => {};

/**
 * Sends a keepalive packet.
 */
export const sendCH = (packet: CHPacket) => {
  client.sendToServer(CH.encode(packet));
};
