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

  // Layout (GoldenLayout panels)
  layoutBg: string;

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

  // Player list
  playerlistBg: string;
  playerlistColor: string;
  playerlistBorder: string;
  playerlistBgImage: string;  // data-URL or ""

  // Opacity (0–100) for background colours; 100 = fully opaque
  bodyBgOpacity: number;
  menuBgOpacity: number;
  logBgOpacity: number;
  oocBgOpacity: number;
  inputBgOpacity: number;
  layoutBgOpacity: number;
  icControlsBgOpacity: number;
  tabBgOpacity: number;
  tabActiveBgOpacity: number;
  playerlistBgOpacity: number;

  // Accent colour — when useAccent is true, derives button/tab/HP highlights
  accentColor: string;
  useAccent: boolean;

  // Chatbox geometry
  chatboxPadding: number;       // px applied to #client_inner_chat
  chatboxRadius: number;        // px applied to #client_chat
  chatboxBorderWidth: number;   // px applied to #client_chat

  // Typography extras
  fontWeight: string;            // 100 | 300 | 400 | 500 | 700 | 900
  lineHeight: string;            // unitless, e.g. "1.4"

  // Audio — blip pitch (playbackRate). 1.0 = normal, range 0.5–2.0
  blipPitch: number;

  // ─── Extra colors (selection, scrollbar, links, focus, mentions, quotes) ──
  selectionBg: string;
  selectionFg: string;
  scrollbarTrack: string;
  scrollbarThumb: string;
  scrollbarThumbHover: string;
  linkColor: string;
  linkHoverColor: string;
  linkVisitedColor: string;
  focusRingColor: string;
  mentionColor: string;
  quoteBg: string;
  quoteColor: string;

  // ─── Visual effects (filters / overlays) ──────────────────────────────────
  // All 0–100 unless noted; 0 = effect off.
  effectVignette: number;          // 0–100 strength of dark vignette overlay
  effectScanlines: number;         // 0–100 opacity of CRT scanlines
  effectScanlineSpacing: number;   // 1–10 px between scanlines
  effectGrain: number;             // 0–100 film-grain noise opacity
  effectChromaticAb: number;       // 0–10 px text chromatic aberration shift
  effectBlur: number;              // 0–20 px backdrop-blur on chat/menu panels
  effectBloom: number;             // 0–100 text-glow strength
  effectSaturation: number;        // 0–200 (100 = unfiltered)
  effectContrast: number;          // 50–200 (100 = unfiltered)

  // ─── Animations / motion ───────────────────────────────────────────────────
  animSpeed: number;               // 0–300 % multiplier (100 = default)
  animEasing: string;              // linear | ease | ease-in | ease-out | ease-in-out | spring | bounce
  animReducedMotion: boolean;      // force all transitions/animations off
  animRespectPrefers: boolean;     // also obey prefers-reduced-motion media query
  animHoverDuration: number;       // 0–500 ms hover transition base

  // ─── Borders & Shape ───────────────────────────────────────────────────────
  // Style applied across button/panel/input borders.
  borderStyle: "solid" | "dashed" | "dotted" | "double" | "groove" | "ridge";
  buttonBorderWidth: number;       // 0–8 px
  panelBorderWidth: number;        // 0–8 px (log/ooc/menu/playerlist)
  inputBorderWidth: number;        // 0–8 px
  panelRadius: number;             // 0–40 px (log/ooc/menu/playerlist)
  inputRadius: number;             // 0–20 px
  tabRadius: number;               // 0–20 px
  // Optional: outline width/offset for focusable elements (separate from focus ring color)
  outlineWidth: number;            // 0–6 px
  outlineOffset: number;           // 0–10 px

  // ─── Shadows & Depth ───────────────────────────────────────────────────────
  // Drop shadow applied to elevated surfaces (modals, panels, buttons).
  shadowStrength: number;          // 0–100 (0 = no shadow)
  shadowBlur: number;              // 0–40 px blur radius
  shadowOffsetY: number;           // 0–20 px vertical offset
  shadowColor: string;             // base color (alpha derived from strength)
  // Inner shadow on inputs / pressed states.
  innerShadowStrength: number;     // 0–100
  innerShadowBlur: number;         // 0–20 px
  // Element glow (separate from text bloom — affects borders/edges).
  glowColor: string;
  glowStrength: number;            // 0–100

  // Extra raw CSS appended at the end
  extraCSS: string;
  // Trust level for extraCSS: "strict" filters @import and remote url(),
  // "trusted" allows everything (user explicitly opted in)
  customCSSTrust: "strict" | "trusted";
  // Whether the user has acknowledged the custom-CSS warning at least once.
  customCSSAcknowledged: boolean;
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

  layoutBg: "#ffffff",

  icControlsBg: "#f8f8f8",

  tabBg: "#dddddd",
  tabActiveBg: "#bbbbbb",
  tabColor: "#333333",
  tabActiveColor: "#000000",

  defHpColor: "#169de0",
  proHpColor: "#e01f5f",

  playerlistBg: "#f0f0f0",
  playerlistColor: "#000000",
  playerlistBorder: "#cccccc",
  playerlistBgImage: "",

  bodyBgOpacity: 100,
  menuBgOpacity: 100,
  logBgOpacity: 100,
  oocBgOpacity: 100,
  inputBgOpacity: 100,
  layoutBgOpacity: 100,
  icControlsBgOpacity: 100,
  tabBgOpacity: 100,
  tabActiveBgOpacity: 100,
  playerlistBgOpacity: 100,

  accentColor: "#7b2900",
  useAccent: false,

  chatboxPadding: 6,
  chatboxRadius: 4,
  chatboxBorderWidth: 2,

  fontWeight: "400",
  lineHeight: "1.4",

  blipPitch: 1.0,

  // Extras
  selectionBg: "#7b2900",
  selectionFg: "#ffffff",
  scrollbarTrack: "#1a1a1a",
  scrollbarThumb: "#555555",
  scrollbarThumbHover: "#777777",
  linkColor: "#4a90e2",
  linkHoverColor: "#74b3ff",
  linkVisitedColor: "#a070d0",
  focusRingColor: "#ffd081",
  mentionColor: "#ffe234",
  quoteBg: "#2a2a2a",
  quoteColor: "#bbbbbb",

  // Effects (default = none)
  effectVignette: 0,
  effectScanlines: 0,
  effectScanlineSpacing: 3,
  effectGrain: 0,
  effectChromaticAb: 0,
  effectBlur: 0,
  effectBloom: 0,
  effectSaturation: 100,
  effectContrast: 100,

  // Animations
  animSpeed: 100,
  animEasing: "ease",
  animReducedMotion: false,
  animRespectPrefers: true,
  animHoverDuration: 120,

  // Borders & Shape
  borderStyle: "solid",
  buttonBorderWidth: 1,
  panelBorderWidth: 1,
  inputBorderWidth: 1,
  panelRadius: 4,
  inputRadius: 4,
  tabRadius: 4,
  outlineWidth: 2,
  outlineOffset: 2,

  // Shadows & Depth
  shadowStrength: 0,
  shadowBlur: 12,
  shadowOffsetY: 4,
  shadowColor: "#000000",
  innerShadowStrength: 0,
  innerShadowBlur: 6,
  glowColor: "#7b2900",
  glowStrength: 0,

  extraCSS: "",
  customCSSTrust: "strict",
  customCSSAcknowledged: false,
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
    layoutBg: "#121212",
    icControlsBg: "#1e1e1e",
    tabBg: "#222222",
    tabActiveBg: "#333333",
    tabColor: "#cccccc",
    tabActiveColor: "#ffffff",
    defHpColor: "#1565c0",
    proHpColor: "#b71c1c",
    playerlistBg: "#1a1a1a",
    playerlistColor: "#e0e0e0",
    playerlistBorder: "#444444",
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
    layoutBg: "#1a0a2e",
    icControlsBg: "#200f38",
    tabBg: "#2d1b4e",
    tabActiveBg: "#5b2685",
    tabColor: "#d1b3ff",
    tabActiveColor: "#ffffff",
    defHpColor: "#7b1fa2",
    proHpColor: "#c2185b",
    playerlistBg: "#2d1b4e",
    playerlistColor: "#f5e6ff",
    playerlistBorder: "#7b1fa2",
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
    layoutBg: "#0a1628",
    icControlsBg: "#0b1a30",
    tabBg: "#112244",
    tabActiveBg: "#1565c0",
    tabColor: "#90caf9",
    tabActiveColor: "#ffffff",
    defHpColor: "#0288d1",
    proHpColor: "#00838f",
    playerlistBg: "#0d1f3c",
    playerlistColor: "#b3d9ff",
    playerlistBorder: "#1565c0",
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
    layoutBg: "#0d1f0d",
    icControlsBg: "#122012",
    tabBg: "#1b3a1b",
    tabActiveBg: "#2e7d32",
    tabColor: "#a5d6a7",
    tabActiveColor: "#ffffff",
    defHpColor: "#388e3c",
    proHpColor: "#f9a825",
    playerlistBg: "#1b3a1b",
    playerlistColor: "#c8e6c9",
    playerlistBorder: "#388e3c",
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
    layoutBg: "#0c0a06",
    icControlsBg: "#100e08",
    tabBg: "#1a1507",
    tabActiveBg: "#3d0a0a",
    tabColor: "#8a7a45",
    tabActiveColor: "#e8d5a3",
    defHpColor: "#6b3a1f",
    proHpColor: "#8b1a1a",
    playerlistBg: "#0f0d08",
    playerlistColor: "#b8a870",
    playerlistBorder: "#3d2e10",
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Converts a #rrggbb hex colour + an opacity (0–100) to a CSS rgba() string. */
function hexToRgba(hex: string, opacity: number): string {
  if (opacity >= 100) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = Math.max(0, Math.min(1, opacity / 100)).toFixed(2);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** Lighten / darken a #rrggbb colour by `amount` (–100..100). */
function shadeHex(hex: string, amount: number): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const adj = (c: number) => {
    const v = amount >= 0
      ? c + (255 - c) * (amount / 100)
      : c + c * (amount / 100);
    return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  };
  return `#${adj(r)}${adj(g)}${adj(b)}`;
}

