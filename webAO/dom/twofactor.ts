import { client } from "../client.js";
import setCookie from "../utils/setCookie.js";

export function hcallback(hcaptcharesponse: string) {
    setCookie('hdid', client.hdid);
    client.sender.sendServer(`2T#${hcaptcharesponse}#%`);
    location.reload();
}

window.hcallback = hcallback;