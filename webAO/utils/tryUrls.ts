import {client} from "../client.ts"
import {AO_HOST} from "../client/aoHost.ts"
import {fileExistsManifest} from './fileExists'
import transparentPng from '../constants/transparentPng'
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
        const exists = await fileExistsManifest(client.manifest,
                                                AO_HOST,
                                                fullFileUrl);
        if (exists) {
            return fullFileUrl
        }
    }
    return transparentPng
}
export default tryUrls
