import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Creature } from './Creature';
import { config } from '../config';
import { play } from '../lib/sound';
import { WORLDS } from '../lib/worlds';

/** The hatch is the biggest moment in the app: slow wobble, cracks, flash, reveal, naming. */
export function Celebration() {
  const s = useStore();
  const c = s.creature;
  const world = s.profile?.world ?? 'emberwick';
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const kind = c.pendingCelebration;
  const [evo, setEvo] = useState(0); // 0 = old form glowing, 1 = flash, 2 = new form revealed

  useEffect(() => {
    if (kind !== 'hatch') return;
    const timers = [
      setTimeout(() => { setStep(1); play('crack'); }, 1800),
      setTimeout(() => { setStep(2); play('crack'); }, 3200),
      setTimeout(() => { setStep(3); play('crack'); }, 4400),
      setTimeout(() => { setStep(4); }, 5400),
      setTimeout(() => { setStep(5); play('hatch'); }, 5900),
    ];
    return () => timers.forEach(clearTimeout);
  }, [kind]);

  useEffect(() => {
    if (!kind || kind === 'hatch') return;
    setEvo(0);
    play('unlock');
    const timers = [
      setTimeout(() => setEvo(1), 2400),
      setTimeout(() => { setEvo(2); play('hatch'); }, 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [kind]);

  if (!kind) return null;

  if (kind === 'hatch') {
    return (
      <div className="overlay celebrate">
        <div className={`flash ${step === 4 ? 'on' : ''}`} />
        <div className="celebrate-card">
          {step < 5 ? (
            <>
              <p className="celebrate-kicker">Something is happening in {WORLDS[world].home}…</p>
              <Creature stage="egg" world={world} wobble size={260} cracks={Math.min(step, 3)} />
              <p className="muted">{step === 0 ? 'The egg is wobbling!' : step < 3 ? 'Crack… crack…' : 'Here it comes!'}</p>
            </>
          ) : (
            <>
              <div className="sparkles" aria-hidden="true">{Array.from({ length: 16 }, (_, i) => <span key={i} style={{ '--i': i } as React.CSSProperties} />)}</div>
              <p className="celebrate-kicker">It hatched!</p>
              {WORLDS[world].hatchArt && !c.customArt.hatchling
                ? <div className={`painted-creature world-${world} is-excited hatch-peek`} style={{ width: 260, height: 300 }}><span className="pc-aura" /><img className="pc-img" src={WORLDS[world].hatchArt} alt="Your baby creature peeking out of its egg" /></div>
                : <Creature stage="hatchling" world={world} mood="radiant" size={260} customArtId={c.customArt.hatchling} excited />}
              <h2>Your creature is here, {s.profile?.name}.</h2>
              <p>It hatched because you showed up and did the work. The art room is now open!</p>
              <form className="row" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { s.nameCreature(name.trim()); s.ackCelebration(); } }}>
                <input autoFocus aria-label="Creature name" placeholder="Give it a name…" value={name} onChange={(e) => setName(e.target.value)} maxLength={24} />
                <button className="btn primary" disabled={!name.trim()}>That's its name</button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  const stage = config.stages.find((x) => x.id === kind);
  const prev = config.stages[config.stages.findIndex((x) => x.id === kind) - 1];
  return (
    <div className="overlay celebrate">
      <div className={`flash ${evo === 1 ? 'on' : ''}`} />
      <div className="celebrate-card">
        {evo < 2 ? (
          <>
            <p className="celebrate-kicker">Something is changing…</p>
            <div className="evolve-stage">
              <div className="evolve-glow">
                <Creature stage={prev.id} world={world} mood="radiant" size={240} cosmetics={c.cosmetics} customArtId={c.customArt[prev.id]} />
              </div>
            </div>
            <p className="muted">{c.name ?? 'Your creature'} is glowing brighter and brighter…</p>
          </>
        ) : (
          <>
            <div className="sparkles" aria-hidden="true">{Array.from({ length: 16 }, (_, i) => <span key={i} style={{ '--i': i } as React.CSSProperties} />)}</div>
            <p className="celebrate-kicker">Evolution!</p>
            <div className="evolve-stage evolve-reveal">
              <Creature stage={kind} world={world} mood="radiant" size={260} cosmetics={c.cosmetics} customArtId={c.customArt[kind]} excited />
            </div>
            <h2>{c.name ?? 'Your creature'} is now a {stage?.name}!</h2>
            <p>Weeks of careful work did this. New brushes are waiting in the art room.</p>
            <button className="btn primary" onClick={s.ackCelebration} autoFocus>Amazing!</button>
          </>
        )}
      </div>
    </div>
  );
}
