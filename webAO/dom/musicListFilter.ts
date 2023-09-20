import { client } from '../client'
/**
 * Triggered when the music search bar is changed
 * @param {MouseEvent} event
 */
export function musiclist_filter(_event: Event) {
    const musiclist_element = <HTMLSelectElement>(
    document.getElementById("client_musiclist")
  );
    const searchname = (<HTMLInputElement>(
    document.getElementById("client_musicsearch")
  )).value;

    musiclist_element.innerHTML = "";

    for (const trackname of client.musics) {
        if (trackname.toLowerCase().indexOf(searchname.toLowerCase()) !== -1) {
            const newentry = <HTMLOptionElement>document.createElement("OPTION");
            newentry.text = trackname;
            musiclist_element.options.add(newentry);
        }
    }
}
window.musiclist_filter = musiclist_filter;