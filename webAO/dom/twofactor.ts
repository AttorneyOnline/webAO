import { client } from "../client";

function handleCredentialResponse(response: any) {
    console.log(response);
    client.sender.sendServer(`2T#${response.credential}#%`);
  }
window.handleCredentialResponse = handleCredentialResponse;

export function showFactorDialog() {
  document.getElementById("client_secondfactor").style.display = "block";
}