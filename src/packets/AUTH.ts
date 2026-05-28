import type { PacketCodec } from "../packets";

export interface AUTHPacket {
  auth_state: number;
}

export const AUTH: PacketCodec<AUTHPacket> = {
  header: "AUTH",
  decode(args) {
    return { auth_state: Number(args[1]) };
  },
  encode(packet) {
    return `AUTH#${packet.auth_state}#%`;
  },
};

/**
 * i am mod now
 */
export const receiveAUTH = (packet: AUTHPacket) => {
  if (packet.auth_state === 1) {
    (<HTMLAnchorElement>document.getElementById("mod_ui")).href =
      `styles/mod.css`;
  }
};
