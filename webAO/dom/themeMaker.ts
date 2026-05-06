/**
 * Advanced CSS Theme Maker for LemmyAO
 *
 * Provides a beautiful, intuitive UI for customising every visual aspect of the
 * client. Changes are applied live, persisted to localStorage, and can be
 * exported / imported as a plain .css file.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ThemeConfig {
  // Body
  bodyBg: string;
  bodyColor: string;
  bodyFontFamily: string;
  bodyFontSize: string;
  bodyBgImage: string;       // data-URL or ""
  bodyBgSize: string;        // cover | contain | auto | tile
  bodyBgPosition: string;    // center | top left | …

  // Menu / sidebar
  menuBg: string;
  menuColor: string;

  // Buttons
  buttonBg: string;
  buttonColor: string;
  buttonBorder: string;
  buttonRadius: string;

  // IC log
  logBg: string;
  logColor: string;

  // OOC log
  oocBg: string;
  oocColor: string;

  // Input boxes
  inputBg: string;
  inputColor: string;
  inputBorder: string;

  // IC controls bar
  icControlsBg: string;

  // Tab bar
  tabBg: string;
  tabActiveBg: string;
  tabColor: string;
  tabActiveColor: string;

  // Health bars
  defHpColor: string;
  proHpColor: string;

  // Extra raw CSS appended at the end
  extraCSS: string;
}

const DEFAULT_CONFIG: ThemeConfig = {
  bodyBg: "#ffffff",
  bodyColor: "#000000",
  bodyFontFamily: "sans-serif",
  bodyFontSize: "14",
  bodyBgImage: "",
  bodyBgSize: "cover",
  bodyBgPosition: "center",

  menuBg: "#f0f0f0",
  menuColor: "#000000",

  buttonBg: "#7b2900",
  buttonColor: "#ffffff",
  buttonBorder: "#ffffff",
  buttonRadius: "3",

  logBg: "#ffffff",
  logColor: "#000000",

  oocBg: "#f5f5f5",
  oocColor: "#222222",

  inputBg: "#ffffff",
  inputColor: "#000000",
  inputBorder: "#cccccc",

  icControlsBg: "#f8f8f8",

  tabBg: "#dddddd",
  tabActiveBg: "#bbbbbb",
  tabColor: "#333333",
  tabActiveColor: "#000000",

  defHpColor: "#169de0",
  proHpColor: "#e01f5f",

  extraCSS: "",
};

const PRESETS: Record<string, Partial<ThemeConfig>> = {
  default: {},
  dark: {
    bodyBg: "#121212",
    bodyColor: "#e0e0e0",
    menuBg: "#1a1a1a",
    menuColor: "#e0e0e0",
    buttonBg: "#1e1e1e",
    buttonColor: "#e0e0e0",
    buttonBorder: "#444444",
    logBg: "#111111",
    logColor: "#e0e0e0",
    oocBg: "#1a1a1a",
    oocColor: "#cccccc",
    inputBg: "#222222",
    inputColor: "#e0e0e0",
    inputBorder: "#444444",
    icControlsBg: "#1e1e1e",
    tabBg: "#222222",
    tabActiveBg: "#333333",
    tabColor: "#cccccc",
    tabActiveColor: "#ffffff",
    defHpColor: "#1565c0",
    proHpColor: "#b71c1c",
  },
  sunset: {
    bodyBg: "#1a0a2e",
    bodyColor: "#f5e6ff",
    menuBg: "#2d1b4e",
    menuColor: "#f5e6ff",
    buttonBg: "#c2185b",
    buttonColor: "#ffffff",
    buttonBorder: "#e91e63",
    logBg: "#12071e",
    logColor: "#f5e6ff",
    oocBg: "#1e0d35",
    oocColor: "#e0cfff",
    inputBg: "#2a1550",
    inputColor: "#f5e6ff",
    inputBorder: "#7b1fa2",
    icControlsBg: "#200f38",
    tabBg: "#2d1b4e",
    tabActiveBg: "#5b2685",
    tabColor: "#d1b3ff",
    tabActiveColor: "#ffffff",
    defHpColor: "#7b1fa2",
    proHpColor: "#c2185b",
  },
  ocean: {
    bodyBg: "#0a1628",
    bodyColor: "#b3d9ff",
    menuBg: "#0d1f3c",
    menuColor: "#b3d9ff",
    buttonBg: "#0277bd",
    buttonColor: "#ffffff",
    buttonBorder: "#0288d1",
    logBg: "#060f1e",
    logColor: "#cce5ff",
    oocBg: "#0a1628",
    oocColor: "#90caf9",
    inputBg: "#0d2040",
    inputColor: "#b3d9ff",
    inputBorder: "#1565c0",
    icControlsBg: "#0b1a30",
    tabBg: "#112244",
    tabActiveBg: "#1565c0",
    tabColor: "#90caf9",
    tabActiveColor: "#ffffff",
    defHpColor: "#0288d1",
    proHpColor: "#00838f",
  },
  forest: {
    bodyBg: "#0d1f0d",
    bodyColor: "#c8e6c9",
    menuBg: "#1b3a1b",
    menuColor: "#c8e6c9",
    buttonBg: "#2e7d32",
    buttonColor: "#ffffff",
    buttonBorder: "#388e3c",
    logBg: "#071407",
    logColor: "#dcedc8",
    oocBg: "#112811",
    oocColor: "#a5d6a7",
    inputBg: "#1b3a1b",
    inputColor: "#c8e6c9",
    inputBorder: "#388e3c",
    icControlsBg: "#122012",
    tabBg: "#1b3a1b",
    tabActiveBg: "#2e7d32",
    tabColor: "#a5d6a7",
    tabActiveColor: "#ffffff",
    defHpColor: "#388e3c",
    proHpColor: "#f9a825",
  },
  haschenLemmy: {
    // "Haschen & Lemmy" — inspired by The Coffin of Andy and Leyley.
    // Palette: coffin-dark near-blacks with a rotting brownish-green undertone,
    // sickly parchment/bone text, dried-blood crimson accents.
    bodyBg: "#0c0a06",
    bodyColor: "#c9b882",
    bodyFontFamily: "Georgia, serif",
    menuBg: "#0f0d08",
    menuColor: "#b8a870",
    buttonBg: "#3d0a0a",
    buttonColor: "#e8d5a3",
    buttonBorder: "#7a1515",
    buttonRadius: "1",
    logBg: "#080602",
    logColor: "#c2ab72",
    oocBg: "#0d0b06",
    oocColor: "#a89a60",
    inputBg: "#141008",
    inputColor: "#c9b882",
    inputBorder: "#3d2e10",
    icControlsBg: "#100e08",
    tabBg: "#1a1507",
    tabActiveBg: "#3d0a0a",
    tabColor: "#8a7a45",
    tabActiveColor: "#e8d5a3",
    defHpColor: "#6b3a1f",
    proHpColor: "#8b1a1a",
    extraCSS: `/* Haschen & Lemmy — extra decay touches */
