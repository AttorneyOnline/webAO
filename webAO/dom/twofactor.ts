import { client } from "../client";
import setCookie from "../utils/setCookie";

export function hcallback(hcaptcharesponse: string) {
  setCookie("hdid", client.hdid);
  client.sender.sendServer(`2T#${hcaptcharesponse}#%`);
  location.reload();
}

window.hcallback = hcallback;
