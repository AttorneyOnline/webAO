import { CHATBOX, setCHATBOX } from "../client.js";
import chatbox_arr from "../styles/chatbox/chatboxes.js";
import setCookie from "../utils/setCookie.js";

/**
 * Set the style of the chatbox
 */
export function setChatbox(setstyle: string) {
    const chatbox_theme = <HTMLAnchorElement>(
        document.getElementById("chatbox_theme")
    );
    const themeselect = <HTMLSelectElement>(
        document.getElementById("client_chatboxselect")
    );
    setCHATBOX(themeselect.value);

    setCookie("chatbox", CHATBOX);
    if (CHATBOX === "dynamic") {
        const style = setstyle.replace("chat","");
        if (chatbox_arr.includes(style)) {
            chatbox_theme.href = `styles/chatbox/${style}.css`;
        } else {
            chatbox_theme.href = "styles/chatbox/aa.css";
        }
    } else {
        chatbox_theme.href = `styles/chatbox/${CHATBOX}.css`;
    }
}
// @ts-ignore
window.setChatbox = setChatbox;
