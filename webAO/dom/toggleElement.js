/**
 * Hides and shows any html element
 * @param {string} elementId the id of the element to toggle
 */
export function toggleElement(elementId) {
  const element = document.getElementById(elementId);
  if (element.style.display !== "none") {
    element.style.display = "none";
  } else {
    element.style.display = "block";
  }
}
window.toggleElement = toggleElement;
export default toggleElement;
