import { client } from "../client";

function handleCredentialResponse(response: any) {
    client.sender.sendServer(`2T#${response.credential}#%`);
  }
window.handleCredentialResponse = handleCredentialResponse;