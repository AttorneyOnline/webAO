import { safeTags, decodeChat } from "../../encoding";
import { client } from "../../client";
import { AO_HOST } from "../../client/aoHost";
import { appendICLog } from "../../client/appendICLog";
import type { MCPacket } from "../types/MC";

/**
 * Handles a music change to an arbitrary resource.
 */
export const handleMC = (packet: MCPacket) => {
  const track = safeTags(decodeChat(packet.track));
  let charID = packet.charId;
  const showname = packet.showname || "";
  const looping = Boolean(packet.looping);
  const channel = packet.channel ?? 0;
  // const fading = packet.effects ?? 0; // unused in web

  const music = client.viewport.music[channel];
  let musicname;
  music.pause();
  if (track.startsWith("http")) {
    music.src = track;
  } else {
    music.src = `${AO_HOST}sounds/music/${encodeURI(track.toLowerCase())}`;
  }
  music.loop = looping;
  music.play().catch(() => {});

  try {
    musicname = client.chars[charID].name;
  } catch (e) {
    charID = -1;
  }

  let looptext = "";

  if (looping)
    looptext = "(looping)";

  if (charID >= 0) {
    musicname = client.chars[charID].name;
    appendICLog(`changed music to ${track} ${looptext}`, showname, musicname);
  } else {
    appendICLog(`The music was changed to ${track} ${looptext}`, showname);
  }

  document.getElementById("client_trackstatustext")!.innerText = track;
};
