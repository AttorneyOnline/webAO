import * as aolib from "../aolib";

/** Show the server's warning to the user. */
export function showBlockingAlert(packet: aolib.Out<typeof aolib.BB>) {
  alert(packet.message);
}
