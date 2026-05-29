import * as aolib from "../aolib";


/**
 * Client -> server voice frame. Carries a base64-encoded Opus packet; the
 * server attaches the source uid and rebroadcasts as `VS_AUDIO`. There is
 * no Server -> Client form, so this codec is send-only.
 *
 * Wire: `VS_FRAME#<b64_opus>#%`.
 */

