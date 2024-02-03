import { AO_HOST } from "../../client/aoHost.js";

export const createShoutAudio = () => {
    const shoutAudio = document.getElementById(
        "client_shoutaudio"
    ) as HTMLAudioElement;
    shoutAudio.src = `${AO_HOST}misc/default/objection.opus`;
    return shoutAudio;
};