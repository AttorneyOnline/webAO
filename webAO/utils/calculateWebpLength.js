const calculateWebpLength = (webpFile) => {
  const d = new Uint8Array(webpFile);
  // https://developers.google.com/speed/webp/docs/riff_container#animation
  let duration = 0;
  for (let i = 0; i < d.length; i++) {
    // Find ANMF header (41 4E 4D 46)
    if (d[i] === 0x41
      && d[i + 1] === 0x4E
      && d[i + 2] === 0x4D
      && d[i + 3] === 0x46) {
      // Swap 5th and 6th bytes to get the delay per frame
      const delay = (d[i + 21] << 8) | (d[i + 20] & 0xFF);

      // Should be aware browsers have a minimum frame delay
      // e.g. 6ms for IE, 2ms modern browsers (50fps)
      duration += delay < 2 ? 10 : delay;
    }
  }
  return duration;
};

export default calculateWebpLength;
