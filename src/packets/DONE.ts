import { client, clientState, autoChar, autoArea } from "../client";
import { sendCC } from "./CC";
import { area_click } from "../dom/areaClick";
import { Packet } from "../Packet";
import { decode } from "../packets";
import queryParser from "../utils/queryParser";

const { mode } = queryParser();

/**
 * Handshake completion. Empty payload; arrival means the player can
 * now select a character.
 */

// Receiver: Client
export class DONEPacket extends Packet {
  static $header = "DONE";
}

// Receive handshake completion; advance to character select.
export function receiveDONE(body: string) {
  decode(DONEPacket, body);
  client.state = clientState.Joined;
  document.getElementById("client_loading")!.style.display = "none";
  if (mode === "watch") {
    // Spectators don't need to pick a character
    document.getElementById("client_waiting")!.style.display = "none";
  }

  if (autoArea) {
    const areaIndex = client.areas.findIndex(
      (a: any) => a && a.name.toLowerCase() === autoArea.toLowerCase(),
    );
    if (areaIndex !== -1) {
      const el = document.getElementById(`area${areaIndex}`);
      if (el) {
        area_click(el as HTMLElement);
      }
    }
  }

  if (autoChar) {
    // Hide charselect immediately (spectator mode) so the user isn't stuck
    // on the selection screen. If the CC request succeeds, PV will confirm it.
    document.getElementById("client_waiting")!.style.display = "none";
    document.getElementById("client_charselect")!.style.display = "none";

    const charIndex = client.chars.findIndex(
      (c: any) => c && c.name.toLowerCase() === autoChar.toLowerCase(),
    );
    if (charIndex !== -1) {
      sendCC({
        player_id: client.playerID,
        char_id: charIndex,
        char_pw: "web",
      });
    }
  }
}
