import { changeChar } from "../client/changeChar";
import * as aolib from "../aolib";

/** Apply the server's character assignment. */
export function applyCharacterPick(packet: aolib.Out<typeof aolib.PV>) {
  changeChar(packet.char_id);
}
