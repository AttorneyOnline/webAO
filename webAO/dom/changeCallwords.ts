import { client } from '../client.js'
import setCookie from '../utils/setCookie.js';

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