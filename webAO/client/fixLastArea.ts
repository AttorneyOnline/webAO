import { client } from "../client";
import { addTrack } from "./addTrack";


/**
 * Area list fuckery
 */
export const fix_last_area = () => {
    if (client.areas.length > 0) {
        const malplaced = client.areas.pop().name;
        const areas = document.getElementById("areas")!;
        areas.removeChild(areas.lastChild);
        addTrack(malplaced);
    }
}