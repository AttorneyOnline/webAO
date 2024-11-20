import { client } from "../client";
import { area_click } from "./areaClick";
/**
 * Triggered when someone switches areas
 * @param {Number} ownarea
 */
export function updatePlayerAreas(ownarea: number) {
  for (let i = 0; i < client.areas.length; i++) {
    if (i === ownarea)
      for (let classelement of Array.from(
        document.getElementsByClassName(
          `area${i}`,
        ) as HTMLCollectionOf<HTMLElement>,
      ))
        classelement.style.display = "";
    else
      for (let classelement of Array.from(
        document.getElementsByClassName(
          `area${i}`,
        ) as HTMLCollectionOf<HTMLElement>,
      ))
        classelement.style.display = "none";
  }
}
