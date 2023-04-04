/**
 * Handles the kicked packet
 * @param {string} type is it a kick or a ban
 * @param {string} reason why
 */
export const handleBans = (type: string, reason: string) => {
    document.getElementById("client_error")!.style.display = "flex";
    document.getElementById(
        "client_errortext"
    )!.innerHTML = `${type}:<br>${reason.replace(/\n/g, "<br />")}`;
    (<HTMLElement>(
        document.getElementById("client_reconnect")
    )).style.display = "none";
    alert(type+":\r"+reason)
}