import { useState } from 'react';
import type { WorldId } from '../types';
import { useStore } from '../store';
import { WORLDS } from '../lib/worlds';
import { play } from '../lib/sound';
import { Creature } from './Creature';
import { Modal } from './Modal';

/** Worlds are purely cosmetic: the creature keeps its name, stage, GP, traits, cosmetics and custom art. */
export function WorldPicker({ onClose }: { onClose: () => void }) {
  const s = useStore();
  const current = s.profile!.world;
  const [pick, setPick] = useState<WorldId>(current);
  const c = s.creature;
  const who = c.name ?? (c.stage === 'egg' ? 'Your egg' : 'Your creature');

  return (
    <Modal title="Move to another world" onClose={onClose} wide>
      <p>{who} comes with you, with the same name, level, GP and treasures. Only the scenery and colours change, and you can move back any time.</p>
      <div className="world-grid">
        {(Object.keys(WORLDS) as WorldId[]).map((id) => (
          <button key={id} className={`world-card world-${id} ${WORLDS[id].art ? 'has-art' : ''} ${pick === id ? 'on' : ''}`}
            style={WORLDS[id].art ? { backgroundImage: `url(${WORLDS[id].art!.card})` } : undefined}
            onClick={() => { setPick(id); play('accept'); }} aria-pressed={pick === id}>
            <span className="world-tag">{id === current ? 'You live here now' : WORLDS[id].tagline}</span>
            <h2>{WORLDS[id].name}</h2>
            <Creature stage={c.stage} world={id} mood="happy" size={110} cosmetics={c.cosmetics} customArtId={c.customArt[c.stage]} />
          </button>
        ))}
      </div>
      <div className="row">
        <button className="btn primary" disabled={pick === current} onClick={() => { s.setWorld(pick); play('unlock'); onClose(); }}>
          {pick === current ? 'Pick a new world' : `Move to ${WORLDS[pick].name}`}
        </button>
        <button className="btn ghost" onClick={onClose}>Stay here</button>
      </div>
    </Modal>
  );
}
