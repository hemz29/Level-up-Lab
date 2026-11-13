import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { todayKey } from '../engine/dates';
import { balanceOf } from '../store/selectors';
import { play } from './sound';

/** Spends one minute of play time for each minute in a room; reports when time is up. */
export function usePlayMeter(reason: string) {
  const spendPlay = useStore((s) => s.spendPlay);
  const balance = useStore((s) => balanceOf(s, todayKey()));
  const [secs, setSecs] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  useEffect(() => {
    if (timeUp) return;
    const t = setInterval(() => setSecs((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [timeUp]);
  useEffect(() => { if (secs > 0 && secs % 60 === 0) spendPlay(1, reason); }, [secs]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (balance <= 0 && !timeUp) { setTimeUp(true); play('break'); } }, [balance, timeUp]);
  return { leftSec: Math.max(0, balance * 60 - (secs % 60)), timeUp };
}
