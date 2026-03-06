import type { HighScoreEntry, Settings } from '../types';
import { MAX_HIGH_SCORES, AUDIO } from '../config';

const KEYS = {
  SCORES:   'sr_highscores',
  SETTINGS: 'sr_settings',
  SESSION:  'sr_session',
} as const;

export const DEFAULT_SETTINGS: Settings = {
  masterVolume: AUDIO.DEFAULT_MASTER,
  sfxVolume:    AUDIO.DEFAULT_SFX,
  musicVolume:  AUDIO.DEFAULT_MUSIC,
  sfxEnabled:   true,
  musicEnabled: true,
  crtEffect:    true,
  scanlines:    true,
  screenShake:  true,
  difficulty:   'normal',
  keyLeft:  'ArrowLeft',
  keyRight: 'ArrowRight',
  keyFire:  ' ',
  keyPause: 'Escape',
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently ignore storage errors
  }
}

// ─── High Scores ───────────────────────────────────────────────────────────

export function loadHighScores(): HighScoreEntry[] {
  return safeGet<HighScoreEntry[]>(KEYS.SCORES, []);
}

export function saveHighScore(entry: HighScoreEntry): void {
  const scores = loadHighScores();
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score);
  if (scores.length > MAX_HIGH_SCORES) scores.length = MAX_HIGH_SCORES;
  safeSet(KEYS.SCORES, scores);
}

export function qualifiesForLeaderboard(score: number): boolean {
  if (score <= 0) return false;
  const scores = loadHighScores();
  if (scores.length < MAX_HIGH_SCORES) return true;
  return score > scores[scores.length - 1].score;
}

// ─── Settings ──────────────────────────────────────────────────────────────

export function loadSettings(): Settings {
  const stored = safeGet<Partial<Settings>>(KEYS.SETTINGS, {});
  return { ...DEFAULT_SETTINGS, ...stored };
}

export function saveSettings(s: Settings): void {
  safeSet(KEYS.SETTINGS, s);
}

// ─── Session (for Continue) ────────────────────────────────────────────────

export interface StoredSession {
  score: number;
  lives: number;
  wave: number;
  timestamp: number;
}

export function saveSession(session: StoredSession): void {
  safeSet(KEYS.SESSION, session);
}

export function loadSession(): StoredSession | null {
  return safeGet<StoredSession | null>(KEYS.SESSION, null);
}

export function clearSession(): void {
  try { localStorage.removeItem(KEYS.SESSION); } catch { /* ignore */ }
}
