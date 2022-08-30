/**
	 * Adds up the chunk delays to find out how long a APNG is
	 * @param {data} apngFile the APNG data
	 */
const calculateApngLength = (apngFile) => {
  const d = new Uint8Array(apngFile);
  // https://wiki.mozilla.org/APNG_Specification#.60fcTL.60:_The_Frame_Control_Chunk
  let duration = 0;
  for (let i = 0; i < d.length; i++) {
    // Find fcTL header (66 63 54 4C)
    if (d[i] === 0x66
					&& d[i + 1] === 0x63
					&& d[i + 2] === 0x54
					&& d[i + 3] === 0x4C) {
      // numerator and denominator
      const delay_num = Number(d[i + 23]);
      const delay_den = Number(d[i + 25]);
      let delay;
      // minimum is 100ms
      if (delay_den == 0)
        delay = delay_num / 100;
      else
        delay = delay_num / delay_den;

      duration = duration + delay;
    }
  }
  return duration * 10;
};
export default calculateApngLength;
