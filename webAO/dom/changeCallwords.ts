import { callwords, setCallwords } from "../client";
import setCookie from "../utils/setCookie";

/**
 * Triggered by a changed callword list
 */
export function changeCallwords() {
  const newCallwords = (<HTMLInputElement>(
    document.getElementById("client_callwords")
  )).value.split("\n");
  setCallwords(newCallwords);
  setCookie("callwords", callwords.join("\n"));
}
window.changeCallwords = changeCallwords;