// ─── Custom CSS sanitizer ────────────────────────────────────────────────────

export interface SanitizeResult {
  css: string;
  removed: string[];
}

/**
 * Strict-mode sanitizer for user-supplied "extra" CSS.
 *
 * CSS is generally safe to inject (the browser will not execute scripts inside
 * a stylesheet) but a malicious snippet can still:
 *   • beacon back to a tracker via @import url(http://evil.example/)
 *   • beacon back via background-image: url(http://evil.example/pixel.png)
 *   • abuse legacy IE expression() / behavior:url() syntax
 *   • inject javascript: pseudo-URLs into cursor / list-style-image
 *
 * In strict mode we strip every one of those patterns and return a list of
 * removals so the UI can show them to the user.
 */
export function sanitizeCustomCSS(css: string, strict: boolean): SanitizeResult {
  if (!strict) return { css, removed: [] };
  const removed: string[] = [];

  // Strip @import statements (any form: url(...), "...", '...')
  let out = css.replace(/@import\s+[^;]+;?/gi, (m) => {
    removed.push(`@import: ${m.trim().slice(0, 80)}`);
    return "/* import-rule blocked */";
  });

  // Strip remote url(http(s)://) and url(//) — keep data:, blob:, and same-origin
  // relative paths (no scheme).
  out = out.replace(/url\(\s*(['"]?)(\s*(?:https?:|\/\/)[^'")]+)\1\s*\)/gi, (m) => {
    removed.push(`remote url(): ${m.slice(0, 80)}`);
    return "url('about:blank')";
  });

  // Strip javascript: / vbscript: / data:text/html pseudo-URLs anywhere
  out = out.replace(/\b(?:javascript|vbscript|livescript)\s*:[^;}'")\s]*/gi, (m) => {
    removed.push(`script URL: ${m.slice(0, 80)}`);
    return "about:blank";
  });

  // Strip legacy IE expression() and behavior: url()
  out = out.replace(/\bexpression\s*\([^)]*\)/gi, (m) => {
    removed.push(`expression(): ${m.slice(0, 80)}`);
    return "/* expression blocked */";
  });
  out = out.replace(/\bbehavior\s*:[^;}]+/gi, (m) => {
    removed.push(`behavior: ${m.slice(0, 80)}`);
    return "/* behavior blocked */";
  });

  return { css: out, removed };
}

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
  const bodyBgColor = hexToRgba(config.bodyBg, Number(config.bodyBgOpacity ?? 100));
  const menuBgColor = hexToRgba(config.menuBg, Number(config.menuBgOpacity ?? 100));
  const logBgColor = hexToRgba(config.logBg, Number(config.logBgOpacity ?? 100));
  const oocBgColor = hexToRgba(config.oocBg, Number(config.oocBgOpacity ?? 100));
  const inputBgColor = hexToRgba(config.inputBg, Number(config.inputBgOpacity ?? 100));
  const layoutBgColor = hexToRgba(config.layoutBg, Number(config.layoutBgOpacity ?? 100));
  const icControlsBgColor = hexToRgba(config.icControlsBg, Number(config.icControlsBgOpacity ?? 100));
  const tabBgColor = hexToRgba(config.tabBg, Number(config.tabBgOpacity ?? 100));
  const tabActiveBgColor = hexToRgba(config.tabActiveBg, Number(config.tabActiveBgOpacity ?? 100));
  const playerlistBgColor = hexToRgba(config.playerlistBg, Number(config.playerlistBgOpacity ?? 100));

  // Accent override — recolour buttons, active tab and HP bars when enabled.
  const useAccent = !!config.useAccent;
  const accent = config.accentColor || "#7b2900";
  const accentHover = shadeHex(accent, 12);
  const accentDark = shadeHex(accent, -25);
  const buttonBgEff = useAccent ? accent : config.buttonBg;
  const buttonBorderEff = useAccent ? accentDark : config.buttonBorder;
  const tabActiveBgEff = useAccent ? hexToRgba(accent, Number(config.tabActiveBgOpacity ?? 100)) : tabActiveBgColor;
  const defHpEff = useAccent ? accent : config.defHpColor;
  const proHpEff = useAccent ? accentDark : config.proHpColor;

  // Numeric defaults for newly-added fields (so older saved configs don't break).
  const chatPad = Number.isFinite(Number(config.chatboxPadding)) ? Number(config.chatboxPadding) : 6;
  const chatRadius = Number.isFinite(Number(config.chatboxRadius)) ? Number(config.chatboxRadius) : 4;
  const chatBorder = Number.isFinite(Number(config.chatboxBorderWidth)) ? Number(config.chatboxBorderWidth) : 2;
  const fontWeight = config.fontWeight || "400";
  const lineHeight = config.lineHeight || "1.4";

  // Sanitize user-supplied "extra" CSS unless they explicitly trust it.
  const trust = config.customCSSTrust ?? "strict";
  const { css: safeExtraCSS } = sanitizeCustomCSS(config.extraCSS ?? "", trust === "strict");

  // Numeric defaults for extras / effects / animation (older configs may lack them).
  const num = (v: unknown, fallback: number): number =>
    Number.isFinite(Number(v)) ? Number(v) : fallback;

  const fxVignette = num(config.effectVignette, 0);
  const fxVignetteRadius = 75; // fixed for now; sliderless to avoid bloat
  const fxScanlines = num(config.effectScanlines, 0);
  const fxScanSpacing = Math.max(1, num(config.effectScanlineSpacing, 3));
  const fxGrain = num(config.effectGrain, 0);
  const fxChromaticAb = num(config.effectChromaticAb, 0);
  const fxBlur = num(config.effectBlur, 0);
  const fxBloom = num(config.effectBloom, 0);
  const fxSat = num(config.effectSaturation, 100);
  const fxCon = num(config.effectContrast, 100);

  const animPct = num(config.animSpeed, 100);
  const animMul = animPct === 0 ? 0 : animPct / 100;
  const animEasing = (config.animEasing && /^[\w\-(),. \d]+$/.test(config.animEasing))
    ? config.animEasing
    : "ease";
  const animHoverMs = Math.round(num(config.animHoverDuration, 120) * (animMul || 1));
  const reducedMotion = !!config.animReducedMotion;
  const respectPrefers = config.animRespectPrefers !== false;

  // ── Built filter string for body (saturation + contrast) ──
  const bodyFilter = (fxSat !== 100 || fxCon !== 100)
    ? `filter: saturate(${fxSat}%) contrast(${fxCon}%);`
    : "";

  // ── Vignette + scanlines + grain rendered as ::after pseudo-overlay ──
  const overlayLayers: string[] = [];
  if (fxVignette > 0) {
    const v = (fxVignette / 100).toFixed(2);
    overlayLayers.push(
      `radial-gradient(ellipse at center, transparent ${fxVignetteRadius}%, rgba(0,0,0,${v}) 100%)`,
    );
  }
  if (fxScanlines > 0) {
    const s = (fxScanlines / 100).toFixed(2);
    overlayLayers.push(
      `repeating-linear-gradient(0deg, rgba(0,0,0,${s}) 0 1px, transparent 1px ${fxScanSpacing}px)`,
    );
  }
  if (fxGrain > 0) {
    const g = (fxGrain / 100).toFixed(2);
    // Cheap CSS-only grain approximation using a finely-stepped repeating gradient.
    overlayLayers.push(
      `repeating-conic-gradient(rgba(255,255,255,${g}) 0 0.0009%, transparent 0 0.002%)`,
    );
  }
  const overlayCSS = overlayLayers.length
    ? `
body::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9998;
  background: ${overlayLayers.join(", ")};
}`
    : "";

  // ── Chromatic aberration via duplicated text-shadow on chat / log ──
  const chromaticCSS = fxChromaticAb > 0
    ? `
#client_log, #client_ooclog, #tm_preview_inner_chat {
  text-shadow: ${fxChromaticAb}px 0 0 rgba(255,0,80,0.55), -${fxChromaticAb}px 0 0 rgba(0,200,255,0.55);
}`
    : "";

  // ── Bloom (text glow) ──
  const bloomCSS = fxBloom > 0
    ? `
#client_log, .iclog_name, .menu_text, .lm_tab.lm_active, .client_button {
  text-shadow: 0 0 ${(fxBloom / 8).toFixed(1)}px ${config.buttonBg}, 0 0 ${(fxBloom / 4).toFixed(1)}px ${config.buttonBg};
}`
    : "";

  // ── Backdrop blur on transparent panels ──
  const blurCSS = fxBlur > 0
    ? `
#client_log, #client_ooclog, #client_menu, #client_iccontrols, #client_playerlist, .lm_content {
  backdrop-filter: blur(${fxBlur}px);
  -webkit-backdrop-filter: blur(${fxBlur}px);
}`
    : "";

  // ── Selection / scrollbar / link / focus / mention / quote ──
  const extrasCSS = `
::selection {
  background: ${config.selectionBg};
  color: ${config.selectionFg};
}
::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}
::-webkit-scrollbar-track {
  background: ${config.scrollbarTrack};
}
::-webkit-scrollbar-thumb {
  background: ${config.scrollbarThumb};
  border-radius: 6px;
}
::-webkit-scrollbar-thumb:hover {
  background: ${config.scrollbarThumbHover};
}
* {
  scrollbar-color: ${config.scrollbarThumb} ${config.scrollbarTrack};
}
a {
  color: ${config.linkColor};
}
a:hover {
  color: ${config.linkHoverColor};
}
a:visited {
  color: ${config.linkVisitedColor};
}
:focus-visible {
  outline: 2px solid ${config.focusRingColor};
  outline-offset: 2px;
}
.iclog_mention, .mention {
  color: ${config.mentionColor};
  font-weight: bold;
}
blockquote, .iclog_quote, q {
  background: ${config.quoteBg};
  color: ${config.quoteColor};
  border-left: 3px solid ${config.scrollbarThumb};
  padding: 4px 8px;
  margin: 4px 0;
}`;

  // ── Borders / shape — derived shared values + element-scoped overrides ────
  const borderStyle = ["solid","dashed","dotted","double","groove","ridge"].includes(config.borderStyle)
    ? config.borderStyle
    : "solid";
  const btnBW = Math.max(0, num(config.buttonBorderWidth, 1));
  const panelBW = Math.max(0, num(config.panelBorderWidth, 1));
  const inputBW = Math.max(0, num(config.inputBorderWidth, 1));
  const panelR = Math.max(0, num(config.panelRadius, 4));
  const inputR = Math.max(0, num(config.inputRadius, 4));
  const tabR = Math.max(0, num(config.tabRadius, 4));
  const outlineW = Math.max(0, num(config.outlineWidth, 2));
  const outlineO = Math.max(0, num(config.outlineOffset, 2));

  const bordersCSS = `
.client_button, .judge_button, .area-button, .menu_button {
  border-style: ${borderStyle};
  border-width: ${btnBW}px;
}
#client_log, #client_ooclog, #client_menu, #client_iccontrols, #client_playerlist, .lm_content {
  border-style: ${borderStyle};
  border-width: ${panelBW}px;
  border-radius: ${panelR}px;
}
#client_inputbox, #client_oocinputbox, #evi_name, #evi_desc, #OOC_name {
  border-style: ${borderStyle};
  border-width: ${inputBW}px;
  border-radius: ${inputR}px;
}
.lm_tab {
  border-radius: ${tabR}px ${tabR}px 0 0;
}
:focus-visible {
  outline-width: ${outlineW}px;
  outline-offset: ${outlineO}px;
}`;

  // ── Shadows / depth — drop, inner, glow ────────────────────────────────────
  const shadowStr = Math.max(0, Math.min(100, num(config.shadowStrength, 0)));
  const shadowBlur = Math.max(0, num(config.shadowBlur, 12));
  const shadowOffY = Math.max(0, num(config.shadowOffsetY, 4));
  const innerStr = Math.max(0, Math.min(100, num(config.innerShadowStrength, 0)));
  const innerBlur = Math.max(0, num(config.innerShadowBlur, 6));
  const glowStr = Math.max(0, Math.min(100, num(config.glowStrength, 0)));

  const dropShadowCSS = shadowStr > 0
    ? `0 ${shadowOffY}px ${shadowBlur}px ${hexToRgba(config.shadowColor || "#000000", shadowStr)}`
    : "";
  const innerShadowCSS = innerStr > 0
    ? `inset 0 0 ${innerBlur}px ${hexToRgba("#000000", innerStr)}`
    : "";
  const glowCSS = glowStr > 0
    ? `0 0 ${(glowStr / 4).toFixed(1)}px ${hexToRgba(config.glowColor || "#7b2900", Math.min(100, glowStr * 1.2))}, 0 0 ${(glowStr / 2).toFixed(1)}px ${hexToRgba(config.glowColor || "#7b2900", glowStr)}`
    : "";

  const composedShadow = [dropShadowCSS, glowCSS].filter(Boolean).join(", ");
  const shadowsCSS = (dropShadowCSS || glowCSS || innerShadowCSS) ? `
${composedShadow ? `.client_button, .judge_button, .area-button, #client_menu, #client_log, #client_ooclog, #client_playerlist, .lm_content {
  box-shadow: ${composedShadow};
}` : ""}
${innerShadowCSS ? `#client_inputbox, #client_oocinputbox, #evi_name, #evi_desc, #OOC_name {
  box-shadow: ${innerShadowCSS};
}` : ""}` : "";

  // ── Animation speed / easing — applied through CSS variables every existing
  //    transition can reference, plus a global override scaling every transition.
  const animationCSS = reducedMotion
    ? `
*, *::before, *::after {
  transition-duration: 0s !important;
  animation-duration: 0s !important;
  animation-iteration-count: 1 !important;
}`
    : `
:root {
  --tm-anim-speed: ${animMul};
  --tm-anim-easing: ${animEasing};
  --tm-hover-ms: ${animHoverMs}ms;
}
.client_button, .menu_button, .area-button, .judge_button, .tm_preset_btn,
.tm_btn, .lm_tab, a, button {
  transition-duration: var(--tm-hover-ms);
  transition-timing-function: var(--tm-anim-easing);
}${respectPrefers ? `
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0s !important;
    animation-duration: 0s !important;
  }
}` : ""}`;

  return `/* LemmyAO Theme Maker — generated theme */
body {
  background-color: ${bodyBgColor};
  color: ${config.bodyColor};
  font-family: ${config.bodyFontFamily};
  font-size: ${config.bodyFontSize}px;
  font-weight: ${fontWeight};
  line-height: ${lineHeight};${buildBgImageCSS(config)}
  ${bodyFilter}
}

.client_button {
  margin: 1px;
  padding: 2px 15px;
  cursor: pointer;
  text-align: center;
  font-weight: bold;
  color: ${config.buttonColor};
  background-color: ${buttonBgEff};
  border-radius: ${config.buttonRadius}px;
  border-style: solid;
  border-width: 1px;
  border-color: ${buttonBorderEff};
  box-shadow: 1px 1px inset;
  transition: background-color 0.12s ease, border-color 0.12s ease;
}
.client_button:hover {
  background-color: ${useAccent ? accentHover : shadeHex(config.buttonBg, 12)};
}

#client_menu {
  background-color: ${menuBgColor};
  color: ${config.menuColor};
  overflow-y: auto;
  height: 100%;
}

.menu_content {
  background-color: ${menuBgColor};
  color: ${config.menuColor};
}

.menu_text {
  color: ${config.menuColor};
  background-color: ${menuBgColor};
}

#client_log {
  background-color: ${logBgColor};
  color: ${config.logColor};
}

#client_ooclog {
  background-color: ${oocBgColor};
  color: ${config.oocColor};
}

#client_inputbox {
  background-color: ${inputBgColor};
  color: ${config.inputColor};
  border: 1px solid ${config.inputBorder};
}

#client_oocinput {
  background-color: ${inputBgColor};
  color: ${config.inputColor};
}

#client_iccontrols {
  background-color: ${icControlsBgColor};
}

.lm_goldenlayout,
.lm_content {
  background-color: ${layoutBgColor} !important;
}

.lm_tab {
  color: ${config.tabColor};
  background-color: ${tabBgColor};
}

.lm_tab.lm_active {
  color: ${config.tabActiveColor};
  background-color: ${tabActiveBgEff};
}

#evi_name {
  background-color: ${inputBgColor};
  color: ${config.inputColor};
  border: 1px solid ${config.inputBorder};
}

#evi_desc {
  flex: 1 auto;
  background-color: ${inputBgColor};
  color: ${config.inputColor};
  border: 1px solid ${config.inputBorder};
}

#client_defense_hp > .health-bar {
  background-color: ${defHpEff};
}

#client_prosecutor_hp > .health-bar {
  background-color: ${proHpEff};
}

/* Chatbox geometry */
#client_chat {
  border-radius: ${chatRadius}px;
  border-width: ${chatBorder}px;
}
#client_inner_chat {
  padding: ${chatPad}px ${chatPad * 2}px;
}

#client_playerlist {
  background-color: ${playerlistBgColor};
  color: ${config.playerlistColor};${config.playerlistBgImage ? `
  background-image: url('${config.playerlistBgImage}');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;` : ""}
}

#client_playerlist th,
#client_playerlist td {
  border-bottom: 1px solid ${config.playerlistBorder};
  color: ${config.playerlistColor};
}

#client_playerlist th {
  border-bottom: 2px solid ${config.playerlistBorder};
}

${extrasCSS}
${bordersCSS}
${shadowsCSS}
${animationCSS}
${blurCSS}
${bloomCSS}
${chromaticCSS}
${overlayCSS}

${safeExtraCSS}`;
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
  const themeLink = document.getElementById("client_theme") as HTMLLinkElement | null;
  if (themeLink) themeLink.disabled = true;
}

