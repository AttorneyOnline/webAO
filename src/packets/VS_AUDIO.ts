import { handleRemoteAudio } from "../voice/voice";
import * as aolib from "../aolib";

/**
 * Undocumented voice subsystem packet. Wire format:
 * `VS_AUDIO#<from_uid>#<b64_opus>#%`. The payload is base64-encoded opus
 * (no FantaCode escaping is applied since base64 doesn't include any of
 * the reserved characters).
 */


export const handleVoiceAudio = (packet: aolib.Out<typeof aolib.VS_AUDIO>) => {
  if (!Number.isFinite(packet.fromUid) || !packet.payload) return;
  handleRemoteAudio(packet.fromUid, packet.payload);
};
