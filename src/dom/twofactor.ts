import { client } from "../client";

export function hcallback(hcaptcharesponse: string) {
  localStorage.setItem("hdid", client.hdid);
  client.sendToServer(`2T#${hcaptcharesponse}#%`);
  location.reload();
}

