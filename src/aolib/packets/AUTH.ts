/**
 * AUTH (s2c) — mod-privilege level for this client. `1` means
 * authenticated as moderator; `0` revokes privileges.
 */
import { packet } from "../schema";
import { num } from "../fields";

export const AUTH = packet("AUTH", {
  auth_state: num(),
});
