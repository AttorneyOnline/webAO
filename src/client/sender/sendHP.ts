import { client } from "../../client";
import { HP } from "../../packets/HP";

/**
 * Sends health point command.
 * @param {number} side the position
 * @param {number} hp the health point
 */
export const sendHP = (side: number, hp: number) => {
  client.sender.sendServer(HP.encode({ bar: side, value: hp }));
};
