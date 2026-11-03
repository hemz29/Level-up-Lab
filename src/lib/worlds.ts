import type { StageId, WorldId } from '../types';

export interface CreaturePalette {
  fur: string; furDark: string; belly: string; earInner: string;
  eye: string; iris: string; glow: string; tailTip: string; mark: string;
  markShape: 'star' | 'leaf' | 'cloud';
  glowFur: boolean; // luminous streaks in the fur (Lumenwood)
}

export interface World {
  id: WorldId;
  name: string;
  tagline: string;
  motto: string; // the banner line from the world's theme art
  quotes: string[];
  description: string;
  home: string; // where the creature lives
  eggWord: string;
  art?: { hero: string; card: string; bg: string; egg: string };
  palette: { body: string; belly: string; accent: string; egg: string; eggSpots: string };
  creature: CreaturePalette;
  /** Painted creature art per stage (happy + sleepy). Stages without art fall back to the drawn creature. */
  creatureArt?: Partial<Record<Exclude<StageId, 'egg'>, { happy: string; sleepy: string; boost?: boolean }>>;
}

export const WORLDS: Record<WorldId, World> = {
  emberwick: {
    id: 'emberwick',
    name: 'Emberwick Academy',
    tagline: 'Cosy and mysterious',
    motto: 'Study · Learn · Hatch · Soar',
    quotes: ['Discipline creates brighter worlds', 'Knowledge hatches brighter worlds', 'Same lessons, bigger adventures'],
    description: 'A hidden academy of towers and lantern-lit bridges at twilight. The eggs are kept warm on velvet cushions by the fire.',
    home: 'the lantern terrace',
    eggWord: 'ember-egg',
    art: { hero: '/worlds/emberwick-hero.webp', card: '/worlds/emberwick-card.webp', bg: '/worlds/emberwick-bg.webp', egg: '/worlds/emberwick-egg.webp' },
    palette: { body: '#c58b5c', belly: '#f4e2c6', accent: '#7a2e3a', egg: '#f3d9a4', eggSpots: '#b5652e' },
    creature: { fur: '#c58b5c', furDark: '#8a5a3a', belly: '#f6e7cf', earInner: '#e58b6c', eye: '#2a1d14', iris: '#ffb347', glow: '#ffb347', tailTip: '#f6e7cf', mark: '#ffcf6b', markShape: 'star', glowFur: false },
  },
  lumenwood: {
    id: 'lumenwood',
    name: 'Lumenwood Sanctuary',
    tagline: 'Gentle and wondrous',
    motto: 'Discover · Learn · Hatch · Belong',
    quotes: ['A brighter you, a kinder world', 'Small steps, brighter worlds', 'Knowledge creates brighter worlds', 'Kinder, braver, smarter, stronger you'],
    description: 'A sanctuary of floating gardens, white stone bridges and waterfalls, where creatures are born from glowing light-seeds.',
    home: 'the waterfall terrace',
    eggWord: 'light-seed egg',
    art: { hero: '/worlds/lumenwood-hero.webp', card: '/worlds/lumenwood-card.webp', bg: '/worlds/lumenwood-bg.webp', egg: '/worlds/lumenwood-egg.webp' },
    palette: { body: '#7d84e6', belly: '#e3e6ff', accent: '#3b3f9e', egg: '#e9e4ff', eggSpots: '#9fb0ff' },
    creature: { fur: '#7d84e6', furDark: '#4b4aa8', belly: '#e6e8ff', earInner: '#b9a8ff', eye: '#1c1840', iris: '#8fe3ff', glow: '#9fd8ff', tailTip: '#f4f5ff', mark: '#9ff0ff', markShape: 'leaf', glowFur: true },
    creatureArt: {
      hatchling: { happy: '/creatures/lumenwood-hatchling-happy.webp', sleepy: '/creatures/lumenwood-hatchling-sleepy.webp' },
      juvenile: { happy: '/creatures/lumenwood-juvenile-happy.webp', sleepy: '/creatures/lumenwood-juvenile-sleepy.webp' },
      teen: { happy: '/creatures/lumenwood-teen-happy.webp', sleepy: '/creatures/lumenwood-teen-sleepy.webp' },
      // no adult art yet: the teen art with a stronger glow stands in
      adult: { happy: '/creatures/lumenwood-teen-happy.webp', sleepy: '/creatures/lumenwood-teen-sleepy.webp', boost: true },
      mythic: { happy: '/creatures/lumenwood-mythic-happy.webp', sleepy: '/creatures/lumenwood-mythic-sleepy.webp' },
    },
  },
  drift: {
    id: 'drift',
    name: 'The Drift Isles',
    tagline: 'Adventurous and open',
    motto: 'Explore · Learn · Hatch · Fly',
    quotes: ['Small steps, brighter worlds', 'Every bridge starts with one plank'],
    description: 'Floating islands linked by rope bridges, drifting through a pastel sky.',
    home: 'the cloud nest',
    eggWord: 'sky-egg',
    palette: { body: '#8fa8ff', belly: '#fde7f1', accent: '#5b4bb5', egg: '#fdeaf3', eggSpots: '#a7b8ff' },
    creature: { fur: '#f1a6c4', furDark: '#c46f93', belly: '#fff1f6', earInner: '#ffc9dc', eye: '#2a2347', iris: '#a7b8ff', glow: '#c9b8ff', tailTip: '#ffffff', mark: '#a7b8ff', markShape: 'cloud', glowFur: false },
  },
};

/** A quote for today (stable for the day). */
export function quoteOfDay(w: World, date = new Date()): string {
  const day = Math.floor(date.getTime() / 86400000);
  return w.quotes[day % w.quotes.length];
}
