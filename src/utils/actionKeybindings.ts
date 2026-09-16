import { ScoreboardActionId, KeyBindings } from '../types';

export interface ActionDefinition {
  id: ScoreboardActionId;
  rowNumber: number;
  label: string;
  defaultKey: string;
  allowAudio: boolean;
}

export const ACTION_DEFINITIONS: ActionDefinition[] = [
  { id: 'addPointTeam1', rowNumber: 1, label: 'ADD POINT TEAM 1 +', defaultKey: 'F1', allowAudio: true },
  { id: 'minusPointTeam1', rowNumber: 2, label: 'MINUS POINT TEAM 1 -', defaultKey: 'F2', allowAudio: true },
  { id: 'resetScoreTeam1', rowNumber: 3, label: 'RESET SCORE TEAM 1', defaultKey: 'F3', allowAudio: true },
  { id: 'addPointTeam2', rowNumber: 4, label: 'ADD POINT TEAM 2 +', defaultKey: 'F4', allowAudio: true },
  { id: 'minusPointTeam2', rowNumber: 5, label: 'MINUS POINT TEAM 2 -', defaultKey: 'F5', allowAudio: true },
  { id: 'resetScoreTeam2', rowNumber: 6, label: 'RESET SCORE TEAM 2', defaultKey: 'F6', allowAudio: true },
  { id: 'startTimer', rowNumber: 7, label: 'START TIMER', defaultKey: 'Space', allowAudio: true },
  { id: 'resetTimer', rowNumber: 8, label: 'RESET TIMER', defaultKey: 'R', allowAudio: true },
  { id: 'thirdRaid', rowNumber: 9, label: '3RD RAID', defaultKey: 'D', allowAudio: true },
  { id: 'thirdRaidReset', rowNumber: 10, label: '3RD RAID RESET', defaultKey: 'R', allowAudio: true },
  { id: 'stopAllAudio', rowNumber: 11, label: 'STOP ALL AUDIO', defaultKey: 'F11', allowAudio: false },
];

/**
 * Maps each ScoreboardActionId to legacy key binding properties if present
 */
export const LEGACY_KEY_MAP: Record<ScoreboardActionId, keyof KeyBindings> = {
  addPointTeam1: 'team1Add',
  minusPointTeam1: 'team1Sub',
  resetScoreTeam1: 'team1Reset',
  addPointTeam2: 'team2Add',
  minusPointTeam2: 'team2Sub',
  resetScoreTeam2: 'team2Reset',
  startTimer: 'raidTimerToggle',
  resetTimer: 'raidTimerReset',
  thirdRaid: 'thirdRaidToggle',
  thirdRaidReset: 'thirdRaidReset',
  stopAllAudio: 'stopAllAudio',
};

/**
 * Returns the effective key assigned to an action
 */
export function getActionKey(actionId: ScoreboardActionId, bindings: KeyBindings): string {
  // 1. Direct property
  const direct = bindings[actionId];
  if (typeof direct === 'string' && direct.trim() !== '') {
    return direct;
  }

  // 2. Legacy alias
  const legacyProp = LEGACY_KEY_MAP[actionId];
  if (legacyProp && typeof bindings[legacyProp] === 'string' && bindings[legacyProp]!.trim() !== '') {
    return bindings[legacyProp]!;
  }

  // 3. Fallback to default key
  const def = ACTION_DEFINITIONS.find((d) => d.id === actionId);
  return def ? def.defaultKey : '';
}

/**
 * Format key string for clear visual display
 */
export function formatKeyDisplay(key: string): string {
  if (!key) return '[None]';
  const trimmed = key.trim();
  if (trimmed === ' ' || trimmed.toLowerCase() === 'space') return 'SPACE';
  if (trimmed.toLowerCase() === 'escape' || trimmed.toLowerCase() === 'esc') return 'ESC';
  if (trimmed.toLowerCase() === 'enter' || trimmed.toLowerCase() === 'return') return 'ENTER';
  if (trimmed.toLowerCase() === 'arrowup') return 'UP ARROW';
  if (trimmed.toLowerCase() === 'arrowdown') return 'DOWN ARROW';
  if (trimmed.toLowerCase() === 'arrowleft') return 'LEFT ARROW';
  if (trimmed.toLowerCase() === 'arrowright') return 'RIGHT ARROW';
  if (trimmed.startsWith('Key')) return trimmed.replace('Key', '').toUpperCase();
  if (trimmed.startsWith('Digit')) return trimmed.replace('Digit', '');
  if (trimmed.startsWith('Numpad')) {
    const suffix = trimmed.replace('Numpad', '');
    if (suffix === 'Add') return 'NUMPAD +';
    if (suffix === 'Subtract') return 'NUMPAD -';
    if (suffix === 'Multiply') return 'NUMPAD *';
    if (suffix === 'Divide') return 'NUMPAD /';
    if (suffix === 'Enter') return 'NUMPAD ENTER';
    return `NUMPAD ${suffix}`;
  }
  return trimmed.toUpperCase();
}

/**
 * Capture a key string from a native keyboard event
 */