body {
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.18) 2px,
    rgba(0,0,0,0.18) 3px
  );
}
.client_button {
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 11px;
}
.client_button:hover {
  background-color: #5a1010;
  border-color: #a02020;
}
#client_log, #client_ooclog {
  border-left: 2px solid #3d0a0a;
}
.lm_tab.lm_active {
  border-bottom: 2px solid #8b1a1a;
}`,
  },
};

// ─── CSS Generation ───────────────────────────────────────────────────────────

function buildBgImageCSS(config: ThemeConfig): string {
  if (!config.bodyBgImage) return "";
  const sizeValue = config.bodyBgSize === "tile" ? "auto" : config.bodyBgSize;
  const repeatValue = config.bodyBgSize === "tile" ? "repeat" : "no-repeat";
  return `
  background-image: url('${config.bodyBgImage}');
  background-size: ${sizeValue};
  background-repeat: ${repeatValue};
  background-position: ${config.bodyBgPosition};
  background-attachment: fixed;`;
}

export function generateCSS(config: ThemeConfig): string {
  return `/* LemmyAO Theme Maker — generated theme */
body {
  background-color: ${config.bodyBg};
  color: ${config.bodyColor};
  font-family: ${config.bodyFontFamily};
  font-size: ${config.bodyFontSize}px;${buildBgImageCSS(config)}
}

.client_button {
  margin: 1px;
  padding: 2px 15px;
  cursor: pointer;
  text-align: center;
  font-weight: bold;
  color: ${config.buttonColor};
  background-color: ${config.buttonBg};
  border-radius: ${config.buttonRadius}px;
  border-style: solid;
  border-width: 1px;
  border-color: ${config.buttonBorder};
  box-shadow: 1px 1px inset;
}

#client_menu {
  background-color: ${config.menuBg};
  color: ${config.menuColor};
  overflow-y: auto;
  height: 100%;
}

.menu_content {
  background-color: ${config.menuBg};
  color: ${config.menuColor};
}

.menu_text {
  color: ${config.menuColor};
  background-color: ${config.menuBg};
}

#client_log {
  background-color: ${config.logBg};
  color: ${config.logColor};
}

#client_ooclog {
  background-color: ${config.oocBg};
  color: ${config.oocColor};
}

#client_inputbox {
  background-color: ${config.inputBg};
  color: ${config.inputColor};
  border: 1px solid ${config.inputBorder};
}

#client_oocinput {
  background-color: ${config.inputBg};
  color: ${config.inputColor};
}

