import { ScoreboardThemeId } from '../types';

export interface ArenaTheme {
  id: ScoreboardThemeId;
  name: string;
  subtitle: string;
  badge: string;
  identity: string;
  behavior: string;
  accentColor: string;
  primaryColor: string;
}

export const ARENA_THEME_LIST: ArenaTheme[] = [
  {
    id: 'sleek-obsidian',
    name: 'Sleek Obsidian',
    subtitle: 'Next-Gen TV Broadcast Cyber HUD',
    badge: 'Pro Arena Default',
    identity: 'Deep carbon obsidian textures with razor-sharp cyan telemetry highlights',
    behavior: 'Precision digital pulses and ultra-clean geometric bevel outlines',
    accentColor: '#38bdf8',
    primaryColor: '#00f0ff',
  },
  {
    id: 'turbo-velocity',
    name: 'Turbo Velocity',
    subtitle: 'High-Octane Kinetic Racer HUD',
    badge: 'High Speed HUD',
    identity: 'Aggressive crimson and flame-red streaks with aerodynamic speed fins',
    behavior: 'Dynamic acceleration pulses and flashing chevrons during active raids',
    accentColor: '#ff1753',
    primaryColor: '#ef4444',
  },
  {
    id: 'titan-mech',
    name: 'Titan Mech',
    subtitle: 'Heavy Industrial Armored Chassis',
    badge: 'Reinforced Steel',
    identity: 'Brushed steel plates, industrial bolt rivets, and hazard warning chevrons',
    behavior: 'Heavy structural shockwaves and mechanical recoil on every point scored',
    accentColor: '#38bdf8',
    primaryColor: '#64748b',
  },
  {
    id: 'cyber-glitch',
    name: 'Cyber Glitch',
    subtitle: 'Neon Syndicate Cyberpunk HUD',
    badge: 'Night City Circuit',
    identity: 'Vibrant neon magenta and electric cyan PCB traces with digital scanlines',
    behavior: 'Subtle digital chromatic aberration and reactive circuitry sparks on score',
    accentColor: '#00f0ff',
    primaryColor: '#ec4899',
  },
  {
    id: 'apex-gold',
    name: 'Apex Gold',
    subtitle: 'Championship Royale Luxury Trophy HUD',
    badge: 'Tournament Final',
    identity: 'Polished gold leaf bezels with deep imperial obsidian backing and star crests',
    behavior: 'Luminous golden crown aura, shimmer bursts, and championship pyrotechnics',
    accentColor: '#fbbf24',
    primaryColor: '#eab308',
  },
];

export const ARENA_THEMES: Record<ScoreboardThemeId, ArenaTheme> = {
  'sleek-obsidian': ARENA_THEME_LIST[0],
  'turbo-velocity': ARENA_THEME_LIST[1],
  'titan-mech': ARENA_THEME_LIST[2],
  'cyber-glitch': ARENA_THEME_LIST[3],
  'apex-gold': ARENA_THEME_LIST[4],
};
