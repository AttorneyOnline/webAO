import { client } from "../client";

/**
 * Triggered by a changed callword list
 */
export function changeCallwords() {
  client.callwords = (<HTMLInputElement>(
    document.getElementById("client_callwords")
  )).value.split("\n");
  localStorage.setItem("callwords", client.callwords.join("\n"));
}
window.changeCallwords = changeCallwords;
