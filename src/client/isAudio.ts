export const isAudio = (trackname: string) => {
  if (!trackname || typeof trackname !== 'string') {
    return false;
  }
  const audioEndings = [".wav", ".mp3", ".ogg", ".opus"];
  return (
    audioEndings.filter((ending) => trackname.endsWith(ending)).length === 1
  );
};
