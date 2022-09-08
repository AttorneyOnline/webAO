/**
 * Triggered by the change aspect ratio checkbox
 */
export async function switchChatOffset() {
    const container = document.getElementById("client_chatcontainer")!;
    if (
        (<HTMLInputElement>document.getElementById("client_hdviewport_offset"))
            .checked
    ) {
        container.style.width = "80%";
        container.style.left = "10%";
    } else {
        container.style.width = "100%";
        container.style.left = "0";
    }
}
window.switchChatOffset = switchChatOffset;