import { client } from "../../client";


/**
 * we are asking ourselves what characters there are
 * @param {Array} args packet arguments
 */
export const handleRD = (_args: string[]) => {
    client.sendSelf("BN#gs4#%");
    client.sendSelf("DONE#%");
    const ooclog = <HTMLInputElement>document.getElementById("client_ooclog");
    ooclog.value = "";
    ooclog.readOnly = false;

    document.getElementById("client_oocinput")!.style.display = "none";
    document.getElementById("client_replaycontrols")!.style.display =
        "inline-block";
}