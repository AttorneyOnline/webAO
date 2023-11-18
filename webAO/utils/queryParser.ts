/* eslint @typescript-eslint/no-explicit-any: "warn" */

interface QueryParams {
    ip: string;
    connect: string;
    mode: string;
    asset: string;
    theme: string;
    serverName: string;
}

const queryParser = (): QueryParams => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParams = {
        ip: urlParams.get("ip") || "",
        connect: urlParams.get("connect") || "",
        mode: urlParams.get("mode") || "join",
        asset: urlParams.get("asset") || "http://attorneyoffline.de/base/",
        theme: urlParams.get("theme") || "default",
        serverName: urlParams.get("serverName") || "Attorney Online session",
    }
    return queryParams as QueryParams;
};
export default queryParser;
