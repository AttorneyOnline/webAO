import { setExtraFeatures } from "../client";
import { escapeFanta, unescapeFanta } from "../escaping";
import * as aolib from "../aolib";



/**
 * With this the server tells us which features it supports
 */
export const applyFeatureFlags = (packet: aolib.Out<typeof aolib.FL>) => {
  const { features } = packet;
  setExtraFeatures(features);

  if (features.includes("yellowtext")) {
    const colorselect = <HTMLSelectElement>document.getElementById("textcolor");

    colorselect.options[colorselect.options.length] = new Option("Yellow", "5");
    colorselect.options[colorselect.options.length] = new Option("Pink", "6");
    colorselect.options[colorselect.options.length] = new Option("Cyan", "7");
    colorselect.options[colorselect.options.length] = new Option("Grey", "8");
    colorselect.options[colorselect.options.length] = new Option("Rainbow", "9");
  }

  if (features.includes("cccc_ic_support")) {
    document.getElementById("cccc")!.style.display = "";
    document.getElementById("pairing")!.style.display = "";
  }

  if (features.includes("flipping")) {
    document.getElementById("button_flip")!.style.display = "";
  }

  if (features.includes("looping_sfx")) {
    document.getElementById("button_shake")!.style.display = "";
    document.getElementById("2.7")!.style.display = "";
  }

  if (features.includes("effects")) {
    document.getElementById("2.8")!.style.display = "";
  }

  if (features.includes("y_offset")) {
    document.getElementById("y_offset")!.style.display = "";
  }
};
