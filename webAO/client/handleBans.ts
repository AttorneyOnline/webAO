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
        document.getElementsByClassName("client_reconnect")[0]
    )).style.display = "none";
    (<HTMLElement>(
        document.getElementsByClassName("client_reconnect")[1]
    )).style.display = "none";
    alert(type+":\r"+reason)
}