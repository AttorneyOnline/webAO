import { setExtraFeatures } from "../../client";

/**
 * With this the server tells us which features it supports
 * @param {Array} args list of features
 */
export const handleFL = (args: string[]) => {
  console.info("Server-supported features:");
  console.info(args);
  setExtraFeatures(args);

  if (args.includes("yellowtext")) {
    const colorselect = <HTMLSelectElement>document.getElementById("textcolor");

    colorselect.options[colorselect.options.length] = new Option("Yellow", "5");
    colorselect.options[colorselect.options.length] = new Option("Pink", "6");
    colorselect.options[colorselect.options.length] = new Option("Cyan", "7");
    colorselect.options[colorselect.options.length] = new Option("Grey", "8");
  }

  if (args.includes("cccc_ic_support")) {
    document.getElementById("cccc")!.style.display = "";
    document.getElementById("pairing")!.style.display = "";
  }

  if (args.includes("flipping")) {
    document.getElementById("button_flip")!.style.display = "";
  }

  if (args.includes("looping_sfx")) {
    document.getElementById("button_shake")!.style.display = "";
    document.getElementById("2.7")!.style.display = "";
  }

  if (args.includes("effects")) {
    document.getElementById("2.8")!.style.display = "";
  }

  if (args.includes("y_offset")) {
    document.getElementById("y_offset")!.style.display = "";
  }
};