#client_iccontrols {
  background-color: ${config.icControlsBg};
}

.lm_tab {
  color: ${config.tabColor};
  background-color: ${config.tabBg};
}

.lm_tab.lm_active {
  color: ${config.tabActiveColor};
  background-color: ${config.tabActiveBg};
}

#evi_name {
  background-color: ${config.inputBg};
  color: ${config.inputColor};
  border: 1px solid ${config.inputBorder};
}

#evi_desc {
  flex: 1 auto;
  background-color: ${config.inputBg};
  color: ${config.inputColor};
  border: 1px solid ${config.inputBorder};
}

#client_defense_hp > .health-bar {
  background-color: ${config.defHpColor};
}

#client_prosecutor_hp > .health-bar {
  background-color: ${config.proHpColor};
}

#client_playerlist {
  background-color: ${config.menuBg};
  color: ${config.menuColor};
}

#client_playerlist th,
#client_playerlist td {
  border-bottom: 1px solid ${config.inputBorder};
  color: ${config.menuColor};
}

#client_playerlist th {
  border-bottom: 2px solid ${config.buttonBorder};
}

${config.extraCSS}`;
}

// ─── Persistence ──────────────────────────────────────────────────────────────

const LS_KEY_CONFIG = "themeMakerConfig";
const LS_KEY_CSS = "customCSS";
const LS_KEY_THEME = "theme";

export function saveThemeMakerConfig(config: ThemeConfig): void {
  localStorage.setItem(LS_KEY_CONFIG, JSON.stringify(config));
  const css = generateCSS(config);
  localStorage.setItem(LS_KEY_CSS, css);
  localStorage.setItem(LS_KEY_THEME, "custom");
}

export function loadThemeMakerConfig(): ThemeConfig | null {
  const raw = localStorage.getItem(LS_KEY_CONFIG);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ThemeConfig;
  } catch {
    return null;
  }
}

// ─── Apply CSS ────────────────────────────────────────────────────────────────

function applyThemeMakerCSS(css: string): void {
  let el = document.getElementById("client_custom_style") as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = "client_custom_style";
    document.head.appendChild(el);
  }
  el.textContent = css;
  const themeLink = document.getElementById("client_theme") as HTMLAnchorElement | null;
  if (themeLink) themeLink.href = "";
}

export function applyThemeMakerConfig(config: ThemeConfig): void {
  applyThemeMakerCSS(generateCSS(config));
}

// ─── Modal HTML ───────────────────────────────────────────────────────────────

function injectModalHTML(): void {
  if (document.getElementById("tm_overlay")) return;

  const html = `
