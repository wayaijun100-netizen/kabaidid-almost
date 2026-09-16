export type ScoreboardThemeId =
  | 'sleek-obsidian'
  | 'turbo-velocity'
  | 'titan-mech'
  | 'cyber-glitch'
  | 'apex-gold';

export interface Team {
  name: string;
  score: number;
  color: string;
}

export type ScoreboardActionId =
  | 'addPointTeam1'
  | 'minusPointTeam1'
  | 'resetScoreTeam1'
  | 'addPointTeam2'
  | 'minusPointTeam2'
  | 'resetScoreTeam2'
  | 'startTimer'
  | 'resetTimer'
  | 'thirdRaid'
  | 'thirdRaidReset'
  | 'stopAllAudio';

export interface ActionAudioConfig {
  fileName: string | null;
}

export type ScoreboardAudioMap = Record<ScoreboardActionId, ActionAudioConfig>;

export interface KeyBindings {
  // 11 Scoreboard Operator Actions
  addPointTeam1?: string;
  minusPointTeam1?: string;
  resetScoreTeam1?: string;
  addPointTeam2?: string;
  minusPointTeam2?: string;
  resetScoreTeam2?: string;
  startTimer?: string;
  resetTimer?: string;
  thirdRaid?: string;
  thirdRaidReset?: string;
  stopAllAudio?: string;

  // Legacy mappings for full backward compatibility
  team1Add: string;
  team1Sub: string;
  team1Reset: string;
  team2Add: string;
  team2Sub: string;
  team2Reset: string;
  raidTimerToggle: string;
  raidTimerReset: string;
  thirdRaidToggle: string;
  raidTimerAdd5?: string;
  raidTimerSub5?: string;
  resetScores?: string;
  toggleFullscreen?: string;
  toggleSound?: string;
  openSettings?: string;
}

export interface ElementLayout {
  x: number; // percentage (0 to 100) or pixel
  y: number; // percentage (0 to 100) or pixel
  width: number; // pixels
  height: number; // pixels
  zIndex?: number;
}

export interface ScoreboardUILayout {
  team1Name: ElementLayout;
  team1Score: ElementLayout;
  team2Name: ElementLayout;
  team2Score: ElementLayout;
  timer: ElementLayout;
}

export interface ScoreboardSettings {
  team1: Team;
  team2: Team;
  raidDuration: number; // default 30s
  soundEnabled: boolean;
  soundVolume: number;
  beepOnLowTime: boolean;
  keyBindings: KeyBindings;
  customLayout?: ScoreboardUILayout;
  theme?: ScoreboardThemeId;
  teamNameFontSize?: number; // default 26px
  scoreFontSize?: number; // default 180px
  team1NameFontSize?: number;
  team2NameFontSize?: number;
  team1ScoreFontSize?: number;
  team2ScoreFontSize?: number;
  actionAudios?: ScoreboardAudioMap;
}
