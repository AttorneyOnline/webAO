import { positions } from "../constants/positions";
import { AO_HOST } from "../../client/aoHost";
import { client } from "../../client";
import { isFullView, Side } from "../../aolib";
import transparentPng from "../../constants/transparentPng";
import fileExists from "../../utils/fileExists";
import { isHideDesksEnabled } from "../../dom/switchHideDesks";

export async function setBackgroundImage(elementid: string, bgname: string, bgpart: string) {

  let url;
  let success = false;
  for (const extension of client.background_extensions) {
    url = `${AO_HOST}background/${encodeURI(bgname.toLowerCase())}/${bgpart}${extension}`;
    const exists = await fileExists(url);

    if (exists) {
      success = true;
      break;
    }
  }
  if (success)
    (<HTMLImageElement>document.getElementById(elementid)).src = url;
  else
    (<HTMLImageElement>document.getElementById(elementid)).src = transparentPng;
  return success;
}


/**
 * Changes the viewport background based on a given position. Unknown
 * positions fall back to a generic backdrop using the position string as
 * the bg filename stem.
 */
export const set_side = async ({
  position,
  showSpeedLines,
  showDesk,
}: {
  position: Side;
  showSpeedLines: boolean;
  showDesk: boolean;
}) => {
  const view = document.getElementById("client_fullview")!;
  const fullView = isFullView(position);

  const bench = <HTMLImageElement>(
    document.getElementById(
      fullView ? `client_${position}_bench` : "client_bench_classic",
    )
  );
  const court = <HTMLImageElement>(
    document.getElementById(
      fullView ? `client_court_${position}` : "client_court_classic",
    )
  );

  let bg;
  let desk;
  let speedLines;

  if (position in positions) {
    bg = positions[position].bg;
    desk = positions[position].desk;
    speedLines = positions[position].speedLines;
  } else {
    bg = `${position}`;
    desk = { ao2: `${position}_overlay`, ao1: "_overlay" };
    speedLines = "defense_speedlines.gif";
  }

  if (showSpeedLines === true) {
    court.src = `${AO_HOST}themes/default/${encodeURI(speedLines)}`;
  } else {
    setBackgroundImage(court.id, client.viewport.getBackgroundName(), bg);
  }

  if (isHideDesksEnabled()) {
    showDesk = false;
  }

  if (showDesk === true && desk) {
    const bg_folder = client.viewport.getBackgroundFolder();
    const stems = [desk.ao2, desk.ao1].filter((s): s is string => typeof s === "string");
    let found = false;
    outer:
    for (const stem of stems) {
      for (const ext of client.background_extensions) {
        const url = `${bg_folder}${stem}${ext}`;
        if (await fileExists(url)) {
          bench.src = url;
          bench.style.opacity = "1";
          found = true;
          break outer;
        }
      }
    }
    if (!found) {
      bench.src = transparentPng;
    }
  } else {
    bench.style.opacity = "0";
  }

  if (fullView) {
    view.style.display = "";
    document.getElementById("client_classicview")!.style.display = "none";
    switch (position) {
      case Side.DEFENSE:
        view.style.left = "0";
        break;
      case Side.WITNESS:
        view.style.left = "-200%";
        break;
      case Side.PROSECUTION:
        view.style.left = "-400%";
        break;
    }
  } else {
    view.style.display = "none";
    document.getElementById("client_classicview").style.display = "";
  }
};
