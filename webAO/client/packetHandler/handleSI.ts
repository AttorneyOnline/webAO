import {
  char_list_length,
  client,
  evidence_list_length,
  music_list_length,
  setCharListLength,
  setEvidenceListLength,
  setMusicListLength,
} from "../../client";
import { oldLoading } from "../../client";
import { extrafeatures } from "../../client";
import { pickChar } from "../../dom/pickChar";

/**
 * Received when the server announces its server info,
 * but we use it as a cue to begin retrieving characters.
 * @param {Array} args packet arguments
 */
export const handleSI = (args: string[]) => {
  console.log(args[1]);
  setCharListLength(Number(args[1]));
  setCharListLength(char_list_length + 1); // some servers count starting from 0 some from 1...
  setEvidenceListLength(Number(args[2]));
  setMusicListLength(Number(args[3]));

  (<HTMLProgressElement>document.getElementById("client_loadingbar")).max =
    char_list_length + evidence_list_length + music_list_length;

  // create the charselect grid, to be filled by the character loader
  document.getElementById("client_chartable").innerHTML = "";

  for (let i = 0; i < char_list_length; i++) {
    const demothing = document.createElement("img");
    demothing.className = "demothing";
    demothing.id = `demo_${i}`;
    const demoonclick = document.createAttribute("onclick");
    demoonclick.value = `pickChar(${i})`;
    demothing.setAttributeNode(demoonclick);

    document.getElementById("client_chartable").appendChild(demothing);
  }

  console.log(oldLoading + "FUCK");
  console.log(extrafeatures);
  // this is determined at the top of this file
  if (!oldLoading && extrafeatures.includes("fastloading")) {
    client.sendServer("RC#%");
  } else {
    client.sendServer("askchar2#%");
  }
};
