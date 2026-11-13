import { describe, expect, it } from 'vitest';
import { centsOff, detectPitch, midiToFreq, noteName } from './pitch';

const sine = (f: number, sr = 44100, n = 2048, amp = 0.5) => {
  const b = new Float32Array(n);
  for (let i = 0; i < n; i++) b[i] = amp * (Math.sin((2 * Math.PI * f * i) / sr) + 0.3 * Math.sin((4 * Math.PI * f * i) / sr));
  return b;
};

describe('pitch detection', () => {
  it('finds the note of a sung-like tone', () => {
    for (const f of [196, 261.63, 440, 659.25]) {
      const got = detectPitch(sine(f), 44100)!;
      expect(Math.abs(got - f) / f).toBeLessThan(0.01);
    }
  });
  it('ignores silence', () => {
    expect(detectPitch(new Float32Array(2048), 44100)).toBeNull();
  });
  it('names notes and folds octaves', () => {
    expect(noteName(60)).toBe('C4');
    expect(Math.round(centsOff(midiToFreq(72), 60))).toBe(0); // an octave up still matches
    expect(Math.round(centsOff(midiToFreq(60.3), 60))).toBe(30);
  });
});
