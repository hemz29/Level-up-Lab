// Pitch detection for the singing games: autocorrelation over a short buffer of mic samples.

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** Fundamental frequency in Hz, or null when the sound is too quiet or unclear. */
export function detectPitch(buf: Float32Array, sampleRate: number): number | null {
  const n = buf.length;
  let rms = 0;
  for (let i = 0; i < n; i++) rms += buf[i] * buf[i];
  if (Math.sqrt(rms / n) < 0.012) return null; // silence
  // trim leading/trailing low-level parts to steady the estimate
  let a = 0, b = n - 1;
  while (a < n / 2 && Math.abs(buf[a]) < 0.2 * Math.max(...buf.slice(0, n / 2).map(Math.abs))) a++;
  while (b > n / 2 && Math.abs(buf[b]) < 0.2 * Math.max(...buf.slice(n / 2).map(Math.abs))) b--;
  const x = buf.slice(a, b);
  const len = x.length;
  const minLag = Math.floor(sampleRate / 1100); // up to ~1100 Hz
  const maxLag = Math.min(len - 1, Math.floor(sampleRate / 70)); // down to ~70 Hz
  const c = new Float32Array(maxLag + 1);
  for (let lag = 0; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < len - lag; i++) sum += x[i] * x[i + lag];
    c[lag] = sum;
  }
  // skip the initial peak at lag 0, then take the highest peak after the first dip
  let d = minLag;
  while (d < maxLag && c[d] > c[d + 1]) d++;
  let best = -1, bestLag = -1;
  for (let lag = d; lag <= maxLag; lag++) if (c[lag] > best) { best = c[lag]; bestLag = lag; }
  if (bestLag <= 0 || best < c[0] * 0.3) return null; // not periodic enough
  // parabolic interpolation for sub-sample accuracy
  const y1 = c[bestLag - 1] ?? best, y2 = best, y3 = c[bestLag + 1] ?? best;
  const shift = (y3 - y1) / (2 * (2 * y2 - y1 - y3) || 1);
  return sampleRate / (bestLag + (Number.isFinite(shift) ? shift : 0));
}

export const midiToFreq = (m: number) => 440 * 2 ** ((m - 69) / 12);
export const freqToMidi = (f: number) => 69 + 12 * Math.log2(f / 440);
export const noteName = (m: number) => `${NOTES[((Math.round(m) % 12) + 12) % 12]}${Math.floor(Math.round(m) / 12) - 1}`;

/** Cents away from the target note, folded to the nearest octave so a lower or higher voice still counts. */
export function centsOff(freq: number, targetMidi: number): number {
  let d = (freqToMidi(freq) - targetMidi) * 100;
  while (d > 600) d -= 1200;
  while (d < -600) d += 1200;
  return d;
}
