// Backing tracks generated live with Web Audio: chord pads, bass and a soft beat.
// Nothing is sampled or copied, so every track is royalty-free.

export interface Backing { id: string; name: string; mood: string; bpm: number; chords: number[][] }

// chords as semitone offsets from the key's root (root-position triads)
const I = [0, 4, 7], ii = [2, 5, 9], IV = [5, 9, 12], V = [7, 11, 14], vi = [9, 12, 16], iii = [4, 7, 11];

export const BACKINGS: Backing[] = [
  { id: 'pop', name: 'Sunny Pop', mood: 'bright and bouncy', bpm: 100, chords: [I, V, vi, IV] },
  { id: 'ballad', name: 'Slow Ballad', mood: 'gentle and dreamy', bpm: 72, chords: [I, vi, IV, V] },
  { id: 'doowop', name: 'Retro Doo-wop', mood: 'classic and fun', bpm: 88, chords: [I, vi, ii, V] },
  { id: 'anthem', name: 'Big Anthem', mood: 'strong and soaring', bpm: 112, chords: [vi, IV, I, V] },
  { id: 'calm', name: 'Calm Waves', mood: 'soft and slow', bpm: 66, chords: [I, iii, IV, I] },
];

export const KEYS = [{ name: 'C', root: 48 }, { name: 'D', root: 50 }, { name: 'E', root: 52 }, { name: 'F', root: 53 }, { name: 'G', root: 55 }, { name: 'A', root: 57 }];

const hz = (m: number) => 440 * 2 ** ((m - 69) / 12);

function note(ctx: AudioContext, out: AudioNode, freq: number, t: number, dur: number, type: OscillatorType, gain: number, attack = 0.02) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + attack);
  g.gain.setTargetAtTime(0, t + dur * 0.8, dur * 0.15);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + dur + 0.3);
}

function beat(ctx: AudioContext, out: AudioNode, t: number, kind: 'kick' | 'snap', gain: number) {
  if (kind === 'kick') {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.15);
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.connect(g).connect(out); o.start(t); o.stop(t + 0.25);
  } else {
    const len = Math.floor(ctx.sampleRate * 0.08);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); const f = ctx.createBiquadFilter(); const g = ctx.createGain();
    src.buffer = buf; f.type = 'highpass'; f.frequency.value = 1800; g.gain.value = gain * 0.6;
    src.connect(f).connect(g).connect(out); src.start(t);
  }
}

/** Starts a looping backing track into `out`. Returns a stop function. One bar per chord, 4 beats. */
export function startBacking(ctx: AudioContext, out: AudioNode, b: Backing, root: number, bpmScale = 1, onBeat?: (beat: number) => void): () => void {
  const spb = 60 / (b.bpm * bpmScale);
  let next = ctx.currentTime + 0.1;
  let beatNo = 0;
  let stopped = false;
  const tick = () => {
    if (stopped) return;
    while (next < ctx.currentTime + 0.4) {
      const bar = Math.floor(beatNo / 4) % b.chords.length;
      const inBar = beatNo % 4;
      const chord = b.chords[bar];
      if (inBar === 0) {
        for (const off of chord) note(ctx, out, hz(root + 12 + off), next, spb * 4, 'triangle', 0.05, 0.08); // pad
        note(ctx, out, hz(root - 12 + chord[0]), next, spb * 1.8, 'sine', 0.16);                           // bass
      }
      if (inBar === 2) note(ctx, out, hz(root - 12 + chord[0] + (chord[2] - chord[0])), next, spb * 1.6, 'sine', 0.12);
      beat(ctx, out, next, inBar % 2 === 0 ? 'kick' : 'snap', 0.25);
      const t = next, bn = beatNo;
      if (onBeat) setTimeout(() => !stopped && onBeat(bn), Math.max(0, (t - ctx.currentTime) * 1000));
      next += spb;
      beatNo++;
    }
    timer = setTimeout(tick, 100);
  };
  let timer = setTimeout(tick, 0);
  return () => { stopped = true; clearTimeout(timer); };
}

/** A single clear note for the warm-up and ear games. */
export function playTone(ctx: AudioContext, midi: number, dur = 1, out: AudioNode = ctx.destination) {
  const t = ctx.currentTime + 0.02;
  note(ctx, out, hz(midi), t, dur, 'triangle', 0.25, 0.03);
  note(ctx, out, hz(midi) * 2, t, dur, 'sine', 0.05, 0.03);
}
