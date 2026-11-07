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
  creatureArt?: Partial<Record<Exclude<StageId, 'egg'>, { happy: string; sleepy?: string; excited?: string; boost?: boolean }>>;
  /** The baby peeking out of its cracked egg, shown at the hatch reveal. */
  hatchArt?: string;
}

export const WORLDS: Record<WorldId, World> = {
  emberwick: {
    id: 'emberwick',
    name: 'Emberwick Academy',
    tagline: 'Cosy and mysterious',
    motto: 'Study · Learn · Hatch · Soar',
    quotes: ['Discipline creates brighter worlds', 'Knowledge hatches brighter worlds', 'Same lessons, bigger adventures'],
    description: 'A hidden academy in an old clock tower beside a crystal waterfall, with candlelit windows and ribbons of glowing water in the night sky.',
    home: 'the waterfall terrace',
    eggWord: 'star-dragon egg',
    art: { hero: '/worlds/emberwick-hero.webp', card: '/worlds/emberwick-card.webp', bg: '/worlds/emberwick-bg.webp', egg: '/creatures/emberwick-egg.webp' },
    // painted star-dragon
    creatureArt: {
      hatchling: { happy: '/creatures/emberwick-hatchling-happy.webp', sleepy: '/creatures/emberwick-hatchling-sleepy.webp' },
      juvenile: { happy: '/creatures/emberwick-juvenile-happy.webp', sleepy: '/creatures/emberwick-juvenile-sleepy.webp', excited: '/creatures/emberwick-juvenile-excited.webp' },
      teen: { happy: '/creatures/emberwick-teen-happy.webp', sleepy: '/creatures/emberwick-teen-sleepy.webp', excited: '/creatures/emberwick-teen-excited.webp' },
      adult: { happy: '/creatures/emberwick-adult-happy.webp', sleepy: '/creatures/emberwick-adult-sleepy.webp', excited: '/creatures/emberwick-adult-excited.webp' },
      mythic: { happy: '/creatures/emberwick-mythic-happy.webp', sleepy: '/creatures/emberwick-mythic-sleepy.webp', excited: '/creatures/emberwick-mythic-excited.webp' },
    },
    hatchArt: '/creatures/emberwick-hatching-egg.webp',
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
      hatchling: { happy: '/creatures/lumenwood-hatchling-happy.webp', sleepy: '/creatures/lumenwood-hatchling-sleepy.webp', excited: '/creatures/lumenwood-hatchling-excited.webp' },
      juvenile: { happy: '/creatures/lumenwood-juvenile-happy.webp', sleepy: '/creatures/lumenwood-juvenile-sleepy.webp', excited: '/creatures/lumenwood-juvenile-excited.webp' },
      teen: { happy: '/creatures/lumenwood-teen-happy.webp', sleepy: '/creatures/lumenwood-teen-sleepy.webp' },
      adult: { happy: '/creatures/lumenwood-adult-happy.webp', sleepy: '/creatures/lumenwood-adult-sleepy.webp', boost: true },
      mythic: { happy: '/creatures/lumenwood-mythic-happy.webp', sleepy: '/creatures/lumenwood-mythic-sleepy.webp' },
    },
    hatchArt: '/creatures/lumenwood-hatching-egg.webp',
  },
  drift: {
    id: 'drift',
    name: 'Neon Rails',
    tagline: 'Fast, bright and fun',
    motto: 'Run · Learn · Hatch · Level Up',
    quotes: ['Small steps, big wins', 'Every block is a coin in the bank', 'Keep rolling, keep learning', 'One more stop to legendary'],
    description: 'A sunny city train yard full of colourful graffiti trains, glowing rails and floating coins and gems.',
    home: 'the train yard',
    eggWord: 'graffiti egg',
    art: { hero: '/worlds/drift-hero.webp', card: '/worlds/drift-card.webp', bg: '/worlds/drift-bg.webp', egg: '/creatures/drift-egg.webp' },
    palette: { body: '#f1f1fb', belly: '#ffffff', accent: '#7b4dd8', egg: '#fdeaf3', eggSpots: '#2fd3c0' },
    creature: { fur: '#eeeaf8', furDark: '#b9a8e6', belly: '#ffffff', earInner: '#c9b6f3', eye: '#1c2a3a', iris: '#4fe3c1', glow: '#5ff0d8', tailTip: '#ffffff', mark: '#5ff0d8', markShape: 'cloud', glowFur: false },
    creatureArt: {
      hatchling: { happy: '/creatures/drift-hatchling-happy.webp', sleepy: '/creatures/drift-hatchling-sleepy.webp', excited: '/creatures/drift-hatchling-excited.webp' },
      juvenile: { happy: '/creatures/drift-juvenile-happy.webp', sleepy: '/creatures/drift-juvenile-sleepy.webp', excited: '/creatures/drift-juvenile-excited.webp' },
      teen: { happy: '/creatures/drift-teen-happy.webp', sleepy: '/creatures/drift-teen-sleepy.webp', excited: '/creatures/drift-teen-excited.webp' },
      adult: { happy: '/creatures/drift-adult-happy.webp', sleepy: '/creatures/drift-adult-sleepy.webp', excited: '/creatures/drift-adult-excited.webp' },
      mythic: { happy: '/creatures/drift-mythic-happy.webp', sleepy: '/creatures/drift-mythic-sleepy.webp', excited: '/creatures/drift-mythic-excited.webp' },
    },
    hatchArt: '/creatures/drift-hatching-egg.webp',
  },

};

/** A quote for today (stable for the day). */
export function quoteOfDay(w: World, date = new Date()): string {
  const day = Math.floor(date.getTime() / 86400000);
  return w.quotes[day % w.quotes.length];
}
