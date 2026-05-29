import { setAOhost } from "../client/aoHost";
import { renderPlayerList } from "../dom/renderPlayerList";
import { Packet } from "../Packet";
import { decode, req } from "../packets";

/**
 * Asset URL update. Server tells the client to fetch character /
 * background / sound assets from a new origin. `None` is a sentinel
 * meaning "keep using the current asset host."
 */

// Receiver: Client
export class ASSPacket extends Packet {
  static $header = "ASS";
  asset_url: string = req("string");
}

// Apply the new asset origin and refresh the player list (which
// renders character icons from the asset host).
export function receiveASS(body: string) {
  const packet = decode(ASSPacket, body);
  if (packet.asset_url !== "None") setAOhost(packet.asset_url);
  renderPlayerList();
}
