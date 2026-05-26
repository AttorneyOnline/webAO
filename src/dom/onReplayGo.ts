import { client } from "../client";

/**
 * Triggered when the user click replay GOOOOO
 * @param {KeyboardEvent} event
 */
export function onReplayGo(_event: Event) {
  client.handleReplay();
}
window.onReplayGo = onReplayGo;
