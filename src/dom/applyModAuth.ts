import type * as aolib from "../aolib";

/** AUTH: `auth_state === 1` swaps in the mod stylesheet. */
export const applyModAuth = (packet: aolib.Out<typeof aolib.AUTH>) => {
  if (packet.auth_state === 1) {
    (<HTMLAnchorElement>document.getElementById("mod_ui")).href = `styles/mod.css`;
  }
};
