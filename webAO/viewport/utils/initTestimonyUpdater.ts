import { Testimony } from '../interfaces/Testimony.js'
import { UPDATE_INTERVAL } from '../constants/defaultChatMsg.js'
import { client } from '../../client.js'
/**
 * Intialize testimony updater
 */
export const initTestimonyUpdater = () => {
    const testimonyFilenames: Testimony = {
        1: "witnesstestimony",
        2: "crossexamination",
        3: "notguilty",
        4: "guilty",
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
    testimonyOverlay.src = client.resources[testimony].src;
    testimonyOverlay.style.opacity = "1";

    client.viewport.setTestimonyTimer(0);
    client.viewport.setTestimonyUpdater(setTimeout(() => client.viewport.updateTestimony(), UPDATE_INTERVAL));
};