/**
 * SM (s2c) — server pushes the music list to the client.
 *
 * The music list is greedy-packed at the end of the wire: each track
 * occupies one positional slot, so `SM#track1#track2#%` decodes as
 * `{ music_list: ["track1", "track2"] }`.
 */

import { packet } from "../schema";
import { str, array } from "../fields";

export const SM = packet("SM", {
  music_list: array(str()),
});
