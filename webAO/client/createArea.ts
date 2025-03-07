import { client } from "../client";
import { area_click } from "../dom/areaClick";
import { safeTags } from "../encoding";

export const createArea = (id: number, aname: string) => {
  const name = safeTags(aname);
  const thisarea = {
    name,
    players: 0,
    status: "IDLE",
    cm: "",
    locked: "FREE",
  };

  client.areas.push(thisarea);

  // Create area button
  const newarea = document.createElement("SPAN");
  newarea.className = "area-button area-default";
  newarea.id = `area${id}`;
  newarea.innerText = thisarea.name;
  newarea.title =
    `Players: ${thisarea.players}\n` +
    `Status: ${thisarea.status}\n` +
    `CM: ${thisarea.cm}\n` +
    `Area lock: ${thisarea.locked}`;
  newarea.onclick = function () {
    area_click(newarea);
  };

  document.getElementById("areas")!.appendChild(newarea);
};
