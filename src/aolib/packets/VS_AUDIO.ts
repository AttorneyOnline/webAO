/**
 * VS_AUDIO (s2c) — voice audio frame from a remote peer.
 *
 * `fromUid` identifies the speaker. `payload` is base64-encoded Opus;
 * treated as an opaque string by aolib.
 */
import { packet } from "../schema";
import { str, num } from "../fields";

export const VS_AUDIO = packet("VS_AUDIO", {
  fromUid: num(),
  payload: str(),
});
