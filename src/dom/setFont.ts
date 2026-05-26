/**
 * Apply and persist the selected dialogue font.
 */
export function setFont() {
  const fontSelect = <HTMLSelectElement>document.getElementById("client_fontselect");
  const customFontInput = <HTMLInputElement>document.getElementById("client_customfont");
  let fontValue = fontSelect.value;

  if (fontValue === "custom") {
    fontValue = customFontInput.value.trim() || "sans-serif";
  }

  document.body.style.fontFamily = fontValue;
  localStorage.setItem("selectedFont", fontSelect.value);
  localStorage.setItem("customFont", customFontInput.value);

  // Show/hide custom font input row
  const customRow = document.getElementById("client_customfont_row");
  if (customRow) {
    customRow.style.display = fontSelect.value === "custom" ? "block" : "none";
  }
}
window.setFont = setFont;

/**
 * Apply a custom font typed by the user.
 */
export function applyCustomFont() {
  const customFontInput = <HTMLInputElement>document.getElementById("client_customfont");
  const fontValue = customFontInput.value.trim() || "sans-serif";
  document.body.style.fontFamily = fontValue;
  localStorage.setItem("customFont", customFontInput.value);
}
window.applyCustomFont = applyCustomFont;
