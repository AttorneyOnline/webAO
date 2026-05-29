import { client } from "../client";
import type * as aolib from "../aolib";

/**
 * HP: defense or prosecution health bar update. `bar === 1` is defense;
 * any other value is prosecution. `value` is 0..10; we paint that as a
 * width percentage on the `.health-bar` child.
 */
export const applyHealthBar = (packet: aolib.Out<typeof aolib.HP>) => {
  const percent_hp = packet.value * 10;
  let healthbox;
  if (packet.bar === 1) {
    client.hp[0] = packet.value;
    healthbox = document.getElementById("client_defense_hp");
  } else {
    client.hp[1] = packet.value;
    healthbox = document.getElementById("client_prosecutor_hp");
  }
  (<HTMLElement>healthbox.getElementsByClassName("health-bar")[0]).style.width =
    `${percent_hp}%`;
};
