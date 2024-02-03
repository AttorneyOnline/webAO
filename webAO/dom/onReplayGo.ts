import { client } from "../client.js";

/**
 * Triggered when the user click replay GOOOOO
 * @param {KeyboardEvent} event
 */
export function onReplayGo(_event: Event) {
    client.handleReplay();
}
// @ts-ignore
window.onReplayGo = onReplayGo;
