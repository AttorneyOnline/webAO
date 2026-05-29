import Client from "../client";
import { Side } from "../aolib";
import transparentPng from "../constants/transparentPng";
import fileExists from "../utils/fileExists";

const isFullView = (s: Side): boolean =>
  s === Side.DEFENSE || s === Side.PROSECUTION || s === Side.WITNESS;

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
  side: Side,
) => {
  const pairID = pair ? "pair" : "char";
  const characterFolder = `${AO_HOST}characters/`;
  const position = isFullView(side) ? `${side}_` : "";
  const emoteSelector = document.getElementById(
    `client_${position}${pairID}_img`,
  ) as HTMLImageElement;

  for (const extension of client.emote_extensions) {
    // Hides all sprites before creating a new sprite

    if (
      client.viewport.getLastCharacter() !== client.viewport.getChatmsg().name
    ) {
      emoteSelector.src = transparentPng;
    }
    let url;
    if (extension === ".png") {
      url = `${characterFolder}${encodeURI(charactername)}/${encodeURI(
        emotename,
      )}${extension}`;
    } else if (extension === ".webp.static") {
      url = `${characterFolder}${encodeURI(charactername)}/${encodeURI(
        emotename,
      )}.webp`;
    } else {
      url = `${characterFolder}${encodeURI(charactername)}/${encodeURI(
        prefix,
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
