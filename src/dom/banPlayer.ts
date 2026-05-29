import { client } from "../client";

/**
 * Tries to ban a player from the playerlist
 * @param {Number} id the players id
 */
export function banPlayer(id: number) {
  const reason = prompt("Please enter the reason", "Being annoying");
  const duration = Number(prompt("Please enter the ban duration in minutes", "60"));

  client.server.send.MA({ id, duration, reason });
}

/**
 * Tries to kick a player from the playerlist
 * @param {Number} id the players id
 */
export function kickPlayer(id: number) {
  const reason = prompt("Please enter the reason", "Being annoying");

  client.server.send.MA({ id, duration: 0, reason });
}
