import { setOldLoading } from '../client.js'
export const isLowMemory = () => {
    if (
        /webOS|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|PlayStation|Nintendo|Opera Mini/i.test(
            navigator.userAgent
        )
    ) {
        setOldLoading(true);
    }
}
