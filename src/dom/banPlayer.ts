import { sendMA } from "../packets/MA";

/**
 * Tries to ban a player from the playerlist
 * @param {Number} id the players id
 */
export function banPlayer(id: number) {
  const reason = prompt("Please enter the reason", "Being annoying");
  const length = Number(prompt("Please enter the ban length in minutes", "60"));

  sendMA({ id, length, reason });
}

/**
 * Tries to kick a player from the playerlist
 * @param {Number} id the players id
 */
export function kickPlayer(id: number) {
  const reason = prompt("Please enter the reason", "Being annoying");

  sendMA({ id, length: 0, reason });
}
