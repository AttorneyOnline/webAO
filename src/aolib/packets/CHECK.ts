/** CHECK (s2c) — server keepalive ack, empty payload. */
import { packet } from "../schema";

export const CHECK = packet("CHECK", {});
