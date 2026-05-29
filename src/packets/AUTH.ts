import * as aolib from "../aolib";

/** `auth_state === 1` activates the mod UI; anything else leaves it inactive. */
export function applyModAuth(packet: aolib.Out<typeof aolib.AUTH>) {
  if (packet.auth_state === 1) {
    (<HTMLAnchorElement>document.getElementById("mod_ui")).href = `styles/mod.css`;
  }
}
