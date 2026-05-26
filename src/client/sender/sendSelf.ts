import { client } from "../../client";

/**
 * Hook for sending messages to the client
 * @param {string} message the message to send
 */
export const sendSelf = (message: string) => {
  (<HTMLInputElement>document.getElementById("client_ooclog")).value +=
    `${message}\r\n`;
  client.handleSelf(message);
};
