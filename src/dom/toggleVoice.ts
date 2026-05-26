import { toggleVoice as voiceToggle } from "../voice/voiceUI";

export function toggleVoice() {
  void voiceToggle();
}
window.toggleVoice = toggleVoice;
