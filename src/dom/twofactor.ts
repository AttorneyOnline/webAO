import { client } from "../client";

export function hcallback(hcaptcharesponse: string) {
  localStorage.setItem("hdid", client.hdid);
  client.sender.sendServer(`2T#${hcaptcharesponse}#%`);
  location.reload();
}

window.hcallback = hcallback;
