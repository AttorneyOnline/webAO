import type { PacketCodec } from "./index";

export interface TIPacket {
  timerId: number;
  command: number;
  time: number;
}

export const TI: PacketCodec<TIPacket> = {
  decode(args) {
    return {
      timerId: Number(args[1]),
      command: Number(args[2]),
      time: Number(args[3]),
    };
  },
  encode(packet) {
    return `TI#${packet.timerId}#${packet.command}#${packet.time}#%`;
  },
};
