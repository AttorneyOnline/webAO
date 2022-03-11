import fileExistsSync from '../utils/fileExistsSync';

/**
	 * Sets all the img tags to the right sources
	 * @param {*} chatmsg
	 */

const setEmote = (AO_HOST, client, charactername, emotename, prefix, pair, side) => {
  const pairID = pair ? 'pair' : 'char';
  const characterFolder = `${AO_HOST}characters/`;
  const acceptedPositions = ['def', 'pro', 'wit'];
  const position = acceptedPositions.includes(side) ? `${side}_` : '';

  const gif_s = document.getElementById(`client_${position}${pairID}_gif`);
  const png_s = document.getElementById(`client_${position}${pairID}_png`);
  const apng_s = document.getElementById(`client_${position}${pairID}_apng`);
  const webp_s = document.getElementById(`client_${position}${pairID}_webp`);
  const extensionsMap = {
    '.gif': gif_s,
    '.png': png_s,  
    '.apng': apng_s,
    '.webp': webp_s,  
  };

  for (const [extension, htmlElement] of Object.entries(extensionsMap)) {
    // Hides all sprites before creating a new sprite
    if (client.lastChar !== client.chatmsg.name) {
      htmlElement.src = transparentPNG;
    }
    let url;
    if (extension === '.png') {
      url = `${characterFolder}${encodeURI(charactername)}/${encodeURI(emotename)}${extension}`;
    } else {
      url = `${characterFolder}${encodeURI(charactername)}/${encodeURI(prefix)}${encodeURI(emotename)}${extension}`;
    }
    const exists = fileExistsSync(url);
    if (exists) {
      htmlElement.src = url;
      return;
    }
  }
};
export default setEmote;
