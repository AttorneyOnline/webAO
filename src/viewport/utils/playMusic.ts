import { client } from "../../client";
import { AO_HOST } from "../../client/aoHost";
import { appendICLog } from "../../client/appendICLog";
import type * as aolib from "../../aolib";

/** MC: server announces a music change; switch the channel and log it. */
export function playMusicChange(packet: aolib.MCPacket) {
  const music = client.viewport.music[packet.channel];
  music.pause();
  if (packet.name.startsWith("http")) {
    music.src = packet.name;
  } else {
    music.src = `${AO_HOST}sounds/music/${encodeURI(packet.name.toLowerCase())}`;
  }
  music.loop = packet.looping;
  music.play().catch(() => {});

  const musicname: string | undefined = client.chars[packet.char_id]?.name;
  const looptext = packet.looping ? "(looping)" : "";
  if (musicname) {
    appendICLog(`changed music to ${packet.name} ${looptext}`, packet.showname, musicname);
  } else {
    appendICLog(`The music was changed to ${packet.name} ${looptext}`, packet.showname);
  }

  document.getElementById("client_trackstatustext")!.innerText = packet.name;
}

/**
 * RMC: music seek to a specific offset. Undocumented; not in the
 * official Packet Reference. `toTime` is a seconds string the legacy
 * audio element parses with `parseFloat`.
 */
export function applyMusicSeek(packet: aolib.RMCPacket) {
  client.viewport.music.pause();
  const { music } = client.viewport;
  music.totime = packet.toTime;
  music.offset = new Date().getTime() / 1000;
  music.addEventListener(
    "loadedmetadata",
    () => {
      music.currentTime += parseFloat(
        music.totime + (new Date().getTime() / 1000 - music.offset),
      ).toFixed(3);
      music.play().catch(() => {});
    },
    false,
  );
}
