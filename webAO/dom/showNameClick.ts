import setCookie from "../utils/setCookie.js";


/**
 * Triggered when the showname checkboc is clicked
 * @param {MouseEvent} event
 */
export function showname_click(_event: Event | null) {
    setCookie(
        "showname",
        String((<HTMLInputElement>document.getElementById("showname")).checked)
    );
    setCookie(
        "ic_chat_name",
        (<HTMLInputElement>document.getElementById("ic_chat_name")).value
    );

    const css_s = <HTMLAnchorElement>document.getElementById("nameplate_setting");

    if ((<HTMLInputElement>document.getElementById("showname")).checked) {
        css_s.href = "styles/shownames.css";
    } else {
        css_s.href = "styles/nameplates.css";
    }
}
// @ts-ignore
window.showname_click = showname_click;
