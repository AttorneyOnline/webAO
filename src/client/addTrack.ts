import { client } from "../client";
import { safeHtmlTags } from "../escaping";
import { getFilenameFromPath } from "../utils/paths";

export const addTrack = (trackname: string) => {
  const newentry = <HTMLOptionElement>document.createElement("OPTION");
  const songName = getFilenameFromPath(trackname);
  // aolib's str field already unescaped chat-meta tokens before we got here.
  newentry.text = safeHtmlTags(songName);
  newentry.value = trackname;
  (<HTMLSelectElement>document.getElementById("client_musiclist")).options.add(
    newentry,
  );
  client.musics.push(trackname);
};
