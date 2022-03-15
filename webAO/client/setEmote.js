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
  const emoteSelector = document.getElementById(`client_${position}${pairID}_img`)
  const extensionsMap = [
    '.gif',
    '.png',
    '.apng',
    '.webp'
  ];
  const transparentPNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  for (const extension of extensionsMap) {
    // Hides all sprites before creating a new sprite
    if (client.lastChar !== client.chatmsg.name) {
      emoteSelector.src = transparentPNG;
    }
    let url;
    if (extension === '.png') {
      url = `${characterFolder}${encodeURI(charactername)}/${encodeURI(emotename)}${extension}`;
    } else {
      url = `${characterFolder}${encodeURI(charactername)}/${encodeURI(prefix)}${encodeURI(emotename)}${extension}`;
    }
    const exists = fileExistsSync(url);
    if (exists) {
      emoteSelector.src = url;
      break;
    }
  }
};
export default setEmote;
