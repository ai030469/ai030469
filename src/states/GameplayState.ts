import type { IGameState, StateName } from '../types';
import type { Game } from '../Game';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, C, UFO as UFO_CFG, ENEMY } from '../config';
import { Player }          from '../entities/Player';
import { EnemyFormation }  from '../entities/EnemyFormation';
import { BulletSystem }    from '../entities/Bullet';
import { buildShields, ShieldBunker } from '../entities/Shield';
import { UFOShip }         from '../entities/UFO';
import { ParticleSystem }  from '../entities/ParticleSystem';
import { HUD }             from '../ui/HUD';
import { Dialog }          from '../ui/Dialog';
import { aabbOverlap }     from '../core/CollisionSystem';
import { PLAYER_SPRITE, ENEMY_SPRITES, UFO_SPRITE, ROW_TYPE } from '../entities/Sprites';

export class GameplayState implements IGameState {
  name: StateName = 'gameplay';

  // Entities
  private player!: Player;
  private formation!: EnemyFormation;
  private bullets!: BulletSystem;
  private shields!: ShieldBunker[];
  private ufo!: UFOShip;
  private particles!: ParticleSystem;

  // UI
  private hud!: HUD;
  private dialog!: Dialog;

  // State
  private gameRunning = false;
  private ufoSpawnTimer = 0;
  private ufoSpawnInterval = 25;
  private lastScorePopX = 0;
  private lastScorePopY = 0;
  private lastScorePopVal = 0;
  private scorePopTimer = 0;

  onEnter(ctx: Game): void {
    ctx.audio.unlock();

    if (ctx.session.paused) {
      // Resuming from pause — entities still valid
      ctx.session.paused = false;
    } else {
      // New game or new wave — always reinitialize
      this.initNewGame(ctx);
    }
    ctx.audio.resetMarch();
    this.gameRunning = true;
    this.dialog = this.dialog ?? new Dialog();
    this.hud = this.hud ?? new HUD();
  }

  onExit(ctx: Game): void {
    ctx.audio.stopUfoSound();
    ctx.audio.resetMarch();
  }

  private initNewGame(ctx: Game): void {
    const wave = ctx.session.wave ?? 1;
    this.player    = new Player(ctx.session.lives);
    this.formation = new EnemyFormation(wave);
    this.bullets   = new BulletSystem(64);
    this.shields   = buildShields();
    this.ufo       = new UFOShip();
    this.particles = new ParticleSystem();
    this.hud       = new HUD();
    this.dialog    = new Dialog();
    this.ufoSpawnTimer    = 0;
    this.ufoSpawnInterval = UFO_CFG.SPAWN_MIN + Math.random() * (UFO_CFG.SPAWN_MAX - UFO_CFG.SPAWN_MIN);
    this.scorePopTimer = 0;
    this.gameRunning = true;
  }

  update(dt: number, ctx: Game): void {
    this.dialog.update(dt);

    if (this.dialog.isVisible) {
      const input = ctx.input.snapshot();
      if (input.left || input.right) {
        this.dialog.toggleSelection();
      }
      if (input.confirm) this.dialog.activate();
      if (input.back)    { this.dialog.cancel(); }
      return;
    }

    const input = ctx.input.snapshot();
    if (input.pause) {
      ctx.audio.play('menuConfirm');
      ctx.session.paused = true;
      ctx.session.lives = this.player.lives;
      ctx.session.score = ctx.session.score;
      ctx.go('pause');
      return;
    }

    if (!this.gameRunning) return;

    // Player input
    if (input.left)  this.player.moveLeft(dt);
    if (input.right) this.player.moveRight(dt);
    if (input.fire && this.player.state === 'alive') {
      if (this.player.triggerFire()) {
        const fired = this.bullets.firePlayer(this.player.cx, this.player.y);
        if (fired) ctx.audio.play('playerShot');
      }
    }

    // Update entities
    this.player.update(dt);
    this.formation.update(dt);
    this.bullets.update(dt);
    this.ufo.update(dt);
    this.particles.update(dt);
    if (this.scorePopTimer > 0) this.scorePopTimer -= dt;

    // Enemy fire
    if (this.formation.pendingFire) {
      const shooter = this.formation.pendingFire;
      this.formation.pendingFire = null;
      const pos = this.formation.cellWorldPos(shooter);
      this.bullets.fireEnemy(pos.x + ENEMY.SPRITE_W / 2, pos.y + ENEMY.SPRITE_H);
    }

    // UFO spawn
    if (!this.ufo.active) {
      this.ufoSpawnTimer += dt;
      if (this.ufoSpawnTimer >= this.ufoSpawnInterval) {
        this.ufoSpawnTimer = 0;
        this.ufoSpawnInterval = UFO_CFG.SPAWN_MIN + Math.random() * (UFO_CFG.SPAWN_MAX - UFO_CFG.SPAWN_MIN);
        this.ufo.spawn();
        ctx.audio.startUfoSound();
      }
    } else if (!this.ufo.active) {
      ctx.audio.stopUfoSound();
    }

    // March audio
    const aliveCount = this.formation.aliveCount;
    const maxEnemies = ENEMY.COLS * ENEMY.ROWS;
    const ratio = aliveCount / maxEnemies;
    const interval = ENEMY.TICK_INTERVAL_MIN + (ENEMY.TICK_INTERVAL_MAX - ENEMY.TICK_INTERVAL_MIN) * ratio * 0.8;
    ctx.audio.updateMarch(dt, Math.max(0.1, interval));

    // Collisions
    this.resolveCollisions(ctx, dt);

    // HUD update
    this.hud.update(ctx.session.score, ctx.session.highScore, this.player.lives, ctx.session.wave, dt);

    // Wave / game-over checks
    this.checkWaveComplete(ctx);
    this.checkGameOver(ctx);
  }

