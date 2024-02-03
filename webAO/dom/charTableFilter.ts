import { client } from '../client.js'
/**
 * Triggered when the music search bar is changed
 * @param {MouseEvent} event
 */
export function chartable_filter(_event: Event) {
    const searchname = (<HTMLInputElement>(
        document.getElementById("client_charactersearch")
    )).value;

    client.chars.forEach((character: any, charid: number) => {
        const demothing = document.getElementById(`demo_${charid}`)!;
        if (character.name.toLowerCase().indexOf(searchname.toLowerCase()) === -1) {
            demothing.style.display = "none";
        } else {
            demothing.style.display = "inline-block";
        }
    });
}
window.chartable_filter = chartable_filter;