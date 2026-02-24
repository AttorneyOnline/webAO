import { client, UPDATE_INTERVAL } from "../../client";
import { AO_HOST } from "../../client/aoHost";
import { testimonies } from "../constants/testimony";
/**
 * Initialize testimony updater
 */
export const initTestimonyUpdater = () => {
  if (!client.testimony) {
    console.warn("No active testimony to initialize");
    return;
  }

  const config = testimonies[client.testimony];
  const theme = client.viewport.getTheme();

  client.viewport.testimonyAudio.src = `${AO_HOST}${config.sfx}`;
  client.viewport.testimonyAudio.play().catch(() => {});

  const testimonyOverlay = <HTMLImageElement>(
    document.getElementById("client_testimony")
  );
  testimonyOverlay.src = `${AO_HOST}themes/${theme}/${config.image}`;
  testimonyOverlay.style.opacity = "1";

  client.viewport.setTestimonyTimer(0);
  client.viewport.setTestimonyUpdater(
    setTimeout(() => client.viewport.updateTestimony(), UPDATE_INTERVAL),
  );
};