  private resolveCollisions(ctx: Game, _dt: number): void {
    // Player bullets vs enemies
    this.bullets.pool.forEach((b) => {
      if (!b.active || b.owner !== 'player') return;
      for (const er of this.formation.getAliveCellRects()) {
        if (aabbOverlap(b, er)) {
          this.bullets.deactivate(b);
          const score = this.formation.kill(er.cell.row, er.cell.col);
          ctx.session.score += score;
          if (ctx.session.score > ctx.session.highScore) {
            ctx.session.highScore = ctx.session.score;
          }
          ctx.audio.play('enemyHit');
          this.particles.explode(er.x + ENEMY.SPRITE_W / 2, er.y + ENEMY.SPRITE_H / 2, ENEMY.ROW_COLORS[er.cell.row], 10);
          ctx.renderer.shake(3, 0.1);
          this.showScorePop(er.x + ENEMY.SPRITE_W / 2, er.y, score);
          return;
        }
      }
    });

    // Player bullets vs UFO
    if (this.ufo.active) {
      this.bullets.pool.forEach((b) => {
        if (!b.active || b.owner !== 'player') return;
        if (aabbOverlap(b, this.ufo.rect)) {
          this.bullets.deactivate(b);
          const score = this.ufo.getScore();
          ctx.session.score += score;
          if (ctx.session.score > ctx.session.highScore) {
            ctx.session.highScore = ctx.session.score;
          }
          ctx.audio.stopUfoSound();
          ctx.audio.play('ufoHit');
          this.particles.explode(this.ufo.cx, this.ufo.cy, C.UFO, 14);
          ctx.renderer.shake(4, 0.15);
          this.showScorePop(this.ufo.cx, this.ufo.y, score);
          this.ufo.active = false;
        }
      });
    }

    // Enemy bullets vs player
    if (this.player.state === 'alive' && !this.player.isInvulnerable) {
      this.bullets.pool.forEach((b) => {
        if (!b.active || b.owner !== 'enemy') return;
        if (aabbOverlap(b, this.player.rect)) {
          this.bullets.deactivate(b);
          this.player.hit();
          ctx.audio.play('playerDeath');
          this.particles.explode(this.player.cx, this.player.y + this.player.h / 2, C.PLAYER, 16);
          ctx.renderer.shake(6, 0.3);
        }
      });
    }

    // Bullets vs shields
    this.bullets.pool.forEach((b) => {
      if (!b.active) return;
      for (const shield of this.shields) {
        if (aabbOverlap(b, shield.rect)) {
          if (shield.checkBulletHit(b.x, b.y, b.w, b.h)) {
            this.bullets.deactivate(b);
            ctx.audio.play('shieldHit');
            this.particles.shieldDebris(b.x + b.w / 2, b.y + b.h / 2, C.SHIELD);
            break;
          }
        }
      }
    });
  }

  private showScorePop(x: number, y: number, score: number): void {
    this.lastScorePopX = x;
    this.lastScorePopY = y;
    this.lastScorePopVal = score;
    this.scorePopTimer = 1.0;
  }

  private checkWaveComplete(ctx: Game): void {
    if (!this.formation.allDead) return;
    this.gameRunning = false;
    ctx.audio.play('waveClear');
    ctx.session.wave++;
    ctx.session.lives = this.player.lives;
    ctx.go('levelTransition');
  }

