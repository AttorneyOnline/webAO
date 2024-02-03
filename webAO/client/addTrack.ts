import { client } from "../client.js";
import { unescapeChat } from "../encoding.js";
import { getFilenameFromPath } from "../utils/paths.js";


export const addTrack = (trackname: string) => {
    const newentry = <HTMLOptionElement>document.createElement("OPTION");
    const songName = getFilenameFromPath(trackname);
    newentry.text = unescapeChat(songName);
    newentry.value = trackname;
    (<HTMLSelectElement>(
        document.getElementById("client_musiclist")
    )).options.add(newentry);
    client.musics.push(trackname);
}