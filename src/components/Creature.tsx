import { useId, useState } from 'react';
import { play } from '../lib/sound';
import type { Mood, StageId, WorldId } from '../types';
import { WORLDS } from '../lib/worlds';
import { useImage } from '../lib/useImage';

interface Props {
  stage: StageId;
  world: WorldId;
  mood?: Mood;
  size?: number;
  cosmetics?: string[];
  customArtId?: string;
  wobble?: boolean;
  cracks?: number; // 0-3, for the hatch sequence
  excited?: boolean; // jump for joy (block done, evolution, mistake caught)
  onTap?: () => void; // makes the creature tappable (hop + sparkles)
}

/** Per-stage proportions: young creatures have bigger heads and ears, older ones fuller tails and manes. */
const STAGE = {
  hatchling: { scale: 0.62, head: 1.24, tail: 0.62, tufts: false, mane: false, mythic: false },
  juvenile: { scale: 0.74, head: 1.12, tail: 0.82, tufts: false, mane: false, mythic: false },
  teen: { scale: 0.86, head: 1.04, tail: 1, tufts: true, mane: false, mythic: false },
  adult: { scale: 0.95, head: 1, tail: 1.08, tufts: true, mane: true, mythic: false },
  mythic: { scale: 1, head: 1, tail: 1.14, tufts: true, mane: true, mythic: true },
} as const;

/**
 * The creature, drawn to match the world's theme art (original design). Raaga can replace any
 * stage with her own drawing from the art room; the egg uses the world's painted egg.
 */
