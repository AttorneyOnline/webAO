import { client, json_mode } from "../client";
import { Packet } from "../Packet";
import { decode, encode } from "../packets";

/**
 * "Ready / done with handshake." Client -> Server, empty payload. In
 * replay mode the server-side handler synthesises the post-handshake
 * setup: default background and DONE, then flips the OOC textarea to
 * writable for the replay queue.
 */

// Wire shape is the same in both directions.
export class RDPacket extends Packet {
  static $header = "RD";
}

export function sendRD(packet: Partial<RDPacket>) {
  client.sendData(encode(RDPacket, packet, json_mode));
}

// Receiver: Server (server-emulation in replay mode).
export function receiveRD(body: string) {
  decode(RDPacket, body);
  client.receiveData("BN#gs4#%");
  client.receiveData("DONE#%");
  const ooclog = <HTMLInputElement>document.getElementById("client_ooclog");
  ooclog.value = "";
  ooclog.readOnly = false;

  document.getElementById("client_oocinput")!.style.display = "none";
  document.getElementById("client_replaycontrols")!.style.display =
    "inline-block";
}