  private checkGameOver(ctx: Game): void {
    // Player ran out of lives
    if (this.player.state === 'dead') {
      this.gameRunning = false;
      ctx.audio.play('gameOver');
      ctx.session.active = false;
      ctx.session.lives = 0;
      ctx.go('gameOver');
      return;
    }

    // Enemies reached the ground
    if (this.formation.hasReachedBottom) {
      this.player['state'] = 'dead'; // force game over
      this.gameRunning = false;
      ctx.audio.play('gameOver');
      ctx.session.active = false;
      ctx.go('gameOver');
    }
  }

  render(ctx: Game): void {
    const r = ctx.renderer;
    r.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, C.BG);

    // Enemies
    for (const cell of this.formation.cells) {
      if (!cell.alive) continue;
      const pos = this.formation.cellWorldPos(cell);
      const type = ROW_TYPE[cell.row] ?? 'octopus';
      const spriteset = ENEMY_SPRITES[type];
      const color = ENEMY.ROW_COLORS[cell.row];
      if (cell.flashTimer > 0) {
        r.ctx.globalAlpha = 0.5;
        r.drawSprite(spriteset[cell.frame], pos.x, pos.y, '#ffffff', 3);
        r.ctx.globalAlpha = 1;
      } else {
        r.drawSprite(spriteset[cell.frame], pos.x, pos.y, color, 3);
      }
    }

    // UFO
    if (this.ufo.active) {
      r.drawSpriteWithGlow(UFO_SPRITE, this.ufo.x, this.ufo.y, C.UFO, '#ff8888', 3);
    }

    // Shields
    for (const shield of this.shields) {
      shield.render(r.ctx);
    }

    // Player
    if (this.player.visible) {
      r.drawSprite(PLAYER_SPRITE, this.player.x, this.player.y, this.player.color, 3);
      // Engine glow
      r.ctx.globalAlpha = 0.3;
      r.fillCircle(this.player.cx, this.player.y + this.player.h + 2, 4, '#44ff44');
      r.ctx.globalAlpha = 1;
    }

    // Bullets
    this.bullets.pool.forEach((b) => {
      if (!b.active) return;
      const color = b.owner === 'player' ? C.PLAYER_BULLET : C.ENEMY_BULLET;
      if (b.owner === 'player') {
        // Brighter player bullet with glow
        r.ctx.globalAlpha = 0.3;
        r.fillRect(b.x - 1, b.y, b.w + 2, b.h, color);
        r.ctx.globalAlpha = 1;
        r.fillRect(b.x, b.y, b.w, b.h, color);
      } else {
        // Enemy bullet — zig-zag style
        r.fillRect(b.x, b.y, b.w, b.h, color);
        r.fillRect(b.x + 1, b.y + 2, b.w, 3, '#ffaa00');
      }
    });

    // Particles
    this.particles.pool.forEach((p) => {
      if (!p.active) return;
      const alpha = 1 - p.life / p.maxLife;
      r.ctx.globalAlpha = alpha;
      r.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size, p.color);
    });
    r.ctx.globalAlpha = 1;

    // Score pop
    if (this.scorePopTimer > 0) {
      const alpha = Math.min(1, this.scorePopTimer * 2);
      const offsetY = (1 - this.scorePopTimer) * 24;
      r.ctx.globalAlpha = alpha;
      r.text(
        `+${this.lastScorePopVal}`,
        this.lastScorePopX, this.lastScorePopY - 10 - offsetY,
        C.HIGHLIGHT, 'center', 12, true,
      );
      r.ctx.globalAlpha = 1;
    }

    // HUD
    this.hud.render(r);

    // UFO despawn — stop sound if no longer visible
    if (!this.ufo.active) ctx.audio.stopUfoSound();

    // Dialog
    this.dialog.render(r);

    // Warning if enemies near bottom
    if (this.formation.lowestY > GROUND_Y - 120) {
      const blink = Date.now() % 600 < 300;
      if (blink) {
        r.text('WARNING — INVASION IMMINENT!', CANVAS_WIDTH / 2, GROUND_Y - 50, C.WARNING, 'center', 13, true);
      }
    }
  }

  /** Called by PauseState to allow restart confirmation. */
  showRestartDialog(ctx: Game): void {
    this.dialog.show({
      title: 'RESTART GAME',
      body: 'Restart the current game? All progress will be lost.',
      confirmLabel: 'RESTART',
      cancelLabel: 'CANCEL',
      onConfirm: () => {
        ctx.session = { score: 0, highScore: ctx.session.highScore, lives: 3, wave: 1, active: true, paused: false };
        this.initNewGame(ctx);
      },
      onCancel: () => {},
    });
  }
}
