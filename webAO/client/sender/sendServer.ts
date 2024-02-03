import { client } from "../../client.js";
import queryParser from "../../utils/queryParser.js";
const { mode } = queryParser()
/**
 * Hook for sending messages to the server
 * @param {string} message the message to send
 */
export const sendServer = (message: string) => {
    console.debug("C: "+message)
    mode === "replay" ? client.sender.sendSelf(message) : client.serv.send(message);
}