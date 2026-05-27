import { client } from "../client";
import { AO_HOST } from "../client/aoHost";
import { decodeChat, escapeChat, safeTags, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";

/**
 * Modcall packet. `reason` is per the AO spec; `target` is a non-spec
 * extension used by AO2-Client (and supported by tsuserver/akashi) to
 * direct the modcall at a specific player id (or `-1` for any mod).
 *
 * Servers only ever send `reason` to clients, so `target` is outbound-only
 * in practice -- but `decode` accepts it for symmetry.
 */
export interface ZZPacket {
  reason: string;
  target?: number;
}

export const ZZ: PacketCodec<ZZPacket> = {
  decode(args) {
    const packet: ZZPacket = { reason: unescapeChat(args[1] ?? "") };
    if (args[2] !== undefined && args[2] !== "") {
      packet.target = Number(args[2]);
    }
    return packet;
  },
  encode(packet) {
    const reason = escapeChat(packet.reason);
    if (packet.target !== undefined) {
      return `ZZ#${reason}#${packet.target}#%`;
    }
    if (reason !== "") {
      return `ZZ#${reason}#%`;
    }
    return `ZZ#%`;
  },
};

/**
 * Handles a modcall.
 */
export const receiveZZ = (packet: ZZPacket) => {
  const oocLog = document.getElementById("client_ooclog")!;
  const message = safeTags(decodeChat(packet.reason)).replace(/\n/g, "<br>");
  oocLog.innerHTML += `$Alert: ${message}<br>`;
  if (oocLog.scrollTop > oocLog.scrollHeight - 60) {
    oocLog.scrollTop = oocLog.scrollHeight;
  }

  client.viewport.getSfxAudio().pause();
  const oldvolume = client.viewport.getSfxAudio().volume;
  client.viewport.getSfxAudio().volume = 1;
  client.viewport.getSfxAudio().src = `${AO_HOST}sounds/general/sfx-gallery.opus`;
  client.viewport.getSfxAudio().play().catch(() => {});
  client.viewport.getSfxAudio().volume = oldvolume;
};

/**
 * Sends a modcall.
 *
 * @param msg reason for the modcall (empty string sends a reason-less modcall)
 * @param target player id to direct the modcall at, or `-1` for any mod.
 *               Pass `undefined` to omit (matches AO2-Client's `ZZ#%` form).
 */
export const sendZZ = (msg: string, target?: number) => {
  client.sender.sendServer(ZZ.encode({ reason: msg, target }));
};
