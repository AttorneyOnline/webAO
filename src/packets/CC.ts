import { client } from "../client";
import * as aolib from "../aolib";

/** In replay mode: ack a character choice with PV. */
export function onCharacterChoose(packet: aolib.Out<typeof aolib.CC>) {
  client.clientSession.send.PV({ player_id: 1, char_id: packet.char_id });
}