const LS_KEY_BLIP_PITCH = "blipPitch";

/** Apply a blip playbackRate to every <audio class="blipSound"> element on the page. */
export function applyBlipPitch(pitch: number): void {
  const clamped = Math.max(0.5, Math.min(2, Number(pitch) || 1));
  const channels = document.getElementsByClassName("blipSound") as HTMLCollectionOf<HTMLAudioElement>;
  for (const ch of Array.from(channels)) {
    try {
      // preservesPitch=false means the pitch shifts with rate (the desired behaviour).
      (ch as any).preservesPitch = false;
      (ch as any).mozPreservesPitch = false;
      (ch as any).webkitPreservesPitch = false;
      ch.playbackRate = clamped;
    } catch {
      /* ignore — some browsers block playbackRate before user gesture */
    }
  }
  localStorage.setItem(LS_KEY_BLIP_PITCH, String(clamped));
}

/** Restore blip pitch from localStorage; safe to call before audio elements exist. */
export function restoreBlipPitch(): void {
  const raw = localStorage.getItem(LS_KEY_BLIP_PITCH);
  if (raw == null) return;
  const v = Number(raw);
  if (Number.isFinite(v)) applyBlipPitch(v);
}

window.applyBlipPitch = applyBlipPitch;
window.restoreBlipPitch = restoreBlipPitch;

