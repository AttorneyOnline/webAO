import type { PacketCodec } from "../packets";

export interface AUTHPacket {
  authState: number;
}

export const AUTH: PacketCodec<AUTHPacket> = {
  decode(args) {
    return { authState: Number(args[1]) };
  },
  encode(packet) {
    return `AUTH#${packet.authState}#%`;
  },
};

/**
 * i am mod now
 */
export const receiveAUTH = (packet: AUTHPacket) => {
  if (packet.authState === 1) {
    (<HTMLAnchorElement>document.getElementById("mod_ui")).href =
      `styles/mod.css`;
  }
};
