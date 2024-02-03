import { client } from '../../client.js'
import { escapeChat } from '../../encoding.js';
import setCookie from '../../utils/setCookie.js';
import { saveChatlogHandle } from '../saveChatLogHandle.js'
/**
 * Sends an out-of-character chat message.
 * @param {string} message the message to send
 */
export const sendOOC = (message: string) => {
    setCookie(
        "OOC_name",
        (<HTMLInputElement>document.getElementById("OOC_name")).value
    );
    const oocName = `${escapeChat(
        (<HTMLInputElement>document.getElementById("OOC_name")).value
    )}`;
    const oocMessage = `${escapeChat(message)}`;

    const commands = {
        "/save_chatlog": saveChatlogHandle,
    };
    const commandsMap = new Map(Object.entries(commands));

    if (oocMessage && commandsMap.has(oocMessage.toLowerCase())) {
        try {
            commandsMap.get(oocMessage.toLowerCase())();
        } catch (e) {
            // Command Not Recognized
        }
    } else {
        client.sender.sendServer(`CT#${oocName}#${oocMessage}#%`);
    }
}