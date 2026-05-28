import type { PacketCodec } from "../packets";

export interface TIPacket {
  timerId: number;
  command: number;
  time: number;
}

export const TI: PacketCodec<TIPacket> = {
  header: "TI",
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

/**
 * Handles a timer update
 */
export const receiveTI = (packet: TIPacket) => {
  switch (packet.command) {
    case 0:
    case 1:
      document.getElementById(`client_timer${packet.timerId}`)!.innerText =
        String(packet.time);
      break;
    case 2:
      document.getElementById(`client_timer${packet.timerId}`)!.style.display = "";
      break;
    case 3:
      document.getElementById(`client_timer${packet.timerId}`)!.style.display = "none";
      break;
  }
};
