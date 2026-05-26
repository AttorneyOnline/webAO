import { client } from "../client";

/**
 * Declare the defendant not guilty
 */
export function guilty() {
  client.sender.sendRT("judgeruling#1");
}
window.guilty = guilty;
