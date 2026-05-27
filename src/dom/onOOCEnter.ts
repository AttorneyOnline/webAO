import { saveChatlogHandle } from "../client/saveChatLogHandle";
import { sendCT } from "../packets/CT";

const OOC_COMMANDS = new Map<string, () => void>([
  ["/save_chatlog", saveChatlogHandle],
]);

/**
 * Triggered when the Return key is pressed on the out-of-character chat input box.
 * Intercepts a small set of client-side slash commands (e.g. `/save_chatlog`)
 * before forwarding the message to the server.
 */
export function onOOCEnter(event: KeyboardEvent) {
  if (event.key !== "Enter") return;

  const inputbox = <HTMLInputElement>document.getElementById("client_oocinputbox");
  const message = inputbox.value;
  const name = (<HTMLInputElement>document.getElementById("OOC_name")).value;
  localStorage.setItem("OOC_name", name);

  const command = OOC_COMMANDS.get(message.toLowerCase());
  if (command) {
    try {
      command();
    } catch {
      // Command Not Recognized
    }
  } else {
    sendCT({ name, message });
  }

  inputbox.value = "";
}
window.onOOCEnter = onOOCEnter;
