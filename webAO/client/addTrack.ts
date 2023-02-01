import { client } from "../client";
import { unescapeChat } from "../encoding";
import { getFilenameFromPath } from "../utils/paths";


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