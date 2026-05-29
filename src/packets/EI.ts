import { client } from "../client";
import { AO_HOST } from "../client/aoHost";
import { safeHtmlTags } from "../escaping";
import * as aolib from "../aolib";

/**
 * Per-evidence incremental info packet. aolib packs name/description/
 * type/image into the nested `details` sub-object; the handler reaches
 * through to flatten the fields into the local cache.
 */
export const applyEvidenceInfo = (packet: aolib.Out<typeof aolib.EI>) => {
  const d = packet.details;
  document.getElementById("client_loadingtext")!.innerHTML =
    `Loading Evidence ${packet.id}/${client.evidence_list_length}`;
  client.evidences[packet.id] = {
    name: safeHtmlTags(d.name),
    desc: safeHtmlTags(d.description),
    filename: d.image,
    icon: `${AO_HOST}evidence/${encodeURI(d.image.toLowerCase())}`,
  };

  client.server.send.AE({ id: packet.id + 1 });
};
