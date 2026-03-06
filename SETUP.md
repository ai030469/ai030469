# SPACE RAIDERS — Setup & Play Guide

## Quick Start

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in your browser and start playing immediately.

---

## Controls

| Action         | Key                    |
|----------------|------------------------|
| Move Left      | ← Arrow / A            |
| Move Right     | → Arrow / D            |
| Fire           | Space / Z              |
| Pause          | Escape                 |
| Navigate Menu  | ↑ ↓ Arrow Keys         |
| Confirm        | Enter / Space          |
| Back / Cancel  | Escape / Backspace     |

---

## Gameplay Rules

- **Destroy all 55 alien invaders** across 5 rows × 11 columns before they reach Earth
- **Top row (Squid):** 30 pts — **Middle rows (Crab):** 20 pts — **Bottom rows (Octopus):** 10 pts
- **Mystery UFO** crosses the top at random intervals for 50–300 bonus points
- **4 destructible shield bunkers** protect you from enemy fire but erode over time
- **Lives:** You start with 3 lives. Losing all lives = Game Over
- **Enemy speed** increases as enemies are eliminated — survival requires urgency
- **Wave complete bonus** = wave number × 100 points added between waves
- Enemies reaching the bottom line = instant Game Over

---

## Features

### Gameplay Systems
- Fixed-timestep deterministic simulation at 60fps
- Classic step-and-drop enemy formation movement with per-wave speed scaling
- Single player bullet on screen (authentic to the original)
- Pixel-level shield erosion — hit anywhere on a shield and those pixels are destroyed
- UFO mystery ship with randomized score reward
- Brief invulnerability window after respawn
- Object pooling for bullets and particles (no runtime GC pressure)

### Game States
- Boot splash → Main Menu → Gameplay → Pause → Level Transition → Game Over → High Score Entry → Leaderboard
- Full How To Play screen, Settings screen (4 categories), Credits (scrolling)

### Audio (100% synthesized, no files needed)
- Web Audio API procedural chiptune sounds for every event
- 4-beat enemy march rhythm that speeds up with fewer enemies
- UFO ambient oscillating tone while active
- Separate Master / SFX / Music volume controls

### Visual Polish
- CRT phosphor vignette overlay
- Scanline effect
- Screen shake on impacts (toggleable)
- Pixel art explosion particles with pooling
- Score pop-up on enemy kills
- Blinking player during invulnerability
- Scrolling starfield on transition screens

### Persistence
- Top 10 high scores saved to localStorage (with initials, wave, date)
- All settings saved between sessions

---

## Project Structure

```
src/
├── main.ts                    Entry point
├── Game.ts                    Central game context + FSM wiring
├── config.ts                  All numeric constants and color palette
├── types.ts                   TypeScript types and interfaces
│
├── core/
│   ├── GameLoop.ts            Fixed-timestep RAF loop
│   ├── Renderer.ts            Canvas 2D helpers + CRT overlay
│   ├── StateManager.ts        Finite state machine
│   ├── InputManager.ts        Keyboard input with configurable bindings
│   ├── AudioManager.ts        Web Audio API synthesized sounds
│   ├── CollisionSystem.ts     AABB collision utilities
│   └── ObjectPool.ts          Generic reusable object pool
│
├── entities/
│   ├── Sprites.ts             Pixel art data (8×8 grids)
│   ├── Player.ts              Player ship + state machine
│   ├── EnemyFormation.ts      Grid movement, shooting AI, escalation
│   ├── Bullet.ts              Pooled bullet system (player + enemy)
│   ├── Shield.ts              Pixel-destructible bunkers
│   ├── UFO.ts                 Mystery ship
│   └── ParticleSystem.ts      Pooled explosion particles
│
├── states/                    All 11 game states
│   ├── BootState.ts
│   ├── MenuState.ts           + attract-mode enemy parade
│   ├── HowToPlayState.ts
│   ├── SettingsState.ts       Audio / Video / Controls / Gameplay tabs
│   ├── GameplayState.ts       Main game logic
│   ├── PauseState.ts
│   ├── LevelTransitionState.ts
│   ├── GameOverState.ts
│   ├── HighScoreEntryState.ts
│   ├── LeaderboardState.ts
│   └── CreditsState.ts
│
├── ui/
│   ├── HUD.ts                 In-game heads-up display
│   ├── Menu.ts                Reusable menu component
│   └── Dialog.ts              Modal confirm/cancel dialog
│
└── persistence/
    └── Storage.ts             localStorage wrapper (scores + settings)
```

---

## Scripts

| Command           | Description                         |
|-------------------|-------------------------------------|
| `npm run dev`     | Development server with hot reload  |
| `npm run build`   | Production build to `dist/`         |
| `npm run preview` | Preview production build locally    |
