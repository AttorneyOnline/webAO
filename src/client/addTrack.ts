import { client } from "../client";
import { unescapeFanta, safeHtmlTags } from "../escaping";
import { getFilenameFromPath } from "../utils/paths";

export const addTrack = (trackname: string) => {
  const newentry = <HTMLOptionElement>document.createElement("OPTION");
  const songName = getFilenameFromPath(trackname);
  newentry.text = safeHtmlTags(unescapeFanta(songName));
  newentry.value = trackname;
  (<HTMLSelectElement>document.getElementById("client_musiclist")).options.add(
    newentry,
  );
  client.musics.push(trackname);
};
