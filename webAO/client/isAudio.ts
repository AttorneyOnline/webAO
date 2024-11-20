export const isAudio = (trackname: string) => {
  const audioEndings = [".wav", ".mp3", ".ogg", ".opus"];
  return (
    audioEndings.filter((ending) => trackname.endsWith(ending)).length === 1
  );
};
