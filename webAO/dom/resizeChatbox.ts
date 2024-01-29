import { CHATBOX } from "../client";
/**
 * Set the font size for the chatbox
 */
export function resizeChatbox() {
    const chatContainerBox = document.getElementById("client_chatcontainer");
    const clockBox = document.getElementById("client_clock");
    const trackstatusBox = document.getElementById("client_trackstatus");

    const gameHeight = document.getElementById("client_background")!.offsetHeight;

    chatContainerBox.style.fontSize = `${(gameHeight * 0.0521).toFixed(1)}px`;
    clockBox.style.fontSize = `${(gameHeight * 0.0521).toFixed(1)}px`;
    trackstatusBox.style.fontSize = `${(gameHeight * 0.0521).toFixed(1)}px`;

    const trackstatus = <HTMLMarqueeElement>(document.getElementById("client_trackstatustext"));
    trackstatus.style.width = (trackstatus.offsetWidth - 1) + "px";


    //clock
    const now = new Date();
    let weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById("client_clock_month")!.innerText = month[now.getMonth()];
    if (CHATBOX == "acww") {
        weekday = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
        document.getElementById("client_clock_weekday")!.innerText = weekday[now.getDay()];
        document.getElementById("client_clock_date")!.innerText = now.getDay() + "/" + now.getMonth();
        document.getElementById("client_clock_time")!.innerText = now.getHours() + ":" + now.getMinutes();
    } else if (CHATBOX == "key") {
        weekday = ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."];
        document.getElementById("client_clock_weekday")!.innerText = weekday[now.getDay()];
        document.getElementById("client_clock_date")!.innerText = String(now.getDate());
    }

}
// @ts-ignore
window.resizeChatbox = resizeChatbox;
