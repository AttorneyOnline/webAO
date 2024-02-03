import { client } from '../client.js'
import setCookie from '../utils/setCookie.js';

/**
 * Triggered by the theme selector.
 */
export const reloadTheme = () => {
    client.viewport.setTheme((<HTMLSelectElement>document.getElementById("client_themeselect"))
        .value);

    setCookie("theme", client.viewport.getTheme());
    (<HTMLAnchorElement>(
        document.getElementById("client_theme")
    )).href = `styles/${client.viewport.getTheme()}.css`;
}
// @ts-ignore
window.reloadTheme = reloadTheme;
