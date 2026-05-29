/**
 * RT — testimony / judge-ruling state. Bidirectional, identical shape.
 *
 * `animation`: `"testimony1"`, `"testimony2"`, or `"judgeruling"`.
 * `judgeId`: only meaningful when `animation === "judgeruling"`;
 *   defaults to `-1` ("no ruling indicator").
 *
 * Legacy emitters omit the `judgeId` slot when unset; aolib
 * canonicalises to always-present `-1`.
 */
import { packet } from "../schema";
import { str, num, opt } from "../fields";

export const RT = packet("RT", {
  animation: str(),
  judgeId: opt(num(), -1),
});
