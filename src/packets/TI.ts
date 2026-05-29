import * as aolib from "../aolib";

/** Timer state update. `command`: 0/1 = set time, 2 = show, 3 = hide. */
export function applyTimerUpdate(packet: aolib.Out<typeof aolib.TI>) {
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
}
