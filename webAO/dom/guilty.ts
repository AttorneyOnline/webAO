/**
 * Declare the defendant not guilty
 */
export function guilty() {
  client.sendRT("judgeruling#1");
}
window.guilty = guilty;
