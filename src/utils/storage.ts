import { ScoreboardSettings, ScoreboardAudioMap } from '../types';
import { DEFAULT_LAYOUT } from './defaultLayout';
import { formatKeyDisplay } from './actionKeybindings';

export const DEFAULT_AUDIO_MAP: ScoreboardAudioMap = {
  addPointTeam1: { fileName: null },
  minusPointTeam1: { fileName: null },
  resetScoreTeam1: { fileName: null },
  addPointTeam2: { fileName: null },
  minusPointTeam2: { fileName: null },
  resetScoreTeam2: { fileName: null },
  startTimer: { fileName: null },
  resetTimer: { fileName: null },
  thirdRaid: { fileName: null },
  thirdRaidReset: { fileName: null },
  stopAllAudio: { fileName: null },
};

export const DEFAULT_SETTINGS: ScoreboardSettings = {
  team1: {
    name: 'BLUE RAIDERS',
    score: 0,
    color: '#1d4ed8', // Vivid Cobalt Blue
  },
  team2: {
    name: 'RED WARRIORS',
    score: 0,
    color: '#dc2626', // Intense Crimson Red
  },
  raidDuration: 30,
  soundEnabled: true,
  soundVolume: 0.8,
  beepOnLowTime: true,
  customLayout: DEFAULT_LAYOUT,
  theme: 'sleek-obsidian',
  teamNameFontSize: 26,
  scoreFontSize: 180,
  keyBindings: {
    // 11 Scoreboard Operator Actions (F1 - F10, Space)
    addPointTeam1: 'F1',
    minusPointTeam1: 'F2',
    resetScoreTeam1: 'F3',
    addPointTeam2: 'F4',
    minusPointTeam2: 'F5',
    resetScoreTeam2: 'F6',
    startTimer: 'Space',
    resetTimer: 'R',
    thirdRaid: 'D',
    thirdRaidReset: 'R',
    stopAllAudio: 'F11',

    // Legacy fallback keys
    team1Add: 'F1',
    team1Sub: 'F2',
    team1Reset: 'F3',
    team2Add: 'F4',
    team2Sub: 'F5',
    team2Reset: 'F6',
    raidTimerToggle: 'Space',
    raidTimerReset: 'R',
    thirdRaidToggle: 'D',
    raidTimerAdd5: 'ArrowUp',
    raidTimerSub5: 'ArrowDown',
    resetScores: 'x',
    toggleFullscreen: 'f',
    toggleSound: 'b',
    openSettings: 'Escape',
  },
  actionAudios: DEFAULT_AUDIO_MAP,
};

const STORAGE_KEY = 'kabaddi_scoreboard_v2';

