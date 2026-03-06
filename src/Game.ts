/**
 * Central game context object passed to all states.
 * Owns all subsystems and shared session data.
 */
import { GameLoop }     from './core/GameLoop';
import { Renderer }     from './core/Renderer';
import { StateManager } from './core/StateManager';
import { InputManager } from './core/InputManager';
import { AudioManager } from './core/AudioManager';
import { loadSettings, saveSettings, loadHighScores, loadSession } from './persistence/Storage';
import type { Settings, GameSession, StateName } from './types';

import { BootState }           from './states/BootState';
import { MenuState }           from './states/MenuState';
import { HowToPlayState }      from './states/HowToPlayState';
import { SettingsState }       from './states/SettingsState';
import { GameplayState }       from './states/GameplayState';
import { PauseState }          from './states/PauseState';
import { LevelTransitionState }from './states/LevelTransitionState';
import { GameOverState }       from './states/GameOverState';
import { HighScoreEntryState } from './states/HighScoreEntryState';
import { LeaderboardState }    from './states/LeaderboardState';
import { CreditsState }        from './states/CreditsState';

export class Game {
  readonly renderer: Renderer;
  readonly input: InputManager;
  readonly audio: AudioManager;
  readonly states: StateManager;
  readonly loop: GameLoop;

  settings: Settings;

  session: GameSession = {
    score: 0,
    highScore: 0,
    lives: 3,
    wave: 1,
    active: false,
    paused: false,
  };

  // Source state for settings (where to return after closing settings)
  settingsReturnState: StateName = 'menu';

  constructor(canvas: HTMLCanvasElement, crtCanvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas, crtCanvas);
    this.settings = loadSettings();
    this.input    = new InputManager(this.settings);
    this.audio    = new AudioManager();

    // Apply initial settings
    this.applySettings();

    // Load high score
    const hs = loadHighScores();
    this.session.highScore = hs.length > 0 ? hs[0].score : 0;

    // State manager — pass `this` as context
    this.states = new StateManager(this);

    // Register all states
    [
      new BootState(),
      new MenuState(),
      new HowToPlayState(),
      new SettingsState(),
      new GameplayState(),
      new PauseState(),
      new LevelTransitionState(),
      new GameOverState(),
      new HighScoreEntryState(),
      new LeaderboardState(),
      new CreditsState(),
    ].forEach(s => this.states.register(s));

    this.loop = new GameLoop(
      (dt) => this.update(dt),
      ()   => this.render(),
    );
  }

  applySettings(): void {
    const s = this.settings;
    this.audio.setMasterVolume(s.masterVolume);
    this.audio.setSfxVolume(s.sfxVolume);
    this.audio.setMusicVolume(s.musicVolume);
    this.audio.setSfxEnabled(s.sfxEnabled);
    this.audio.setMusicEnabled(s.musicEnabled);
    this.renderer.setCrtEnabled(s.crtEffect);
    this.renderer.setScanlinesEnabled(s.scanlines);
    this.renderer.setShakeEnabled(s.screenShake);
    this.input.updateBindings(s);
  }

  saveCurrentSettings(): void {
    saveSettings(this.settings);
    this.applySettings();
  }

  start(): void {
    this.states.transition('boot');
    this.loop.start();
  }

  private update(dt: number): void {
    this.renderer.updateShake(dt);
    this.states.update(dt);
    this.input.flush();
  }

  private render(): void {
    this.renderer.beginFrame();
    this.states.render();
    this.renderer.endFrame();
  }

  /** Convenience: go to a state by name. */
  go(state: StateName): void {
    this.states.transition(state);
  }
}
