import { client } from "../client";
import * as aolib from "../aolib";



/**
 * Handles a change in the health bars' states.
 */
export const applyHealthBar = (packet: aolib.Out<typeof aolib.HP>) => {
  const percent_hp = packet.value * 10;
  let healthbox;
  if (packet.bar === 1) {
    // Def hp
    client.hp[0] = packet.value;
    healthbox = document.getElementById("client_defense_hp");
  } else {
    // Pro hp
    client.hp[1] = packet.value;
    healthbox = document.getElementById("client_prosecutor_hp");
  }
  (<HTMLElement>healthbox.getElementsByClassName("health-bar")[0]).style.width =
    `${percent_hp}%`;
};

/**
 * Sends a health point change.
 */