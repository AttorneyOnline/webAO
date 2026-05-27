/**
 * Hides and shows any html element
 */
export function toggleElement(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) return;
  if (element.style.display !== "none") {
    element.style.display = "none";
  } else {
    element.style.display = "block";
  }
}
export default toggleElement;
