import { client } from "../../client";
import { CT } from "../../packets/types/CT";
import { saveChatlogHandle } from "../../client/saveChatLogHandle";
/**
 * Sends an out-of-character chat message.
 * @param {string} message the message to send
 */
export const sendOOC = (message: string) => {
  const nameInput = <HTMLInputElement>document.getElementById("OOC_name");
  localStorage.setItem("OOC_name", nameInput.value);

  const commands = {
    "/save_chatlog": saveChatlogHandle,
  };
  const commandsMap = new Map(Object.entries(commands));

  if (message && commandsMap.has(message.toLowerCase())) {
    try {
      commandsMap.get(message.toLowerCase())();
    } catch (e) {
      // Command Not Recognized
    }
  } else {
    client.sender.sendServer(CT.encode({ name: nameInput.value, message }));
  }
};
