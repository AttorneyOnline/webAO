import queryParser from "../utils/queryParser";

const { asset } = queryParser();
export let AO_HOST = asset;
export const setAOhost = (val: string) => {
  const currentProtocol = window.location.protocol;
  const assetProtocol = val.split(":")[0] + ":";

  if (currentProtocol === "https:" && assetProtocol === "http:") {
    // In this specific case, we need to request assets over HTTPS
    console.log("Upgrading asset link to https");
    val = val.replace("http:", "https:");
  }
  if (AO_HOST.length < 5) {
    AO_HOST = val;
  }  
};
