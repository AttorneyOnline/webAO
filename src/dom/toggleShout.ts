import { selectedShout, setSelectedShout } from "../client";
import { ShoutModifier } from "../packets/MS";

/**
 * Highlights and selects a shout for in-character chat.
 * If the same shout button is selected, then the shout is canceled.
 */
export function toggleShout(shout: ShoutModifier) {
  if (shout === selectedShout) {
    document.getElementById(`button_${shout}`)!.className = "client_button";
    setSelectedShout(ShoutModifier.NONE);
  } else {
    document.getElementById(`button_${shout}`)!.className =
      "client_button dark";
    if (selectedShout) {
      document.getElementById(`button_${selectedShout}`)!.className =
        "client_button";
    }
    setSelectedShout(shout);
  }
}
