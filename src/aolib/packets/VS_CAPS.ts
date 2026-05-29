/**
 * VS_CAPS (s2c) — voice subsystem capability advertisement.
 *
 * Arrives twice in the modern handshake (after FL and after DONE);
 * the payload is idempotent so the second arrival is harmless.
 */
import { packet } from "../schema";
import { str, num, bool } from "../fields";

export const VS_CAPS = packet("VS_CAPS", {
  enabled: bool(),
  pttOnly: bool(),
  maxPeers: num(),
  codec: str(),
  sampleRate: num(),
  frameMs: num(),
  maxFrameBytes: num(),
});
