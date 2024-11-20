import { opusCheck } from "../../dom/opusCheck";

export const createBlipsChannels = () => {
  const blipSelectors = document.getElementsByClassName(
    "blipSound",
  ) as HTMLCollectionOf<HTMLAudioElement>;

  const blipChannels = [...blipSelectors];
  // Allocate multiple blip audio channels to make blips less jittery
  blipChannels.forEach((channel: HTMLAudioElement) => (channel.volume = 0.5));
  blipChannels.forEach(
    (channel: HTMLAudioElement) => (channel.onerror = opusCheck(channel)),
  );
  return blipChannels;
};
