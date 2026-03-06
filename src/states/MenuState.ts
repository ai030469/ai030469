import type { IGameState, StateName } from '../types';
import type { Game } from '../Game';
import type { Renderer } from '../core/Renderer';
import { Menu } from '../ui/Menu';
import { CANVAS_WIDTH, CANVAS_HEIGHT, C, ENEMY } from '../config';
import { loadSession } from '../persistence/Storage';
import { SQUID, CRAB, OCTOPUS, UFO_SPRITE } from '../entities/Sprites';

// Attract-mode decorative enemy
interface AttractEnemy {
  x: number; y: number;
  row: number;
  frame: number;
  animTimer: number;
}

export class MenuState implements IGameState {
  name: StateName = 'menu';
  private menu = new Menu();
  private flashTimer = 0;
  private attractEnemies: AttractEnemy[] = [];
  private attractDir = 1;
  private attractTimer = 0;
  private attractTick = 0.6;

  onEnter(ctx: Game): void {
    this.flashTimer = 0;
    this.attractTimer = 0;
    this.buildAttractEnemies();
    this.buildMenu(ctx);
    ctx.audio.stopUfoSound();
  }

  onExit(_ctx: Game): void {}

  private buildMenu(ctx: Game): void {
    const hasSaved = loadSession() !== null && ctx.session.active;
    this.menu.setItems([
      {
        label: 'NEW GAME',
        action: () => {
          ctx.audio.unlock();
          ctx.audio.play('menuConfirm');
          ctx.session = { score: 0, highScore: ctx.session.highScore, lives: 3, wave: 1, active: true, paused: false };
          ctx.go('gameplay');
        },
      },
      {
        label: 'CONTINUE',
        disabled: !hasSaved,
        action: () => {
          ctx.audio.play('menuConfirm');
          ctx.session.paused = false;
          ctx.go('gameplay');
        },
      },
      {
        label: 'HOW TO PLAY',
        action: () => {
          ctx.audio.play('menuConfirm');
          ctx.go('howtoplay');
        },
      },
      {
        label: 'SETTINGS',
        action: () => {
          ctx.audio.play('menuConfirm');
          ctx.settingsReturnState = 'menu';
          ctx.go('settings');
        },
      },
      {
        label: 'HIGH SCORES',
        action: () => {
          ctx.audio.play('menuConfirm');
          ctx.go('leaderboard');
        },
      },
      {
        label: 'CREDITS',
        action: () => {
          ctx.audio.play('menuConfirm');
          ctx.go('credits');
        },
      },
    ]);
  }

