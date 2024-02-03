import fileExists from './fileExists.js'
import transparentPng from '../constants/transparentPng.js'
const urlExtensionsToTry = [
    '.png',
    '.gif',
    '.webp',
    '.apng'
]
const tryUrls = async (url: string) => {
    for (let i = 0; i < urlExtensionsToTry.length; i++) {
        const extension = urlExtensionsToTry[i]
        const fullFileUrl = url + extension
        const exists = await fileExists(fullFileUrl);
        if (exists) {
            return fullFileUrl
        }
    }
    return transparentPng
}
export default tryUrls