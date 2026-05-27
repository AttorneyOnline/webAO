import { client } from "../client";

/**
 * Tries to ban a player from the playerlist
 * @param {Number} id the players id
 */
export function banPlayer(id: number) {
  const reason = prompt("Please enter the reason", "Being annoying");
  const length = Number(prompt("Please enter the ban length in minutes", "60"));

  client.sender.sendMA({ id, length, reason });
}
window.banPlayer = banPlayer;

/**
 * Tries to kick a player from the playerlist
 * @param {Number} id the players id
 */
export function kickPlayer(id: number) {
  const reason = prompt("Please enter the reason", "Being annoying");

  client.sender.sendMA({ id, length: 0, reason });
}
window.kickPlayer = kickPlayer;
