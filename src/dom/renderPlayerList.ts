import { client } from "../client";
import { AO_HOST } from "../client/aoHost";
import { banPlayer, kickPlayer } from "./banPlayer";
import { pairPlayer } from "./pairPlayer";
import {
  getSpeakingUids,
  isLocalSpeaking,
  getLocalPlayerID,
  isVoiceAvailable,
} from "../voice/voice";

export function renderPlayerList() {
  const list = document.getElementById("client_playerlist") as HTMLTableElement;
  list.innerHTML = "";

  const header = list.createTHead().insertRow();
  for (const label of ["Icon", "Character", "Showname", "OOC Name"]) {
    const th = document.createElement("th");
    th.textContent = label;
    header.appendChild(th);
  }

  const voiceActive = isVoiceAvailable();
  const speakingSet = voiceActive ? new Set(getSpeakingUids()) : new Set<number>();
  const localUID = voiceActive ? getLocalPlayerID() : -1;
  const localTalking = voiceActive && isLocalSpeaking();

  const body = list.createTBody();
  for (const [playerID, player] of client.playerlist) {
    const playerRow = body.insertRow();
    playerRow.id = `client_playerlist_entry${playerID}`;
    playerRow.style.display = player.area === client.area ? "" : "none";

    const isSpeaking =
      voiceActive &&
      ((playerID === localUID && localTalking) || speakingSet.has(playerID));

    const imgCell = playerRow.insertCell(0);
    imgCell.style.width = "64px";
    if (isSpeaking) {
      imgCell.classList.add("voice-speaking-cell");
    }
    const img = document.createElement("img");
    img.style.maxWidth = "60px";
    img.style.maxHeight = "60px";
    if (player.charName) {
      const iconExt = client.charicon_extensions[0] || ".png";
      img.src = `${AO_HOST}characters/${encodeURI(player.charName.toLowerCase())}/char_icon${iconExt}`;
      img.alt = player.charName;
      img.title = player.charName;
    }
    imgCell.appendChild(img);

    const charNameCell = playerRow.insertCell(1);
    charNameCell.textContent =
      player.charName ? `[${playerID}] ${player.charName}` : "";

    const showNameCell = playerRow.insertCell(2);
    showNameCell.textContent = player.showName;

    const oocNameCell = playerRow.insertCell(3);
    oocNameCell.textContent = player.name;

    const kickCell = playerRow.insertCell(4);
    kickCell.style.width = "64px";
    const kick = document.createElement("button");
    kick.innerText = "Kick";
    kick.onclick = () => kickPlayer(playerID);
    kickCell.appendChild(kick);

    const banCell = playerRow.insertCell(5);
    banCell.style.width = "64px";
    const ban = document.createElement("button");
    ban.innerText = "Ban";
    ban.onclick = () => banPlayer(playerID);
    banCell.appendChild(ban);

    const pairCell = playerRow.insertCell(6);
    pairCell.style.width = "32px";
    pairCell.classList.add("playerlist-pair-cell");
    const pair = document.createElement("button");
    pair.classList.add("playerlist-pair-button");
    pair.innerText = "\u{1F517}";
    pair.title = `Pair with [${playerID}] ${player.charName || player.showName || player.name || "player"}`;
    pair.setAttribute("aria-label", pair.title);
    pair.onclick = () => pairPlayer(playerID);
    pairCell.appendChild(pair);
  }
}
