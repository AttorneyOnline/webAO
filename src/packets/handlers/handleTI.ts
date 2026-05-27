import type { TIPacket } from "../types/TI";

/**
 * Handles a timer update
 */
export const handleTI = (packet: TIPacket) => {
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
