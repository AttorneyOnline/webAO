import { Packet } from "../Packet";
import { decode, req } from "../packets";

/**
 * Auth state update. Server tells the client their mod-privilege
 * level: `1` means they are now logged in as a moderator.
 */

// Receiver: Client
export class AUTHPacket extends Packet {
  static $header = "AUTH";
  auth_state: number = req("number");
}

// i am mod now
export function receiveAUTH(body: string) {
  const packet = decode(AUTHPacket, body);
  if (packet.auth_state === 1) {
    (<HTMLAnchorElement>document.getElementById("mod_ui")).href = `styles/mod.css`;
  }
}