  private buildAttractEnemies(): void {
    this.attractEnemies = [];
    const rows = 3;
    const cols = 9;
    const startX = (CANVAS_WIDTH - cols * 44) / 2;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.attractEnemies.push({
          x: startX + col * 44,
          y: 130 + row * 36,
          row,
          frame: 0,
          animTimer: 0,
        });
      }
    }
    this.attractDir = 1;
    this.attractTimer = 0;
  }

  update(dt: number, ctx: Game): void {
    this.flashTimer += dt;
    this.menu.update(dt);
    this.updateAttract(dt);

    const input = ctx.input.snapshot();
    if (input.up) {
      ctx.audio.play('menuMove');
      this.menu.moveUp();
    } else if (input.down) {
      ctx.audio.play('menuMove');
      this.menu.moveDown();
    } else if (input.confirm) {
      this.menu.confirm();
    }
  }

  private updateAttract(dt: number): void {
    this.attractTimer += dt;
    for (const e of this.attractEnemies) {
      e.animTimer += dt;
      if (e.animTimer >= 0.5) { e.animTimer -= 0.5; e.frame ^= 1; }
    }
    if (this.attractTimer >= this.attractTick) {
      this.attractTimer -= this.attractTick;
      const step = 8;
      // Check bounds
      let minX = Infinity, maxX = -Infinity;
      for (const e of this.attractEnemies) {
        if (e.x < minX) minX = e.x;
        if (e.x + 24 > maxX) maxX = e.x + 24;
      }
      if (this.attractDir === 1 && maxX + step >= CANVAS_WIDTH - 20) this.attractDir = -1;
      else if (this.attractDir === -1 && minX - step <= 20) this.attractDir = 1;
      for (const e of this.attractEnemies) e.x += this.attractDir * step;
    }
  }

  render(ctx: Game): void {
    const r = ctx.renderer;

    // Background
    r.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#000008');

    // Starfield
    this.drawStarfield(r);

    // Game logo
    const logoY = 18;
    r.textShadow('SPACE', CANVAS_WIDTH / 2 - 62, logoY, C.HUD_SCORE, '#003300', 'center', 34, true);
    r.textShadow('RAIDERS', CANVAS_WIDTH / 2 + 70, logoY, C.HIGHLIGHT, '#333300', 'center', 34, true);

    // Subtitle
    const blink = Math.floor(this.flashTimer * 2) % 2 === 0;
    r.text('INSERT COIN — PRESS ENTER', CANVAS_WIDTH / 2, 70, blink ? C.HIGHLIGHT : C.DIM, 'center', 11);

    // Attract enemies
    this.renderAttractEnemies(r);

    // Menu panel
    const panelX = CANVAS_WIDTH / 2 - 120;
    const panelW = 240;
    const panelY = 295;
    const panelH = this.menu['items'].length * 36 + 20;
    r.fillRect(panelX - 10, panelY - 10, panelW + 20, panelH, 'rgba(0,0,0,0.75)');
    r.strokeRect(panelX - 10, panelY - 10, panelW + 20, panelH, C.BORDER, 1);

    this.menu.render(r, CANVAS_WIDTH / 2, panelY, 36, 16, true);

    // Score table legend
    r.text('SCORE ADVANCE TABLE', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80, C.DIM, 'center', 10);
    const scoreItems = [
      { sprite: SQUID[0], color: ENEMY.ROW_COLORS[0], score: '= 30 PTS' },
      { sprite: CRAB[0],  color: ENEMY.ROW_COLORS[2], score: '= 20 PTS' },
      { sprite: OCTOPUS[0], color: ENEMY.ROW_COLORS[4], score: '= 10 PTS' },
    ];
    scoreItems.forEach((item, i) => {
      const x = CANVAS_WIDTH / 2 - 100 + i * 70;
      const y = CANVAS_HEIGHT - 65;
      r.drawSprite(item.sprite, x, y, item.color, 2);
      r.text(item.score, x + 20, y + 4, C.DIM, 'left', 9);
    });

    // Bottom copyright
    r.text('© 2024 SPACE RAIDERS  —  ALL RIGHTS RESERVED', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 12, C.DIM, 'center', 8);
  }

  private drawStarfield(r: Renderer): void {
    // Pseudo-random but stable stars
    r.ctx.fillStyle = 'rgba(255,255,255,0.4)';
    const seed = 42;
    for (let i = 0; i < 60; i++) {
      const rx = ((seed * (i * 7 + 3)) % 1000) / 1000;
      const ry = ((seed * (i * 13 + 7)) % 1000) / 1000;
      const twinkle = Math.sin(this.flashTimer * 2 + i) * 0.3 + 0.7;
      r.ctx.globalAlpha = twinkle * 0.3;
      r.ctx.fillRect(
        Math.floor(rx * CANVAS_WIDTH),
        Math.floor(ry * CANVAS_HEIGHT),
        1, 1,
      );
    }
    r.ctx.globalAlpha = 1;
  }

  private renderAttractEnemies(r: Renderer): void {
    const sprites: Record<number, readonly (readonly number[])[][]> = { 0: SQUID, 1: CRAB, 2: OCTOPUS };
    const colors  = ENEMY.ROW_COLORS;
    for (const e of this.attractEnemies) {
      const spriter = sprites[e.row] ?? OCTOPUS;
      const color   = colors[e.row * 2] ?? '#ffffff';
      r.drawSprite(spriter[e.frame], e.x, e.y, color, 3);
    }
  }
}
