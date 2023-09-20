import { client } from "../../client";
import queryParser from "../../utils/queryParser";
const { mode } = queryParser()
/**
 * Hook for sending messages to the server
 * @param {string} message the message to send
 */
export const sendServer = (message: string) => {
    console.debug("C: "+message)
    mode === "replay" ? client.sender.sendSelf(message) : client.serv.send(message);
}