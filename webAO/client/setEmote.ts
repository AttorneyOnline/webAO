import Client from "../client";
import transparentPng from "../constants/transparentPng";
import fileExists from "../utils/fileExists";

/**
 * Sets all the img tags to the right sources
 * @param {*} chatmsg
 */

const setEmote = async (
  AO_HOST: string,
  client: Client,
  charactername: string,
  emotename: string,
  prefix: string,
  pair: boolean,
  side: string
) => {
  const pairID = pair ? "pair" : "char";
  const characterFolder = `${AO_HOST}characters/`;
  const acceptedPositions = ["def", "pro", "wit"];
  const position = acceptedPositions.includes(side) ? `${side}_` : "";
  const emoteSelector = document.getElementById(
    `client_${position}${pairID}_img`
  ) as HTMLImageElement;
  const extensionsMap = [".gif", ".png", ".apng", ".webp", ".webp.static"];

  for (const extension of extensionsMap) {
    // Hides all sprites before creating a new sprite

    if (client.viewport.lastChar !== client.viewport.chatmsg.name) {
      emoteSelector.src = transparentPng;
    }
    let url;
    if (extension === ".png") {
      url = `${characterFolder}${encodeURI(charactername)}/${encodeURI(
        emotename
      )}${extension}`;
    } else if (extension === ".webp.static") {
      url = `${characterFolder}${encodeURI(charactername)}/${encodeURI(
        emotename
      )}.webp`;    
    } else {
      url = `${characterFolder}${encodeURI(charactername)}/${encodeURI(
        prefix
      )}${encodeURI(emotename)}${extension}`;
    }
    const exists = await fileExists(url);
    if (exists) {
      emoteSelector.src = url;
      break;
    }
  }
};
export default setEmote;
