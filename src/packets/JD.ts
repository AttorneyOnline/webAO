import { Packet } from "../Packet";
import { decode, req } from "../packets";

/**
 * Judge-controls toggle. `state === 1` shows the judge action panel;
 * anything else hides it.
 */

// Receiver: Client
export class JDPacket extends Packet {
  static $header = "JD";
  state = req("number");
}

export function receiveJD(body: string) {
  const packet = decode(JDPacket, body);
  if (packet.state === 1) {
    document.getElementById("judge_action")!.style.display = "inline-table";
    document.getElementById("no_action")!.style.display = "none";
  } else {
    document.getElementById("judge_action")!.style.display = "none";
    document.getElementById("no_action")!.style.display = "inline-table";
  }
}
