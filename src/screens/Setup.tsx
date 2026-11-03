import { useState } from 'react';
import type { WorldId } from '../types';
import { useStore } from '../store';
import { WORLDS } from '../lib/worlds';
import { Creature } from '../components/Creature';
import { play } from '../lib/sound';

const GROWN_UPS = ['Mum', 'Dad', 'Amma', 'Papa', 'Grandma', 'Grandpa'];

/** First run for a child. `name` comes from the child profile; in local mode the child types it. */
export function Setup({ name: givenName }: { name?: string }) {
  const setupProfile = useStore((s) => s.setupProfile);
  const [step, setStep] = useState(givenName ? 0 : -1);
  const [world, setWorld] = useState<WorldId>();
  const [name, setName] = useState(givenName ?? '');
  const [parentLabel, setParentLabel] = useState('Mum');

  if (step === -1) {
    return (
      <div className="setup">
        <form className="card narrow center stack" onSubmit={(e) => { e.preventDefault(); if (name.trim()) setStep(0); }}>
          <p className="kicker">Level-Up Lab</p>
          <h1>What's your name?</h1>
          <input autoFocus maxLength={30} value={name} onChange={(e) => setName(e.target.value)} aria-label="Your name" placeholder="First name or nickname" />
          <button className="btn primary big" disabled={!name.trim()}>That's me</button>
        </form>
      </div>
    );
  }

  if (step === 0) {
    return (
      <div className="setup">
        <div className="card narrow center">
          <p className="kicker">A new adventure begins</p>
          <h1>Hello, {name}.</h1>
          <p className="big">Welcome to Level-Up Lab. You make the plan, you do the work, and a creature grows because of it. Careful work opens rooms for art, music and games.</p>
          <p className="muted">Who will you tell about your study days?</p>
          <div className="chips center-row">
            {GROWN_UPS.map((g) => <button key={g} className={`chip ${parentLabel === g ? 'on' : ''}`} onClick={() => setParentLabel(g)}>{g}</button>)}
            <input className="chip-input" aria-label="Someone else" placeholder="Someone else…" maxLength={20}
              value={GROWN_UPS.includes(parentLabel) ? '' : parentLabel} onChange={(e) => setParentLabel(e.target.value || 'Mum')} />
          </div>
          <p className="muted">Next, pick the world your creature will live in. It only changes how things look, so pick the one you love.</p>
          <button className="btn primary big" onClick={() => setStep(1)} autoFocus>Choose my world</button>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="setup">
        <h1 className="center">Where will your creature live?</h1>
        <div className="world-grid">
          {(Object.keys(WORLDS) as WorldId[]).map((id) => (
            <button key={id} className={`world-card world-${id} ${WORLDS[id].art ? 'has-art' : ''} ${world === id ? 'on' : ''}`}
              style={WORLDS[id].art ? { backgroundImage: `url(${WORLDS[id].art!.card})` } : undefined}
              onClick={() => { setWorld(id); play('accept'); }} aria-pressed={world === id}>
              <span className="world-tag">{WORLDS[id].tagline}</span>
              <h2>{WORLDS[id].name}</h2>
              <p className="world-motto">{WORLDS[id].motto}</p>
              <p>{WORLDS[id].description}</p>
            </button>
          ))}
        </div>
        <div className="center">
          <button className="btn primary big" disabled={!world} onClick={() => { setStep(2); play('unlock'); }}>This one</button>
        </div>
      </div>
    );
  }

  const w = WORLDS[world!];
  return (
    <div className={`setup world-${world}`}>
      <div className="card narrow center">
        <p className="kicker">{w.name}</p>
        <h1>You have received a {w.eggWord}.</h1>
        <Creature stage="egg" world={world!} wobble size={240} />
        <p className="big">It's warm, and something inside is humming. Finish two study blocks with honest notes and it will hatch.</p>
        <p className="world-quote">{w.quotes[0]}</p>
        <button className="btn primary big" onClick={() => { setupProfile(name.trim(), world!, parentLabel.trim() || 'Mum'); play('start'); }} autoFocus>Take it to {w.home}</button>
      </div>
    </div>
  );
}