export function applyThemeMakerConfig(config: ThemeConfig): void {
  applyThemeMakerCSS(generateCSS(config));
  applyBlipPitch(Number(config.blipPitch ?? 1));
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
        <button class="tm_tab" data-tab="chatbox" role="tab" aria-selected="false">💬 Chatbox</button>
        <button class="tm_tab" data-tab="audio" role="tab" aria-selected="false">🔊 Audio</button>
        <button class="tm_tab" data-tab="background" role="tab" aria-selected="false">🖼 Background</button>
        <button class="tm_tab" data-tab="typography" role="tab" aria-selected="false">✏️ Typography</button>
        <button class="tm_tab" data-tab="effects" role="tab" aria-selected="false">✨ Effects</button>
        <button class="tm_tab" data-tab="animations" role="tab" aria-selected="false">🎬 Animations</button>
        <button class="tm_tab" data-tab="borders" role="tab" aria-selected="false">🔲 Borders</button>
        <button class="tm_tab" data-tab="shadows" role="tab" aria-selected="false">🌑 Shadows</button>
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
        <!-- Mock live preview pane (always visible) -->
        <div id="tm_live_preview_box" aria-label="Live preview">
          <p class="tm_section_label">Live Preview</p>
          <div id="tm_preview_chatbox">
            <div id="tm_preview_name">Phoenix</div>
            <div id="tm_preview_chat">
              <div id="tm_preview_inner_chat">The quick brown fox jumps over the lazy dog!</div>
            </div>
          </div>
          <div id="tm_preview_buttonrow">
            <button class="tm_preview_btn">Send</button>
            <button class="tm_preview_btn tm_preview_btn_alt">Cancel</button>
          </div>
          <div id="tm_preview_blip_row">
            <button class="tm_btn tm_btn_secondary tm_btn_sm" id="tm_preview_blip_btn">▶ Test blip</button>
          </div>
        </div>
      </nav>

      <!-- Tab panels -->
      <div id="tm_panels">

        <!-- Colors -->
        <div class="tm_panel tm_panel_active" data-panel="colors">
          <h3 class="tm_panel_title">Color Settings</h3>

          <div class="tm_group">
            <h4 class="tm_group_title">🌟 Accent</h4>
            <p class="tm_hint">A single accent colour overrides buttons, the active tab and HP bars. Toggle off for full per-element control below.</p>
            <div class="tm_row">
              <label class="tm_label" for="tm_useAccent">Use accent colour</label>
              <div class="tm_ctrl">
                <input type="checkbox" id="tm_useAccent" data-prop="useAccent" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_accentColor">Accent</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_accentColor" data-prop="accentColor" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_accentColor" maxlength="7" />
              </div>
            </div>
          </div>

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
              <label class="tm_label" for="tm_bodyBgOpacity">Page bg opacity</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_bodyBgOpacity" data-prop="bodyBgOpacity" min="0" max="100" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_bodyBgOpacity">100</span><span>%</span>
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
              <label class="tm_label" for="tm_menuBgOpacity">Menu bg opacity</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_menuBgOpacity" data-prop="menuBgOpacity" min="0" max="100" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_menuBgOpacity">100</span><span>%</span>
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
              <label class="tm_label" for="tm_logBgOpacity">IC log bg opacity</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_logBgOpacity" data-prop="logBgOpacity" min="0" max="100" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_logBgOpacity">100</span><span>%</span>
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
              <label class="tm_label" for="tm_oocBgOpacity">OOC log bg opacity</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_oocBgOpacity" data-prop="oocBgOpacity" min="0" max="100" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_oocBgOpacity">100</span><span>%</span>
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
              <label class="tm_label" for="tm_inputBgOpacity">Input bg opacity</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_inputBgOpacity" data-prop="inputBgOpacity" min="0" max="100" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_inputBgOpacity">100</span><span>%</span>
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
            <h4 class="tm_group_title">🗒 Layout &amp; IC Controls</h4>
            <div class="tm_row">
              <label class="tm_label" for="tm_layoutBg">Layout panel background</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_layoutBg" data-prop="layoutBg" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_layoutBg" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_layoutBgOpacity">Layout bg opacity</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_layoutBgOpacity" data-prop="layoutBgOpacity" min="0" max="100" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_layoutBgOpacity">100</span><span>%</span>
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_icControlsBg">IC controls background</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_icControlsBg" data-prop="icControlsBg" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_icControlsBg" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_icControlsBgOpacity">IC controls bg opacity</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_icControlsBgOpacity" data-prop="icControlsBgOpacity" min="0" max="100" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_icControlsBgOpacity">100</span><span>%</span>
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
              <label class="tm_label" for="tm_tabBgOpacity">Tab bg opacity</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_tabBgOpacity" data-prop="tabBgOpacity" min="0" max="100" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_tabBgOpacity">100</span><span>%</span>
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
              <label class="tm_label" for="tm_tabActiveBgOpacity">Active tab bg opacity</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_tabActiveBgOpacity" data-prop="tabActiveBgOpacity" min="0" max="100" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_tabActiveBgOpacity">100</span><span>%</span>
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

          <div class="tm_group">
            <h4 class="tm_group_title">👥 Player List</h4>
            <div class="tm_row">
              <label class="tm_label" for="tm_playerlistBg">Background</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_playerlistBg" data-prop="playerlistBg" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_playerlistBg" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_playerlistBgOpacity">Player list bg opacity</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_playerlistBgOpacity" data-prop="playerlistBgOpacity" min="0" max="100" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_playerlistBgOpacity">100</span><span>%</span>
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_playerlistColor">Text color</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_playerlistColor" data-prop="playerlistColor" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_playerlistColor" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_playerlistBorder">Row divider color</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_playerlistBorder" data-prop="playerlistBorder" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_playerlistBorder" maxlength="7" />
              </div>
            </div>
          </div>

          <div class="tm_group">
            <h4 class="tm_group_title">✨ Extras (selection · scrollbar · links · focus · mentions · quotes)</h4>
            <p class="tm_hint">Fine-tune the small surfaces most clients ignore.</p>
            <div class="tm_row">
              <label class="tm_label" for="tm_selectionBg">Selection background</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_selectionBg" data-prop="selectionBg" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_selectionBg" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_selectionFg">Selection text</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_selectionFg" data-prop="selectionFg" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_selectionFg" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_scrollbarTrack">Scrollbar track</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_scrollbarTrack" data-prop="scrollbarTrack" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_scrollbarTrack" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_scrollbarThumb">Scrollbar thumb</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_scrollbarThumb" data-prop="scrollbarThumb" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_scrollbarThumb" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_scrollbarThumbHover">Scrollbar thumb hover</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_scrollbarThumbHover" data-prop="scrollbarThumbHover" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_scrollbarThumbHover" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_linkColor">Link</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_linkColor" data-prop="linkColor" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_linkColor" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_linkHoverColor">Link hover</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_linkHoverColor" data-prop="linkHoverColor" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_linkHoverColor" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_linkVisitedColor">Link visited</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_linkVisitedColor" data-prop="linkVisitedColor" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_linkVisitedColor" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_focusRingColor">Focus ring</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_focusRingColor" data-prop="focusRingColor" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_focusRingColor" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_mentionColor">@-Mention highlight</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_mentionColor" data-prop="mentionColor" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_mentionColor" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_quoteBg">Quote background</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_quoteBg" data-prop="quoteBg" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_quoteBg" maxlength="7" />
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_quoteColor">Quote text</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_quoteColor" data-prop="quoteColor" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_quoteColor" maxlength="7" />
              </div>
            </div>
          </div>
        </div>

        <!-- Chatbox -->
        <div class="tm_panel" data-panel="chatbox">
          <h3 class="tm_panel_title">Chatbox Geometry</h3>
          <div class="tm_group">
            <h4 class="tm_group_title">📐 Padding &amp; shape</h4>
            <p class="tm_hint">These values override the inner padding and rounded corners of the IC chatbox at runtime. They do not modify your selected chatbox theme's other styling.</p>
            <div class="tm_row">
              <label class="tm_label" for="tm_chatboxPadding">Inner padding (px)</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_chatboxPadding" data-prop="chatboxPadding" min="0" max="32" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_chatboxPadding">6</span><span>px</span>
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_chatboxRadius">Border radius (px)</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_chatboxRadius" data-prop="chatboxRadius" min="0" max="40" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_chatboxRadius">4</span><span>px</span>
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_chatboxBorderWidth">Border width (px)</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_chatboxBorderWidth" data-prop="chatboxBorderWidth" min="0" max="10" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_chatboxBorderWidth">2</span><span>px</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Audio -->
        <div class="tm_panel" data-panel="audio">
          <h3 class="tm_panel_title">Audio Settings</h3>
          <div class="tm_group">
            <h4 class="tm_group_title">🔉 Blip pitch</h4>
            <p class="tm_hint">Adjust the playback rate of character blip sounds — under 1.0 is deeper, over 1.0 is higher. Press "Test blip" in the live preview to hear it.</p>
            <div class="tm_row">
              <label class="tm_label" for="tm_blipPitch">Pitch</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_blipPitch" data-prop="blipPitch" min="0.5" max="2" step="0.05" class="tm_range" />
                <span class="tm_range_val" data-for="tm_blipPitch">1.00</span><span>×</span>
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
            <h4 class="tm_group_title">👥 Player List Image</h4>
            <div class="tm_row tm_row_vert">
              <label class="tm_label">Upload image</label>
              <input type="file" id="tm_playerlist_bg_file" accept="image/*" />
              <p class="tm_hint">Optional background image for the player list. Stored locally — never leaves your browser.</p>
            </div>
            <div class="tm_row" id="tm_playerlist_bg_preview_wrap" style="display:none">
              <label class="tm_label">Current image</label>
              <div class="tm_ctrl">
                <img id="tm_playerlist_bg_preview" alt="Player list background preview" style="max-height:60px;border-radius:4px;" />
                <button class="tm_btn tm_btn_danger tm_btn_sm" id="tm_playerlist_bg_clear_btn">Remove image</button>
              </div>
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
            <div class="tm_row">
              <label class="tm_label" for="tm_fontWeight">Font weight</label>
              <select id="tm_fontWeight" data-prop="fontWeight" class="tm_select">
                <option value="100">Thin (100)</option>
                <option value="300">Light (300)</option>
                <option value="400">Regular (400)</option>
                <option value="500">Medium (500)</option>
                <option value="700">Bold (700)</option>
                <option value="900">Black (900)</option>
              </select>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_lineHeight">Line height</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_lineHeight" data-prop="lineHeight" min="1" max="2.5" step="0.05" class="tm_range" />
                <span class="tm_range_val" data-for="tm_lineHeight">1.40</span>
              </div>
            </div>
          </div>

          <div id="tm_font_preview" class="tm_group">
            <h4 class="tm_group_title">👁 Preview</h4>
            <p id="tm_font_preview_text" class="tm_font_preview_text">The quick brown fox jumps over the lazy dog. 1234567890 !@#$%^&*</p>
          </div>
        </div>

        <!-- Effects -->
        <div class="tm_panel" data-panel="effects">
          <h3 class="tm_panel_title">Visual Effects</h3>
          <p class="tm_hint">Stack overlays and filters for stylised looks. Set everything to 0 for a clean theme.</p>

          <div class="tm_group">
            <h4 class="tm_group_title">📺 CRT / Scanlines</h4>
            <div class="tm_row">
              <label class="tm_label" for="tm_effectScanlines">Scanline opacity</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_effectScanlines" data-prop="effectScanlines" min="0" max="100" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_effectScanlines">0</span><span>%</span>
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_effectScanlineSpacing">Scanline spacing (px)</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_effectScanlineSpacing" data-prop="effectScanlineSpacing" min="1" max="10" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_effectScanlineSpacing">3</span><span>px</span>
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_effectChromaticAb">Chromatic aberration</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_effectChromaticAb" data-prop="effectChromaticAb" min="0" max="10" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_effectChromaticAb">0</span><span>px</span>
              </div>
            </div>
          </div>

          <div class="tm_group">
            <h4 class="tm_group_title">🌫 Vignette &amp; grain</h4>
            <div class="tm_row">
              <label class="tm_label" for="tm_effectVignette">Vignette strength</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_effectVignette" data-prop="effectVignette" min="0" max="100" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_effectVignette">0</span><span>%</span>
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_effectGrain">Film grain</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_effectGrain" data-prop="effectGrain" min="0" max="100" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_effectGrain">0</span><span>%</span>
              </div>
            </div>
          </div>

          <div class="tm_group">
            <h4 class="tm_group_title">💡 Bloom &amp; blur</h4>
            <div class="tm_row">
              <label class="tm_label" for="tm_effectBloom">Text bloom (glow)</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_effectBloom" data-prop="effectBloom" min="0" max="100" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_effectBloom">0</span><span>%</span>
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_effectBlur">Backdrop blur (px)</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_effectBlur" data-prop="effectBlur" min="0" max="20" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_effectBlur">0</span><span>px</span>
              </div>
            </div>
          </div>

          <div class="tm_group">
            <h4 class="tm_group_title">🎚 Color filters</h4>
            <p class="tm_hint">Applied to the whole document. 100% = unchanged.</p>
            <div class="tm_row">
              <label class="tm_label" for="tm_effectSaturation">Saturation</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_effectSaturation" data-prop="effectSaturation" min="0" max="200" step="5" class="tm_range" />
                <span class="tm_range_val" data-for="tm_effectSaturation">100</span><span>%</span>
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_effectContrast">Contrast</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_effectContrast" data-prop="effectContrast" min="50" max="200" step="5" class="tm_range" />
                <span class="tm_range_val" data-for="tm_effectContrast">100</span><span>%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Animations -->
        <div class="tm_panel" data-panel="animations">
          <h3 class="tm_panel_title">Animations &amp; Motion</h3>

          <div class="tm_group">
            <h4 class="tm_group_title">⏩ Speed</h4>
            <div class="tm_row">
              <label class="tm_label" for="tm_animSpeed">Animation speed</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_animSpeed" data-prop="animSpeed" min="0" max="300" step="5" class="tm_range" />
                <span class="tm_range_val" data-for="tm_animSpeed">100</span><span>%</span>
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_animHoverDuration">Hover transition (ms)</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_animHoverDuration" data-prop="animHoverDuration" min="0" max="500" step="10" class="tm_range" />
                <span class="tm_range_val" data-for="tm_animHoverDuration">120</span><span>ms</span>
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_animEasing">Easing curve</label>
              <select id="tm_animEasing" data-prop="animEasing" class="tm_select">
                <option value="linear">Linear</option>
                <option value="ease">Ease (default)</option>
                <option value="ease-in">Ease-in</option>
                <option value="ease-out">Ease-out</option>
                <option value="ease-in-out">Ease-in-out</option>
                <option value="cubic-bezier(0.34, 1.56, 0.64, 1)">Spring (overshoot)</option>
                <option value="cubic-bezier(0.68, -0.55, 0.27, 1.55)">Bounce</option>
                <option value="cubic-bezier(0.4, 0, 0.2, 1)">Material standard</option>
              </select>
            </div>
          </div>

          <div class="tm_group">
            <h4 class="tm_group_title">♿ Accessibility</h4>
            <p class="tm_hint">Respects users sensitive to motion.</p>
            <div class="tm_row">
              <label class="tm_label" for="tm_animReducedMotion">Force reduced motion</label>
              <div class="tm_ctrl">
                <input type="checkbox" id="tm_animReducedMotion" data-prop="animReducedMotion" />
                <span class="tm_hint" style="margin:0">Disables every transition + animation immediately.</span>
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_animRespectPrefers">Respect prefers-reduced-motion</label>
              <div class="tm_ctrl">
                <input type="checkbox" id="tm_animRespectPrefers" data-prop="animRespectPrefers" />
                <span class="tm_hint" style="margin:0">Honors the OS-level "reduce motion" setting.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Borders -->
        <div class="tm_panel" data-panel="borders">
          <h3 class="tm_panel_title">Borders &amp; Shape</h3>
          <p class="tm_hint">Per-element border width, style, and corner radius. Style is shared globally; widths and radii are scoped.</p>

          <div class="tm_group">
            <h4 class="tm_group_title">✏️ Border style</h4>
            <div class="tm_row">
              <label class="tm_label" for="tm_borderStyle">Style</label>
              <select id="tm_borderStyle" data-prop="borderStyle" class="tm_select">
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
                <option value="double">Double</option>
                <option value="groove">Groove</option>
                <option value="ridge">Ridge</option>
              </select>
            </div>
          </div>

          <div class="tm_group">
            <h4 class="tm_group_title">📏 Widths (px)</h4>
            <div class="tm_row">
              <label class="tm_label" for="tm_buttonBorderWidth">Buttons</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_buttonBorderWidth" data-prop="buttonBorderWidth" min="0" max="8" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_buttonBorderWidth">1</span><span>px</span>
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_panelBorderWidth">Panels (log/menu/playerlist)</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_panelBorderWidth" data-prop="panelBorderWidth" min="0" max="8" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_panelBorderWidth">1</span><span>px</span>
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_inputBorderWidth">Inputs</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_inputBorderWidth" data-prop="inputBorderWidth" min="0" max="8" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_inputBorderWidth">1</span><span>px</span>
              </div>
            </div>
          </div>

          <div class="tm_group">
            <h4 class="tm_group_title">🟦 Corner radius (px)</h4>
            <p class="tm_hint">Buttons have their own slider in the Colors tab. Sliders below cover everything else.</p>
            <div class="tm_row">
              <label class="tm_label" for="tm_panelRadius">Panels</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_panelRadius" data-prop="panelRadius" min="0" max="40" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_panelRadius">4</span><span>px</span>
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_inputRadius">Inputs</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_inputRadius" data-prop="inputRadius" min="0" max="20" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_inputRadius">4</span><span>px</span>
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_tabRadius">Tab tops</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_tabRadius" data-prop="tabRadius" min="0" max="20" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_tabRadius">4</span><span>px</span>
              </div>
            </div>
          </div>

          <div class="tm_group">
            <h4 class="tm_group_title">🎯 Focus outline</h4>
            <p class="tm_hint">Keyboard-focus indicator on buttons / inputs / links.</p>
            <div class="tm_row">
              <label class="tm_label" for="tm_outlineWidth">Outline width</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_outlineWidth" data-prop="outlineWidth" min="0" max="6" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_outlineWidth">2</span><span>px</span>
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_outlineOffset">Outline offset</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_outlineOffset" data-prop="outlineOffset" min="0" max="10" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_outlineOffset">2</span><span>px</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Shadows -->
        <div class="tm_panel" data-panel="shadows">
          <h3 class="tm_panel_title">Shadows &amp; Depth</h3>
          <p class="tm_hint">Drop shadows for elevated surfaces, inner shadows for inputs, and a separate glow that hugs the edges.</p>

          <div class="tm_group">
            <h4 class="tm_group_title">🪟 Drop shadow</h4>
            <div class="tm_row">
              <label class="tm_label" for="tm_shadowStrength">Strength</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_shadowStrength" data-prop="shadowStrength" min="0" max="100" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_shadowStrength">0</span><span>%</span>
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_shadowBlur">Blur radius</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_shadowBlur" data-prop="shadowBlur" min="0" max="40" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_shadowBlur">12</span><span>px</span>
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_shadowOffsetY">Vertical offset</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_shadowOffsetY" data-prop="shadowOffsetY" min="0" max="20" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_shadowOffsetY">4</span><span>px</span>
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_shadowColor">Shadow color</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_shadowColor" data-prop="shadowColor" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_shadowColor" maxlength="7" />
              </div>
            </div>
          </div>

          <div class="tm_group">
            <h4 class="tm_group_title">🕳 Inner shadow</h4>
            <p class="tm_hint">Subtle inset shadow on inputs and OOC name field for a "pressed" look.</p>
            <div class="tm_row">
              <label class="tm_label" for="tm_innerShadowStrength">Strength</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_innerShadowStrength" data-prop="innerShadowStrength" min="0" max="100" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_innerShadowStrength">0</span><span>%</span>
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_innerShadowBlur">Blur radius</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_innerShadowBlur" data-prop="innerShadowBlur" min="0" max="20" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_innerShadowBlur">6</span><span>px</span>
              </div>
            </div>
          </div>

          <div class="tm_group">
            <h4 class="tm_group_title">🌟 Edge glow</h4>
            <p class="tm_hint">Different from "Text bloom" in Effects — this glows the outline of buttons and panels.</p>
            <div class="tm_row">
              <label class="tm_label" for="tm_glowStrength">Strength</label>
              <div class="tm_ctrl">
                <input type="range" id="tm_glowStrength" data-prop="glowStrength" min="0" max="100" step="1" class="tm_range" />
                <span class="tm_range_val" data-for="tm_glowStrength">0</span><span>%</span>
              </div>
            </div>
            <div class="tm_row">
              <label class="tm_label" for="tm_glowColor">Glow color</label>
              <div class="tm_ctrl">
                <input type="color" id="tm_glowColor" data-prop="glowColor" class="tm_color" />
                <input type="text" class="tm_hex" data-for="tm_glowColor" maxlength="7" />
              </div>
            </div>
          </div>
        </div>

        <!-- Advanced -->
        <div class="tm_panel" data-panel="advanced">
          <h3 class="tm_panel_title">Advanced CSS</h3>

          <div class="tm_group tm_warn_banner" id="tm_css_warn_banner">
            <h4 class="tm_group_title">⚠️ Custom CSS — read me first</h4>
            <p>
              Custom CSS is injected directly into the page. CSS itself can't run scripts,
              but a malicious snippet can still leak data via <code>@import</code>,
              <code>url(http://…)</code> or <code>javascript:</code> pseudo-URLs (used for
              tracking pixels and beacons).
            </p>
            <p>
              By default we run in <strong>Strict</strong> mode and remove any
              <code>@import</code>, remote <code>url()</code>, <code>expression()</code>,
              <code>behavior:</code> and <code>javascript:</code> references before applying
              your CSS. Switch to <strong>Trusted</strong> only if you understand the snippet
              and explicitly want it to load remote resources.
            </p>
          </div>

          <div class="tm_group">
            <h4 class="tm_group_title">🛡 CSS Trust Level</h4>
            <div class="tm_row">
              <label class="tm_label">Mode</label>
              <div class="tm_ctrl">
                <label class="tm_radio_label">
                  <input type="radio" name="tm_customCSSTrust" value="strict" checked />
                  Strict (recommended)
                </label>
                <label class="tm_radio_label">
                  <input type="radio" name="tm_customCSSTrust" value="trusted" />
                  Trusted (allow remote URLs)
                </label>
              </div>
            </div>
            <p id="tm_css_removed" class="tm_hint" style="display:none"></p>
          </div>

          <div class="tm_group">
            <h4 class="tm_group_title">🧪 Extra CSS Rules</h4>
            <p class="tm_hint">Add any custom CSS you like. It will be appended after all other theme rules. Changes are applied live!</p>
            <textarea
              id="tm_extraCSS"
              class="tm_css_editor"
              placeholder="/* Your custom CSS here */
#client_log { border: 2px solid gold; }
.client_button:hover { opacity: 0.8; }"
              rows="14"
              spellcheck="false"
            ></textarea>
          </div>
          <div class="tm_group">
            <h4 class="tm_group_title">📄 Generated CSS Preview</h4>
            <p class="tm_hint">This is the full CSS that will be saved and exported (after sanitization, if Strict).</p>
            <textarea id="tm_css_preview" class="tm_css_editor tm_css_readonly" rows="12" readonly spellcheck="false"></textarea>
          </div>
        </div>

      </div><!-- /tm_panels -->
    </div><!-- /tm_body -->

    <div id="tm_footer">
      <div id="tm_footer_left">
        <button class="tm_btn tm_btn_danger" id="tm_reset_btn" title="Reset all theme maker settings to defaults">🗑 Reset to Default</button>
        <button class="tm_btn tm_btn_secondary" id="tm_undo_btn" title="Undo last change" disabled>↩ Undo</button>
        <button class="tm_btn tm_btn_secondary" id="tm_randomize_btn" title="Generate a random harmonious colour scheme">🎲 Randomize</button>
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

// ─── Undo History ─────────────────────────────────────────────────────────────

const MAX_HISTORY = 10;
const undoStack: ThemeConfig[] = [];
/** True while the user is still holding down / interacting — avoid flooding the stack. */
let isInteracting = false;

function pushToHistory(config: ThemeConfig): void {
  undoStack.push(JSON.parse(JSON.stringify(config)));
  if (undoStack.length > MAX_HISTORY) undoStack.shift();
  const undoBtn = document.getElementById("tm_undo_btn") as HTMLButtonElement | null;
  if (undoBtn) undoBtn.disabled = false;
}

function undoLastChange(): void {
  if (undoStack.length === 0) return;
  setConfig(undoStack.pop()!);
  syncUIFromConfig(currentConfig);
  liveUpdate();
  const undoBtn = document.getElementById("tm_undo_btn") as HTMLButtonElement | null;
  if (undoBtn) undoBtn.disabled = undoStack.length === 0;
}

function captureHistory(): void {
  if (!isInteracting) {
    pushToHistory(currentConfig);
    isInteracting = true;
  }
}

// ─── Random Palette Generator ─────────────────────────────────────────────────

/** Converts HSL (h: 0–360, s: 0–100, l: 0–100) to a #rrggbb hex string. */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const val = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(val * 255).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Generates a random but visually harmonious ThemeConfig derived from HSL math. */
function generateRandomPalette(): ThemeConfig {
  const hue = Math.floor(Math.random() * 360);
  const sat = 20 + Math.floor(Math.random() * 50); // 20–70 %
  const isDark = Math.random() < 0.65;              // 65 % dark, 35 % light
  const accentHue = (hue + 150 + Math.floor(Math.random() * 60)) % 360;
  const accentSat = 55 + Math.floor(Math.random() * 35);
  const radius = String(Math.floor(Math.random() * 10));

  if (isDark) {
    const bgL = 5 + Math.floor(Math.random() * 10);   // 5–15 %
    const textL = 80 + Math.floor(Math.random() * 15); // 80–95 %
    const clamp = (v: number, mn: number, mx: number) => Math.max(mn, Math.min(mx, v));
    return {
      ...DEFAULT_CONFIG,
      bodyBg: hslToHex(hue, Math.round(sat * 0.35), bgL),
      bodyColor: hslToHex(hue, 15, textL),
      menuBg: hslToHex(hue, Math.round(sat * 0.30), clamp(bgL + 4, 3, 25)),
      menuColor: hslToHex(hue, 10, textL),
      buttonBg: hslToHex(accentHue, accentSat, 35),
      buttonColor: hslToHex(hue, 5, 95),
      buttonBorder: hslToHex(accentHue, accentSat, 55),
      buttonRadius: radius,
      logBg: hslToHex(hue, Math.round(sat * 0.25), clamp(bgL - 2, 3, 20)),
      logColor: hslToHex(hue, 10, textL),
      oocBg: hslToHex(hue, Math.round(sat * 0.25), clamp(bgL + 3, 3, 25)),
      oocColor: hslToHex(hue, 10, clamp(textL - 5, 60, 95)),
      inputBg: hslToHex(hue, Math.round(sat * 0.30), clamp(bgL + 6, 3, 30)),
      inputColor: hslToHex(hue, 10, textL),
      inputBorder: hslToHex(hue, Math.round(sat * 0.35), clamp(bgL + 20, 10, 45)),
      layoutBg: hslToHex(hue, Math.round(sat * 0.25), bgL),
      icControlsBg: hslToHex(hue, Math.round(sat * 0.30), clamp(bgL + 3, 3, 25)),
      tabBg: hslToHex(hue, Math.round(sat * 0.30), clamp(bgL + 6, 3, 30)),
      tabActiveBg: hslToHex(hue, Math.round(sat * 0.35), clamp(bgL + 16, 10, 45)),
      tabColor: hslToHex(hue, 10, clamp(textL - 10, 60, 90)),
      tabActiveColor: hslToHex(hue, 5, textL),
      defHpColor: hslToHex((hue + 120) % 360, 65, 40),
      proHpColor: hslToHex((hue + 240) % 360, 70, 40),
      playerlistBg: hslToHex(hue, Math.round(sat * 0.30), clamp(bgL + 4, 3, 25)),
      playerlistColor: hslToHex(hue, 10, textL),
      playerlistBorder: hslToHex(hue, Math.round(sat * 0.35), clamp(bgL + 20, 10, 45)),
      extraCSS: currentConfig.extraCSS,
      bodyBgImage: currentConfig.bodyBgImage,
      playerlistBgImage: currentConfig.playerlistBgImage,
    };
  } else {
    // Light palette
    const bgL = 90 + Math.floor(Math.random() * 8);   // 90–98 %
    const textL = 5 + Math.floor(Math.random() * 15);  // 5–20 %
    const clamp = (v: number, mn: number, mx: number) => Math.max(mn, Math.min(mx, v));
    return {
      ...DEFAULT_CONFIG,
      bodyBg: hslToHex(hue, Math.round(sat * 0.20), bgL),
      bodyColor: hslToHex(hue, Math.round(sat * 0.40), textL),
      menuBg: hslToHex(hue, Math.round(sat * 0.20), clamp(bgL - 6, 70, 96)),
      menuColor: hslToHex(hue, Math.round(sat * 0.40), textL),
      buttonBg: hslToHex(accentHue, accentSat, 45),
      buttonColor: hslToHex(hue, 5, 98),
      buttonBorder: hslToHex(accentHue, accentSat, 35),
      buttonRadius: radius,
      logBg: hslToHex(hue, Math.round(sat * 0.10), clamp(bgL + 4, 92, 100)),
      logColor: hslToHex(hue, Math.round(sat * 0.40), textL),
      oocBg: hslToHex(hue, Math.round(sat * 0.15), clamp(bgL - 4, 70, 96)),
      oocColor: hslToHex(hue, Math.round(sat * 0.35), clamp(textL + 5, 5, 30)),
      inputBg: hslToHex(hue, 5, clamp(bgL + 2, 90, 100)),
      inputColor: hslToHex(hue, Math.round(sat * 0.40), textL),
      inputBorder: hslToHex(hue, Math.round(sat * 0.25), clamp(bgL - 25, 50, 80)),
      layoutBg: hslToHex(hue, Math.round(sat * 0.10), bgL),
      icControlsBg: hslToHex(hue, Math.round(sat * 0.15), clamp(bgL - 3, 70, 97)),
      tabBg: hslToHex(hue, Math.round(sat * 0.20), clamp(bgL - 10, 65, 92)),
      tabActiveBg: hslToHex(hue, Math.round(sat * 0.25), clamp(bgL - 20, 55, 85)),
      tabColor: hslToHex(hue, Math.round(sat * 0.30), clamp(textL + 15, 15, 50)),
      tabActiveColor: hslToHex(hue, Math.round(sat * 0.40), textL),
      defHpColor: hslToHex((hue + 120) % 360, 65, 40),
      proHpColor: hslToHex((hue + 240) % 360, 70, 40),
      playerlistBg: hslToHex(hue, Math.round(sat * 0.15), clamp(bgL - 5, 70, 96)),
      playerlistColor: hslToHex(hue, Math.round(sat * 0.40), textL),
      playerlistBorder: hslToHex(hue, Math.round(sat * 0.25), clamp(bgL - 25, 50, 80)),
      extraCSS: currentConfig.extraCSS,
      bodyBgImage: currentConfig.bodyBgImage,
      playerlistBgImage: currentConfig.playerlistBgImage,
    };
  }
}

// ─── UI ───────────────────────────────────────────────────────────────────────

function formatRangeVal(input: HTMLInputElement, raw: string): string {
  const v = Number(raw);
  if (!Number.isFinite(v)) return raw;
  const step = Number(input.step);
  if (Number.isFinite(step) && step > 0 && step < 1) {
    // Show 2 decimals for fine sliders (line-height, blip pitch).
    return v.toFixed(2);
  }
  return String(Math.round(v));
}

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
    const v = config[prop];
    if (v != null) input.value = String(v);
    const valSpan = document.querySelector<HTMLElement>(`.tm_range_val[data-for="${input.id}"]`);
    if (valSpan) valSpan.textContent = formatRangeVal(input, input.value);
  });

  // Checkboxes
  document.querySelectorAll<HTMLInputElement>("input[type=checkbox][data-prop]").forEach((input) => {
    const prop = input.dataset.prop as keyof ThemeConfig;
    input.checked = !!config[prop];
  });

  // Radio: customCSSTrust
  document.querySelectorAll<HTMLInputElement>('input[name="tm_customCSSTrust"]').forEach((r) => {
    r.checked = r.value === (config.customCSSTrust ?? "strict");
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
  updatePlayerlistBgPreview(config);

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

function updatePlayerlistBgPreview(config: ThemeConfig): void {
  const img = document.getElementById("tm_playerlist_bg_preview") as HTMLImageElement | null;
  const wrap = document.getElementById("tm_playerlist_bg_preview_wrap");
  if (!img || !wrap) return;
  if (config.playerlistBgImage) {
    img.src = config.playerlistBgImage;
    wrap.style.display = "flex";
  } else {
    img.src = "";
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

/** Update the in-modal mock chatbox / button preview + the "removed CSS" banner. */
function updateMockPreview(config: ThemeConfig): void {
  const accent = config.useAccent ? config.accentColor : config.buttonBg;
  const accentDark = shadeHex(accent, -25);
  const chatPad = Number(config.chatboxPadding) || 6;
  const chatRadius = Number(config.chatboxRadius) || 4;
  const chatBorder = Number(config.chatboxBorderWidth) || 2;

  const chatbox = document.getElementById("tm_preview_chatbox") as HTMLElement | null;
  const chatInner = document.getElementById("tm_preview_inner_chat") as HTMLElement | null;
  const chatChat = document.getElementById("tm_preview_chat") as HTMLElement | null;
  const name = document.getElementById("tm_preview_name") as HTMLElement | null;
  if (chatbox && chatInner && chatChat && name) {
    chatbox.style.background = config.logBg;
    chatbox.style.color = config.logColor;
    chatbox.style.fontFamily = config.bodyFontFamily || "sans-serif";
    chatbox.style.fontSize = config.bodyFontSize + "px";
    chatbox.style.fontWeight = config.fontWeight || "400";
    chatbox.style.lineHeight = config.lineHeight || "1.4";
    chatChat.style.borderRadius = chatRadius + "px";
    chatChat.style.borderWidth = chatBorder + "px";
    chatChat.style.borderStyle = "solid";
    chatChat.style.borderColor = config.inputBorder;
    chatInner.style.padding = `${chatPad}px ${chatPad * 2}px`;
    name.style.background = accent;
    name.style.color = config.buttonColor;
    name.style.borderColor = accentDark;
  }

  const previewBtns = document.querySelectorAll<HTMLButtonElement>(".tm_preview_btn");
  previewBtns.forEach((btn, idx) => {
    btn.style.background = idx === 1 ? shadeHex(accent, -10) : accent;
    btn.style.color = config.buttonColor;
    btn.style.borderColor = accentDark;
    btn.style.borderRadius = (Number(config.buttonRadius) || 3) + "px";
    btn.style.fontFamily = config.bodyFontFamily || "sans-serif";
  });

  // Surface what the strict sanitizer would remove from the user's extra CSS.
  const removedEl = document.getElementById("tm_css_removed");
  if (removedEl) {
    const trust = config.customCSSTrust ?? "strict";
    if (trust === "strict" && (config.extraCSS ?? "").trim()) {
      const { removed } = sanitizeCustomCSS(config.extraCSS, true);
      if (removed.length) {
        removedEl.style.display = "block";
        removedEl.textContent = `🛡 Strict mode removed ${removed.length} item(s): ` + removed.join(" · ");
      } else {
        removedEl.style.display = "block";
        removedEl.textContent = "🛡 Strict mode active — no risky patterns found in your CSS.";
      }
    } else if (trust === "trusted" && (config.extraCSS ?? "").trim()) {
      removedEl.style.display = "block";
      removedEl.textContent = "⚠️ Trusted mode — your CSS is being injected unmodified.";
    } else {
      removedEl.style.display = "none";
    }
  }
}

function liveUpdate(): void {
  const config = getConfig();
  applyThemeMakerConfig(config);
  updateFontPreview(config);
  updateCSSPreview(config);
  updateMockPreview(config);
}

// ─── Event wiring ─────────────────────────────────────────────────────────────

function wireEvents(): void {
  // ── Reset the "interacting" flag whenever the pointer is released globally ──
  document.addEventListener("pointerup", () => { isInteracting = false; }, true);

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

  // Color inputs — capture history on pointerdown, sync hex box + update live
  document.querySelectorAll<HTMLInputElement>(".tm_color[data-prop]").forEach((input) => {
    input.addEventListener("pointerdown", captureHistory);
    input.addEventListener("input", () => {
      const prop = input.dataset.prop as keyof ThemeConfig;
      (currentConfig as any)[prop] = input.value;
      const hexInput = document.querySelector<HTMLInputElement>(`.tm_hex[data-for="${input.id}"]`);
      if (hexInput) hexInput.value = input.value;
      liveUpdate();
    });
  });

  // Hex text inputs — capture history on focus, sync color picker + update live
  document.querySelectorAll<HTMLInputElement>(".tm_hex[data-for]").forEach((hexInput) => {
    hexInput.addEventListener("focus", captureHistory);
    hexInput.addEventListener("blur", () => { isInteracting = false; });
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

  // Range inputs — capture history on pointerdown
  document.querySelectorAll<HTMLInputElement>(".tm_range[data-prop]").forEach((input) => {
    input.addEventListener("pointerdown", captureHistory);
    input.addEventListener("input", () => {
      const prop = input.dataset.prop as keyof ThemeConfig;
      // Numeric props are stored as numbers; string props keep .value verbatim.
      const numericProps = new Set([
        "bodyBgOpacity", "menuBgOpacity", "logBgOpacity", "oocBgOpacity",
        "inputBgOpacity", "layoutBgOpacity", "icControlsBgOpacity",
        "tabBgOpacity", "tabActiveBgOpacity", "playerlistBgOpacity",
        "chatboxPadding", "chatboxRadius", "chatboxBorderWidth", "blipPitch",
        "effectVignette", "effectScanlines", "effectScanlineSpacing",
        "effectGrain", "effectChromaticAb", "effectBlur", "effectBloom",
        "effectSaturation", "effectContrast",
        "animSpeed", "animHoverDuration",
        "buttonBorderWidth", "panelBorderWidth", "inputBorderWidth",
        "panelRadius", "inputRadius", "tabRadius",
        "outlineWidth", "outlineOffset",
        "shadowStrength", "shadowBlur", "shadowOffsetY",
        "innerShadowStrength", "innerShadowBlur",
        "glowStrength",
      ]);
      (currentConfig as any)[prop] = numericProps.has(prop as string)
        ? Number(input.value)
        : input.value;
      const valSpan = document.querySelector<HTMLElement>(`.tm_range_val[data-for="${input.id}"]`);
      if (valSpan) valSpan.textContent = formatRangeVal(input, input.value);
      liveUpdate();
    });
  });

  // Checkbox inputs (e.g. useAccent)
  document.querySelectorAll<HTMLInputElement>("input[type=checkbox][data-prop]").forEach((input) => {
    input.addEventListener("change", () => {
      pushToHistory(currentConfig);
      const prop = input.dataset.prop as keyof ThemeConfig;
      (currentConfig as any)[prop] = input.checked;
      liveUpdate();
    });
  });

  // CSS trust radio
  document.querySelectorAll<HTMLInputElement>('input[name="tm_customCSSTrust"]').forEach((r) => {
    r.addEventListener("change", () => {
      if (!r.checked) return;
      // Hopping into Trusted mode: warn the user once per session.
      if (r.value === "trusted" && !currentConfig.customCSSAcknowledged) {
        const ok = confirm(
          "⚠️ Trusted mode injects your custom CSS unmodified.\n\n" +
          "This means @import and remote url() references will fire network " +
          "requests to whatever server you point them at, which can be used " +
          "to track you or fingerprint your browser.\n\n" +
          "Only enable this if you wrote the CSS yourself or fully trust its source.\n\n" +
          "Continue?",
        );
        if (!ok) {
          // Revert UI
          const strictRadio = document.querySelector<HTMLInputElement>('input[name="tm_customCSSTrust"][value="strict"]');
          if (strictRadio) strictRadio.checked = true;
          return;
        }
        currentConfig.customCSSAcknowledged = true;
      }
      pushToHistory(currentConfig);
      currentConfig.customCSSTrust = r.value as "strict" | "trusted";
      liveUpdate();
    });
  });

  // Test-blip button (uses an existing blipSound channel if available)
  const testBlipBtn = document.getElementById("tm_preview_blip_btn");
  if (testBlipBtn) {
    testBlipBtn.addEventListener("click", () => {
      const blip = document.querySelector(".blipSound") as HTMLAudioElement | null;
      if (!blip) {
        alert("No blip channels initialized yet — join a server first.");
        return;
      }
      try {
        (blip as any).preservesPitch = false;
        blip.playbackRate = Math.max(0.5, Math.min(2, Number(currentConfig.blipPitch) || 1));
        blip.currentTime = 0;
        blip.play().catch(() => {});
      } catch {
        /* ignore */
      }
    });
  }

  // Select dropdowns — capture history before change
  document.querySelectorAll<HTMLSelectElement>(".tm_select[data-prop]").forEach((sel) => {
    sel.addEventListener("focus", captureHistory);
    sel.addEventListener("blur", () => { isInteracting = false; });
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
    customFontInput.addEventListener("focus", captureHistory);
    customFontInput.addEventListener("blur", () => { isInteracting = false; });
    customFontInput.addEventListener("input", () => {
      currentConfig.bodyFontFamily = customFontInput.value || "sans-serif";
      liveUpdate();
    });
  }

  // Extra CSS textarea — capture history on focus
  const extraTA = document.getElementById("tm_extraCSS") as HTMLTextAreaElement | null;
  if (extraTA) {
    extraTA.addEventListener("focus", captureHistory);
    extraTA.addEventListener("blur", () => { isInteracting = false; });
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
      pushToHistory(currentConfig);
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
      pushToHistory(currentConfig);
      currentConfig.bodyBgImage = "";
      const bgFile2 = document.getElementById("tm_bg_file") as HTMLInputElement | null;
      if (bgFile2) bgFile2.value = "";
      updateBgPreview(currentConfig);
      liveUpdate();
    });
  }

  // Player list image upload
  const playerlistBgFile = document.getElementById("tm_playerlist_bg_file") as HTMLInputElement | null;
  if (playerlistBgFile) {
    playerlistBgFile.addEventListener("change", () => {
      const file = playerlistBgFile.files?.[0];
      if (!file) return;
      pushToHistory(currentConfig);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        currentConfig.playerlistBgImage = dataUrl;
        updatePlayerlistBgPreview(currentConfig);
        liveUpdate();
      };
      reader.readAsDataURL(file);
    });
  }

  // Player list image clear
  const playerlistBgClearBtn = document.getElementById("tm_playerlist_bg_clear_btn");
  if (playerlistBgClearBtn) {
    playerlistBgClearBtn.addEventListener("click", () => {
      pushToHistory(currentConfig);
      currentConfig.playerlistBgImage = "";
      const plFile = document.getElementById("tm_playerlist_bg_file") as HTMLInputElement | null;
      if (plFile) plFile.value = "";
      updatePlayerlistBgPreview(currentConfig);
      liveUpdate();
    });
  }

  // Presets
  document.querySelectorAll<HTMLButtonElement>(".tm_preset_btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      pushToHistory(currentConfig);
      const presetName = btn.dataset.preset!;
      const preset = PRESETS[presetName] ?? {};
      setConfig({ ...DEFAULT_CONFIG, ...preset, extraCSS: currentConfig.extraCSS, bodyBgImage: currentConfig.bodyBgImage, playerlistBgImage: currentConfig.playerlistBgImage });
      syncUIFromConfig(currentConfig);
      liveUpdate();
    });
  });

  // Undo
  const undoBtn = document.getElementById("tm_undo_btn") as HTMLButtonElement | null;
  if (undoBtn) {
    undoBtn.addEventListener("click", () => {
      isInteracting = false;
      undoLastChange();
    });
  }

  // Randomize
  const randomizeBtn = document.getElementById("tm_randomize_btn");
  if (randomizeBtn) {
    randomizeBtn.addEventListener("click", () => {
      pushToHistory(currentConfig);
      setConfig(generateRandomPalette());
      syncUIFromConfig(currentConfig);
      liveUpdate();
    });
  }

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
            pushToHistory(currentConfig);
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
            pushToHistory(currentConfig);
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
      pushToHistory(currentConfig);
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

  // Clear undo stack each time the modal opens and reset button state
  undoStack.length = 0;
  isInteracting = false;
  const undoBtnEl = document.getElementById("tm_undo_btn") as HTMLButtonElement | null;
  if (undoBtnEl) undoBtnEl.disabled = true;

  syncUIFromConfig(currentConfig);
  if (saved) {
    // Re-apply saved theme and update all previews
    liveUpdate();
  } else {
    // No saved config — only update the CSS preview without touching page styles
    updateCSSPreview(currentConfig);
  }
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
  } else {
    // Even if there's no saved theme, the blip pitch may have been adjusted
    // independently — restore it so audio plays with the correct rate.
    restoreBlipPitch();
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
