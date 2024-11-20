/* eslint no-param-reassign: ["error",
{ "props": true, "ignorePropertyModificationsFor": ["button"] }] */
/**
 * Highlights and selects an effect for in-character chat.
 * If the same effect button is selected, then the effect is canceled.
 * @param {string} effect the new effect to be selected
 */
export function toggleEffect(button) {
  if (button.classList.contains("dark")) {
    button.className = "client_button";
  } else {
    button.className = "client_button dark";
  }
}
window.toggleEffect = toggleEffect;
export default toggleEffect;
