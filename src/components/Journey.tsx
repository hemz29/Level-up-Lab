import type { StageId, WorldId } from '../types';
import { config } from '../config';
import { WORLDS } from '../lib/worlds';
import { stageIndex } from '../engine/creature';

/** The creature's journey: stages reached, a glowing silhouette of the next one ("who will it become?"), and locked ones. */
export function Journey({ world, stage }: { world: WorldId; stage: StageId }) {
  const w = WORLDS[world];
  if (!w.creatureArt) return null;
  const cur = stageIndex(stage);
  const stages = config.stages.filter((s) => s.id !== 'egg');
  return (
    <div className="journey" aria-label="Your creature's journey">
      {stages.map((s) => {
        const i = stageIndex(s.id);
        const art = w.creatureArt?.[s.id as Exclude<StageId, 'egg'>];
        const state = i < cur ? 'reached' : i === cur ? 'current' : i === cur + 1 ? 'next' : 'locked';
        return (
          <div key={s.id} className={`journey-step ${state}`} title={state === 'next' ? `Next: ${s.name}. Who will it become?` : s.name}>
            <div className="journey-thumb">{art ? <img src={art.happy} alt="" /> : null}</div>
            <span>{state === 'next' ? 'Next?' : state === 'locked' ? '???' : s.name}</span>
          </div>
        );
      })}
    </div>
  );
}
