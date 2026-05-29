import type * as aolib from "../aolib";

/**
 * TI: timer state update. `command` selects the action:
 *   0 / 1 = set displayed time (`time` ms)
 *   2 = show the timer
 *   3 = hide the timer
 */
export const applyTimerUpdate = (packet: aolib.TIPacket) => {
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
