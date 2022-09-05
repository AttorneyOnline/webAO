import { AO_HOST } from '../client/aoHost'

/**
 * 
 * @param {number} amountOfBlips Amount of Blips to put on page
 */
const createBlip = (amountOfBlips) => {
    for (let i = 0; i < amountOfBlips; i++) {
        const audio = document.createElement('audio')
        const blipUrl = `${AO_HOST}sounds/general/sfx-blipmale.opus`
        audio.setAttribute('class', 'blipSound')
        audio.setAttribute('src', blipUrl)
        document.body.appendChild(audio)
    }
}
createBlip(6)
export default createBlip