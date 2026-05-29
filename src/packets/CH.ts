import { client } from "../client";
import * as aolib from "../aolib";

/**
 * Client keepalive ping. The server resets the timeout timer on receipt and
 * responds with `CHECK`. As a client we never receive `CH`, but the registry
 * still includes it so an echo is silently ignored rather than warned about.
 */


export const onClientKeepalive = () => {};

/**
 * Sends a keepalive packet.
 */