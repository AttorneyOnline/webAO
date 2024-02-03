import { lastICMessageTime, setLastICMessageTime } from "../client.js";



/**
 * Appends a message to the in-character chat log.
 * @param {string} msg the string to be added
 * @param {string} name the name of the sender
 */
export function appendICLog(
    msg: string,
    showname = "",
    nameplate = "",
    time = new Date()
) {
    const entry = document.createElement("p");
    const shownameField = document.createElement("span");
    const nameplateField = document.createElement("span");
    const textField = document.createElement("span");
    nameplateField.className = "iclog_name iclog_nameplate";
    nameplateField.appendChild(document.createTextNode(nameplate));

    shownameField.className = "iclog_name iclog_showname";
    if (showname === "" || !showname) {
        shownameField.appendChild(document.createTextNode(nameplate));
    } else {
        shownameField.appendChild(document.createTextNode(showname));
    }

    textField.className = "iclog_text";
    textField.appendChild(document.createTextNode(msg));

    entry.appendChild(shownameField);
    entry.appendChild(nameplateField);
    entry.appendChild(textField);

    // Only put a timestamp if the minute has changed.
    if (lastICMessageTime.getMinutes() !== time.getMinutes()) {
        const timeStamp = document.createElement("span");
        timeStamp.className = "iclog_time";
        timeStamp.innerText = time.toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
        });
        entry.appendChild(timeStamp);
    }

    const clientLog = document.getElementById("client_log")!;
    clientLog.appendChild(entry);

    if (clientLog.scrollTop+clientLog.offsetHeight+120>clientLog.scrollHeight)
        clientLog.scrollTo(0, clientLog.scrollHeight);

    setLastICMessageTime(new Date());
}