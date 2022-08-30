import queryParser from '../../utils/queryParser'
import { prepChat } from '../../encoding'
let { mode } = queryParser();

/**
   * Handles an out-of-character chat message.
   * @param {Array} args packet arguments
   */
export const handleCT = (args: string[]) => {
    if (mode !== "replay") {
        const oocLog = document.getElementById("client_ooclog")!;
        oocLog.innerHTML += `${prepChat(args[1])}: ${prepChat(args[2])}\r\n`;
        if (oocLog.scrollTop > oocLog.scrollHeight - 600) {
            oocLog.scrollTop = oocLog.scrollHeight;
        }
    }
}