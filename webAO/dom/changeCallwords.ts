import { client } from '../client'
import setCookie from '../utils/setCookie';

/**
 * Triggered by a changed callword list
 */
export function changeCallwords() {
    client.callwords = (<HTMLInputElement>(
        document.getElementById("client_callwords")
    )).value.split("\n");
    setCookie("callwords", client.callwords.join("\n"));
}
window.changeCallwords = changeCallwords;