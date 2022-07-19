import queryParser from "../../utils/queryParser";
let { mode } = queryParser();
import { char_list_length, handleCharacterInfo } from "../../client";
import { client } from "../../client";

/**
 * Handles incoming character information, containing all characters
 * in one packet.
 * @param {Array} args packet arguments
 */
export const handleSC = async (args: string[]) => {
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  if (mode === "watch") {
    // Spectators don't need to pick a character
    document.getElementById("client_charselect").style.display = "none";
  } else {
    document.getElementById("client_charselect").style.display = "block";
  }

  document.getElementById("client_loadingtext").innerHTML =
    "Loading Characters";
  for (let i = 1; i < args.length; i++) {
    document.getElementById(
      "client_loadingtext"
    ).innerHTML = `Loading Character ${i}/${char_list_length}`;
    const chargs = args[i].split("&");
    const charid = i - 1;
    (<HTMLProgressElement>document.getElementById("client_loadingbar")).value =
      charid;
    await sleep(0.1); // TODO: Too many network calls without this. net::ERR_INSUFFICIENT_RESOURCES
    handleCharacterInfo(chargs, charid);
  }
  // We're done with the characters, request the music
  client.sendServer("RM#%");
};
