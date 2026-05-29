/**
 * BN (s2c) — background change. `position` overrides the side-default
 * background frame (empty = use the side's default).
 *
 * Legacy emitters omit the `position` slot entirely when unset; aolib
 * canonicalises to always-present empty string. Decoders on either
 * side already treat empty and missing identically.
 */
import { packet } from "../schema";
import { str, opt } from "../fields";

export const BN = packet("BN", {
  background: str(),
  position: opt(str(), ""),
});
