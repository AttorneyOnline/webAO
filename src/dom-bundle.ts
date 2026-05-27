// dispatch.ts is the single entry point for HTML-driven handlers: it
// imports every dom/*.ts that exposes a handler, builds the action
// map, and registers the delegated listeners.
import "./dom/dispatch";

// Standalone side-effect modules (no actions to expose).
import "./dom/audioMute";
import "./dom/pairNotification";
import "./dom/renderPlayerList";
import "./dom/resizeChatbox";
import "./dom/spritePreview";
import "./dom/switchHideDesks";
import "./dom/themeMaker";
