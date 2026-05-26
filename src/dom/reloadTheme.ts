import { client } from "../client";

/**
 * Triggered by the theme selector.
 */
export const reloadTheme = () => {
  const themeSelect = <HTMLSelectElement>document.getElementById("client_themeselect");
  const customCSSRow = document.getElementById("client_customcss_row");

  client.viewport.setTheme(themeSelect.value);

  // Show/hide custom CSS import row
  if (customCSSRow) {
    customCSSRow.style.display = themeSelect.value === "custom" ? "block" : "none";
  }

  if (themeSelect.value === "custom") {
    // Apply previously saved custom CSS if available
    const savedCustomCSS = localStorage.getItem("customCSS");
    if (savedCustomCSS) {
      applyCustomCSSText(savedCustomCSS);
    }
    localStorage.setItem("theme", "custom");
    return;
  }

  localStorage.setItem("theme", client.viewport.getTheme());
  (<HTMLAnchorElement>document.getElementById("client_theme")).href =
    `styles/${client.viewport.getTheme()}.css`;
};
window.reloadTheme = reloadTheme;

/**
 * Apply an inline CSS string as the active theme.
 */
function applyCustomCSSText(css: string) {
  let styleEl = document.getElementById("client_custom_style") as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "client_custom_style";
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = css;
  // Clear the file-based theme link so they don't conflict
  (<HTMLAnchorElement>document.getElementById("client_theme")).href = "";
}

/**
 * Triggered by the custom CSS file input.
 */
export const importCustomCSS = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  if (!file.name.endsWith(".css")) {
    alert("Please select a .css file.");
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const css = e.target?.result as string;
    localStorage.setItem("customCSS", css);
    applyCustomCSSText(css);
  };
  reader.readAsText(file);
};
window.importCustomCSS = importCustomCSS;
