/**
 * FM (s2c) — full music list, replacing the client's current list.
 *
 * Same wire shape as SM but different semantics: SM is incremental,
 * FM is a full reset.
 */
import { packet } from "../schema";
import { str, array } from "../fields";

export const FM = packet("FM", {
  music_list: array(str()),
});
