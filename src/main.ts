// Single entry point loaded by client.html. Each side-effect import
// runs the module's top-level initialization (Client construction,
// GoldenLayout setup, DOM event dispatch wiring, audio channel
// creation) in turn.
import "./client";
import "./ui";
import "./dom/dispatch";
import "./components/audioChannels";