export function Creature({ stage, world, mood = 'content', size = 220, cosmetics = [], customArtId, wobble, cracks = 0, excited, onTap }: Props) {
  const custom = useImage(customArtId);
  const w = WORLDS[world];
  const asleep = mood === 'paused' || mood === 'sleepy';
  const cls = `creature ${wobble ? 'wobble' : ''} ${asleep ? 'asleep' : 'bob'} mood-${mood}`;
  const uid = useId().replace(/:/g, '');

  if (custom && stage !== 'egg') {
    return (
      <div className={cls} style={{ width: size, height: size }}>
        <img src={custom} alt="Your creature" className="creature-custom" />
        {asleep && <span className="zzz">z z z</span>}
      </div>
    );
  }

  if (stage === 'egg') {
    if (w.art) {
      return (
        <div className={`${cls} egg-art world-${world}`} style={{ width: size, height: size }} role="img" aria-label="A mysterious glowing egg">
          <img src={w.art.egg} alt="" draggable={false} />
          {cracks > 0 && (
            <svg viewBox="0 0 200 200" className="egg-cracks" aria-hidden="true">
              {cracks >= 1 && <path d="M62 96 l14 -10 l10 12 l12 -14" />}
              {cracks >= 2 && <path d="M104 80 l12 12 l14 -10 l12 8" />}
              {cracks >= 3 && <path d="M56 124 l18 6 l10 -8 l14 10 l16 -6 l18 4" />}
            </svg>
          )}
        </div>
      );
    }
    const p = w.palette;
    return (
      <svg className={cls} width={size} height={size} viewBox="0 0 200 200" role="img" aria-label="A mysterious egg">
        <ellipse cx="100" cy="182" rx="50" ry="8" fill="rgba(0,0,0,.18)" />
        <ellipse cx="100" cy="108" rx="58" ry="74" fill={p.egg} stroke={p.accent} strokeWidth="3" />
        <circle cx="78" cy="88" r="9" fill={p.eggSpots} opacity=".7" />
        <circle cx="122" cy="128" r="12" fill={p.eggSpots} opacity=".6" />
        <circle cx="112" cy="70" r="6" fill={p.eggSpots} opacity=".7" />
        <circle cx="84" cy="146" r="7" fill={p.eggSpots} opacity=".6" />
        <ellipse cx="80" cy="72" rx="12" ry="20" fill="#fff" opacity=".35" />
        {cracks >= 1 && <path d="M70 100 l12 -10 l10 12 l10 -14" stroke={p.accent} strokeWidth="3" fill="none" strokeLinecap="round" />}
        {cracks >= 2 && <path d="M102 88 l12 12 l14 -10 l12 8" stroke={p.accent} strokeWidth="3" fill="none" strokeLinecap="round" />}
        {cracks >= 3 && <path d="M64 120 l18 6 l10 -8 l14 10 l16 -6 l16 4" stroke={p.accent} strokeWidth="3" fill="none" strokeLinecap="round" />}
      </svg>
    );
  }

  const art = w.creatureArt?.[stage];
  if (art) return <PaintedCreature src={asleep ? art.sleepy : excited && art.excited ? art.excited : art.happy} stage={stage} world={world} asleep={asleep} boost={!!art.boost} size={size} excited={excited} onTap={onTap} />;

  const c = w.creature;
  const st = STAGE[stage];
  const happy = mood === 'radiant' || mood === 'happy';
  const id = (n: string) => `${n}-${world}-${stage}-${uid}`;
  const glowFilter = `url(#${id('glow')})`;

  return (
    <svg className={cls} width={size} height={size} viewBox="0 0 200 200" role="img" aria-label={`Your creature, ${mood}`}>
      <defs>
        <linearGradient id={id('tail')} x1="0.1" y1="1" x2="0.8" y2="0">
          <stop offset="0" stopColor={c.fur} />
          <stop offset="0.62" stopColor={c.fur} />
          <stop offset="1" stopColor={c.tailTip} />
        </linearGradient>
        <radialGradient id={id('body')} cx="0.45" cy="0.35" r="0.75">
          <stop offset="0" stopColor={c.fur} />
          <stop offset="1" stopColor={c.furDark} />
        </radialGradient>
        <radialGradient id={id('aura')} cx="0.5" cy="0.55" r="0.5">
          <stop offset="0" stopColor={c.glow} stopOpacity="0.55" />
          <stop offset="1" stopColor={c.glow} stopOpacity="0" />
        </radialGradient>
        <filter id={id('glow')} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {st.mythic && <circle cx="100" cy="112" r="96" fill={`url(#${id('aura')})`} className="aura" />}
      <ellipse cx="100" cy="188" rx={58 * st.scale} ry="7" fill="rgba(0,0,0,.22)" />

      <g transform={`translate(100 188) scale(${st.scale}) translate(-100 -188)`}>
        {/* tail */}
        <g transform={`translate(128 170) scale(${st.tail}) translate(-128 -170)`}>
          <path d="M122 172 C176 170 194 128 176 92 C166 72 146 70 140 86 C156 102 160 132 124 148 Z" fill={`url(#${id('tail')})`} stroke={c.furDark} strokeWidth="1.2" />
          <path d="M150 86 c6 4 10 10 12 18 M160 80 c6 6 9 12 10 20 M144 98 c6 6 8 12 8 18" stroke={c.tailTip} strokeWidth="1.6" fill="none" opacity=".7" strokeLinecap="round" />
          {c.glowFur && <path d="M132 150 C160 140 172 116 166 96" stroke={c.mark} strokeWidth="2" fill="none" strokeLinecap="round" filter={glowFilter} opacity=".9" />}
          {st.mythic && [[170, 92], [160, 76], [178, 112]].map(([x, y]) => <path key={`${x}`} d={`M${x} ${y - 5} l1.6 3.4 l3.4 1.6 l-3.4 1.6 l-1.6 3.4 l-1.6 -3.4 l-3.4 -1.6 l3.4 -1.6 Z`} fill={c.mark} filter={glowFilter} />)}
        </g>

        {/* body */}
        <path d="M68 188 C56 150 66 112 100 108 C134 112 144 150 132 188 Z" fill={`url(#${id('body')})`} />
        <ellipse cx="100" cy="160" rx="21" ry="25" fill={c.belly} />
        {c.glowFur && (
          <g stroke={c.mark} strokeWidth="1.8" fill="none" strokeLinecap="round" filter={glowFilter} opacity=".85">
            <path d="M76 150 c4 -8 10 -12 16 -14" /><path d="M124 150 c-4 -8 -10 -12 -16 -14" /><path d="M80 170 c3 -5 7 -8 12 -9" />
          </g>
        )}
        {/* mane / chest ruff */}
        {st.mane
          ? <path d="M62 104 L56 120 L70 117 L67 133 L82 124 L100 138 L118 124 L133 133 L130 117 L144 120 L138 104 Z" fill={c.belly} stroke={c.furDark} strokeWidth="1" strokeLinejoin="round" />
          : <path d="M78 122 L86 138 L92 127 L100 144 L108 127 L114 138 L122 122 C114 114 86 114 78 122 Z" fill={c.belly} />}
        {/* paws */}
        <ellipse cx="85" cy="185" rx="12" ry="7" fill={c.fur} stroke={c.furDark} strokeWidth="1" />
        <ellipse cx="115" cy="185" rx="12" ry="7" fill={c.fur} stroke={c.furDark} strokeWidth="1" />
        <path d="M81 185 v4 M86 185 v4 M111 185 v4 M116 185 v4" stroke={c.furDark} strokeWidth="1" opacity=".6" />

        {/* head */}
        <g transform={`translate(100 86) scale(${st.head}) translate(-100 -86)`}>
          {/* ears */}
          <path d="M70 76 L56 16 L96 58 Z" fill={c.fur} stroke={c.furDark} strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M130 76 L144 16 L104 58 Z" fill={c.fur} stroke={c.furDark} strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M73 68 L63 30 L89 58 Z" fill={c.earInner} />
          <path d="M127 68 L137 30 L111 58 Z" fill={c.earInner} />
          <path d="M66 46 l6 6 M70 40 l5 7 M134 46 l-6 6 M130 40 l-5 7" stroke={c.belly} strokeWidth="1.4" strokeLinecap="round" opacity=".8" />
          {st.tufts && <path d="M56 16 l-3 -9 M56 16 l3 -10 M144 16 l3 -9 M144 16 l-3 -10" stroke={c.furDark} strokeWidth="2.2" strokeLinecap="round" />}
          {c.glowFur && <path d="M58 22 L70 70 M142 22 L130 70" stroke={c.mark} strokeWidth="1.6" filter={glowFilter} opacity=".8" />}
          {/* head + cheek fluff */}
          <path d="M60 88 C60 60 80 50 100 50 C120 50 140 60 140 88 C140 102 130 114 100 116 C70 114 60 102 60 88 Z" fill={c.fur} stroke={c.furDark} strokeWidth="1.2" />
          <path d="M62 90 L48 100 L64 102 L54 110 L70 108 Z" fill={c.fur} />
          <path d="M138 90 L152 100 L136 102 L146 110 L130 108 Z" fill={c.fur} />
          <path d="M82 98 C82 88 118 88 118 98 C118 112 82 112 82 98 Z" fill={c.belly} />
          {/* forehead mark */}
          <g filter={glowFilter}>
            {c.markShape === 'star' && <path d="M100 58 l2.6 5.4 l5.8 0.8 l-4.2 4 l1 5.8 l-5.2 -2.8 l-5.2 2.8 l1 -5.8 l-4.2 -4 l5.8 -0.8 Z" fill={c.mark} />}
            {c.markShape === 'leaf' && <path d="M100 56 C108 62 108 70 100 76 C92 70 92 62 100 56 Z M100 58 V76" fill={c.mark} stroke={c.eye} strokeWidth="0.6" />}
            {c.markShape === 'cloud' && <path d="M92 68 a5 5 0 0 1 6 -6 a6 6 0 0 1 10 3 a4 4 0 0 1 0 8 h-14 a4 4 0 0 1 -2 -5 Z" fill={c.mark} />}
          </g>
          {/* eyes */}
          {asleep ? (
            <g stroke={c.eye} strokeWidth="3.2" strokeLinecap="round" fill="none">
              <path d="M76 86 q9 7 18 0" /><path d="M106 86 q9 7 18 0" />
            </g>
          ) : (
            <g>
              <ellipse cx="85" cy="84" rx="10" ry="11" fill={c.eye} />
              <ellipse cx="115" cy="84" rx="10" ry="11" fill={c.eye} />
              <circle cx="85" cy="85" r="7" fill={c.iris} opacity=".95" />
              <circle cx="115" cy="85" r="7" fill={c.iris} opacity=".95" />
              <circle cx="85" cy="85.5" r="4.4" fill={c.eye} />
              <circle cx="115" cy="85.5" r="4.4" fill={c.eye} />
              <circle cx="88.5" cy="80.5" r="2.8" fill="#fff" /><circle cx="118.5" cy="80.5" r="2.8" fill="#fff" />
              <circle cx="82" cy="88.5" r="1.3" fill="#fff" opacity=".9" /><circle cx="112" cy="88.5" r="1.3" fill="#fff" opacity=".9" />
            </g>
          )}
          <circle cx="74" cy="98" r="5" fill="#f2849a" opacity=".35" />
          <circle cx="126" cy="98" r="5" fill="#f2849a" opacity=".35" />
          <path d="M95.5 96.5 h9 l-4.5 5 Z" fill={c.eye} />
          <path d={happy ? 'M100 101.5 q-3 6 -8 3 M100 101.5 q3 6 8 3' : 'M100 101.5 q-3 4 -7 2.5 M100 101.5 q3 4 7 2.5'} stroke={c.eye} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {cosmetics.includes('detective-monocle') && (
            <g>
              <circle cx="115" cy="84" r="14" fill="none" stroke="#d4a72c" strokeWidth="2.6" />
              <path d="M128 90 q6 18 -4 32" stroke="#d4a72c" strokeWidth="1.6" fill="none" />
            </g>
          )}
          {st.mythic && (
            <g filter={glowFilter} fill={c.mark}>
              <circle cx="100" cy="36" r="3.4" /><circle cx="84" cy="40" r="2.4" /><circle cx="116" cy="40" r="2.4" />
              <circle cx="72" cy="48" r="1.8" /><circle cx="128" cy="48" r="1.8" />
            </g>
          )}
        </g>
        {cosmetics.includes('star-cloak') && <path d="M58 140 Q100 172 142 140 L148 180 Q100 198 52 180 Z" fill="#3b2d7a" opacity=".85" />}
      </g>
      {asleep && <text x="150" y="44" className="zzz-svg">z z z</text>}
    </svg>
  );
}

