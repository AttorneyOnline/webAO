import { client } from "../client";

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

/**
 * Tries to mute or unmute a player from the playerlist
 * @param {Number} id the players id
 */
export function mutePlayer(id: number) {
  const playerRow = <HTMLTableElement>(
    document.getElementById(`client_playerlist_entry${id}`)
  );
  const charName = <HTMLElement>playerRow.childNodes[1].innerText;

  const mutelist = <HTMLSelectElement>document.getElementById("mute_select");

  let selected_character = mutelist.options[id];

  mutelist.forEach((mutechar: HTMLOptionElement) => {
    if (mutechar.innerText == charName || mutechar.innerText == `${charName} (muted)`)
      selected_character = mutechar;
  });

  

  if (client.chars[selected_character.value].muted === false) {
    client.chars[selected_character.value].muted = true;
    selected_character.text = `${client.chars[selected_character.value].name} (muted)`;
    console.info(`muted ${client.chars[selected_character.value].name}`);
  } else {
    client.chars[selected_character.value].muted = false;
    selected_character.text = client.chars[selected_character.value].name;
  }
}
window.kickPlayer = kickPlayer;
