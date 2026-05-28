import type { PacketCodec } from "../packets";

export interface TIPacket {
  timer_id: number;
  command: number;
  time: number;
}

export const TI: PacketCodec<TIPacket> = {
  header: "TI",
  decode(args) {
    return {
      timer_id: Number(args[1]),
      command: Number(args[2]),
      time: Number(args[3]),
    };
  },
  encode(packet) {
    return `TI#${packet.timer_id}#${packet.command}#${packet.time}#%`;
  },
};

/**
 * Handles a timer update
 */
export const receiveTI = (packet: TIPacket) => {
  switch (packet.command) {
    case 0:
    case 1:
      document.getElementById(`client_timer${packet.timer_id}`)!.innerText =
        String(packet.time);
      break;
    case 2:
      document.getElementById(`client_timer${packet.timer_id}`)!.style.display = "";
      break;
    case 3:
      document.getElementById(`client_timer${packet.timer_id}`)!.style.display = "none";
      break;
  }
};
