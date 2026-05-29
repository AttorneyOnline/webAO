/**
 * VS_FRAME (c2s) — voice subsystem outbound frame.
 *
 * `payload` is base64-encoded Opus; not chat-escaped (no `#` / `&` in
 * base64) but treated as opaque by aolib.
 */
import { packet } from "../schema";
import { str } from "../fields";

export const VS_FRAME = packet("VS_FRAME", {
  payload: str(),
});
