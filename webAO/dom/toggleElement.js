/**
 * Hides and shows any html element
 * @param {string} element_id the id of the element to toggle
 */
export function toggleElement(element_id) {
  const element = document.getElementById(element_id);
  if (element.style.display !== 'none') {
    element.style.display = 'none';
  } else {
    element.style.display = 'block';
  }
}
window.toggleElement = toggleElement;
