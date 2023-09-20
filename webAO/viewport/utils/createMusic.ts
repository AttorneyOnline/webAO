import { opusCheck } from '../../dom/opusCheck'

export const createMusic = () => {
    const audioChannels = document.getElementsByClassName(
        "audioChannel"
    ) as HTMLCollectionOf<HTMLAudioElement>;
    const music = [...audioChannels];
    music.forEach((channel: HTMLAudioElement) => (channel.volume = 0.5));
    music.forEach(
        (channel: HTMLAudioElement) => (channel.onerror = opusCheck(channel))
    );
    return music;
};