<div id="tm_overlay" role="dialog" aria-modal="true" aria-label="Theme Maker" style="display:none">
  <div id="tm_modal" tabindex="-1">
    <div id="tm_header">
      <span id="tm_title">🎨 Theme Maker</span>
      <div id="tm_header_actions">
        <button class="tm_btn tm_btn_secondary" id="tm_import_btn" title="Import a .css or .json theme file">📂 Import</button>
        <button class="tm_btn tm_btn_secondary" id="tm_export_btn" title="Export theme as CSS file">💾 Export CSS</button>
        <button class="tm_btn tm_btn_secondary" id="tm_export_json_btn" title="Export theme as JSON for easy re-import">📋 Export JSON</button>
        <button class="tm_btn tm_btn_close" id="tm_close_btn" title="Close Theme Maker">✕</button>
      </div>
    </div>

    <div id="tm_body">
      <!-- Sidebar / tab list -->
      <nav id="tm_tabs" role="tablist">
        <button class="tm_tab tm_tab_active" data-tab="colors" role="tab" aria-selected="true">🎨 Colors</button>
        <button class="tm_tab" data-tab="background" role="tab" aria-selected="false">🖼 Background</button>
        <button class="tm_tab" data-tab="typography" role="tab" aria-selected="false">✏️ Typography</button>
        <button class="tm_tab" data-tab="advanced" role="tab" aria-selected="false">⚙️ Advanced</button>
        <div id="tm_presets_section">
          <p class="tm_section_label">Quick Presets</p>
          <button class="tm_preset_btn" data-preset="default">☀️ Default</button>
          <button class="tm_preset_btn" data-preset="dark">🌑 Dark</button>
          <button class="tm_preset_btn" data-preset="sunset">🌅 Sunset</button>
          <button class="tm_preset_btn" data-preset="ocean">🌊 Ocean</button>
          <button class="tm_preset_btn" data-preset="forest">🌿 Forest</button>
          <button class="tm_preset_btn" data-preset="haschenLemmy">🪦 Haschen &amp; Lemmy</button>
        </div>
      </nav>

      <!-- Tab panels -->
      <div id="tm_panels">

        <!-- Colors -->
        <div class="tm_panel tm_panel_active" data-panel="colors">
          <h3 class="tm_panel_title">Color Settings</h3>

          <div class="tm_group">
            <h4 class="tm_group_title">🖥 Page</h4>
            <div class="tm_row">
              <label class="tm_label" for="tm_bodyBg">Page background</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_bodyBg" data-prop="bodyBg" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_bodyBg" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_bodyColor">Page text color</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_bodyColor" data-prop="bodyColor" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_bodyColor" maxlength="7" />
              </div>
            </div>
          </div>

          <div class="tm_group">
            <h4 class="tm_group_title">🗂 Menu / Sidebar</h4>
            <div class="tm_row">
              <label class="tm_label" for="tm_menuBg">Menu background</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_menuBg" data-prop="menuBg" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_menuBg" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_menuColor">Menu text color</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_menuColor" data-prop="menuColor" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_menuColor" maxlength="7" />
              </div>
            </div>
          </div>

          <div class="tm_group">
            <h4 class="tm_group_title">🔘 Buttons</h4>
            <div class="tm_row">
              <label class="tm_label" for="tm_buttonBg">Button background</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_buttonBg" data-prop="buttonBg" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_buttonBg" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_buttonColor">Button text</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_buttonColor" data-prop="buttonColor" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_buttonColor" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_buttonBorder">Button border</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_buttonBorder" data-prop="buttonBorder" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_buttonBorder" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_buttonRadius">Button rounding (px)</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_buttonRadius" data-prop="buttonRadius" min="0" max="20" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_buttonRadius">3</span>
              </div>
            </div>
          </div>

          <div class="tm_group">
            <h4 class="tm_group_title">💬 Chat / Log</h4>
            <div class="tm_row">
              <label class="tm_label" for="tm_logBg">IC log background</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_logBg" data-prop="logBg" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_logBg" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_logColor">IC log text</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_logColor" data-prop="logColor" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_logColor" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_oocBg">OOC log background</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_oocBg" data-prop="oocBg" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_oocBg" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_oocColor">OOC log text</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_oocColor" data-prop="oocColor" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_oocColor" maxlength="7" />
              </div>
            </div>
          </div>

          <div class="tm_group">
            <h4 class="tm_group_title">📝 Inputs</h4>
            <div class="tm_row">
              <label class="tm_label" for="tm_inputBg">Input background</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_inputBg" data-prop="inputBg" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_inputBg" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_inputColor">Input text</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_inputColor" data-prop="inputColor" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_inputColor" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_inputBorder">Input border</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_inputBorder" data-prop="inputBorder" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_inputBorder" maxlength="7" />
              </div>
            </div>
          </div>

          <div class="tm_group">
            <h4 class="tm_group_title">🗒 IC Controls Bar</h4>
            <div class="tm_row">
              <label class="tm_label" for="tm_icControlsBg">IC controls background</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_icControlsBg" data-prop="icControlsBg" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_icControlsBg" maxlength="7" />
              </div>
            </div>
          </div>

          <div class="tm_group">
            <h4 class="tm_group_title">📑 Tabs</h4>
            <div class="tm_row">
              <label class="tm_label" for="tm_tabBg">Tab background</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_tabBg" data-prop="tabBg" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_tabBg" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_tabActiveBg">Active tab background</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_tabActiveBg" data-prop="tabActiveBg" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_tabActiveBg" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_tabColor">Tab text</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_tabColor" data-prop="tabColor" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_tabColor" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_tabActiveColor">Active tab text</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_tabActiveColor" data-prop="tabActiveColor" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_tabActiveColor" maxlength="7" />
              </div>
            </div>
          </div>

          <div class="tm_group">
            <h4 class="tm_group_title">❤ Health Bars</h4>
            <div class="tm_row">
              <label class="tm_label" for="tm_defHpColor">Defense HP</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_defHpColor" data-prop="defHpColor" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_defHpColor" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_proHpColor">Prosecution HP</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_proHpColor" data-prop="proHpColor" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_proHpColor" maxlength="7" />
              </div>
            </div>
          </div>
        </div>

        <!-- Background -->
        <div class="tm_panel" data-panel="background">
          <h3 class="tm_panel_title">Background Settings</h3>

          <div class="tm_group">
            <h4 class="tm_group_title">🖼 Background Image</h4>
            <div class="tm_row tm_row_vert">
              <label class="tm_label">Upload image</label>
              <input type="file" id="tm_bg_file" accept="image/*" />
              <p class="tm_hint">Supports PNG, JPG, GIF, WebP, SVG. The image is stored locally — it never leaves your browser.</p>
            </div>
            <div class="tm_row">
              <label class="tm_label">Current image</label>
              <div id="tm_bg_preview_wrap">
                <img id="tm_bg_preview" alt="Background preview" />
                <button class="tm_btn tm_btn_danger tm_btn_sm" id="tm_bg_clear_btn">Remove image</button>
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_bodyBgSize">Image sizing</label>
              <select id="tm_bodyBgSize" data-prop="bodyBgSize" class="tm_select">
                <option value="cover">Cover (fill, may crop)</option>
                <option value="contain">Contain (fit, no crop)</option>
                <option value="tile">Tile (repeat)</option>
                <option value="auto">Natural size</option>
              </select>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_bodyBgPosition">Image position</label>
              <select id="tm_bodyBgPosition" data-prop="bodyBgPosition" class="tm_select">
                <option value="center">Center</option>
                <option value="top center">Top center</option>
                <option value="bottom center">Bottom center</option>
                <option value="top left">Top left</option>
                <option value="top right">Top right</option>
              </select>
            </div>
          </div>

          <div class="tm_group">
            <h4 class="tm_group_title">🎨 Page Base Colors</h4>
            <p class="tm_hint">These are the same controls as in the Colors tab — tweak them here for easier pairing with your background image.</p>
            <div class="tm_row">
              <label class="tm_label" for="tm_bodyBg2">Page background color</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_bodyBg2" data-prop="bodyBg" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_bodyBg2" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_bodyColor2">Page text color</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_bodyColor2" data-prop="bodyColor" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_bodyColor2" maxlength="7" />
              </div>
            </div>
          </div>
        </div>

        <!-- Typography -->
        <div class="tm_panel" data-panel="typography">
          <h3 class="tm_panel_title">Typography Settings</h3>

          <div class="tm_group">
            <h4 class="tm_group_title">🔤 Font</h4>
            <div class="tm_row">
              <label class="tm_label" for="tm_bodyFontFamily">Font family</label>
              <select id="tm_bodyFontFamily" data-prop="bodyFontFamily" class="tm_select">
                <option value="sans-serif">Default (sans-serif)</option>
                <option value="Igiari Cyrillic, Ace Attorney, sans-serif">Igiari (Ace Attorney)</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Times New Roman, Times, serif">Times New Roman</option>
                <option value="Courier New, Courier, monospace">Courier New</option>
                <option value="monospace">Monospace</option>
                <option value="Comic Sans MS, cursive">Comic Sans</option>
                <option value="Impact, fantasy">Impact</option>
                <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
                <option value="custom">Custom…</option>
              </select>
            </div>
            <div id="tm_customFont_row" style="display:none" class="tm_row">
              <label class="tm_label" for="tm_customFontInput">Custom font name</label>
              <input type="text" id="tm_customFontInput" placeholder="e.g. 'Noto Sans', sans-serif" class="tm_text_input" />
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_bodyFontSize">Font size (px)</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_bodyFontSize" data-prop="bodyFontSize" min="10" max="24" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_bodyFontSize">14</span>
              </div>
            </div>
          </div>

          <div id="tm_font_preview" class="tm_group">
            <h4 class="tm_group_title">👁 Preview</h4>
            <p id="tm_font_preview_text" class="tm_font_preview_text">The quick brown fox jumps over the lazy dog. 1234567890 !@#$%^&*</p>
          </div>
        </div>

        <!-- Advanced -->
        <div class="tm_panel" data-panel="advanced">
          <h3 class="tm_panel_title">Advanced CSS</h3>
          <div class="tm_group">
            <h4 class="tm_group_title">🧪 Extra CSS Rules</h4>
            <p class="tm_hint">Add any custom CSS you like. It will be appended after all other theme rules. Changes are applied live!</p>
            <textarea
              id="tm_extraCSS"
              class="tm_css_editor"
              placeholder="/* Your custom CSS here */
