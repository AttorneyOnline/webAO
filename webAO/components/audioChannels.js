/**
 *
 * @param {number} amountOfChannels Amount of Blips to put on page
 */
const createAudioChannels = (amountOfChannels) => {
    for (let i = 0; i < amountOfChannels; i++) {
        const audioChannel = document.createElement('audio');
        audioChannel.setAttribute('class', 'audioChannel');
        document.body.appendChild(audioChannel);
    }
};
createAudioChannels(4);
export default createAudioChannels;
