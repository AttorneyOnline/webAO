import { client } from '../client'
/**
 * Tries to ban a player from the playerlist
 * @param {Number} id the players id
 */
export function banPlayer(id: number) {
    let reason;
    let length;
    reason = prompt("Please enter the ban reason", "");
    length = Number(prompt("Please enter the ban length in hours", ""));

    client.sender.sendMA(id, length, reason);
}
window.banPlayer = banPlayer;