#client_log { border: 2px solid gold; }
.client_button:hover { opacity: 0.8; }"
              rows="18"
              spellcheck="false"
            ></textarea>
          </div>
          <div class="tm_group">
            <h4 class="tm_group_title">📄 Generated CSS Preview</h4>
            <p class="tm_hint">This is the full CSS that will be saved and exported.</p>
            <textarea id="tm_css_preview" class="tm_css_editor tm_css_readonly" rows="12" readonly spellcheck="false"></textarea>
          </div>
        </div>

      </div><!-- /tm_panels -->
    </div><!-- /tm_body -->

    <div id="tm_footer">
      <div id="tm_footer_left">
        <button class="tm_btn tm_btn_danger" id="tm_reset_btn" title="Reset all theme maker settings to defaults">🗑 Reset to Default</button>
      </div>
      <div id="tm_footer_right">
        <span id="tm_saved_badge" style="display:none">✅ Saved!</span>
        <button class="tm_btn tm_btn_primary" id="tm_save_btn">💾 Save Theme</button>
      </div>
    </div>

  </div><!-- /tm_modal -->
</div><!-- /tm_overlay -->
<input type="file" id="tm_import_file" accept=".css,.json" style="display:none" />
`;

  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);
}

// ─── State ────────────────────────────────────────────────────────────────────

let currentConfig: ThemeConfig = { ...DEFAULT_CONFIG };

function getConfig(): ThemeConfig {
  return currentConfig;
}

function setConfig(config: ThemeConfig): void {
  currentConfig = config;
}

// ─── UI ───────────────────────────────────────────────────────────────────────

function syncUIFromConfig(config: ThemeConfig): void {
  // Color inputs
  document.querySelectorAll<HTMLInputElement>(".tm_color[data-prop]").forEach((input) => {
    const prop = input.dataset.prop as keyof ThemeConfig;
    const val = String(config[prop] ?? "");
    if (val.startsWith("#")) input.value = val;
    // Sync linked hex text input
    const hexInput = document.querySelector<HTMLInputElement>(`.tm_hex[data-for="${input.id}"]`);
    if (hexInput) hexInput.value = val;
  });

  // Range inputs
  document.querySelectorAll<HTMLInputElement>(".tm_range[data-prop]").forEach((input) => {
    const prop = input.dataset.prop as keyof ThemeConfig;
    input.value = String(config[prop] ?? "");
    const valSpan = document.querySelector<HTMLElement>(`.tm_range_val[data-for="${input.id}"]`);
    if (valSpan) valSpan.textContent = String(config[prop] ?? "");
  });

  // Selects
  document.querySelectorAll<HTMLSelectElement>(".tm_select[data-prop]").forEach((sel) => {
    const prop = sel.dataset.prop as keyof ThemeConfig;
    const val = String(config[prop] ?? "");
    // If the value exists in options, set it; otherwise pick "custom" or first
    const match = Array.from(sel.options).find((o) => o.value === val);
    if (match) {
      sel.value = val;
    } else if (prop === "bodyFontFamily") {
      sel.value = "custom";
      const customRow = document.getElementById("tm_customFont_row");
      if (customRow) customRow.style.display = "block";
      const customInput = document.getElementById("tm_customFontInput") as HTMLInputElement | null;
      if (customInput) customInput.value = val;
    } else {
      sel.value = sel.options[0]?.value ?? "";
    }
  });

  // Extra CSS textarea
  const extraTA = document.getElementById("tm_extraCSS") as HTMLTextAreaElement | null;
  if (extraTA) extraTA.value = config.extraCSS ?? "";

  // Background preview
  updateBgPreview(config);

  // Font preview
  updateFontPreview(config);

  // CSS preview
  updateCSSPreview(config);
}

function updateBgPreview(config: ThemeConfig): void {
  const img = document.getElementById("tm_bg_preview") as HTMLImageElement | null;
  const wrap = document.getElementById("tm_bg_preview_wrap");
  if (!img || !wrap) return;
  if (config.bodyBgImage) {
    img.src = config.bodyBgImage;
    img.style.display = "block";
    wrap.style.display = "flex";
  } else {
    img.src = "";
    img.style.display = "none";
    wrap.style.display = "none";
  }
}

function updateFontPreview(config: ThemeConfig): void {
  const preview = document.getElementById("tm_font_preview_text");
  if (!preview) return;
  // The stored config always holds the actual font value; the "custom" entry only
  // exists as a UI-level sentinel in the <select>. Use the config value directly.
  const font = config.bodyFontFamily || "sans-serif";
  preview.style.fontFamily = font;
  preview.style.fontSize = config.bodyFontSize + "px";
  preview.style.color = config.bodyColor;
  preview.style.background = config.bodyBg;
}

function updateCSSPreview(config: ThemeConfig): void {
  const ta = document.getElementById("tm_css_preview") as HTMLTextAreaElement | null;
  if (!ta) return;
  ta.value = generateCSS(config);
}

function liveUpdate(): void {
  const config = getConfig();
  applyThemeMakerConfig(config);
  updateFontPreview(config);
  updateCSSPreview(config);
}

// ─── Event wiring ─────────────────────────────────────────────────────────────

function wireEvents(): void {
  // Tab switching
  document.querySelectorAll<HTMLButtonElement>(".tm_tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tm_tab").forEach((t) => {
        t.classList.remove("tm_tab_active");
        t.setAttribute("aria-selected", "false");
      });
      document.querySelectorAll(".tm_panel").forEach((p) => p.classList.remove("tm_panel_active"));
      tab.classList.add("tm_tab_active");
      tab.setAttribute("aria-selected", "true");
      const panel = document.querySelector<HTMLElement>(`.tm_panel[data-panel="${tab.dataset.tab}"]`);
      if (panel) panel.classList.add("tm_panel_active");
    });
  });

  // Color inputs — sync hex box + update live
  document.querySelectorAll<HTMLInputElement>(".tm_color[data-prop]").forEach((input) => {
    input.addEventListener("input", () => {
      const prop = input.dataset.prop as keyof ThemeConfig;
      (currentConfig as any)[prop] = input.value;
      const hexInput = document.querySelector<HTMLInputElement>(`.tm_hex[data-for="${input.id}"]`);
      if (hexInput) hexInput.value = input.value;
      liveUpdate();
    });
  });

  // Hex text inputs — sync color picker + update live
  document.querySelectorAll<HTMLInputElement>(".tm_hex[data-for]").forEach((hexInput) => {
    hexInput.addEventListener("input", () => {
      const colorId = hexInput.dataset.for!;
      const colorInput = document.getElementById(colorId) as HTMLInputElement | null;
      if (!colorInput) return;
      const val = hexInput.value;
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        colorInput.value = val;
        const prop = colorInput.dataset.prop as keyof ThemeConfig;
        (currentConfig as any)[prop] = val;
        liveUpdate();
      }
    });
  });

  // Range inputs
  document.querySelectorAll<HTMLInputElement>(".tm_range[data-prop]").forEach((input) => {
    input.addEventListener("input", () => {
      const prop = input.dataset.prop as keyof ThemeConfig;
      (currentConfig as any)[prop] = input.value;
      const valSpan = document.querySelector<HTMLElement>(`.tm_range_val[data-for="${input.id}"]`);
      if (valSpan) valSpan.textContent = input.value;
      liveUpdate();
    });
  });

  // Select dropdowns
  document.querySelectorAll<HTMLSelectElement>(".tm_select[data-prop]").forEach((sel) => {
    sel.addEventListener("change", () => {
      const prop = sel.dataset.prop as keyof ThemeConfig;
      if (prop === "bodyFontFamily") {
        const customRow = document.getElementById("tm_customFont_row");
        if (customRow) customRow.style.display = sel.value === "custom" ? "block" : "none";
        if (sel.value !== "custom") {
          (currentConfig as any)[prop] = sel.value;
        }
      } else {
        (currentConfig as any)[prop] = sel.value;
      }
      liveUpdate();
    });
  });

  // Custom font input
  const customFontInput = document.getElementById("tm_customFontInput") as HTMLInputElement | null;
  if (customFontInput) {
    customFontInput.addEventListener("input", () => {
      currentConfig.bodyFontFamily = customFontInput.value || "sans-serif";
      liveUpdate();
    });
  }

  // Extra CSS textarea
  const extraTA = document.getElementById("tm_extraCSS") as HTMLTextAreaElement | null;
  if (extraTA) {
    extraTA.addEventListener("input", () => {
      currentConfig.extraCSS = extraTA.value;
      liveUpdate();
    });
  }

  // Background file upload
  const bgFile = document.getElementById("tm_bg_file") as HTMLInputElement | null;
  if (bgFile) {
    bgFile.addEventListener("change", () => {
      const file = bgFile.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        currentConfig.bodyBgImage = dataUrl;
        updateBgPreview(currentConfig);
        liveUpdate();
      };
      reader.readAsDataURL(file);
    });
  }

  // Background clear
  const bgClearBtn = document.getElementById("tm_bg_clear_btn");
  if (bgClearBtn) {
    bgClearBtn.addEventListener("click", () => {
      currentConfig.bodyBgImage = "";
      const bgFile2 = document.getElementById("tm_bg_file") as HTMLInputElement | null;
      if (bgFile2) bgFile2.value = "";
      updateBgPreview(currentConfig);
      liveUpdate();
    });
  }

  // Presets
  document.querySelectorAll<HTMLButtonElement>(".tm_preset_btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const presetName = btn.dataset.preset!;
      const preset = PRESETS[presetName] ?? {};
      setConfig({ ...DEFAULT_CONFIG, ...preset, extraCSS: currentConfig.extraCSS, bodyBgImage: currentConfig.bodyBgImage });
      syncUIFromConfig(currentConfig);
      liveUpdate();
    });
  });

  // Save
  const saveBtn = document.getElementById("tm_save_btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      saveThemeMakerConfig(currentConfig);
      // Also update the theme selector in settings
      const themeSelect = document.getElementById("client_themeselect") as HTMLSelectElement | null;
      if (themeSelect) {
        const customOpt = themeSelect.querySelector<HTMLOptionElement>('[value="custom"]');
        if (customOpt) customOpt.selected = true;
        const customCSSRow = document.getElementById("client_customcss_row");
        if (customCSSRow) customCSSRow.style.display = "none";
      }
      // Show saved badge
      const badge = document.getElementById("tm_saved_badge");
      if (badge) {
        badge.style.display = "inline";
        setTimeout(() => { badge.style.display = "none"; }, 2000);
      }
    });
  }

  // Export CSS
  const exportBtn = document.getElementById("tm_export_btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const css = generateCSS(currentConfig);
      downloadFile("lemmyao-theme.css", css, "text/css");
    });
  }

  // Export JSON
  const exportJsonBtn = document.getElementById("tm_export_json_btn");
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener("click", () => {
      const json = JSON.stringify(currentConfig, null, 2);
      downloadFile("lemmyao-theme.json", json, "application/json");
    });
  }

  // Import
  const importBtn = document.getElementById("tm_import_btn");
  const importFile = document.getElementById("tm_import_file") as HTMLInputElement | null;
  if (importBtn && importFile) {
    importBtn.addEventListener("click", () => importFile.click());
    importFile.addEventListener("change", () => {
      const file = importFile.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (file.name.endsWith(".json")) {
          try {
            const parsed = JSON.parse(text) as Partial<ThemeConfig>;
            setConfig({ ...DEFAULT_CONFIG, ...parsed });
            syncUIFromConfig(currentConfig);
            liveUpdate();
            alert("✅ Theme imported successfully!");
          } catch {
            alert("❌ Invalid JSON file. Please import a valid LemmyAO theme JSON.");
          }
        } else {
          // Raw CSS import — put it in extraCSS
          if (confirm("Import as raw CSS? It will be placed in the Extra CSS field (Advanced tab). This will override any extra CSS you had.")) {
            currentConfig.extraCSS = text;
            const extraTA2 = document.getElementById("tm_extraCSS") as HTMLTextAreaElement | null;
            if (extraTA2) extraTA2.value = text;
            liveUpdate();
            alert("✅ CSS imported into Extra CSS field. Switch to the Advanced tab to view it.");
          }
        }
        importFile.value = "";
      };
      reader.readAsText(file);
    });
  }

  // Reset
  const resetBtn = document.getElementById("tm_reset_btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (!confirm("Reset ALL theme maker settings to defaults? This will remove your saved theme.")) return;
      setConfig({ ...DEFAULT_CONFIG });
      saveThemeMakerConfig(currentConfig);
      syncUIFromConfig(currentConfig);
      liveUpdate();
      const badge = document.getElementById("tm_saved_badge");
      if (badge) {
        badge.style.display = "inline";
        badge.textContent = "🔄 Reset!";
        setTimeout(() => { badge.style.display = "none"; badge.textContent = "✅ Saved!"; }, 2000);
      }
    });
  }

  // Close
  const closeBtn = document.getElementById("tm_close_btn");
  const overlay = document.getElementById("tm_overlay");
  if (closeBtn && overlay) {
    closeBtn.addEventListener("click", () => { overlay.style.display = "none"; });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.style.display = "none";
    });
  }

  // Keyboard close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const overlayEl = document.getElementById("tm_overlay");
      if (overlayEl && overlayEl.style.display !== "none") overlayEl.style.display = "none";
    }
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Opens the theme maker modal. Injects DOM on first call.
 */
export function openThemeMaker(): void {
  injectModalHTML();

  // Load saved config or defaults
  const saved = loadThemeMakerConfig();
  setConfig(saved ?? { ...DEFAULT_CONFIG });

  // Wire events only once
  const overlay = document.getElementById("tm_overlay")!;
  if (!overlay.dataset.wired) {
    wireEvents();
    overlay.dataset.wired = "1";
  }

  syncUIFromConfig(currentConfig);
  liveUpdate();
  overlay.style.display = "flex";

  // Trap focus inside modal
  const modal = document.getElementById("tm_modal");
  if (modal) modal.focus();
}

window.openThemeMaker = openThemeMaker;

/**
 * Restores a previously saved theme maker theme on page load.
 */
export function restoreThemeMaker(): void {
  const saved = loadThemeMakerConfig();
  if (saved && localStorage.getItem(LS_KEY_THEME) === "custom") {
    applyThemeMakerConfig(saved);
  }
}

window.restoreThemeMaker = restoreThemeMaker;

/**
 * Resets all theme maker settings (called from resetSettings).
 */
export function resetThemeMaker(): void {
  localStorage.removeItem(LS_KEY_CONFIG);
  // Only clear customCSS if it was set by the theme maker
  if (localStorage.getItem(LS_KEY_THEME) === "custom") {
    localStorage.removeItem(LS_KEY_CSS);
    localStorage.removeItem(LS_KEY_THEME);
  }
  setConfig({ ...DEFAULT_CONFIG });
  const el = document.getElementById("client_custom_style");
  if (el) el.remove();
}

window.resetThemeMaker = resetThemeMaker;
