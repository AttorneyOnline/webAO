import { Testimony } from '../interfaces/Testimony'
import { client, UPDATE_INTERVAL } from '../../client'
/**
 * Intialize testimony updater
 */
export const initTestimonyUpdater = () => {
    const testimonyFilenames: Testimony = {
        1: "witnesstestimony",
        2: "crossexamination",
        3: "notguilty",
        4: "guilty",
        5: "testimony"
    };

    const testimony = testimonyFilenames[client.testimonyID];
    if (!testimony) {
        console.warn(`Invalid testimony ID ${client.testimonyID}`);
        return;
    }

    client.viewport.testimonyAudio.src = client.resources[testimony].sfx;
    client.viewport.testimonyAudio.play();

    const testimonyOverlay = <HTMLImageElement>(
        document.getElementById("client_testimony")
    );
    
    testimonyOverlay.innerHTML = client.resources[testimony].html;
    testimonyOverlay.style.opacity = "1";

    client.viewport.setTestimonyTimer(0);
    client.viewport.setTestimonyUpdater(setTimeout(() => client.viewport.updateTestimony(), UPDATE_INTERVAL));
};