import { prepChat } from "../../encoding";
import { client } from "../../client";
import { AO_HOST } from "../../client/aoHost";
import { appendICLog } from "../../client/appendICLog";

/**
 * Handles a music change to an arbitrary resource.
 * @param {Array} args packet arguments
 */
export const handleMC = (args: string[]) => {
  const track = prepChat(args[1]);
  let charID = Number(args[2]);
  const showname = args[3] || "";
  const looping = Boolean(Number(args[4])) || false;
  const channel = Number(args[5]) || 0;
  // const fading = Number(args[6]) || 0; // unused in web

  const music = client.viewport.music[channel];
  let musicname;
  music.pause();
  if (track.startsWith("http")) {
    music.src = track;
  } else {
    music.src = `${AO_HOST}sounds/music/${encodeURI(track.toLowerCase())}`;
  }
  music.loop = looping;
  music.play();

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
    appendICLog(`${musicname} changed music to ${track} ${looptext}`,showname);
  } else {
    appendICLog(`The music was changed to ${track} ${looptext}`,showname);
  }

  document.getElementById("client_trackstatustext")!.innerText = track;
};
