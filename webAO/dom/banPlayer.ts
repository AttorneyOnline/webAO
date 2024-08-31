import { client } from '../client'

/**
 * Tries to ban a player from the playerlist
 * @param {Number} id the players id
 */
export function banPlayer(id: number) {
    let reason;
    let length;
    reason = prompt("Please enter the reason", "Being annoying");
    length = Number(prompt("Please enter the ban length in minutes", "60"));

    client.sender.sendMA(id, length, reason);
}
window.banPlayer = banPlayer;

/**
 * Tries to kick a player from the playerlist
 * @param {Number} id the players id
 */
export function kickPlayer(id: number) {
    let reason;
    reason = prompt("Please enter the reason", "Being annoying");

    client.sender.sendMA(id, 0, reason);
}
window.kickPlayer = kickPlayer;