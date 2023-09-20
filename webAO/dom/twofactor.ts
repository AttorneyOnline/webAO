import { client } from "../client";

function handleCredentialResponse(response: any) {
    client.sender.sendServer(`2T#${response.credential}#%`);
}
window.handleCredentialResponse = handleCredentialResponse;

export function showFactorDialog(args: string[]) {
    document.getElementById("client_secondfactor").style.display = args[1];
}