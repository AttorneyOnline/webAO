/* eslint @typescript-eslint/no-explicit-any: "warn" */

interface QueryParams {
    ip: string;
    mode: string;
    asset: string;
    theme: string;
}

const queryParser = (): QueryParams => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParams = {
        ip: urlParams.get("ip") || "",
        mode: urlParams.get("mode") || "join",
        asset: urlParams.get("asset") || "http://attorneyoffline.de/base/",
        theme: urlParams.get("theme") || "default",
    }
    return queryParams as QueryParams;
};
export default queryParser;
