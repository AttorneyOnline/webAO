import { client } from "../client";
import { Packet } from "../Packet";
import { decode, req } from "../packets";

/**
 * Choose character. Client requests to play as char_id; server acks
 * with PV. Wire: `CC#0#{char_id}#{char_pw}#%` — the leading `0` is a
 * spec-mandated literal at position 0 (webAO has historically sent
 * playerID there in violation of the spec), and `char_pw` is a
 * deprecated slot we always emit empty. Both are kept entirely inside
 * `toArgs`/`fromArgs`; callers only see `char_id`.
 */

// Receiver: Server
export class CCPacketServer extends Packet {
  static $header = "CC";
  char_id: number = req("number");

  static toArgs(p: CCPacketServer): string[] {
    return ["0", String(p.char_id), ""];
  }

  static fromArgs(args: string[]): Partial<CCPacketServer> {
    return args[1] !== undefined ? { char_id: Number(args[1]) } : {};
  }
}

// Receive character choice from client; ack with PV.
export function receiveCC(body: string) {
  const packet = decode(CCPacketServer, body);
  client.sendAsServer.PV({ player_id: 1, char_id: packet.char_id });
}
