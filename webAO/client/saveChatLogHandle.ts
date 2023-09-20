import downloadFile from "../services/downloadFile";

export const saveChatlogHandle = async () => {
    const clientLog = document.getElementById("client_log")!;
    const icMessageLogs = clientLog.getElementsByTagName("p");
    const messages: string[] = [];

    for (let i = 0; i < icMessageLogs.length; i++) {
        const SHOWNAME_POSITION = 0;
        const TEXT_POSITION = 2;
        const showname = icMessageLogs[i].children[SHOWNAME_POSITION].innerHTML;
        const text = icMessageLogs[i].children[TEXT_POSITION].innerHTML;
        const message = `${showname}: ${text}`;
        messages.push(message);
    }
    const d = new Date();
    const ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
    const mo = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
    const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);

    const filename = `chatlog-${da}-${mo}-${ye}`.toLowerCase();
    downloadFile(messages.join("\n"), filename);

    // Reset Chatbox to Empty
    (<HTMLInputElement>document.getElementById("client_inputbox")).value = "";
};