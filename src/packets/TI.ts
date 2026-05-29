import { Packet } from "../Packet";
import { decode, req } from "../packets";

/**
 * Timer state update. `command` selects the action: 0/1 = set the
 * displayed time, 2 = show, 3 = hide.
 */

// Receiver: Client
export class TIPacket extends Packet {
  static $header = "TI";
  timer_id = req("number");
  command = req("number");
  time = req("number");
}

export function receiveTI(body: string) {
  const packet = decode(TIPacket, body);
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
