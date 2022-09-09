import { client } from "../client";
/**
 * Triggered when the Return key is pressed on the out-of-character chat input box.
 * @param {KeyboardEvent} event
 */
export function onOOCEnter(event: KeyboardEvent) {
    if (event.keyCode === 13) {
        client.sender.sendOOC(
            (<HTMLInputElement>document.getElementById("client_oocinputbox")).value
        );
        (<HTMLInputElement>document.getElementById("client_oocinputbox")).value =
            "";
    }
}
window.onOOCEnter = onOOCEnter;