export function loadSettings(): ScoreboardSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    const parsedKeys = parsed.keyBindings || {};

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      team1: { ...DEFAULT_SETTINGS.team1, ...parsed.team1 },
      team2: { ...DEFAULT_SETTINGS.team2, ...parsed.team2 },
      keyBindings: {
        ...DEFAULT_SETTINGS.keyBindings,
        ...parsedKeys,
        // Ensure all 11 action keys exist, checking new keys first then legacy keys
        addPointTeam1: parsedKeys.addPointTeam1 || parsedKeys.team1Add || DEFAULT_SETTINGS.keyBindings.addPointTeam1,
        minusPointTeam1: parsedKeys.minusPointTeam1 || parsedKeys.team1Sub || DEFAULT_SETTINGS.keyBindings.minusPointTeam1,
        resetScoreTeam1: parsedKeys.resetScoreTeam1 || parsedKeys.team1Reset || DEFAULT_SETTINGS.keyBindings.resetScoreTeam1,
        addPointTeam2: parsedKeys.addPointTeam2 || parsedKeys.team2Add || DEFAULT_SETTINGS.keyBindings.addPointTeam2,
        minusPointTeam2: parsedKeys.minusPointTeam2 || parsedKeys.team2Sub || DEFAULT_SETTINGS.keyBindings.minusPointTeam2,
        resetScoreTeam2: parsedKeys.resetScoreTeam2 || parsedKeys.team2Reset || DEFAULT_SETTINGS.keyBindings.resetScoreTeam2,
        startTimer: parsedKeys.startTimer || parsedKeys.raidTimerToggle || DEFAULT_SETTINGS.keyBindings.startTimer,
        resetTimer: parsedKeys.resetTimer || parsedKeys.raidTimerReset || DEFAULT_SETTINGS.keyBindings.resetTimer,
        thirdRaid: parsedKeys.thirdRaid || parsedKeys.thirdRaidToggle || DEFAULT_SETTINGS.keyBindings.thirdRaid,
        thirdRaidReset: parsedKeys.thirdRaidReset || DEFAULT_SETTINGS.keyBindings.thirdRaidReset,
        stopAllAudio: parsedKeys.stopAllAudio || DEFAULT_SETTINGS.keyBindings.stopAllAudio,

        // Legacy mirror
        team1Add: parsedKeys.addPointTeam1 || parsedKeys.team1Add || DEFAULT_SETTINGS.keyBindings.team1Add,
        team1Sub: parsedKeys.minusPointTeam1 || parsedKeys.team1Sub || DEFAULT_SETTINGS.keyBindings.team1Sub,
        team1Reset: parsedKeys.resetScoreTeam1 || parsedKeys.team1Reset || DEFAULT_SETTINGS.keyBindings.team1Reset,
        team2Add: parsedKeys.addPointTeam2 || parsedKeys.team2Add || DEFAULT_SETTINGS.keyBindings.team2Add,
        team2Sub: parsedKeys.minusPointTeam2 || parsedKeys.team2Sub || DEFAULT_SETTINGS.keyBindings.team2Sub,
        team2Reset: parsedKeys.resetScoreTeam2 || parsedKeys.team2Reset || DEFAULT_SETTINGS.keyBindings.team2Reset,
        raidTimerToggle: parsedKeys.startTimer || parsedKeys.raidTimerToggle || DEFAULT_SETTINGS.keyBindings.raidTimerToggle,
        raidTimerReset: parsedKeys.resetTimer || parsedKeys.raidTimerReset || DEFAULT_SETTINGS.keyBindings.raidTimerReset,
        thirdRaidToggle: parsedKeys.thirdRaid || parsedKeys.thirdRaidToggle || DEFAULT_SETTINGS.keyBindings.thirdRaidToggle,
      },
      actionAudios: parsed.actionAudios
        ? { ...DEFAULT_AUDIO_MAP, ...parsed.actionAudios }
        : DEFAULT_AUDIO_MAP,
      customLayout: parsed.customLayout
        ? { ...DEFAULT_SETTINGS.customLayout, ...parsed.customLayout }
        : DEFAULT_SETTINGS.customLayout,
      theme: ['sleek-obsidian', 'turbo-velocity', 'titan-mech', 'cyber-glitch', 'apex-gold'].includes(parsed.theme)
        ? parsed.theme
        : DEFAULT_SETTINGS.theme,
      teamNameFontSize: typeof parsed.teamNameFontSize === 'number' ? parsed.teamNameFontSize : DEFAULT_SETTINGS.teamNameFontSize,
      scoreFontSize: typeof parsed.scoreFontSize === 'number' ? parsed.scoreFontSize : DEFAULT_SETTINGS.scoreFontSize,
      team1NameFontSize: typeof parsed.team1NameFontSize === 'number' ? parsed.team1NameFontSize : undefined,
      team2NameFontSize: typeof parsed.team2NameFontSize === 'number' ? parsed.team2NameFontSize : undefined,
      team1ScoreFontSize: typeof parsed.team1ScoreFontSize === 'number' ? parsed.team1ScoreFontSize : undefined,
      team2ScoreFontSize: typeof parsed.team2ScoreFontSize === 'number' ? parsed.team2ScoreFontSize : undefined,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: ScoreboardSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage might be unavailable
  }
}

export function formatKeyLabel(key: string): string {
  return formatKeyDisplay(key);
}
