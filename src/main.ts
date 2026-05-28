// Single entry point loaded by client.html. Each side-effect import
// runs the module's top-level initialization (Client construction,
// GoldenLayout setup, DOM event dispatch wiring, audio channel
// creation) in turn.

// Runtime-swapped stylesheet placeholders. Code in dom/reloadTheme,
// dom/setChatbox, packets/AUTH, etc. assigns these elements' hrefs at
// startup -- they have to exist in the DOM before anything else runs.
// Kept here (not in client.html) because Bun's HTML bundler strips
// out <link> tags with no real href during build.
for (const id of [
  "client_theme",
  "chatbox_theme",
  "nameplate_setting",
  "mod_ui",
  "effect_css",
]) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.id = id;
  // Empty-CSS data URL: makes the link "loaded" immediately so it
  // doesn't keep the document in `interactive` state forever. Real
  // href gets set later by the modules that own each id.
  link.href = "data:text/css,";
  document.head.appendChild(link);
}

import "./client";
import "./ui";
import "./dom/dispatch";
import "./components/audioChannels";
