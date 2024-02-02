import { AO_HOST } from "../../client/aoHost.js";

export const createSfxAudio = () => {
    const sfxAudio = document.getElementById(
        "client_sfxaudio"
    ) as HTMLAudioElement;
    sfxAudio.src = `${AO_HOST}sounds/general/sfx-realization.opus`;
    return sfxAudio;
};