const SPARKS = Array.from({ length: 10 }, (_, i) => i);

/** Painted creature art, brought to life: breathing, floating motes, tap-to-hop, sleepy curl and joyful jumps. */
function PaintedCreature({ src, stage, world, asleep, boost, size, excited, onTap }: {
  src: string; stage: StageId; world: WorldId; asleep: boolean; boost: boolean; size: number; excited?: boolean; onTap?: () => void;
}) {
  const [hop, setHop] = useState(0);
  const tap = () => {
    if (!onTap) return;
    setHop((h) => h + 1);
    play('sparkle');
    onTap();
  };
  const wide = stage === 'mythic' && !asleep;
  return (
    <div
      className={`painted-creature world-${world} stage-${stage} ${asleep ? 'is-asleep' : 'is-awake'} ${boost ? 'boost' : ''} ${excited ? 'is-excited' : ''} ${onTap ? 'tappable' : ''}`}
      style={{ width: wide ? size * 1.25 : size, height: size }}
      onClick={tap}
      role={onTap ? 'button' : 'img'}
      tabIndex={onTap ? 0 : undefined}
      onKeyDown={(e) => { if (onTap && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); tap(); } }}
      aria-label={asleep ? 'Your creature, sleeping' : onTap ? 'Your creature. Tap to say hello' : 'Your creature'}
    >
      <span className="pc-aura" aria-hidden="true" />
      {!asleep && <span className="pc-motes" aria-hidden="true">{SPARKS.map((i) => <i key={i} style={{ '--i': i } as React.CSSProperties} />)}</span>}
      <img key={hop} src={src} alt="" draggable={false} className={`pc-img ${hop ? 'hop' : ''}`} />
      {hop > 0 && <span key={`b${hop}`} className="pc-burst" aria-hidden="true">{SPARKS.map((i) => <i key={i} style={{ '--i': i } as React.CSSProperties} />)}</span>}
      {asleep && <span className="pc-zzz" aria-hidden="true"><b>z</b><b>z</b><b>Z</b></span>}
    </div>
  );
}