export function captureKeyFromEvent(e: KeyboardEvent): string {
  // Function keys F1 - F24
  if (e.code.startsWith('F') && /^F([1-9]|1[0-9]|2[0-4])$/.test(e.code)) {
    return e.code;
  }
  if (e.key.startsWith('F') && /^F([1-9]|1[0-9]|2[0-4])$/.test(e.key)) {
    return e.key;
  }

  // Spacebar
  if (e.code === 'Space' || e.key === ' ') {
    return 'Space';
  }

  // Enter
  if (e.code === 'Enter' || e.key === 'Enter') {
    return 'Enter';
  }

  // Escape
  if (e.code === 'Escape' || e.key === 'Escape') {
    return 'Escape';
  }

  // Arrow keys
  if (e.code === 'ArrowUp' || e.key === 'ArrowUp') return 'ArrowUp';
  if (e.code === 'ArrowDown' || e.key === 'ArrowDown') return 'ArrowDown';
  if (e.code === 'ArrowLeft' || e.key === 'ArrowLeft') return 'ArrowLeft';
  if (e.code === 'ArrowRight' || e.key === 'ArrowRight') return 'ArrowRight';

  // Numpad keys
  if (e.code.startsWith('Numpad')) {
    return e.code;
  }

  // Modifiers
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.key === 'Shift') return 'Shift';
  if (e.code === 'ControlLeft' || e.code === 'ControlRight' || e.key === 'Control') return 'Ctrl';
  if (e.code === 'AltLeft' || e.code === 'AltRight' || e.key === 'Alt') return 'Alt';

  // Letters (A - Z)
  if (e.code.startsWith('Key')) {
    return e.code.replace('Key', '').toUpperCase();
  }

  // Digits (0 - 9)
  if (e.code.startsWith('Digit')) {
    return e.code.replace('Digit', '');
  }

  // Default fallback: single character or code
  if (e.key && e.key.length === 1) {
    return e.key.toUpperCase();
  }

  return e.code || e.key;
}

/**
 * Normalize key string for equality matching
 */
export function normalizeKey(key: string): string {
  if (!key) return '';
  const trimmed = key.trim().toLowerCase();
  if (trimmed === ' ' || trimmed === 'space') return 'space';
  if (trimmed === 'escape' || trimmed === 'esc') return 'escape';
  if (trimmed === 'enter' || trimmed === 'return') return 'enter';
  if (trimmed.startsWith('key')) return trimmed.replace('key', '');
  if (trimmed.startsWith('digit')) return trimmed.replace('digit', '');
  return trimmed;
}

/**
 * Check if a KeyboardEvent matches an assigned key
 */
export function matchesKey(e: KeyboardEvent, boundKey: string): boolean {
  if (!boundKey) return false;
  const normalizedBound = normalizeKey(boundKey);
  const normalizedEventKey = normalizeKey(e.key);
  const normalizedEventCode = normalizeKey(e.code);

  // Direct normalized match
  if (normalizedEventKey === normalizedBound || normalizedEventCode === normalizedBound) {
    return true;
  }

  // Spacebar special check
  if (normalizedBound === 'space' && (e.code === 'Space' || e.key === ' ')) {
    return true;
  }

  // Letters check (e.g. bound 'a' vs code 'KeyA' vs key 'A')
  if (normalizedBound.length === 1 && /^[a-z0-9]$/.test(normalizedBound)) {
    if (e.key.toLowerCase() === normalizedBound) return true;
    if (e.code.toLowerCase() === `key${normalizedBound}`) return true;
    if (e.code.toLowerCase() === `digit${normalizedBound}`) return true;
    if (e.code.toLowerCase() === `numpad${normalizedBound}`) return true;
  }

  // Function keys check (F1-F12)
  if (/^f([1-9]|1[0-2])$/.test(normalizedBound)) {
    if (e.code.toLowerCase() === normalizedBound || e.key.toLowerCase() === normalizedBound) {
      return true;
    }
  }

  // Arrow keys check
  if (normalizedBound === 'arrowup' && (e.code === 'ArrowUp' || e.key === 'ArrowUp')) return true;
  if (normalizedBound === 'arrowdown' && (e.code === 'ArrowDown' || e.key === 'ArrowDown')) return true;
  if (normalizedBound === 'arrowleft' && (e.code === 'ArrowLeft' || e.key === 'ArrowLeft')) return true;
  if (normalizedBound === 'arrowright' && (e.code === 'ArrowRight' || e.key === 'ArrowRight')) return true;

  // Numpad operators
  if (normalizedBound.includes('numpadadd') || normalizedBound.includes('numpad+')) {
    return e.code === 'NumpadAdd' || e.key === '+';
  }
  if (normalizedBound.includes('numpadsubtract') || normalizedBound.includes('numpad-')) {
    return e.code === 'NumpadSubtract' || e.key === '-';
  }

  return false;
}

/**
 * Check if a key is already assigned to another action (key conflict protection)
 */
export function findKeyConflict(
  targetActionId: ScoreboardActionId,
  newKey: string,
  bindings: KeyBindings
): ActionDefinition | null {
  const normNew = normalizeKey(newKey);
  if (!normNew) return null;

  for (const def of ACTION_DEFINITIONS) {
    if (def.id === targetActionId) continue;
    const existingKey = getActionKey(def.id, bindings);
    if (normalizeKey(existingKey) === normNew) {
      return def;
    }
  }

  return null;
}
