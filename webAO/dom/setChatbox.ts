import setCookie from "../utils/setCookie";
import chatbox_arr from "../styles/chatbox/chatboxes";
/**
 * Set the style of the chatbox
 */
export function setChatbox(style: string) {
  const chatbox_theme = <HTMLAnchorElement>(
    document.getElementById("chatbox_theme")
  );
  const themeselect = <HTMLSelectElement>(
    document.getElementById("client_chatboxselect")
  );
  const selected_theme = themeselect.value;

  setCookie("chatbox", selected_theme);
  if (selected_theme === "dynamic") {
    if (chatbox_arr.includes(style)) {
      chatbox_theme.href = `styles/chatbox/${style}.css`;
    } else {
      chatbox_theme.href = "styles/chatbox/aa.css";
    }
  } else {
    chatbox_theme.href = `styles/chatbox/${selected_theme}.css`;
  }
}
window.setChatbox = setChatbox;
