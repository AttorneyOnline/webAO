/**
 * BB (s2c) — server pops a modal warning on the client.
 *
 * Used for kicks, soft warnings, and any blocking server-to-client
 * message. The client renders `message` in a "you must click OK" box.
 */

import { packet } from "../schema";
import { str } from "../fields";

export const BB = packet("BB", {
  message: str(),
});
