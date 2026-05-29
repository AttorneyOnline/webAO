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
export async function set_side({
  position,
  showSpeedLines,
  showDesk,
}: {
  position: Side;
  showSpeedLines: boolean;
  showDesk: boolean;
}) {
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
}

import { getIndexFromSelect } from "../../dom/getIndexFromSelect";
import { switchPanTilt } from "../../dom/switchPanTilt";
import { updateBackgroundPreview } from "../../dom/updateBackgroundPreview";
import { safeHtmlTags } from "../../escaping";
import type * as aolib from "../../aolib";

/** BN: background change broadcast — swap every viewport background slot. */
export function applyBackgroundChange(packet: aolib.BNPacket) {
  const bgFromArgs = safeHtmlTags(packet.background);
  client.viewport.setBackgroundName(bgFromArgs);
  const bg_index = getIndexFromSelect("bg_select", client.viewport.getBackgroundName());
  (<HTMLSelectElement>document.getElementById("bg_select")).selectedIndex = bg_index;
  updateBackgroundPreview();
  if (bg_index === 0) {
    (<HTMLInputElement>document.getElementById("bg_filename")).value =
      client.viewport.getBackgroundName();
  }

  setBackgroundImage("bg_preview", packet.background, "defenseempty");
  setBackgroundImage("client_def_bench", packet.background, "defensedesk");
  setBackgroundImage("client_wit_bench", packet.background, "stand");
  setBackgroundImage("client_pro_bench", packet.background, "prosecutiondesk");
  setBackgroundImage("client_court_def", packet.background, "defenseempty");
  setBackgroundImage("client_court_wit", packet.background, "witnessempty");
  setBackgroundImage("client_court_pro", packet.background, "prosecutorempty");
  setBackgroundImage("client_court_deft", packet.background, "transition_def");
  setBackgroundImage("client_court_prot", packet.background, "transition_pro");
  setBackgroundImage("client_court", packet.background, "court");

  if ((<HTMLImageElement>document.getElementById("client_court")).src !== transparentPng) {
    const pantiltCheckbox = <HTMLInputElement>document.getElementById("client_pantilt");
    if (pantiltCheckbox.checked) switchPanTilt();
  }

  if (client.charID === -1) {
    client.viewport.set_side({ position: Side.JUDGE, showSpeedLines: false, showDesk: true });
  } else {
    client.viewport.set_side({
      position: client.chars[client.charID].side,
      showSpeedLines: false,
      showDesk: true,
    });
  }
}
