import queryParser from "../../utils/queryParser";

const { mode } = queryParser()
/**
   * Handles the handshake completion packet, meaning the player
   * is ready to select a character.
   *
   * @param {Array} args packet arguments
   */
export const handleDONE = (_args: string[]) => {
    document.getElementById("client_loading")!.style.display = "none";
    if (mode === "watch") {
      // Spectators don't need to pick a character
      document.getElementById("client_waiting")!.style.display = "none";
    }
}