/**
 * Highlights and selects an effect for in-character chat.
 * If the same effect button is selected, then the effect is canceled.
 */
export function toggleEffect(button: HTMLElement): void {
  if (button.classList.contains("dark")) {
    button.className = "client_button";
  } else {
    button.className = "client_button dark";
  }
}
export default toggleEffect;
