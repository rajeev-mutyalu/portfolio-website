/**
 * Rajeev Mutyalu Portfolio — Interactive Particle & Comet Rain Canvas Engine
 * 
 * Features:
 * - Varied Geometry: 65% Sleek Comets + 35% Glowing Circular Orbs & Drops
 * - Rich Multi-Shade Palettes (Highlight White, Vibrant Mid-tones, Deep Indigo/Amber Shades)
 * - Random Opacities from 0.25 to 0.95
 * - Shatter / Break Particle Effect on Mouse Collision (No tornado!)
 * - Dynamic Directional Tilt following pointer (Left / Center / Right)
 * - Navbar On/Off Switch Button
 * - Floating FX Preset Selector (Comet Cascade, Solar Flare, Aurora Borealis, Hyper Diamond)
 * - OpenUSD Architecture Flow Visualizer
 * - Scroll Spy Navigation
 */

(function () {
  'use strict';

  // ==========================================================================
  // 0. Cyber Charlie Character & Combat Engine
  // ==========================================================================
  class CyberCharlie {
    constructor(x = -1000, y = -1000, scale = 1.0) {
      this.x = x;
      this.y = y;
      this.targetX = this.x;
      this.targetY = this.y;
      this.vx = 0;
      this.vy = 0;
      this.facing = 1; // 1 = right, -1 = left

      // User Specifications
      this.scale = scale;              // Character Scale: 1.0x
      this.bladeGlowIntensity = 2.5;   // Plasma Blade Glow Intensity: 2.5x
      this.animSpeed = 1.0;

      // Animation & Face States
      this.state = 'waiting'; // idle, walk, run, jump, slash, bonk, dizzy, victory, thinking, writing, waiting, cyber_dash
      this.face = 'waiting';  // happy, battle, sprint, shocked, dizzy, sad, victory, wink, thinking, writing, waiting
      this.animTimer = 0;
      this.bonkTimer = 0;
      this.dizzyTimer = 0;
      this.dizzyAngle = 0;
      this.blinkTimer = Math.floor(Math.random() * 100);

      // Meet Charlie Section Mascot & Mode States
      this.sectionActive = false;
      this.isGameModeDeploy = false;
      this.combatCooldown = 0;

      // Supersonic Cyber Dash Mechanics
      this.deployTimer = 0;
      this.deployStartX = 0;
      this.deployStartY = 0;
      this.deployTargetX = 0;
      this.deployTargetY = 0;
      this.dashType = 'to_cursor'; // 'to_cursor' or 'to_dock'
      this.afterimages = [];

      // Companion Flight Escort States
      this.isEscorting = false;
      this.escortTimer = 0;
      this.escortMaxDuration = 80;
      this.escortTargetEl = null;
      this.escortSectionName = '';

      // Combat Action Timers & Sequences
      this.slashPhase = 1;
      this.slashTimer = 0;
      this.slashMax = 20;

      this.jumpTimer = 0;
      this.jumpMax = 72;
      this.jumpStartX = 0;
      this.jumpStartY = 0;
      this.jumpLandedSpark = false;

      this.victoryTimer = 0;
      this.victoryMax = 110;
      this.twirlAngle = 0;

      this.writeTimer = 0;
      this.bladeTrails = [];
      this.sparks = [];

      // Spontaneous Personality Engine (~45s - 75s intervals, avg 60s)
      this.spontaneousTimer = 0;
      this.spontaneousNextInterval = Math.floor(2700 + Math.random() * 1800);
      this.isSpontaneousAction = false;
      this.isShielded = false;
      this.manualShieldActive = false;
      this.shieldTimer = 0;
      this.emoteText = '';
      this.emoteTimer = 0;
    }

    addSparks(x, y, color = '#00f2fe', count = 10) {
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 1.5 + Math.random() * 4.5;
        this.sparks.push({
          x: x,
          y: y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          radius: 1.0 + Math.random() * 2.0,
          color: color,
          alpha: 1.0,
          decay: 0.03 + Math.random() * 0.03
        });
      }
    }

    updateSparks() {
      for (let i = this.sparks.length - 1; i >= 0; i--) {
        const s = this.sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.94;
        s.vy *= 0.94;
        s.alpha -= s.decay;
        if (s.alpha <= 0) {
          this.sparks.splice(i, 1);
        }
      }
    }

    drawSparks(c) {
      this.sparks.forEach(s => {
        c.save();
        c.beginPath();
        c.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        c.fillStyle = s.color;
        c.globalAlpha = s.alpha;
        c.shadowBlur = 8 * this.bladeGlowIntensity;
        c.shadowColor = s.color;
        c.fill();
        c.restore();
      });
    }

    setMode(mode) {
      this.state = mode;
      if (mode === 'run') this.face = 'sprint';
      else if (mode === 'walk') this.face = 'happy';
      else if (mode === 'slash') this.face = 'battle';
      else if (mode === 'bonk') this.face = 'shocked';
      else if (mode === 'dizzy') { this.face = 'dizzy'; this.dizzyTimer = 180; }
      else if (mode === 'thinking') this.face = 'thinking';
      else if (mode === 'writing') this.face = 'writing';
      else if (mode === 'waiting') this.face = 'waiting';
      else if (mode === 'victory') this.face = 'victory';
      else if (mode === 'idle') this.face = 'happy';
    }

    triggerRandomCombatAction() {
      if (this.combatCooldown > 0) return;
      this.combatCooldown = 14;

      // Randomly pick a combat move & expression
      const roll = Math.random();
      const combatFaces = ['battle', 'sprint', 'wink', 'victory'];
      this.face = combatFaces[Math.floor(Math.random() * combatFaces.length)];

      if (roll < 0.25) {
        // High Cleave Slash (Phase 1)
        this.slashPhase = 1;
        this.state = 'slash';
        this.slashTimer = 0;
        this.addSparks(this.x + this.facing * 32 * this.scale, this.y - 6 * this.scale, '#00f2fe', 18);
      } else if (roll < 0.50) {
        // Overhead Smite / Rising Uppercut (Phase 2)
        this.slashPhase = 2;
        this.state = 'slash';
        this.slashTimer = 0;
        this.addSparks(this.x + this.facing * 30 * this.scale, this.y - 20 * this.scale, '#f59e0b', 18);
      } else if (roll < 0.75) {
        // 360° Cyclone Vortex (Phase 3)
        this.slashPhase = 3;
        this.state = 'slash';
        this.slashTimer = 0;
        this.addSparks(this.x, this.y - 6 * this.scale, '#38bdf8', 24);
      } else {
        // Rapid Martial Thrust & Whip (Phase 4)
        this.slashPhase = 4;
        this.state = 'slash';
        this.slashTimer = 0;
        this.addSparks(this.x + this.facing * 34 * this.scale, this.y - 4 * this.scale, '#00f2fe', 20);
      }

      // Sync HUD face if bot HUD is visible
      const hudFace = document.getElementById('botFace');
      if (hudFace) {
        const faceMap = { battle: '[⚔_⚔]', sprint: '[⚡_⚡]', wink: '[^_-]', victory: '[★_★]' };
        hudFace.textContent = faceMap[this.face] || '[•_•]';
      }
    }

    triggerSlash() {
      this.slashPhase = (this.slashPhase % 4) + 1;
      this.state = 'slash';
      this.slashTimer = 0;
      this.face = 'battle';
      this.addSparks(this.x + this.facing * 30 * this.scale, this.y - 6 * this.scale, '#00f2fe', 14);
    }

    triggerJump() {
      this.state = 'jump';
      this.jumpStartX = this.x;
      this.jumpStartY = this.y;
      this.jumpMax = 72;
      this.jumpTimer = 0;
      this.jumpLandedSpark = false;
      this.face = 'wink';
    }

    triggerVictory() {
      if (window.portfolioEngine?.isEnabled) return;
      this.state = 'victory';
      this.victoryTimer = 0;
      this.twirlAngle = 0;
      this.face = 'victory';
    }

    triggerBonk() {
      this.state = 'bonk';
      this.face = 'shocked';
      this.bonkTimer = 45;
      this.vy = -7;
      this.vx = -this.facing * 5.5;
      this.addSparks(this.x, this.y - 18 * this.scale, '#f59e0b', 16);
    }

    triggerDizzy() {
      this.state = 'dizzy';
      this.face = 'dizzy';
      this.dizzyTimer = 180;
      this.addSparks(this.x, this.y - 20 * this.scale, '#f59e0b', 12);
    }

    triggerThinking() {
      if (window.portfolioEngine?.isEnabled) return;
      this.state = 'thinking';
      this.face = 'thinking';
    }

    triggerWriting() {
      if (window.portfolioEngine?.isEnabled) return;
      this.state = 'writing';
      this.face = 'writing';
      this.writeTimer = 0;
    }

    triggerSpontaneousAction() {
      if (window.portfolioEngine?.isEnabled) return; // In Game Mode, Charlie is always 100% focused on sword fighting!
      if (this.state === 'slash' || this.state === 'cyber_dash' || this.state === 'deploying') return;

      this.spontaneousTimer = 0;
      this.spontaneousNextInterval = Math.floor(2700 + Math.random() * 1800);
      this.isSpontaneousAction = true;

      const moves = ['jump', 'bonk', 'dizzy', 'victory'];
      const move = moves[Math.floor(Math.random() * moves.length)];
      const soundEngine = window.portfolioSoundEngine;

      if (move === 'jump') {
        this.state = 'jump';
        this.jumpStartX = this.x;
        this.jumpStartY = this.y;
        this.jumpMax = 72;
        this.jumpTimer = 0;
        this.jumpLandedSpark = false;
        this.face = 'wink';
        this.setEmote('WOOHOO! 🦘', 70);
        if (soundEngine && typeof soundEngine.playJump === 'function') {
          soundEngine.playJump();
        }
        this.syncHudFace('[^_-]');
      } else if (move === 'bonk') {
        this.state = 'bonk';
        this.face = 'shocked';
        this.bonkTimer = 40;
        this.vy = -6;
        this.vx = -this.facing * 4.5;
        this.isShielded = true;
        this.setEmote('BONK! 💥', 65);
        this.addSparks(this.x, this.y - 18 * this.scale, '#f59e0b', 16);
        if (soundEngine && typeof soundEngine.playBonk === 'function') {
          soundEngine.playBonk();
        }
        this.syncHudFace('[⊙_⊙]');
      } else if (move === 'dizzy') {
        this.state = 'dizzy';
        this.face = 'dizzy';
        this.dizzyTimer = 75; // ~2.2s
        this.isShielded = true;
        this.setEmote('WHOA! 😵', 80);
        this.addSparks(this.x, this.y - 20 * this.scale, '#f59e0b', 14);
        if (soundEngine && typeof soundEngine.playDizzy === 'function') {
          soundEngine.playDizzy();
        }
        this.syncHudFace('[@_@]');
      } else if (move === 'victory') {
        this.state = 'victory';
        this.victoryTimer = 0;
        this.twirlAngle = 0;
        this.face = 'victory';
        this.setEmote('UNSTOPPABLE! 🌟', 85);
        if (soundEngine && typeof soundEngine.playFanfare === 'function') {
          soundEngine.playFanfare();
        }
        this.syncHudFace('[★_★]');
      }
    }

    setEmote(text, duration = 75) {
      this.emoteText = text;
      this.emoteTimer = duration;
    }

    syncHudFace(faceStr) {
      const hudFace = document.getElementById('botFace');
      if (hudFace) {
        hudFace.textContent = faceStr;
      }
    }

    triggerWaiting() {
      if (window.portfolioEngine?.isEnabled) return;
      this.state = 'waiting';
      this.face = 'waiting';
    }

    triggerDeploy(startX, startY, targetX, targetY, isGameMode = true) {
      this.state = 'cyber_dash';
      this.dashType = 'to_cursor';
      this.isGameModeDeploy = isGameMode;
      this.sectionActive = !isGameMode;
      this.face = isGameMode ? 'battle' : 'sprint';
      this.deployTimer = 0;
      this.deployStartX = startX;
      this.deployStartY = startY;
      this.deployTargetX = targetX;
      this.deployTargetY = targetY;
      this.targetX = targetX;
      this.targetY = targetY;
      this.x = startX;
      this.y = startY;
      this.facing = this.deployTargetX >= this.x ? 1 : -1;
      this.addSparks(this.x, this.y, isGameMode ? '#00f2fe' : '#38bdf8', 24);
    }

    triggerDock(dockX, dockY) {
      this.state = 'cyber_dash';
      this.dashType = 'to_dock';
      this.face = 'sprint';
      this.isGameModeDeploy = false;
      this.sectionActive = false;
      this.deployTimer = 0;
      this.deployStartX = this.x;
      this.deployStartY = this.y;
      this.deployTargetX = dockX;
      this.deployTargetY = dockY;
      this.facing = this.deployTargetX >= this.x ? 1 : -1;
      this.addSparks(this.x, this.y, '#f59e0b', 20);
    }

    triggerSectionEscort(targetEl, sectionName) {
      if (!targetEl) return;

      // If deployed in dock (off-screen), start flight from dock button coordinates
      if (!isFinite(this.x) || this.x < -200 || !isFinite(this.y) || this.y < -200) {
        const floatingBtn = document.getElementById('floatingCharlieBtn');
        const dockRect = floatingBtn ? floatingBtn.getBoundingClientRect() : { left: window.innerWidth - 60, top: window.innerHeight - 60, width: 44, height: 44 };
        this.x = dockRect.left + dockRect.width / 2;
        this.y = dockRect.top + dockRect.height / 2;
        if (floatingBtn) floatingBtn.classList.add('hidden');
      }

      this.isEscorting = true;
      this.escortTargetEl = targetEl;
      this.escortSectionName = sectionName || targetEl.getAttribute('data-section-title') || targetEl.id || 'Portfolio Section';
      this.state = 'escort';
      this.face = 'sprint';
      this.escortTimer = 0;
      this.escortMaxDuration = 80; // ~1.3s companion flight
      this.sectionActive = false;

      this.setEmote(`ESCORTING TO ${this.escortSectionName.toUpperCase()}! 🚀`, 110);
      this.addSparks(this.x, this.y, '#00f2fe', 26);
      if (typeof window.portfolioSoundEngine?.playJump === 'function' && !window.portfolioSoundEngine.isMuted) {
        window.portfolioSoundEngine.playJump();
      }
    }

    triggerWriteDash(startX, startY, targetX, targetY, onComplete) {
      if (window.portfolioEngine?.isEnabled) return;
      if (!isFinite(startX) || !isFinite(startY) || startX < -200 || startY < -200) {
        const floatingBtn = document.getElementById('floatingCharlieBtn');
        const dockRect = floatingBtn ? floatingBtn.getBoundingClientRect() : { left: window.innerWidth - 60, top: window.innerHeight - 60, width: 44, height: 44 };
        startX = dockRect.left + dockRect.width / 2;
        startY = dockRect.top + dockRect.height / 2;
        if (floatingBtn) floatingBtn.classList.add('hidden');
      }

      if (!isFinite(targetX) || !isFinite(targetY) || targetX < 0) {
        const bottomPoint = this.getChatBottomCenter();
        targetX = bottomPoint.x;
        targetY = bottomPoint.y;
      }

      this.state = 'cyber_dash';
      this.dashType = 'to_write';
      this.face = 'sprint';
      this.isGameModeDeploy = false;
      this.sectionActive = true;
      this.deployTimer = 0;
      this.deployStartX = startX;
      this.deployStartY = startY;
      this.deployTargetX = targetX;
      this.deployTargetY = targetY;
      this.onDashComplete = (typeof onComplete === 'function') ? onComplete : null;
      this.x = startX;
      this.y = startY;
      this.facing = this.deployTargetX >= this.x ? 1 : -1;
      this.addSparks(this.x, this.y, '#00f2fe', 24);
      this.setEmote('CYBER WRITE! ⚡', 45);
      try {
        if (typeof window.portfolioSoundEngine?.playLaserDeflect === 'function') {
          window.portfolioSoundEngine.playLaserDeflect();
        }
      } catch (e) {}
    }

    triggerReturnDash(startX, startY, targetX, targetY) {
      if (window.portfolioEngine?.isEnabled) return;
      if (!isFinite(startX) || !isFinite(startY)) {
        startX = this.x;
        startY = this.y;
      }
      if (!isFinite(targetX) || !isFinite(targetY)) {
        const home = this.getChatMascotAnchor();
        targetX = home.x;
        targetY = home.y;
      }

      this.state = 'cyber_dash';
      this.dashType = 'to_mascot';
      this.face = 'sprint';
      this.isGameModeDeploy = false;
      this.sectionActive = true;
      this.deployTimer = 0;
      this.deployStartX = startX;
      this.deployStartY = startY;
      this.deployTargetX = targetX;
      this.deployTargetY = targetY;
      this.x = startX;
      this.y = startY;
      this.facing = this.deployTargetX >= this.x ? 1 : -1;
      this.addSparks(this.x, this.y, '#38bdf8', 22);
      this.setEmote('DELIVERED! ✨', 45);
      try {
        if (typeof window.portfolioSoundEngine?.playLaserDeflect === 'function') {
          window.portfolioSoundEngine.playLaserDeflect();
        }
      } catch (e) {}
    }

    getChatWritingCenter() {
      const streamEl = document.getElementById('aiChatStream');
      const terminalEl = document.querySelector('.ai-bot-terminal') || document.getElementById('ai-assistant');
      const navbarEl = document.querySelector('.navbar');
      const navBottom = (navbarEl ? navbarEl.getBoundingClientRect().bottom : 70);

      const targetEl = (streamEl && streamEl.getBoundingClientRect().height > 80) ? streamEl : terminalEl;
      if (targetEl) {
        const sRect = targetEl.getBoundingClientRect();
        const centerX = Math.max(60, Math.min(window.innerWidth - 60, sRect.left + sRect.width / 2));
        const topBound = Math.max(sRect.top + 45, navBottom + 45);
        const bottomBound = Math.max(topBound + 20, sRect.bottom - 45);
        const naturalY = sRect.top + sRect.height * 0.46;
        const centerY = Math.max(topBound, Math.min(bottomBound, naturalY));
        const isVisible = (sRect.bottom > navBottom + 50 && sRect.top < window.innerHeight - 50);
        return { x: centerX, y: centerY, isVisible };
      }
      return { x: window.innerWidth / 2, y: window.innerHeight / 2, isVisible: true };
    }

    getChatBottomCenter() {
      const streamEl = document.getElementById('aiChatStream');
      const formEl = document.getElementById('aiChatForm');
      const terminalEl = document.querySelector('.ai-bot-terminal') || document.getElementById('ai-assistant');
      const navbarEl = document.querySelector('.navbar');
      const navBottom = (navbarEl ? navbarEl.getBoundingClientRect().bottom : 70);

      const targetEl = (streamEl && streamEl.getBoundingClientRect().height > 80) ? streamEl : terminalEl;
      if (targetEl) {
        const sRect = targetEl.getBoundingClientRect();
        const centerX = Math.max(60, Math.min(window.innerWidth - 60, sRect.left + sRect.width / 2));
        // Position Charlie hovering a few pixels above the input bar at bottom-center
        let bottomY;
        if (formEl) {
          const fRect = formEl.getBoundingClientRect();
          // Charlie's feet extend downward from center by ~22*scale. To hover ~8px above the input bar:
          bottomY = fRect.top - (30 * this.scale);
        } else {
          bottomY = sRect.bottom - (42 * this.scale);
        }
        // Clamp so Charlie stays safely inside visible viewport
        bottomY = Math.max(navBottom + 60, Math.min(window.innerHeight - 55, bottomY));
        const isVisible = (sRect.bottom > navBottom + 50 && sRect.top < window.innerHeight - 50);
        return { x: centerX, y: bottomY, isVisible };
      }
      return { x: window.innerWidth / 2, y: window.innerHeight - 90, isVisible: true };
    }

    getChatMascotAnchor() {
      const streamEl = document.getElementById('aiChatStream');
      const terminalEl = document.querySelector('.ai-bot-terminal') || document.getElementById('ai-assistant');
      const navbarEl = document.querySelector('.navbar');
      const navBottom = (navbarEl ? navbarEl.getBoundingClientRect().bottom : 70);

      if (streamEl) {
        const sRect = streamEl.getBoundingClientRect();
        // 1. Horizontal: inside chat window, comfortably towards the right, just to the left of the scrollbar
        const anchorX = Math.min(window.innerWidth - 44, Math.max(44, sRect.right - 48));

        // 2. Vertical: inside the chat window area, down below the terminal header & "LOCAL KB READY" pill
        // Natural center is sRect.top + 62 (head at sRect.top + 34, cleanly down inside chat stream)
        // Clamped to navBottom + 44 so when scrolling, Charlie never overlaps sticky top menu bar
        const minAllowedY = navBottom + 44;
        const maxAllowedY = sRect.bottom - 45;
        const naturalY = sRect.top + 62;
        const anchorY = Math.max(minAllowedY, Math.min(maxAllowedY, naturalY));

        const isVisible = (sRect.bottom > navBottom + 65 && sRect.top < window.innerHeight - 60);
        return { x: anchorX, y: anchorY, isVisible };
      } else if (terminalEl) {
        const tRect = terminalEl.getBoundingClientRect();
        const anchorX = Math.min(window.innerWidth - 44, Math.max(44, tRect.right - 48));
        const minAllowedY = navBottom + 44;
        const maxAllowedY = tRect.bottom - 45;
        const naturalY = tRect.top + 105;
        const anchorY = Math.max(minAllowedY, Math.min(maxAllowedY, naturalY));
        const isVisible = (tRect.bottom > navBottom + 65 && tRect.top < window.innerHeight - 60);
        return { x: anchorX, y: anchorY, isVisible };
      }
      return { x: window.innerWidth - 80, y: 250, isVisible: false };
    }

    drawAfterimages(c) {
      for (let i = this.afterimages.length - 1; i >= 0; i--) {
        const ghost = this.afterimages[i];
        ghost.alpha -= 0.045 * this.animSpeed;
        if (ghost.alpha <= 0) {
          this.afterimages.splice(i, 1);
          continue;
        }
        c.save();
        c.translate(ghost.x, ghost.y);
        c.scale(ghost.facing * this.scale * 0.95, this.scale * 0.95);
        c.globalAlpha = ghost.alpha * 0.55;
        c.shadowColor = ghost.color;
        c.shadowBlur = 14 * this.bladeGlowIntensity;
        c.fillStyle = ghost.color;
        c.beginPath();
        c.roundRect(-14, -26, 28, 38, 7);
        c.fill();
        c.fillStyle = '#ffffff';
        c.fillRect(-10, -14, 20, 4);
        c.restore();
      }
    }

    drawLightningArcs(c) {
      if (this.state === 'cyber_dash' && this.deployTimer < 1.0 && this.dashType === 'to_cursor') {
        c.save();
        const color = '#00f2fe';
        c.strokeStyle = color;
        c.shadowColor = color;
        c.shadowBlur = 12 * this.bladeGlowIntensity;
        c.lineWidth = 2.0;
        for (let a = 0; a < 2; a++) {
          c.beginPath();
          c.moveTo(this.deployStartX, this.deployStartY);
          const steps = 6;
          for (let s = 1; s < steps; s++) {
            const segT = s / steps;
            const px = this.deployStartX + (this.x - this.deployStartX) * segT + (Math.random() - 0.5) * 26;
            const py = this.deployStartY + (this.y - this.deployStartY) * segT + (Math.random() - 0.5) * 26;
            c.lineTo(px, py);
          }
          c.lineTo(this.x, this.y);
          c.stroke();
        }
        c.restore();
      }
    }

    drawBladeTrails(c) {
      if (this.bladeTrails.length > 1) {
        c.save();
        for (let i = 1; i < this.bladeTrails.length; i++) {
          const pt1 = this.bladeTrails[i - 1];
          const pt2 = this.bladeTrails[i];
          c.strokeStyle = `rgba(0, 242, 254, ${pt2.alpha * 0.95})`;
          c.shadowColor = '#00f2fe';
          c.shadowBlur = 14 * this.bladeGlowIntensity;
          c.lineWidth = Math.max(1.8, 5.0 * pt2.alpha * this.scale);
          c.lineCap = 'round';
          c.beginPath();
          c.moveTo(pt1.x, pt1.y);
          c.lineTo(pt2.x, pt2.y);
          c.stroke();
        }
        c.restore();
      }
      for (let i = 0; i < this.bladeTrails.length; i++) {
        const trail = this.bladeTrails[i];
        c.save();
        c.globalAlpha = trail.alpha * 0.85;
        c.shadowColor = '#00f2fe';
        c.shadowBlur = 12 * this.bladeGlowIntensity;
        c.fillStyle = '#00f2fe';
        c.beginPath();
        c.arc(trail.x, trail.y, Math.max(1.0, 3.2 * this.scale * trail.alpha), 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    update() {
      // Timing: Sprint Animation Speed = 1.0x, rest all = 0.5x
      const stateSpeedRate = (this.state === 'run' || this.state === 'cyber_dash') ? 1.0 : 0.5;
      this.animTimer += 0.15 * this.animSpeed * stateSpeedRate;
      this.dizzyAngle += 0.08 * this.animSpeed * stateSpeedRate;
      this.blinkTimer = (this.blinkTimer + 1) % 210; // ~3.5 seconds at 60fps natural blink cycle
      if (this.combatCooldown > 0) this.combatCooldown--;
      this.updateSparks();

      // Blade Trail decay
      for (let i = this.bladeTrails.length - 1; i >= 0; i--) {
        this.bladeTrails[i].alpha -= 0.08;
        if (this.bladeTrails[i].alpha <= 0) {
          this.bladeTrails.splice(i, 1);
        }
      }

      // 1. Terminal Anchor Tracking (When stationed as Meet Charlie section mascot AND Game Mode is strictly OFF)
      // Note: Writing state trajectory is independently interpolated along the triangular path from bottom-center to screen-center
      if (!window.portfolioEngine?.isEnabled && this.sectionActive && this.state !== 'cyber_dash' && this.state !== 'writing' && this.state !== 'escort' && !this.isEscorting) {
        const isCenteredMode = (this.state === 'victory');
        const anchor = isCenteredMode ? this.getChatWritingCenter() : this.getChatMascotAnchor();
        if (anchor.isVisible) {
          this.targetX = anchor.x;
          this.targetY = anchor.y;

          const dx = this.targetX - this.x;
          const dy = this.targetY - this.y;
          this.x += dx * 0.22;
          this.y += dy * 0.22;
          if (Math.abs(dx) > 4 && this.state !== 'writing') {
            this.facing = dx > 0 ? 1 : -1;
          }
        } else if (!isCenteredMode) {
          // Mascot scrolled out of view -> trigger return dash to dock (NEVER dock during writing or celebrating!)
          const floatingBtn = document.getElementById('floatingCharlieBtn');
          const dockRect = floatingBtn ? floatingBtn.getBoundingClientRect() : { left: window.innerWidth - 60, top: window.innerHeight - 60, width: 44, height: 44 };
          const dockCenterX = dockRect.left + dockRect.width / 2;
          const dockCenterY = dockRect.top + dockRect.height / 2;
          this.triggerDock(dockCenterX, dockCenterY);
        }
      }

      // 2. Fluid, Zero-Lag Mouse Tracking (When Game Mode is active - UNCONDITIONALLY overrides chat)
      if (window.portfolioEngine && window.portfolioEngine.isEnabled && this.state !== 'cyber_dash') {
        this.sectionActive = false; // Game Mode unconditionally takes priority over chat!

        const targetX = (this.targetX > -500) ? this.targetX : (window.innerWidth / 2);
        const targetY = (this.targetY > -500) ? this.targetY : (window.innerHeight / 2);

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.hypot(dx, dy);

        if (Math.abs(dx) > 6) {
          this.facing = dx > 0 ? 1 : -1;
        }

        // In Game Mode: Charlie is ALWAYS doing sword fighting!
        if (!this.manualShieldActive) {
          if (this.state !== 'slash') {
            this.triggerSlash();
          }
        }

        let chaseFactor = 0.22;
        if (dist > 220) {
          chaseFactor = 0.36;
        } else if (dist > 35) {
          chaseFactor = 0.26;
        } else {
          chaseFactor = 0.18;
        }

        this.vx = dx * chaseFactor;
        this.vy = dy * chaseFactor;
        this.x += this.vx;
        this.y += this.vy;
      }

      // Action Progressions
      if (this.state === 'jump') {
        this.x = this.jumpStartX; // Lock horizontal position in-place for pure vertical leap!
        this.vx = 0;
        this.vy = 0;
        this.jumpTimer += 1.0 * this.animSpeed;
        const t = Math.min(1.0, this.jumpTimer / this.jumpMax);

        if (t >= 0.15 && t < 0.52 && Math.random() > 0.3) {
          this.addSparks(this.x, this.y + 16 * this.scale, '#00f2fe', 2);
        }
        if (t >= 0.45 && t < 0.75) {
          this.face = 'battle';
        } else if (t >= 0.75) {
          this.face = 'happy';
        }
        if (t >= 0.88 && !this.jumpLandedSpark) {
          this.jumpLandedSpark = true;
          this.addSparks(this.x, this.y + 14 * this.scale, '#00f2fe', 14);
          try {
            if (typeof window.portfolioSoundEngine?.playComboDing === 'function') {
              window.portfolioSoundEngine.playComboDing();
            }
          } catch (e) {}
        }
        if (this.jumpTimer >= this.jumpMax) {
          this.state = 'idle';
          this.face = 'happy';
          this.isSpontaneousAction = false;
          if (!this.manualShieldActive) this.isShielded = false;
        }
      }

      if (this.state === 'victory') {
        this.victoryTimer += 1.0 * this.animSpeed * 0.5;
        const t = Math.min(1.0, this.victoryTimer / this.victoryMax);
        if (t < 0.35) {
          this.twirlAngle = (t / 0.35) * Math.PI * 4;
        } else {
          this.twirlAngle = 0;
        }
        if (t >= 0.35 && t < 0.70 && Math.floor(this.victoryTimer) % 6 === 0) {
          const bladeTipX = this.x + this.facing * 18 * this.scale;
          const bladeTipY = this.y - 28 * this.scale;
          this.addSparks(bladeTipX, bladeTipY, '#f59e0b', 4);
        }
        if (this.isSpontaneousAction) {
          if (this.victoryTimer >= 65) {
            this.state = 'idle';
            this.face = 'happy';
            this.isSpontaneousAction = false;
            this.isShielded = false;
          }
        } else if (this.victoryTimer >= this.victoryMax) {
          this.victoryTimer = 25;
        }
      }

      if (this.state === 'slash') {
        this.slashTimer += 1.0 * this.animSpeed;
        if (this.slashTimer >= this.slashMax) {
          if (window.portfolioEngine && window.portfolioEngine.isEnabled && !this.manualShieldActive) {
            // In Game Mode: Charlie is ALWAYS doing sword fighting! Seamlessly chain to next sword strike!
            this.triggerSlash();
          } else {
            this.state = 'idle';
            this.face = 'happy';
          }
        }
      }

      if (this.state === 'bonk') {
        this.bonkTimer--;
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.35;
        if (this.bonkTimer <= 0) {
          if (this.isSpontaneousAction) {
            this.state = 'idle';
            this.face = 'happy';
            this.isSpontaneousAction = false;
            this.isShielded = false;
          } else {
            this.state = 'dizzy';
            this.face = 'dizzy';
            this.dizzyTimer = 180;
          }
        }
      }

      if (this.state === 'dizzy') {
        this.dizzyTimer -= 1.0 * this.animSpeed * 0.5;
        if (this.dizzyTimer <= 0) {
          this.state = 'idle';
          this.face = 'happy';
          this.isSpontaneousAction = false;
          this.isShielded = false;
        }
      }

      if (this.emoteTimer > 0) this.emoteTimer--;

      // Holo-Shield Timer Countdown
      if (this.shieldTimer > 0 && !this.manualShieldActive) {
        this.shieldTimer--;
        if (this.shieldTimer <= 0) {
          this.isShielded = false;
        }
      }

      // Spontaneous Action Interval Check (Game Mode Only)
      if (window.portfolioEngine && window.portfolioEngine.isEnabled && this.state !== 'cyber_dash') {
        this.spontaneousTimer++;
        if (this.spontaneousTimer >= this.spontaneousNextInterval) {
          if (this.state === 'idle' || this.state === 'walk' || this.state === 'run') {
            this.triggerSpontaneousAction();
          } else {
            // Postpone slightly until attack completes
            this.spontaneousTimer = this.spontaneousNextInterval - 60;
          }
        }
      }

      if (this.state === 'thinking' && Math.random() > 0.65) {
        this.addSparks(this.x, this.y - 28 * this.scale, '#f59e0b', 1);
      }

      if (this.state === 'writing') {
        this.writeTimer += 1.0 * this.animSpeed * 0.5;
        if (Math.random() > 0.35) {
          const stylusTipX = this.x + this.facing * 14 * this.scale;
          const stylusTipY = this.y - 2 * this.scale;
          this.addSparks(stylusTipX, stylusTipY, '#00f2fe', 1);
        }
      }

      // Companion Escort Flight Mode (Accompanies page animation / smooth scroll to specific portfolio section)
      if (this.state === 'escort') {
        this.escortTimer += 1.0 * this.animSpeed;
        const rect = this.escortTargetEl ? this.escortTargetEl.getBoundingClientRect() : null;
        let destX = window.innerWidth / 2;
        let destY = window.innerHeight / 2;
        if (rect) {
          destX = Math.min(window.innerWidth - 85, Math.max(85, rect.left + rect.width - 130));
          destY = Math.min(window.innerHeight - 100, Math.max(90, rect.top + 70));
        }

        const dx = destX - this.x;
        const dy = destY - this.y;
        this.x += dx * 0.16;
        this.y += dy * 0.16;
        if (Math.abs(dx) > 4) {
          this.facing = dx >= 0 ? 1 : -1;
        }

        this.afterimages.push({
          x: this.x,
          y: this.y,
          facing: this.facing,
          alpha: 0.85,
          color: '#00f2fe'
        });

        if (Math.random() > 0.3) {
          this.addSparks(this.x, this.y, '#38bdf8', 2);
        }

        const isArrived = (this.escortTimer >= this.escortMaxDuration) || (rect && Math.abs(rect.top - 70) < 25 && this.escortTimer > 25);
        if (isArrived) {
          this.state = 'victory';
          this.victoryTimer = 0;
          this.twirlAngle = 0;
          this.face = 'victory';
          this.setEmote(`ARRIVED AT ${this.escortSectionName.toUpperCase()}! 🌟`, 90);
          this.addSparks(this.x, this.y, '#f59e0b', 26);
          this.addSparks(this.x, this.y, '#00f2fe', 20);

          if (typeof window.portfolioSoundEngine?.playFanfare === 'function' && !window.portfolioSoundEngine.isMuted) {
            window.portfolioSoundEngine.playFanfare();
          }

          setTimeout(() => {
            const floatingBtn = document.getElementById('floatingCharlieBtn');
            const dockRect = floatingBtn ? floatingBtn.getBoundingClientRect() : { left: window.innerWidth - 60, top: window.innerHeight - 60, width: 44, height: 44 };
            const dockCenterX = dockRect.left + dockRect.width / 2;
            const dockCenterY = dockRect.top + dockRect.height / 2;
            this.isEscorting = false;
            this.triggerDock(dockCenterX, dockCenterY);
          }, 1150);
        }
      }

      // Supersonic Cyber Dash
      if (this.state === 'cyber_dash') {
        this.deployTimer += 0.055 * this.animSpeed;
        const t = Math.min(1.0, this.deployTimer);
        const ease = 1 - Math.pow(1 - t, 3);
        this.x = this.deployStartX + (this.deployTargetX - this.deployStartX) * ease;
        this.y = this.deployStartY + (this.deployTargetY - this.deployStartY) * ease;

        const ghostColor = (this.dashType === 'to_cursor' || this.dashType === 'to_write') ? '#00f2fe' : (this.dashType === 'to_mascot' ? '#38bdf8' : '#f59e0b');
        this.afterimages.push({
          x: this.x,
          y: this.y,
          facing: this.facing,
          alpha: 0.85,
          color: ghostColor
        });

        if (Math.random() > 0.3) {
          this.addSparks(this.x, this.y, ghostColor, 2);
        }

        if (t >= 1.0) {
          if (this.dashType === 'to_dock') {
            this.state = 'waiting';
            this.face = 'waiting';
            this.x = -1000;
            this.y = -1000;
            this.sectionActive = false;
            document.body.classList.remove('combat-cursor-active');
            this.addSparks(this.deployTargetX, this.deployTargetY, '#00f2fe', 16);
            const floatingBtn = document.getElementById('floatingCharlieBtn');
            if (floatingBtn) floatingBtn.classList.remove('hidden');
          } else if (this.dashType === 'to_write') {
            this.state = 'writing';
            this.face = 'writing';
            this.writeTimer = 0;
            this.sectionActive = true;
            this.facing = 1;
            this.x = this.deployTargetX;
            this.y = this.deployTargetY;
            this.addSparks(this.x, this.y, '#00f2fe', 26);
            try {
              if (typeof window.portfolioSoundEngine?.playComboDing === 'function') {
                window.portfolioSoundEngine.playComboDing();
              }
            } catch (e) {}
            if (typeof this.onDashComplete === 'function') {
              const cb = this.onDashComplete;
              this.onDashComplete = null;
              cb();
            }
          } else if (this.dashType === 'to_mascot') {
            this.state = 'waiting';
            this.face = 'waiting';
            this.sectionActive = true;
            this.facing = -1;
            this.x = this.deployTargetX;
            this.y = this.deployTargetY;
            this.addSparks(this.x, this.y, '#38bdf8', 22);
            try {
              if (typeof window.portfolioSoundEngine?.playComboDing === 'function') {
                window.portfolioSoundEngine.playComboDing();
              }
            } catch (e) {}
          } else {
            if (this.isGameModeDeploy) {
              this.state = 'slash';
              this.slashPhase = 1;
              this.slashTimer = 0;
              this.face = 'battle';
              this.facing = 1;
              document.body.classList.add('combat-cursor-active');
              this.addSparks(this.x, this.y, '#00f2fe', 26);
            } else {
              this.state = 'waiting';
              this.face = 'waiting';
              this.sectionActive = true;
              document.body.classList.remove('combat-cursor-active');
              this.addSparks(this.x, this.y, '#00f2fe', 22);
            }
          }
        }
      }

      // Blade Trail following dynamic sword tip across full martial reach
      if (this.state === 'slash' || this.state === 'run' || (this.state === 'jump' && this.jumpTimer > 20)) {
        let tipOffsetX = 26;
        let tipOffsetY = -5;

        if (this.state === 'slash') {
          const st = this.slashTimer / this.slashMax;
          if (this.slashPhase === 1) {
            // High-to-low diagonal cleave: sword sweeps from overhead (-34) down across hip (+14)
            tipOffsetX = 10 + Math.sin(st * Math.PI) * 28;
            tipOffsetY = -34 + (st * 48);
          } else if (this.slashPhase === 2) {
            // Low-to-high rising uppercut: sword sweeps from low (+16) up into sky (-38)
            tipOffsetX = 14 + Math.sin(st * Math.PI) * 26;
            tipOffsetY = 16 - (st * 54);
          } else if (this.slashPhase === 3) {
            // 360° Cyclone spin
            const ang = st * Math.PI * 2;
            tipOffsetX = Math.cos(ang) * 30;
            tipOffsetY = -8 + Math.sin(ang) * 26;
          } else if (this.slashPhase === 4) {
            // Rapid martial thrust: sword lunges forward and whips
            tipOffsetX = 22 + Math.sin(st * Math.PI * 4) * 16;
            tipOffsetY = -4 + Math.cos(st * Math.PI * 4) * 8;
          }
        } else if (this.state === 'jump') {
          const jt = this.jumpTimer / this.jumpMax;
          const flipAng = jt * Math.PI * 2;
          tipOffsetX = Math.cos(flipAng) * 26;
          tipOffsetY = -10 + Math.sin(flipAng) * 26;
        }

        const bladeTipX = this.x + this.facing * (tipOffsetX * this.scale);
        const bladeTipY = this.y + (tipOffsetY * this.scale);
        this.bladeTrails.push({ x: bladeTipX, y: bladeTipY, alpha: 0.95 });
      }
    }

    draw(c) {
      if (this.x < -200 || this.y < -200) return;

      c.save();

      let worldJumpY = 0;
      let bobY = 0;
      let squashX = 1.0;
      let squashY = 1.0;
      let leanAngle = 0;
      let somersaultRotation = 0;

      let hipL = 0, kneeL = 0;
      let hipR = 0, kneeR = 0;
      let upperL = 0, elbowL = 0;
      let upperR = 0, elbowR = 0;
      let customKnifeAngle = 0;
      let thrusterL = false, thrusterR = false;

      // IDLE CYCLE
      if (this.state === 'idle') {
        bobY = Math.sin(this.animTimer * 1.8) * 2.0;
        hipL = 0.08; kneeL = 0.05;
        hipR = -0.08; kneeR = 0.05;
        upperL = 0.70; elbowL = -1.30;
        upperR = 0.42; elbowR = -0.85;
        customKnifeAngle = 0.43;
      }

      // WALK CYCLE
      else if (this.state === 'walk') {
        const w = this.animTimer * 2.2;
        bobY = Math.abs(Math.sin(w)) * 2.5;
        hipL = Math.sin(w) * 0.45;
        kneeL = Math.max(0, -Math.sin(w) * 0.55);
        hipR = -Math.sin(w) * 0.45;
        kneeR = Math.max(0, Math.sin(w) * 0.55);
        leanAngle = 0.08;
        upperL = 0.70 + Math.sin(w) * 0.55;
        elbowL = -1.15;
        upperR = 0.42 - Math.sin(w) * 0.40;
        elbowR = -0.85;
        customKnifeAngle = 0.43;
      }

      // SPRINT & ESCORT COMPANION FLIGHT CYCLE
      else if (this.state === 'run' || this.state === 'escort') {
        const r = this.animTimer * 3.6;
        bobY = Math.abs(Math.sin(r)) * 4.0;
        hipL = Math.sin(r) * 0.85;
        kneeL = Math.max(0, -Math.sin(r) * 1.1);
        hipR = -Math.sin(r) * 0.85;
        kneeR = Math.max(0, Math.sin(r) * 1.1);
        leanAngle = 0.30;
        thrusterL = hipL > 0.2;
        thrusterR = hipR > 0.2;
        upperL = 0.45 - Math.sin(r) * 0.95;
        elbowL = -1.0;
        upperR = 0.30 + Math.sin(r) * 0.70;
        elbowR = -0.70;
        customKnifeAngle = 0.35;
      }

      // JUMP & 360° SOMERSAULT FLIP (5-Phase Parabolic Motion, Inverted Apex with skyward legs)
      else if (this.state === 'jump') {
        const t = Math.min(1.0, this.jumpTimer / this.jumpMax);

        if (t < 0.14) {
          // Phase 1: Deep anticipation crouch
          const u = t / 0.14;
          worldJumpY = 0;
          somersaultRotation = 0;
          squashY = 1.0 - (u * 0.22);
          squashX = 1.0 + (u * 0.18);
          hipL = 0.40; kneeL = 0.80;
          hipR = 0.40; kneeR = 0.80;
          upperL = 0.90; elbowL = -0.3;
          upperR = 0.90; elbowR = -0.3;
        } else if (t < 0.45) {
          // Phase 2: Explosive Vertical Ascent & First Half Rotation (0 -> 180°)
          const u = (t - 0.14) / 0.31; // 0 -> 1
          worldJumpY = -95 * Math.sin(u * Math.PI * 0.5);
          somersaultRotation = u * Math.PI; // rotating to inverted pose
          squashY = 1.20 - (u * 0.20);
          squashX = 0.88 + (u * 0.12);
          hipL = -0.25 + u * 0.2; kneeL = 0.3;
          hipR = 0.15 + u * 0.2; kneeR = 0.3;
          thrusterL = true; thrusterR = true;
          upperL = -0.2 - u * 0.4; elbowL = -0.5;
          upperR = -0.2 - u * 0.4; elbowR = -0.5;
          customKnifeAngle = u * Math.PI;
        } else if (t < 0.55) {
          // Phase 3: APEX INVERSION — LEGS ARE ON TOP IN THE AIR (pointing skyward!)
          const u = (t - 0.45) / 0.10;
          worldJumpY = -95 - Math.sin(u * Math.PI) * 4.0; // gentle float at apex
          somersaultRotation = Math.PI; // fully inverted 180° somersault
          squashY = 1.05; squashX = 0.95;
          // Legs on top pointing up into the sky!
          hipL = -0.35; kneeL = 0.15;
          hipR = -0.35; kneeR = 0.15;
          thrusterL = true; thrusterR = true;
          upperL = -0.6; elbowL = -0.4;
          upperR = -0.6; elbowR = -0.4;
          customKnifeAngle = Math.PI;
        } else if (t < 0.88) {
          // Phase 4: Gravity Accelerated Descent & Second Half Rotation (180° -> 360°)
          const u = (t - 0.55) / 0.33; // 0 -> 1
          worldJumpY = -95 * (1 - u * u); // accelerating downward under gravity
          somersaultRotation = Math.PI + (u * Math.PI); // completing 360° flip
          squashY = 1.05 + (u * 0.10);
          squashX = 0.95 - (u * 0.08);
          hipL = -0.2 + u * 0.4; kneeL = 0.2 + u * 0.3;
          hipR = -0.2 + u * 0.4; kneeR = 0.2 + u * 0.3;
          thrusterL = (Math.random() > 0.3); thrusterR = (Math.random() > 0.3);
          upperL = -0.4 + u * 0.7; elbowL = -0.4 - u * 0.2;
          upperR = -0.4 + u * 0.7; elbowR = -0.4 - u * 0.2;
          customKnifeAngle = Math.PI + (u * Math.PI);
        } else {
          // Phase 5: Ground touchdown cushion & springback
          const u = (t - 0.88) / 0.12; // 0 -> 1
          worldJumpY = Math.sin(u * Math.PI) * 5.0; // slight cushion dip
          somersaultRotation = 0; // cleanly upright on landing
          squashY = 1.0 - Math.sin(u * Math.PI) * 0.22;
          squashX = 1.0 + Math.sin(u * Math.PI) * 0.18;
          hipL = Math.sin(u * Math.PI) * 0.35; kneeL = Math.sin(u * Math.PI) * 0.70;
          hipR = Math.sin(u * Math.PI) * 0.35; kneeR = Math.sin(u * Math.PI) * 0.70;
          upperL = 0.6; elbowL = -0.8;
          upperR = 0.55; elbowR = -0.85;
          customKnifeAngle = 0.4;
        }
      }

      // VICTORY CELEBRATION
      else if (this.state === 'victory') {
        const t = Math.min(1.0, this.victoryTimer / this.victoryMax);
        if (t < 0.35) {
          bobY = Math.sin(this.animTimer * 3) * 2;
          upperR = 0.38; elbowR = -0.82;
          customKnifeAngle = this.twirlAngle;
          upperL = 0.4; elbowL = -0.6;
        } else if (t < 0.70) {
          bobY = -Math.abs(Math.sin(this.animTimer * 2.5)) * 5;
          upperR = -2.1; elbowR = 0.05; customKnifeAngle = 0;
          upperL = -1.9; elbowL = 0.15;
        } else {
          const hop = ((t - 0.70) / 0.30) * Math.PI * 4;
          bobY = -Math.abs(Math.sin(hop)) * 11;
          leanAngle = Math.sin(hop) * 0.1;
          hipL = 0.1; kneeL = 0.2;
          hipR = -0.1; kneeR = 0.2;
          upperR = -1.9 + Math.sin(hop) * 0.15; elbowR = 0.1;
          upperL = -1.8 + Math.sin(hop) * 0.15; elbowL = 0.15;
        }
      }

      // DYNAMIC MARTIAL SWORD COMBAT (HIGH-LOW, DIAGONAL & CYCLONE STRIKES)
      else if (this.state === 'slash') {
        const st = this.slashTimer / this.slashMax;

        if (this.slashPhase === 1) {
          // Phase 1: High-to-Low Diagonal Cleave (Cross Slash)
          // Wind up high overhead, then slice violently downward diagonally across the torso past the hip
          bobY = Math.sin(st * Math.PI) * 3.0;
          leanAngle = 0.28 * Math.sin(st * Math.PI);
          hipL = 0.22; kneeL = 0.35;
          hipR = -0.22; kneeR = 0.15;
          thrusterL = true;
          upperR = -1.6 + (st * 2.8); // sweeps from -1.6 (high overhead) to +1.2 (low follow-through)
          elbowR = -0.3 + Math.sin(st * Math.PI) * 0.5;
          customKnifeAngle = -0.3 + (st * 1.5);
          upperL = 0.85; elbowL = -1.25; // off-hand shield braced defensively
        } else if (this.slashPhase === 2) {
          // Phase 2: Rising Uppercut / Reverse Cleave (Low-to-High)
          // Crouch low behind hip and drive blade explosively upward into the sky
          bobY = -Math.sin(st * Math.PI) * 4.5;
          leanAngle = -0.15 + (st * 0.35);
          hipL = -0.20 + (st * 0.35); kneeL = 0.40;
          hipR = 0.25 - (st * 0.35); kneeR = 0.30;
          thrusterR = true;
          upperR = 1.3 - (st * 3.2); // sweeps from +1.3 (low behind hip) to -1.9 (high skyward)
          elbowR = -0.4 - Math.sin(st * Math.PI) * 0.3;
          customKnifeAngle = -0.6 + (st * 1.8);
          upperL = 0.40; elbowL = -0.8; // shield points at target
        } else if (this.slashPhase === 3) {
          // Phase 3: 360° Whirling Cyclone / Blade Flurry
          // Full circular spin sweeping high, low, left, and right
          const ang = st * Math.PI * 2;
          bobY = -Math.sin(st * Math.PI) * 5.0;
          leanAngle = Math.sin(ang) * 0.25;
          hipL = Math.sin(ang) * 0.45; kneeL = 0.25;
          hipR = -Math.sin(ang) * 0.45; kneeR = 0.25;
          thrusterL = true; thrusterR = true;
          upperR = -0.2 + Math.sin(ang) * 1.7;
          elbowR = -0.5 + Math.cos(ang) * 0.4;
          customKnifeAngle = ang * 2.0;
          upperL = -0.2 - Math.sin(ang) * 1.3;
          elbowL = -0.6;
        } else if (this.slashPhase === 4) {
          // Phase 4: High-Velocity Rapid Thrust & Martial Flourish
          bobY = Math.sin(st * Math.PI * 2) * 2.5;
          leanAngle = 0.22 + Math.sin(st * Math.PI * 3) * 0.15;
          hipL = 0.30; kneeL = 0.40;
          hipR = -0.15; kneeR = 0.15;
          thrusterR = (Math.random() > 0.4);
          upperR = 0.10 + Math.sin(st * Math.PI * 4) * 0.9;
          elbowR = -0.25 - Math.cos(st * Math.PI * 4) * 0.4;
          customKnifeAngle = 0.8 + Math.sin(st * Math.PI * 4) * 0.6;
          upperL = 0.70; elbowL = -1.1; // shield held ready
        }
      }

      // BONK REACTION
      else if (this.state === 'bonk') {
        leanAngle = -0.65;
        bobY = -10;
        hipL = 0.8; kneeL = 0.4;
        hipR = 0.6; kneeR = 0.4;
        upperR = 0.8; elbowR = 0.2;
        upperL = 0.8; elbowL = 0.2;
      }

      // DIZZY REACTION
      else if (this.state === 'dizzy') {
        bobY = Math.sin(this.animTimer * 2) * 3.5;
        leanAngle = Math.sin(this.animTimer * 1.8) * 0.22;
        hipL = 0.15; kneeL = 0.1;
        hipR = -0.15; kneeR = 0.1;
        upperL = 0.4 + Math.sin(this.animTimer * 2) * 0.25;
        elbowL = -0.5;
        upperR = 0.35 + Math.cos(this.animTimer * 2) * 0.15;
        elbowR = -0.7;
        customKnifeAngle = 0.35;
      }

      // THINKING STATE (Unarmed, hand on chin, floating ?)
      else if (this.state === 'thinking') {
        bobY = Math.sin(this.animTimer * 1.5) * 2.0;
        hipL = 0.08; kneeL = 0.05;
        hipR = -0.08; kneeR = 0.05;
        upperL = 0.65; elbowL = -1.2;
        upperR = -1.35; elbowR = 2.1;
        customKnifeAngle = 0;
      }

      // WRITING STATE (Rapid laser stylus scribbling, unarmed)
      else if (this.state === 'writing') {
        bobY = Math.sin(this.animTimer * 8.0) * 1.6;
        leanAngle = 0.14;
        hipL = 0.12; kneeL = 0.1;
        hipR = -0.12; kneeR = 0.1;
        upperL = 0.55; elbowL = -1.25;
        const scrib = Math.sin(this.animTimer * 32.0);
        upperR = 0.35 + scrib * 0.18;
        elbowR = -1.1 + scrib * 0.22;
        customKnifeAngle = 0;
      }

      // DOCKED & SECTION WAITING (Active gentle floating, breathing chest expansion, zero-g limb drifting, unarmed)
      else if (this.state === 'waiting') {
        const floatCycle = this.animTimer * 1.6;
        bobY = Math.sin(floatCycle) * 5.0;
        squashY = 1.0 + Math.sin(floatCycle * 1.2) * 0.07;
        squashX = 1.0 - Math.sin(floatCycle * 1.2) * 0.04;
        leanAngle = Math.sin(floatCycle * 0.7) * 0.06;
        hipL = 0.20 + Math.sin(floatCycle) * 0.12;
        kneeL = 0.35 + Math.cos(floatCycle) * 0.14;
        hipR = -0.15 + Math.sin(floatCycle + 1.2) * 0.12;
        kneeR = 0.30 + Math.cos(floatCycle + 1.2) * 0.14;
        upperL = 0.52 + Math.sin(floatCycle * 1.1) * 0.16;
        elbowL = -0.85 + Math.cos(floatCycle * 1.1) * 0.12;
        upperR = 0.46 + Math.sin(floatCycle * 1.1 + 1.5) * 0.16;
        elbowR = -0.85 + Math.cos(floatCycle * 1.1 + 1.5) * 0.12;
        customKnifeAngle = 0;
      }

      // SUPERSONIC CYBER DASH POSTURE
      else if (this.state === 'cyber_dash') {
        bobY = 0;
        leanAngle = this.facing * 0.48;
        hipL = -0.3; kneeL = 0.4;
        hipR = 0.4; kneeR = 0.5;
        thrusterL = true; thrusterR = true;
        upperL = 0.85; elbowL = -0.25;
        upperR = 0.85; elbowR = -0.25;
        customKnifeAngle = 0.2;
      }

      // World Translation with Vertical Jump Motion (strictly vertical leap without orbital skew!)
      c.translate(this.x, this.y + worldJumpY);

      // Apply scale, flip and rotation around Charlie's center of gravity
      c.scale(this.facing * this.scale * squashX, this.scale * squashY);
      c.rotate(leanAngle + somersaultRotation);

      // 1. Draw Legs
      this.drawLeg(c, -7, 10 + bobY, hipL, kneeL, thrusterL);
      this.drawLeg(c, 7, 10 + bobY, hipR, kneeR, thrusterR);

      // 2. Draw Torso
      c.save();
      c.translate(0, bobY);
      c.fillStyle = '#070d1a';
      c.strokeStyle = '#00f2fe';
      c.lineWidth = 2.0;
      c.beginPath();
      c.roundRect(-12, -5, 24, 18, 5);
      c.fill();
      c.stroke();

      c.shadowColor = '#00f2fe';
      c.shadowBlur = 12 * this.bladeGlowIntensity;
      c.fillStyle = '#00f2fe';
      c.beginPath();
      c.arc(0, 4, 3.8, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(0, 4, 1.8, 0, Math.PI * 2);
      c.fill();
      c.restore();

      // 3. Draw Head & Visor
      c.save();
      c.translate(0, -19 + bobY);

      let antennaBend = (this.state === 'run' ? -0.4 : 0) + (this.state === 'sad' ? -1.2 : 0);
      c.save();
      c.translate(0, -15);
      c.rotate(antennaBend);
      c.strokeStyle = '#38bdf8';
      c.lineWidth = 1.8;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(0, -9);
      c.stroke();

      c.shadowColor = '#00f2fe';
      c.shadowBlur = 10 * this.bladeGlowIntensity;
      c.fillStyle = this.state === 'bonk' ? '#f59e0b' : '#00f2fe';
      c.beginPath();
      c.arc(0, -11, 3.0, 0, Math.PI * 2);
      c.fill();
      c.restore();

      c.fillStyle = '#090f1f';
      c.strokeStyle = '#00f2fe';
      c.lineWidth = 2.2;
      c.shadowColor = 'rgba(0, 242, 254, 0.4)';
      c.shadowBlur = 8;
      c.beginPath();
      c.roundRect(-16, -16, 32, 23, 7);
      c.fill();
      c.stroke();

      c.fillStyle = '#00f2fe';
      c.beginPath();
      c.arc(-16.5, -4, 2.6, 0, Math.PI * 2);
      c.arc(16.5, -4, 2.6, 0, Math.PI * 2);
      c.fill();

      c.shadowBlur = 0;
      c.fillStyle = '#02060f';
      c.strokeStyle = 'rgba(0, 242, 254, 0.35)';
      c.lineWidth = 1.1;
      c.beginPath();
      c.roundRect(-12, -12, 24, 15, 4);
      c.fill();
      c.stroke();

      this.drawFace(c);

      if (this.state === 'sad' || this.state === 'dizzy') {
        c.save();
        c.translate(-7, -10);
        c.rotate(0.3);
        c.fillStyle = '#f59e0b';
        c.fillRect(-3, -2, 6, 4);
        c.strokeStyle = '#fff';
        c.lineWidth = 0.8;
        c.strokeRect(-3, -2, 6, 4);
        c.restore();
      }
      c.restore();

      // Hand Equipment Modes (Unarmed sheathed during writing, thinking, waiting)
      let leftHandMode = 'shield';
      let rightHandMode = 'knife';

      if (this.state === 'writing') {
        leftHandMode = 'bare';
        rightHandMode = 'stylus';
      } else if (this.state === 'thinking' || this.state === 'waiting') {
        leftHandMode = 'bare';
        rightHandMode = 'bare';
      } else if (this.state === 'cyber_dash') {
        if (this.dashType === 'to_cursor') {
          leftHandMode = 'shield';
          rightHandMode = 'knife';
        } else {
          leftHandMode = 'bare';
          rightHandMode = 'bare';
        }
      }

      // 4. Draw Left Arm
      this.drawArm(c, -2, 0 + bobY, upperL, elbowL, leftHandMode, false, 0);

      // 5. Draw Right Arm
      this.drawArm(c, 10, -2 + bobY, upperR, elbowR, rightHandMode, true, customKnifeAngle);

      // 6. Draw Dizzy Stars if Stunned
      if (this.state === 'dizzy') {
        c.save();
        c.translate(0, -36 + bobY);
        for (let s = 0; s < 3; s++) {
          const starAngle = this.dizzyAngle + (s * (Math.PI * 2 / 3));
          const starX = Math.cos(starAngle) * 18;
          const starY = Math.sin(starAngle) * 6;
          c.fillStyle = '#f59e0b';
          c.shadowColor = '#f59e0b';
          c.shadowBlur = 8;
          c.font = '9px sans-serif';
          c.fillText('★', starX - 4, starY + 3);
        }
        c.restore();
      }

      // 7. Draw Holographic Idea Gear if Thinking
      if (this.state === 'thinking') {
        c.save();
        c.translate(0, -38 + bobY);
        c.rotate(this.animTimer * 1.5);
        c.strokeStyle = '#00f2fe';
        c.shadowColor = '#00f2fe';
        c.shadowBlur = 10 * this.bladeGlowIntensity;
        c.lineWidth = 1.6;
        c.beginPath();
        c.arc(0, 0, 7, 0, Math.PI * 2);
        c.stroke();
        for (let g = 0; g < 6; g++) {
          const ang = (g * Math.PI) / 3;
          c.beginPath();
          c.moveTo(Math.cos(ang) * 7, Math.sin(ang) * 7);
          c.lineTo(Math.cos(ang) * 10, Math.sin(ang) * 10);
          c.stroke();
        }
        c.fillStyle = '#f59e0b';
        c.beginPath();
        c.arc(0, 0, 2.4, 0, Math.PI * 2);
        c.fill();
        c.restore();

        c.save();
        c.translate(13, -37 + bobY + Math.sin(this.animTimer * 2) * 2.5);
        c.fillStyle = '#f59e0b';
        c.shadowColor = '#f59e0b';
        c.shadowBlur = 8;
        c.font = 'bold 11px monospace';
        c.fillText('?', 0, 0);
        c.restore();
      }

      // 8. Draw Holographic Datapad if Writing
      if (this.state === 'writing') {
        c.save();
        c.translate(8, -4 + bobY);
        c.shadowColor = '#00f2fe';
        c.shadowBlur = 12 * this.bladeGlowIntensity;
        c.fillStyle = 'rgba(0, 242, 254, 0.2)';
        c.strokeStyle = '#00f2fe';
        c.lineWidth = 1.5;
        c.beginPath();
        c.roundRect(-2, -9, 16, 19, 3);
        c.fill();
        c.stroke();

        c.strokeStyle = '#38bdf8';
        c.lineWidth = 1.4;
        for (let l = 0; l < 4; l++) {
          const lineY = -5 + l * 4;
          const lineWidth = 5 + ((l * 3 + Math.floor(this.animTimer * 5)) % 7);
          c.beginPath();
          c.moveTo(1, lineY);
          c.lineTo(1 + lineWidth, lineY);
          c.stroke();
        }

        const stylusContactX = 3 + Math.sin(this.animTimer * 16) * 4;
        const stylusContactY = -5 + ((Math.floor(this.animTimer * 3) % 4) * 4);
        c.fillStyle = '#ffffff';
        c.shadowColor = '#00f2fe';
        c.shadowBlur = 8;
        c.beginPath();
        c.arc(stylusContactX, stylusContactY, 1.5, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }

      // 9. Draw Chatbot Aura & Drifting 'z z Z' if Waiting
      if (this.state === 'waiting') {
        c.save();
        c.translate(0, bobY);
        c.strokeStyle = 'rgba(0, 242, 254, 0.3)';
        c.shadowColor = '#00f2fe';
        c.shadowBlur = 8 * this.bladeGlowIntensity;
        c.lineWidth = 1.2;
        c.setLineDash([4, 4]);
        c.beginPath();
        c.arc(0, -4, 27, 0, Math.PI * 2);
        c.stroke();
        c.setLineDash([]);

        c.fillStyle = '#38bdf8';
        c.shadowColor = '#00f2fe';
        c.shadowBlur = 6;
        const zPhase = (this.animTimer * 0.8) % 3;
        for (let z = 0; z < 3; z++) {
          const zAge = (zPhase + z) % 3;
          const zY = -28 - (zAge * 8);
          const zX = 13 + Math.sin(zAge * 2) * 5;
          const zAlpha = 1.0 - (zAge / 3);
          c.globalAlpha = Math.max(0, zAlpha);
          c.font = `${7 + z * 2}px monospace`;
          c.fillText('z', zX, zY);
        }
        c.restore();
      }

      c.restore();

      // Tactical Holo-Shield Bubble (when actively deployed or deflecting)
      if (this.isShielded || (this.isSpontaneousAction && (this.state === 'bonk' || this.state === 'dizzy'))) {
        c.save();
        const shieldPulse = Math.sin(this.animTimer * 6.0) * 2.5;
        const shieldCenterX = this.x;
        const shieldCenterY = this.y - 4 * this.scale;
        const radiusX = 38 * this.scale + shieldPulse;
        const radiusY = 48 * this.scale + shieldPulse; // increased height to fully cover Charlie from antenna to boots!

        // 1. Glowing translucent plasma field
        const shieldGrad = c.createRadialGradient(shieldCenterX, shieldCenterY, 8, shieldCenterX, shieldCenterY, radiusY);
        shieldGrad.addColorStop(0, 'rgba(0, 242, 254, 0.05)');
        shieldGrad.addColorStop(0.65, 'rgba(0, 242, 254, 0.22)');
        shieldGrad.addColorStop(0.92, 'rgba(56, 189, 248, 0.48)');
        shieldGrad.addColorStop(1, 'rgba(0, 242, 254, 0.88)');
        c.strokeStyle = '#00f2fe';
        c.lineWidth = 2.0;
        c.shadowColor = '#00f2fe';
        c.shadowBlur = 18 * this.bladeGlowIntensity;
        c.fillStyle = shieldGrad;
        c.beginPath();
        c.ellipse(shieldCenterX, shieldCenterY, radiusX, radiusY, 0, 0, Math.PI * 2);
        c.fill();
        c.stroke();

        // 2. Rotating orbital dashed lattice ring
        c.save();
        c.translate(shieldCenterX, shieldCenterY);
        c.rotate(this.animTimer * 1.8);
        c.strokeStyle = 'rgba(255, 255, 255, 0.70)';
        c.lineWidth = 1.2;
        c.setLineDash([6, 5]);
        c.beginPath();
        c.ellipse(0, 0, radiusX + 3, radiusY + 3, 0, 0, Math.PI * 2);
        c.stroke();
        c.restore();

        // 3. Counter-rotating inner energy lattice
        c.save();
        c.translate(shieldCenterX, shieldCenterY);
        c.rotate(-this.animTimer * 1.2);
        c.strokeStyle = 'rgba(0, 242, 254, 0.50)';
        c.lineWidth = 1.0;
        c.setLineDash([4, 6]);
        c.beginPath();
        c.ellipse(0, 0, radiusX * 0.72, radiusY * 0.72, 0, 0, Math.PI * 2);
        c.stroke();
        c.restore();

        c.restore();
      }

      // Floating Emote Speech Bubble
      if (this.emoteTimer > 0 && this.emoteText) {
        c.save();
        c.translate(this.x, this.y - 44 * this.scale);
        const emoteAlpha = Math.min(1.0, this.emoteTimer / 15);
        c.globalAlpha = emoteAlpha;
        c.font = 'bold 11px "JetBrains Mono", monospace';
        const textWidth = c.measureText(this.emoteText).width;
        const padX = 8;
        const boxW = textWidth + padX * 2;
        const boxH = 20;

        // Glassmorphic Speech Pill
        c.fillStyle = 'rgba(6, 11, 24, 0.92)';
        c.strokeStyle = '#00f2fe';
        c.lineWidth = 1.2;
        c.shadowColor = '#00f2fe';
        c.shadowBlur = 8;
        c.beginPath();
        c.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 6);
        c.fill();
        c.stroke();

        // Speech pointer downward
        c.fillStyle = 'rgba(6, 11, 24, 0.92)';
        c.beginPath();
        c.moveTo(-4, boxH / 2);
        c.lineTo(0, boxH / 2 + 5);
        c.lineTo(4, boxH / 2);
        c.fill();
        c.stroke();

        // Text
        c.fillStyle = '#00f2fe';
        c.shadowBlur = 0;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(this.emoteText, 0, 0);
        c.restore();
      }
    }

    drawLeg(c, hipX, hipY, hipAngle, kneeAngle, isThrusterActive) {
      c.save();
      c.translate(hipX, hipY);
      c.rotate(hipAngle);

      c.strokeStyle = '#38bdf8';
      c.lineWidth = 2.4;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(0, 7);
      c.stroke();

      c.fillStyle = '#00f2fe';
      c.beginPath();
      c.arc(0, 7, 1.8, 0, Math.PI * 2);
      c.fill();

      c.save();
      c.translate(0, 7);
      c.rotate(kneeAngle);

      c.strokeStyle = '#0284c7';
      c.lineWidth = 2.2;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(0, 7);
      c.stroke();

      c.fillStyle = '#070d1a';
      c.strokeStyle = '#00f2fe';
      c.lineWidth = 1.6;
      c.beginPath();
      c.roundRect(-4, 6, 9, 5, 2);
      c.fill();
      c.stroke();

      if (isThrusterActive) {
        c.save();
        c.shadowColor = '#00f2fe';
        c.shadowBlur = 10 * this.bladeGlowIntensity;
        c.fillStyle = '#00f2fe';
        c.beginPath();
        c.moveTo(-3, 11);
        c.lineTo(3, 11);
        c.lineTo(0, 17 + Math.random() * 5);
        c.closePath();
        c.fill();

        c.fillStyle = '#ffffff';
        c.beginPath();
        c.moveTo(-1.5, 11);
        c.lineTo(1.5, 11);
        c.lineTo(0, 14 + Math.random() * 3);
        c.closePath();
        c.fill();
        c.restore();
      }

      c.restore();
      c.restore();
    }

    drawArm(c, shoulderX, shoulderY, upperAngle, elbowAngle, handMode = 'bare', isRightArm = false, customKnifeAngle = 0) {
      c.save();
      c.translate(shoulderX, shoulderY);

      c.fillStyle = '#070d1a';
      c.strokeStyle = '#00f2fe';
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(0, 0, 3.2, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      c.rotate(upperAngle);

      c.strokeStyle = '#38bdf8';
      c.lineWidth = 2.8;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(6, 0);
      c.stroke();

      c.fillStyle = '#00f2fe';
      c.beginPath();
      c.arc(6, 0, 1.8, 0, Math.PI * 2);
      c.fill();

      c.save();
      c.translate(6, 0);
      c.rotate(elbowAngle);

      c.strokeStyle = '#0284c7';
      c.lineWidth = 2.6;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(6.5, 0);
      c.stroke();

      c.save();
      c.translate(6.5, 0);

      if (handMode === 'knife' || handMode === true) {
        c.rotate(customKnifeAngle);

        c.fillStyle = '#0a101f';
        c.strokeStyle = '#475569';
        c.lineWidth = 1.0;
        c.fillRect(-3, -2, 6, 4);

        c.fillStyle = '#00f2fe';
        c.beginPath();
        c.arc(-3, 0, 1.3, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = '#091124';
        c.strokeStyle = '#00f2fe';
        c.lineWidth = 1.3;
        c.beginPath();
        c.roundRect(-2, -3, 5, 6, 2);
        c.fill();
        c.stroke();

        c.fillStyle = '#00f2fe';
        c.beginPath();
        c.arc(0.5, 0, 1.1, 0, Math.PI * 2);
        c.fill();

        c.strokeStyle = '#00f2fe';
        c.lineWidth = 1.4;
        c.beginPath();
        c.moveTo(3, -4);
        c.lineTo(3, 4);
        c.stroke();

        // Astra Plasma Dagger with 2.5x Glow
        c.shadowColor = '#00f2fe';
        c.shadowBlur = 14 * this.bladeGlowIntensity;
        c.fillStyle = '#00f2fe';
        c.beginPath();
        c.moveTo(3, -2.8);
        c.lineTo(18, -1);
        c.lineTo(24, 0);
        c.lineTo(18, 2);
        c.lineTo(3, 2.8);
        c.closePath();
        c.fill();

        c.fillStyle = '#ffffff';
        c.beginPath();
        c.moveTo(4, -1);
        c.lineTo(20, 0);
        c.lineTo(4, 1);
        c.closePath();
        c.fill();

      } else if (handMode === 'stylus') {
        c.rotate(customKnifeAngle);

        c.fillStyle = '#091124';
        c.strokeStyle = '#00f2fe';
        c.lineWidth = 1.3;
        c.beginPath();
        c.roundRect(-2, -3, 5, 6, 2);
        c.fill();
        c.stroke();

        c.fillStyle = '#00f2fe';
        c.beginPath();
        c.arc(0.5, 0, 1.1, 0, Math.PI * 2);
        c.fill();

        c.strokeStyle = '#cbd5e1';
        c.lineWidth = 1.6;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(1, 0);
        c.lineTo(9, 3.5);
        c.stroke();

        c.fillStyle = '#00f2fe';
        c.beginPath();
        c.arc(6, 2.3, 1.1, 0, Math.PI * 2);
        c.fill();

        c.strokeStyle = '#f59e0b';
        c.shadowColor = '#f59e0b';
        c.shadowBlur = 10 * this.bladeGlowIntensity;
        c.lineWidth = 2.0;
        c.beginPath();
        c.moveTo(7.5, 3.0);
        c.lineTo(11, 4.5);
        c.stroke();

        c.fillStyle = '#ffffff';
        c.beginPath();
        c.arc(11, 4.5, 1.2, 0, Math.PI * 2);
        c.fill();

      } else if (handMode === 'shield') {
        c.fillStyle = '#091124';
        c.strokeStyle = '#00f2fe';
        c.lineWidth = 1.3;
        c.beginPath();
        c.roundRect(-2, -3, 5, 6, 2);
        c.fill();
        c.stroke();

        c.fillStyle = '#00f2fe';
        c.beginPath();
        c.arc(0.5, 0, 1.2, 0, Math.PI * 2);
        c.fill();

        c.save();
        c.shadowColor = '#00f2fe';
        c.shadowBlur = 10 * this.bladeGlowIntensity;
        c.strokeStyle = 'rgba(0, 242, 254, 0.85)';
        c.lineWidth = 1.5;
        c.fillStyle = 'rgba(0, 242, 254, 0.2)';
        c.beginPath();
        c.arc(3.5, 0, 5, -Math.PI * 0.48, Math.PI * 0.48);
        c.fill();
        c.stroke();

        c.fillStyle = '#ffffff';
        c.beginPath();
        c.arc(2.5, 0, 1.2, 0, Math.PI * 2);
        c.fill();
        c.restore();

      } else {
        c.fillStyle = '#091124';
        c.strokeStyle = '#00f2fe';
        c.lineWidth = 1.3;
        c.beginPath();
        c.roundRect(-2, -3, 5, 6, 2);
        c.fill();
        c.stroke();

        c.fillStyle = '#00f2fe';
        c.beginPath();
        c.arc(0.5, 0, 1.2, 0, Math.PI * 2);
        c.fill();
      }

      c.restore();
      c.restore();
      c.restore();
    }

    drawFace(c) {
      c.save();
      c.shadowColor = '#00f2fe';
      c.shadowBlur = 8 * this.bladeGlowIntensity;
      c.fillStyle = '#00f2fe';
      c.strokeStyle = '#00f2fe';
      c.lineWidth = 1.8;

      if (this.face === 'happy') {
        // Natural periodic blinking: blinks for ~12 frames every 210 frames (~3.5 seconds)
        const isBlinking = (this.blinkTimer > 195);
        if (isBlinking) {
          // Closed happy blinking curves
          c.beginPath();
          c.moveTo(-7, -4); c.lineTo(-4, -6); c.lineTo(-1, -4);
          c.moveTo(1, -4); c.lineTo(4, -6); c.lineTo(7, -4);
          c.stroke();
        } else {
          // Open glowing cyber eyes with lively pupils & white specular shine
          const glanceX = Math.sin(this.animTimer * 0.8) * 0.8;
          c.fillStyle = '#00f2fe';
          c.shadowColor = '#00f2fe';
          c.shadowBlur = 8 * this.bladeGlowIntensity;
          c.beginPath();
          c.roundRect(-7 + glanceX, -7, 4.5, 6, 2);
          c.roundRect(2.5 + glanceX, -7, 4.5, 6, 2);
          c.fill();

          // White specular reflection gleam
          c.fillStyle = '#ffffff';
          c.shadowBlur = 4;
          c.beginPath();
          c.arc(-4 + glanceX, -5.5, 1.1, 0, Math.PI * 2);
          c.arc(5.5 + glanceX, -5.5, 1.1, 0, Math.PI * 2);
          c.fill();
        }

        // Cheerful cyber smile
        c.strokeStyle = '#00f2fe';
        c.shadowColor = '#00f2fe';
        c.beginPath();
        c.arc(0, -1, 3.2, 0.2, Math.PI - 0.2);
        c.stroke();
      } else if (this.face === 'battle') {
        c.beginPath();
        c.moveTo(-7, -7); c.lineTo(-1, -4); c.lineTo(-7, -2);
        c.moveTo(7, -7); c.lineTo(1, -4); c.lineTo(7, -2);
        c.fill();
      } else if (this.face === 'sprint') {
        c.beginPath();
        c.moveTo(-6, -7); c.lineTo(-2, -4); c.lineTo(-6, -1);
        c.moveTo(6, -7); c.lineTo(2, -4); c.lineTo(6, -1);
        c.stroke();
      } else if (this.face === 'shocked') {
        c.strokeStyle = '#f59e0b';
        c.fillStyle = '#f59e0b';
        c.shadowColor = '#f59e0b';
        c.beginPath();
        c.arc(-4.5, -5, 3.2, 0, Math.PI * 2);
        c.arc(4.5, -5, 3.2, 0, Math.PI * 2);
        c.stroke();
        c.beginPath();
        c.arc(-4.5, -5, 1.1, 0, Math.PI * 2);
        c.arc(4.5, -5, 1.1, 0, Math.PI * 2);
        c.fill();
        c.beginPath();
        c.arc(0, 0, 2.2, 0, Math.PI * 2);
        c.stroke();
      } else if (this.face === 'dizzy') {
        c.strokeStyle = '#f59e0b';
        c.shadowColor = '#f59e0b';
        c.beginPath();
        c.arc(-4.5, -5, 2.8, 0, Math.PI * 1.8);
        c.stroke();
        c.beginPath();
        c.arc(4.5, -5, 2.8, 0, Math.PI * 1.8);
        c.stroke();
      } else if (this.face === 'sad') {
        c.beginPath();
        c.moveTo(-7, -7); c.lineTo(-1, -7);
        c.moveTo(-4, -7); c.lineTo(-4, -2);
        c.moveTo(1, -7); c.lineTo(7, -7);
        c.moveTo(4, -7); c.lineTo(4, -2);
        c.stroke();
        c.fillStyle = '#38bdf8';
        c.beginPath();
        c.arc(-4, 2, 1.4, 0, Math.PI * 2);
        c.arc(4, 2, 1.4, 0, Math.PI * 2);
        c.fill();
      } else if (this.face === 'victory') {
        c.fillStyle = '#f59e0b';
        c.shadowColor = '#f59e0b';
        c.font = '7px sans-serif';
        c.fillText('★', -7, -2);
        c.fillText('★', 1, -2);
        c.strokeStyle = '#f59e0b';
        c.beginPath();
        c.arc(0, 0, 3.5, 0.2, Math.PI - 0.2);
        c.stroke();
      } else if (this.face === 'wink') {
        c.beginPath();
        c.moveTo(-6, -7); c.lineTo(-2, -4); c.lineTo(-6, -1);
        c.stroke();
        c.beginPath();
        c.arc(4, -4, 2.2, 0, Math.PI * 2);
        c.fill();
        c.beginPath();
        c.arc(0, 0, 2.8, 0.2, Math.PI - 0.2);
        c.stroke();
      } else if (this.face === 'thinking') {
        c.fillStyle = '#00f2fe';
        c.shadowColor = '#00f2fe';
        c.shadowBlur = 8 * this.bladeGlowIntensity;
        for (let d = 0; d < 3; d++) {
          const dotX = -6 + d * 6;
          const dotY = -4 + Math.sin(this.animTimer * 3.5 + d * 0.8) * 2.2;
          c.beginPath();
          c.arc(dotX, dotY, 1.6, 0, Math.PI * 2);
          c.fill();
        }
      } else if (this.face === 'writing') {
        c.beginPath();
        c.moveTo(-6, -7); c.lineTo(-2, -4); c.lineTo(-6, -1);
        c.moveTo(6, -7); c.lineTo(2, -4); c.lineTo(6, -1);
        c.stroke();
        c.beginPath();
        c.moveTo(-3, 0); c.lineTo(3, 0);
        c.stroke();
        c.fillStyle = '#38bdf8';
        c.beginPath();
        c.arc(8, -6, 1.2, 0, Math.PI * 2);
        c.fill();
      } else if (this.face === 'waiting') {
        // Natural periodic blinking: blinks for ~12 frames every 210 frames (~3.5 seconds)
        const isBlinking = (this.blinkTimer > 195);
        if (isBlinking) {
          // Closed happy blinking curves
          c.beginPath();
          c.moveTo(-7, -4); c.lineTo(-4, -6); c.lineTo(-1, -4);
          c.moveTo(1, -4); c.lineTo(4, -6); c.lineTo(7, -4);
          c.stroke();
        } else {
          // Open glowing cyber eyes with lively pupils & white specular shine
          const glanceX = Math.sin(this.animTimer * 0.8) * 0.8;
          c.fillStyle = '#00f2fe';
          c.shadowColor = '#00f2fe';
          c.shadowBlur = 8 * this.bladeGlowIntensity;
          c.beginPath();
          c.roundRect(-7 + glanceX, -7, 4.5, 6, 2);
          c.roundRect(2.5 + glanceX, -7, 4.5, 6, 2);
          c.fill();

          // White specular reflection gleam
          c.fillStyle = '#ffffff';
          c.shadowBlur = 4;
          c.beginPath();
          c.arc(-4 + glanceX, -5.5, 1.1, 0, Math.PI * 2);
          c.arc(5.5 + glanceX, -5.5, 1.1, 0, Math.PI * 2);
          c.fill();
        }

        // Cute gentle cyber smile
        c.strokeStyle = '#00f2fe';
        c.lineWidth = 1.6;
        c.beginPath();
        c.arc(0, 0, 2.6, 0.2, Math.PI - 0.2);
        c.stroke();
      }

      c.restore();
    }
  }

  // ==========================================================================
  // 1. Dynamic Comet & Particle Engine
  // ==========================================================================
  class ParticleEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');

      // Foreground Mascot & Combat Canvas (z-index: 99990, always on top of all blocks and text)
      this.charlieCanvas = document.getElementById('charlieCanvas');
      this.charlieCtx = this.charlieCanvas ? this.charlieCanvas.getContext('2d') : null;
      this.isEnabled = false;

      // Multi-Shade Theme Palettes
      this.themes = {
        comet: {
          name: 'Comet Cascade',
          highlight: '#ffffff',
          midBright: '#00f2fe',
          midDark: '#3b82f6',
          deepDark: '#1d4ed8',
          orbGlow: 'rgba(0, 242, 254, 0.45)',
          spark: '#00f2fe'
        },
        solar: {
          name: 'Solar Flare',
          highlight: '#ffffff',
          midBright: '#fbbf24',
          midDark: '#f59e0b',
          deepDark: '#b45309',
          orbGlow: 'rgba(251, 191, 36, 0.45)',
          spark: '#f59e0b'
        },
        aurora: {
          name: 'Aurora Borealis',
          highlight: '#ffffff',
          midBright: '#34d399',
          midDark: '#10b981',
          deepDark: '#047857',
          orbGlow: 'rgba(52, 211, 153, 0.45)',
          spark: '#10b981'
        },
        diamond: {
          name: 'Hyper Diamond',
          highlight: '#ffffff',
          midBright: '#e2e8f0',
          midDark: '#94a3b8',
          deepDark: '#475569',
          orbGlow: 'rgba(255, 255, 255, 0.45)',
          spark: '#ffffff'
        }
      };

      this.currentThemeKey = 'comet';
      this.theme = this.themes.comet;

      // Mouse State
      this.mouse = {
        x: -1000,
        y: -1000,
        isHovered: false
      };

      // Flow Dynamics & Speed Scaling
      this.globalAngle = Math.PI / 2; // Default 90 deg vertical rain
      this.targetAngle = Math.PI / 2;
      this.speedMultiplier = 1.0;
      this.particles = [];
      this.shards = [];
      this.ripples = [];
      this.particleCount = 100;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.onShatter = null;
      this.lastGlitterySpawn = Date.now() - 6000; // First glitter comet ready after brief combat start

      // Cyber Charlie Companion & Combat Cursor (Scale: 1.0x, Blade Glow: 2.5x)
      this.charlie = new CyberCharlie();
      this.charlie.scale = 1.0;
      this.charlie.bladeGlowIntensity = 2.5;

      // Miniature Dock Cyber Charlie (for floating bottom-right launcher button)
      this.dockCanvas = document.getElementById('charlieDockCanvas');
      this.dockCtx = null;
      this.dockCharlie = null;
      if (this.dockCanvas) {
        this.dockCtx = this.dockCanvas.getContext('2d');
        this.dockCharlie = new CyberCharlie(36, 39, 0.55);
        this.dockCharlie.bladeGlowIntensity = 2.5;
        this.dockCharlie.state = 'waiting';
        this.dockCharlie.face = 'waiting';
        window.portfolioDockCharlie = this.dockCharlie;
      }

      this.init();
    }

    init() {
      if (this.canvas) this.canvas.classList.add('fx-disabled');
      if (window.innerWidth <= 768) {
        this.isEnabled = false;
      } else {
        this.resize();
      }

      window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
          if (this.isEnabled) this.toggleState(false);
        } else {
          this.resize();
        }
      });

      // Mouse Trackers
      window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.mouse.isHovered = true;

        if (this.charlie) {
          this.charlie.targetX = e.clientX;
          this.charlie.targetY = e.clientY;
        }

        // Dynamic directional tilt based on mouse X position (Left / Center / Right)
        const normX = (this.mouse.x / this.width) - 0.5;
        this.targetAngle = (Math.PI / 2) + (normX * 0.65);
      });

      window.addEventListener('mouseleave', () => {
        this.mouse.isHovered = false;
        this.mouse.x = -1000;
        this.mouse.y = -1000;
        this.targetAngle = Math.PI / 2;
      });

      // Prevent context menu during Game Mode to enable Right-Click tactical shield
      window.addEventListener('contextmenu', (e) => {
        if (this.isEnabled) {
          e.preventDefault();
        }
      });

      // Right-Click Hold & Space/Shift/S Holo-Shield deployment
      window.addEventListener('mousedown', (e) => {
        if (!this.isEnabled) return;
        if (e.button === 2 && this.charlie) {
          this.charlie.manualShieldActive = true;
          this.charlie.isShielded = true;
          this.charlie.setEmote('🛡️ HOLO-SHIELD ACTIVE', 60);
          this.charlie.addSparks(this.charlie.x, this.charlie.y, '#00f2fe', 16);
          try {
            if (typeof window.portfolioSoundEngine?.playLaserDeflect === 'function') {
              window.portfolioSoundEngine.playLaserDeflect();
            }
          } catch (err) {}
        }
      });

      window.addEventListener('mouseup', (e) => {
        if (e.button === 2 && this.charlie) {
          this.charlie.manualShieldActive = false;
          this.charlie.isShielded = false;
        }
      });

      window.addEventListener('keydown', (e) => {
        if (!this.isEnabled || !this.charlie) return;
        if (e.code === 'Space' || e.key === 'Shift' || e.key === 's' || e.key === 'S') {
          if (!this.charlie.manualShieldActive) {
            this.charlie.manualShieldActive = true;
            this.charlie.isShielded = true;
            this.charlie.setEmote('🛡️ HOLO-SHIELD ACTIVE', 60);
            this.charlie.addSparks(this.charlie.x, this.charlie.y, '#00f2fe', 16);
          }
        }
      });

      window.addEventListener('keyup', (e) => {
        if (!this.charlie) return;
        if (e.code === 'Space' || e.key === 'Shift' || e.key === 's' || e.key === 'S') {
          this.charlie.manualShieldActive = false;
          this.charlie.isShielded = false;
        }
      });

      // Supernova Click Burst & Comet Shatter
      window.addEventListener('click', (e) => {
        if (!this.isEnabled) return;
        if (this.charlie && this.charlie.state !== 'cyber_dash') {
          this.charlie.facing = e.clientX >= this.charlie.x ? 1 : -1;
          this.charlie.triggerRandomCombatAction();
        }
        this.triggerShatterBurst(e.clientX, e.clientY, 20);

        let blastedCount = 0;
        this.particles.forEach((p, index) => {
          const dx = e.clientX - p.x;
          const dy = e.clientY - p.y;
          if (Math.hypot(dx, dy) < 95) {
            this.triggerShatterBurst(p.x, p.y, p.isSuperFast ? 14 : 8, p.isSuperFast);
            this.particles[index] = this.createParticle(false);
            blastedCount++;
          }
        });

        if (this.onShatter) {
          this.onShatter(e.clientX, e.clientY, Math.max(1, blastedCount));
        }
      });

      // Populate Initial Particles
      this.particles = [];
      for (let i = 0; i < this.particleCount; i++) {
        this.particles.push(this.createParticle(true));
      }

      this.animate();
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.ctx.scale(this.dpr, this.dpr);
      if (this.charlieCanvas) {
        this.charlieCanvas.width = this.width * this.dpr;
        this.charlieCanvas.height = this.height * this.dpr;
        if (this.charlieCtx) {
          this.charlieCtx.scale(this.dpr, this.dpr);
        }
      }
    }

    setTheme(themeKey) {
      if (this.themes[themeKey]) {
        this.currentThemeKey = themeKey;
        this.theme = this.themes[themeKey];
      }
    }

    setSpeedMultiplier(mult = 1.0) {
      this.speedMultiplier = mult;
    }

    toggleState(enable) {
      this.isEnabled = (typeof enable === 'boolean') ? enable : !this.isEnabled;
      if (this.isEnabled) {
        this.canvas.classList.remove('fx-disabled');
      } else {
        this.canvas.classList.add('fx-disabled');
      }
    }

    hasActiveGlitteryComet() {
      return this.particles && this.particles.some(p => p && p.isGlittery);
    }

    createParticle(initial = false) {
      const angleVariation = (Math.random() - 0.5) * 0.16;
      const angle = this.globalAngle + angleVariation;

      // Check if this particle should spawn as a rare, celestial Glittery Shimmer Comet!
      const now = Date.now();
      const timeSinceLastGlitter = now - (this.lastGlitterySpawn || 0);
      let isGlittery = false;

      // Only 1 glittery comet active at a time; guaranteed spawn every 15-20s or ~6% chance after 8s cooldown
      if (!initial && !this.hasActiveGlitteryComet()) {
        if (timeSinceLastGlitter > 15000 || (timeSinceLastGlitter > 8000 && Math.random() < 0.065)) {
          isGlittery = true;
          this.lastGlitterySpawn = now;
        }
      }

      if (isGlittery) {
        const glitterSpeed = 1.35 + Math.random() * 0.65; // Smooth majestic glide speed so Charlie/player can catch it
        const spawnX = Math.random() * (this.width + 400) - 200;
        const spawnY = -90 - Math.random() * 80;
        return {
          x: spawnX,
          y: spawnY,
          vx: Math.cos(angle) * glitterSpeed,
          vy: Math.sin(angle) * glitterSpeed,
          baseSpeed: glitterSpeed,
          angleOffset: angleVariation,
          isOrb: false,
          isSuperFast: false,
          isGlittery: true,
          glitterAngle: Math.random() * Math.PI * 2,
          radius: 4.8,
          length: 75,
          opacity: 1.0,
          baseOpacity: 1.0,
          shadeTier: 3,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.08
        };
      }

      // 68% Streak/Comet vs 32% Glowing Circular Orb
      const isOrb = Math.random() < 0.32;

      // 16% Chance of a quick Shooting Star/Meteor with a longer luminous streak
      const isSuperFast = Math.random() < 0.16;

      // Opacity: Random variation from 0.25 to 0.95 (light and dark layered depth)
      const opacity = 0.25 + Math.random() * 0.70;

      // Shade tone variation: 0 = deepDark, 1 = midDark, 2 = midBright, 3 = highlight
      const shadeTier = Math.floor(Math.random() * 4);

      // Smooth steady baseline speed with occasional quick shooting stars
      const normalSpeed = 1.3 + Math.random() * 2.0;
      const baseSpeed = isSuperFast ? (normalSpeed * 1.65) : normalSpeed;
      const radius = isOrb ? (1.5 + Math.random() * 3.6) : (isSuperFast ? (1.2 + Math.random() * 1.5) : (1.0 + Math.random() * 1.4));
      const length = isOrb ? 0 : ((28 + Math.random() * 55) * (isSuperFast ? 1.45 : 1.0));

      const spawnX = initial ? Math.random() * (this.width + 600) - 300 : Math.random() * (this.width + 800) - 400;
      const spawnY = initial ? Math.random() * this.height : -80 - Math.random() * 140;

      return {
        x: spawnX,
        y: spawnY,
        vx: Math.cos(angle) * baseSpeed,
        vy: Math.sin(angle) * baseSpeed,
        baseSpeed: baseSpeed,
        angleOffset: angleVariation,
        isOrb: isOrb,
        isSuperFast: isSuperFast,
        isGlittery: false,
        radius: radius,
        length: length,
        opacity: opacity,
        baseOpacity: opacity,
        shadeTier: shadeTier,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.03 + Math.random() * 0.05
      };
    }

    triggerShatterBurst(x, y, count = 8, isExtra = false, customColor = null) {
      const finalCount = isExtra ? 16 : count;
      for (let i = 0; i < finalCount; i++) {
        const pAngle = Math.random() * Math.PI * 2;
        const pSpeed = (1.6 + Math.random() * 4.2) * (isExtra ? 1.4 : 1.0);
        this.shards.push({
          x: x,
          y: y,
          vx: Math.cos(pAngle) * pSpeed,
          vy: Math.sin(pAngle) * pSpeed,
          radius: 1.0 + Math.random() * (isExtra ? 2.4 : 1.6),
          alpha: 1.0,
          decay: 0.022 + Math.random() * 0.028,
          color: customColor || null
        });
      }

      // Dual concentric shockwave rings
      this.ripples.push({
        x: x,
        y: y,
        radius: 2,
        maxRadius: isExtra ? 48 : 34,
        alpha: 1.0,
        speed: isExtra ? 2.4 : 1.8,
        lineWidth: isExtra ? 2.4 : 1.6,
        color: customColor || null
      });
      if (isExtra) {
        this.ripples.push({
          x: x,
          y: y,
          radius: 1,
          maxRadius: 26,
          alpha: 0.8,
          speed: 1.3,
          lineWidth: 1.2,
          color: customColor || null
        });
      }
    }

    triggerGlitterCatch(x, y) {
      if (this.charlie) {
        this.charlie.isShielded = true;
        this.charlie.shieldTimer = 330; // 5.5 seconds (at 60fps) of Holo-Shield power-up!
        this.charlie.setEmote('🛡️ GLITTER SHIELD! (5s)', 100);
        this.charlie.addSparks(this.charlie.x, this.charlie.y, '#ffd700', 16);
        this.charlie.addSparks(this.charlie.x, this.charlie.y, '#00f2fe', 16);
      }

      // 1. Extra dazzling golden & cyan prismatic stardust burst
      this.triggerShatterBurst(x, y, 22, true, '#ffd700');
      for (let s = 0; s < 14; s++) {
        const pAngle = Math.random() * Math.PI * 2;
        const pSpeed = 2.0 + Math.random() * 4.8;
        this.shards.push({
          x: x,
          y: y,
          vx: Math.cos(pAngle) * pSpeed,
          vy: Math.sin(pAngle) * pSpeed,
          radius: 2.0 + Math.random() * 2.5,
          alpha: 1.0,
          decay: 0.016 + Math.random() * 0.018,
          color: Math.random() > 0.4 ? '#ffd700' : '#00f2fe'
        });
      }

      // 2. Wide concentric glowing golden & cyan shockwave ripples
      this.ripples.push({
        x: x,
        y: y,
        radius: 6,
        maxRadius: 75,
        speed: 3.4,
        alpha: 1.0,
        lineWidth: 3.0,
        color: '#ffd700'
      });
      this.ripples.push({
        x: x,
        y: y,
        radius: 2,
        maxRadius: 50,
        speed: 2.4,
        alpha: 0.85,
        lineWidth: 2.0,
        color: '#00f2fe'
      });

      // 3. Generous score bonus (+50 points) for catching rare glittery comet
      if (this.onShatter) {
        this.onShatter(x, y, 5);
      }

      // 4. Sound cues: combo ding & laser deflect chime
      try {
        if (typeof window.portfolioSoundEngine?.playComboDing === 'function') {
          window.portfolioSoundEngine.playComboDing();
        }
        if (typeof window.portfolioSoundEngine?.playLaserDeflect === 'function') {
          window.portfolioSoundEngine.playLaserDeflect();
        }
      } catch (e) {}
    }

    update() {
      // 1. Cyber Charlie update runs unconditionally (handles dash, terminal anchoring, and cursor tracking)
      if (this.charlie) {
        this.charlie.update();
      }

      // Background cosmic comets, particles, shards & ripples only update when Game Mode is active
      if (!this.isEnabled) return;

      // Smoothly interpolate wind angle
      this.globalAngle += (this.targetAngle - this.globalAngle) * 0.05;

      // 1. Update Particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];

        // SHATTER IMPACT ON POINTER TOUCH
        if (this.mouse.isHovered) {
          const dx = this.mouse.x - p.x;
          const dy = this.mouse.y - p.y;
          const dist = Math.hypot(dx, dy);

          // Impact collision radius ~36px
          if (dist < 36) {
            if (p.isGlittery) {
              this.triggerGlitterCatch(p.x, p.y);
              this.particles[i] = this.createParticle(false);
              continue;
            }
            this.triggerShatterBurst(p.x, p.y, 6);
            if (this.onShatter) this.onShatter(p.x, p.y, 1);
            // Destroy particle upon hit and respawn at top
            this.particles[i] = this.createParticle(false);
            continue;
          }
        }

        // Apply gentle velocity
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;

        if (p.isGlittery) {
          p.glitterAngle = (p.glitterAngle || 0) + 0.09;
          // Drop micro stardust sparkles in its wake
          if (Math.random() < 0.28) {
            const normSpd = Math.hypot(p.vx, p.vy) || 1;
            this.shards.push({
              x: p.x - (p.vx / normSpd) * 14 + (Math.random() - 0.5) * 8,
              y: p.y - (p.vy / normSpd) * 14 + (Math.random() - 0.5) * 8,
              vx: (Math.random() - 0.5) * 0.9,
              vy: (Math.random() - 0.5) * 0.9,
              radius: 1.2 + Math.random() * 1.6,
              alpha: 0.95,
              decay: 0.032,
              color: Math.random() > 0.4 ? '#ffd700' : '#00f2fe'
            });
          }
        }

        // Smoothly adjust direction with global tilt
        const desiredAngle = this.globalAngle + p.angleOffset;
        const targetVx = Math.cos(desiredAngle) * p.baseSpeed;
        const targetVy = Math.sin(desiredAngle) * p.baseSpeed;

        p.vx += (targetVx - p.vx) * 0.035;
        p.vy += (targetVy - p.vy) * 0.035;

        // Organic opacity breathing
        p.opacity = Math.min(0.95, Math.max(0.20, p.baseOpacity + Math.sin(p.pulse) * 0.12));

        // Recycle off-screen
        if (p.y > this.height + 80 || p.x > this.width + 300 || p.x < -300) {
          this.particles[i] = this.createParticle(false);
        }
      }

      // 2. Update Shatter Shards
      for (let i = this.shards.length - 1; i >= 0; i--) {
        const s = this.shards[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.94;
        s.vy *= 0.94;
        s.alpha -= s.decay;

        if (s.alpha <= 0) {
          this.shards.splice(i, 1);
        }
      }

      // 3. Update Ripples
      for (let i = this.ripples.length - 1; i >= 0; i--) {
        const r = this.ripples[i];
        r.radius += r.speed;
        r.alpha -= 0.035;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          this.ripples.splice(i, 1);
        }
      }

      // 4. Combat Suite: Holo-Shield Deflection & Plasma Blade Combat
      if (this.charlie) {
        // A. Active Holo-Shield Bubble Deflection Field
        // NOTE: Auto-reflex proximity shield spam has been removed as requested!
        // Shield now triggers for 5.5s when Charlie or player catches the rare Glittery Comet (or manual hold).
        if (this.charlie.isShielded) {
          const deflectRadius = 65 * this.charlie.scale;
          for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            const dist = Math.hypot(p.x - this.charlie.x, p.y - this.charlie.y);
            if (dist < deflectRadius) {
              if (p.isGlittery) {
                // Catching glitter comet with shield refreshes duration
                this.triggerGlitterCatch(p.x, p.y);
                this.particles[i] = this.createParticle(false);
              } else {
                this.triggerShatterBurst(p.x, p.y, p.isSuperFast ? 18 : 14, true);
                this.particles[i] = this.createParticle(false);
                this.ripples.push({
                  x: p.x,
                  y: p.y,
                  radius: 6,
                  maxRadius: 48,
                  speed: 3.8,
                  alpha: 1.0,
                  lineWidth: 2.5,
                  color: '#00f2fe'
                });
                this.charlie.addSparks(p.x, p.y, '#00f2fe', 12);
                if (this.onShatter) {
                  this.onShatter(p.x, p.y, 2); // Double score for shield deflection!
                }
                try {
                  if (typeof window.portfolioSoundEngine?.playLaserDeflect === 'function') {
                    window.portfolioSoundEngine.playLaserDeflect();
                  }
                } catch (e) {}
              }
            }
          }
        }

        // B. Plasma Blade Combat Reach (High-Low Cleave, Uppercut, Cyclone & Thrust)
        const hasBladeEquipped = (this.charlie.state !== 'thinking' && this.charlie.state !== 'writing' && this.charlie.state !== 'waiting');
        if (hasBladeEquipped) {
          const sliceReach = 85 * this.charlie.scale;

          for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            const dist = Math.hypot(p.x - this.charlie.x, p.y - this.charlie.y);
            if (dist < sliceReach) {
              if (p.isGlittery) {
                // CAUGHT THE GLITTERY COMET! Holo-Shield power-up activated for few seconds!
                this.triggerGlitterCatch(p.x, p.y);
                this.particles[i] = this.createParticle(false);
              } else {
                this.triggerShatterBurst(p.x, p.y, p.isSuperFast ? 18 : 12, p.isSuperFast);
                this.particles[i] = this.createParticle(false);
                this.combatShatters = (this.combatShatters || 0) + 1;
                if (this.onShatter) {
                  this.onShatter(p.x, p.y, 1);
                }
                this.charlie.triggerRandomCombatAction();
              }
            }
          }
        }
      }
    }

    draw() {
      // 1. Draw Cyber Charlie on FOREGROUND CANVAS unconditionally whenever deployed
      if (this.charlieCtx) {
        this.charlieCtx.clearRect(0, 0, this.width, this.height);
      }
      const shouldDrawCharlie = this.charlie && (
        this.isEnabled ||
        this.charlie.state === 'cyber_dash' ||
        this.charlie.state === 'escort' ||
        this.charlie.isEscorting ||
        this.charlie.sectionActive ||
        this.charlie.state === 'thinking' ||
        this.charlie.state === 'writing' ||
        this.charlie.state === 'victory' ||
        (this.charlie.state === 'waiting' && this.charlie.x > -200)
      );
      if (shouldDrawCharlie) {
        const cCtx = this.charlieCtx || this.ctx;
        this.charlie.drawAfterimages(cCtx);
        this.charlie.drawLightningArcs(cCtx);
        this.charlie.drawBladeTrails(cCtx);
        this.charlie.drawSparks(cCtx);
        this.charlie.draw(cCtx);
      }

      // Background cosmic comets, ripples, and particles ONLY draw when Game Mode is active
      if (!this.isEnabled) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        return;
      }
      this.ctx.clearRect(0, 0, this.width, this.height);

      // 1. Draw Shockwave Ripples with Neon Glow
      this.ripples.forEach(r => {
        this.ctx.beginPath();
        this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = r.color || this.theme.midBright;
        this.ctx.lineWidth = r.lineWidth || 1.4;
        this.ctx.globalAlpha = r.alpha;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = r.color || this.theme.highlight;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
      });

      // 2. Draw Particles (Streaks, Orbs & Rare Glittery Celestial Comets)
      this.particles.forEach(p => {
        this.ctx.globalAlpha = p.opacity;

        if (p.isGlittery) {
          // GLITTERY SHIMMER COMET (Special rare celestial comet with iridescent gold, cyan & diamond sparkles)
          const speed = Math.hypot(p.vx, p.vy) || 1;
          const normVx = p.vx / speed;
          const normVy = p.vy / speed;
          const tailX = p.x - normVx * p.length;
          const tailY = p.y - normVy * p.length;

          // 1. Iridescent Prismatic Tail Gradient (White-Gold -> Amber -> Neon Cyan -> Magenta -> Transparent)
          const tailGrad = this.ctx.createLinearGradient(p.x, p.y, tailX, tailY);
          tailGrad.addColorStop(0, '#fffbeb');
          tailGrad.addColorStop(0.2, '#ffd700');
          tailGrad.addColorStop(0.55, '#00f2fe');
          tailGrad.addColorStop(0.85, '#ec4899');
          tailGrad.addColorStop(1, 'transparent');

          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(tailX, tailY);
          this.ctx.strokeStyle = tailGrad;
          this.ctx.lineWidth = 3.8;
          this.ctx.lineCap = 'round';
          this.ctx.shadowColor = '#ffd700';
          this.ctx.shadowBlur = 14;
          this.ctx.stroke();
          this.ctx.shadowBlur = 0;

          // 2. Glowing Golden Shimmer Aura
          const auraPulse = Math.sin(p.pulse * 2.5) * 3;
          const auraGrad = this.ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, 16 + auraPulse);
          auraGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          auraGrad.addColorStop(0.25, 'rgba(255, 215, 0, 0.85)');
          auraGrad.addColorStop(0.65, 'rgba(0, 242, 254, 0.45)');
          auraGrad.addColorStop(1, 'transparent');

          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, 16 + auraPulse, 0, Math.PI * 2);
          this.ctx.fillStyle = auraGrad;
          this.ctx.fill();

          // 3. Solid Brilliant Core
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
          this.ctx.fillStyle = '#ffffff';
          this.ctx.shadowColor = '#00f2fe';
          this.ctx.shadowBlur = 8;
          this.ctx.fill();
          this.ctx.shadowBlur = 0;

          // 4. Rotating Diamond Stardust Sparkles (✦)
          p.glitterAngle = (p.glitterAngle || 0) + 0.08;
          const sparkleOrbit = 12 + Math.sin(p.pulse * 3) * 3;
          for (let s = 0; s < 3; s++) {
            const a = p.glitterAngle + (s * Math.PI * 2 / 3);
            const sx = p.x + Math.cos(a) * sparkleOrbit;
            const sy = p.y + Math.sin(a) * sparkleOrbit;
            const sColor = s === 0 ? '#ffd700' : (s === 1 ? '#00f2fe' : '#ffffff');

            this.ctx.fillStyle = sColor;
            this.ctx.shadowColor = sColor;
            this.ctx.shadowBlur = 6;
            this.ctx.beginPath();
            this.ctx.moveTo(sx, sy - 4.5);
            this.ctx.lineTo(sx + 2.5, sy);
            this.ctx.lineTo(sx, sy + 4.5);
            this.ctx.lineTo(sx - 2.5, sy);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
          }
        } else if (p.isOrb) {
          // GLOWING CIRCULAR ORB
          const radGrad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.2);

          if (p.shadeTier >= 2) {
            radGrad.addColorStop(0, this.theme.highlight);
            radGrad.addColorStop(0.4, this.theme.midBright);
            radGrad.addColorStop(1, 'transparent');
          } else if (p.shadeTier === 1) {
            radGrad.addColorStop(0, this.theme.midBright);
            radGrad.addColorStop(0.6, this.theme.midDark);
            radGrad.addColorStop(1, 'transparent');
          } else {
            radGrad.addColorStop(0, this.theme.midDark);
            radGrad.addColorStop(0.7, this.theme.deepDark);
            radGrad.addColorStop(1, 'transparent');
          }

          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.radius * 2.0, 0, Math.PI * 2);
          this.ctx.fillStyle = radGrad;
          this.ctx.fill();

          // Solid bright core
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, Math.max(0.8, p.radius * 0.4), 0, Math.PI * 2);
          this.ctx.fillStyle = this.theme.highlight;
          this.ctx.fill();

        } else {
          // STREAMING RAIN STREAK / COMET
          const speed = Math.hypot(p.vx, p.vy);
          const normVx = p.vx / speed;
          const normVy = p.vy / speed;

          const tailX = p.x - normVx * p.length;
          const tailY = p.y - normVy * p.length;

          const linGrad = this.ctx.createLinearGradient(p.x, p.y, tailX, tailY);

          if (p.shadeTier >= 2) {
            linGrad.addColorStop(0, this.theme.highlight);
            linGrad.addColorStop(0.3, this.theme.midBright);
            linGrad.addColorStop(0.8, this.theme.midDark);
            linGrad.addColorStop(1, 'transparent');
          } else {
            linGrad.addColorStop(0, this.theme.midBright);
            linGrad.addColorStop(0.4, this.theme.midDark);
            linGrad.addColorStop(0.9, this.theme.deepDark);
            linGrad.addColorStop(1, 'transparent');
          }

          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(tailX, tailY);
          this.ctx.strokeStyle = linGrad;
          this.ctx.lineWidth = p.radius * 1.3;
          this.ctx.lineCap = 'round';
          this.ctx.stroke();

          // Subtle head glow
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.radius * 0.8, 0, Math.PI * 2);
          this.ctx.fillStyle = this.theme.highlight;
          this.ctx.fill();
        }
      });

      // 3. Draw Shatter Shards
      this.shards.forEach(s => {
        this.ctx.beginPath();
        this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = s.color || this.theme.spark;
        this.ctx.globalAlpha = s.alpha;
        this.ctx.shadowBlur = 6;
        this.ctx.shadowColor = s.color || this.theme.midBright;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      });

      this.ctx.globalAlpha = 1;
    }

    drawDockCharlie() {
      if (!this.dockCanvas) {
        this.dockCanvas = document.getElementById('charlieDockCanvas');
        if (this.dockCanvas) {
          this.dockCtx = this.dockCanvas.getContext('2d');
          this.dockCharlie = new CyberCharlie(36, 39, 0.55);
          this.dockCharlie.bladeGlowIntensity = 2.5;
          this.dockCharlie.state = 'waiting';
          this.dockCharlie.face = 'waiting';
          window.portfolioDockCharlie = this.dockCharlie;
        }
      }
      if (!this.dockCanvas || !this.dockCtx || !this.dockCharlie) return;

      // When Game Mode is active or Charlie is actively deployed outside the dock, suppress dock Charlie
      const isCharlieDeployed = this.isEnabled ||
        (this.charlie && (this.charlie.state === 'cyber_dash' || this.charlie.sectionActive || (this.charlie.state !== 'waiting' && this.charlie.x > -200)));

      if (isCharlieDeployed) {
        return;
      }

      // Ensure dock Charlie stays in lively waiting state
      if (this.dockCharlie.state !== 'waiting') {
        this.dockCharlie.state = 'waiting';
        this.dockCharlie.face = 'waiting';
      }

      this.dockCharlie.update();
      this.dockCtx.clearRect(0, 0, this.dockCanvas.width, this.dockCanvas.height);

      // Subtle ambient cyber energy aura in dock
      const pulseAlpha = 0.25 + Math.sin(this.dockCharlie.animTimer * 2.0) * 0.15;
      this.dockCtx.save();
      this.dockCtx.beginPath();
      this.dockCtx.arc(36, 36, 30, 0, Math.PI * 2);
      this.dockCtx.fillStyle = `rgba(0, 242, 254, ${pulseAlpha * 0.2})`;
      this.dockCtx.shadowColor = '#00f2fe';
      this.dockCtx.shadowBlur = 10;
      this.dockCtx.fill();
      this.dockCtx.restore();

      this.dockCharlie.draw(this.dockCtx);
    }

    animate() {
      this.update();
      this.draw();
      this.drawDockCharlie();
      requestAnimationFrame(() => this.animate());
    }
  }

  // ==========================================================================
  // 2. Interactive Pipeline Architecture Visualizer
  // ==========================================================================
  const FLOWS = {
    usd: {
      nodes: [
        { title: 'Asset Creation', sub: 'Modeling → Groom → LookDev → Rig → Assembly' },
        { title: 'Layout Setup', sub: 'Camera Optics & Scene Assembly' },
        { title: 'Animation Cache', sub: 'Deforming Geometry & Inheritances' },
        { title: 'CFX & FX Simulation', sub: 'Cloth, Hair & VDB Volumes' },
        { title: 'Lighting & Final Render', sub: 'Lookdev Binding & Master Deliverables', highlight: true }
      ],
      description: '<strong>OpenUSD Production Pipeline Architecture:</strong> Grounded in a modular two-tier USD specification (Asset Creation → Shot Pipeline SH0010). Unifies modular asset publishing (characters, props, vehicles, environments) with a non-destructive shot sublayer workflow across Layout, Animation, CFX Simulation, FX, and Lighting to generate unified, studio-scale renderable deliverables with zero geometry duplication.'
    },
    automation: {
      nodes: [
        { title: 'Event Trigger', sub: 'Slack / Webhook / Ingest Event' },
        { title: 'n8n Core Hub', sub: 'Logic & Validation Router', highlight: true },
        { title: 'Project Onboarding', sub: 'Auto-Provisioning & Folder Tree' },
        { title: 'Pattern Recognition', sub: 'Pattern Recognition for VFX plates' },
        { title: 'Ingest and Render', sub: 'Auto-Transcode & Farm Dispatch' },
        { title: 'ShotGrid Update', sub: 'Status, Versions & Metadata Sync' },
        { title: 'Production Notification', sub: 'Slack & Email Artist Briefing' }
      ],
      description: '<strong>Zero-Touch n8n Studio Automation Flow:</strong> Production-tested event-driven orchestrator managing end-to-end project onboarding, regex-based VFX plate validation, automated transcode/render farm dispatch, and bidirectional ShotGrid/Slack metadata publication.'
    },
    genai: {
      nodes: [
        { title: 'Script & Storyboards', sub: 'Scene Breakdown & Shot Lists' },
        { title: 'Prompt Studio & Router', sub: 'Veo / Kling / Higgsfield / Seedance', highlight: true },
        { title: 'Frame Consistency', sub: 'Latent Anchors & Identity Match' },
        { title: 'Editorial & Review', sub: 'Director Approval & Visual Diff' },
        { title: 'ACES Studio Conform', sub: 'Plate Match & Comp Delivery' }
      ],
      description: '<strong>Studio.AI (Scene Weaver) GenAI Production Platform:</strong> Enterprise orchestration engine for generative visual effects and cinematic video pipelines. Features prompt optimization across Google Veo, Kling AI, Higgsfield, and Seedance, multi-view character identity locking, editorial timeline conforming, and automated ShotGrid asset synchronization.'
    }
  };

  const archButtons = document.querySelectorAll('.arch-btn');
  const archCanvas = document.getElementById('archCanvas');
  const archDetails = document.getElementById('archDetails');

  function renderArchitectureFlow(flowKey) {
    const flow = FLOWS[flowKey];
    if (!flow || !archCanvas || !archDetails) return;

    let html = '<div class="arch-flow-diagram">';
    flow.nodes.forEach((node, index) => {
      html += `
        <div class="arch-node ${node.highlight ? 'highlight' : ''}">
          <div class="arch-node-title">${node.title}</div>
          <div class="arch-node-sub">${node.sub}</div>
        </div>
      `;
      if (index < flow.nodes.length - 1) {
        html += `<div class="arch-arrow">&rarr;</div>`;
      }
    });
    html += '</div>';

    archCanvas.innerHTML = html;
    archDetails.innerHTML = flow.description;
  }

  // ==========================================================================
  // 3. Cosmic Game Audio Engine (Zero-Latency Procedural Web Audio Synth)
  // ==========================================================================
  class CosmicSoundEngine {
    constructor() {
      this.ctx = null;
      this.isMuted = false;
      this.isPlayingBGM = false;
      this.bgmTimer = null;
      this.masterGain = null;
      this.bgmGain = null;
      this.sfxGain = null;
      this.bgmStep = 0;
      this.bgmNotes = [
        // A minor / Cyberpunk Pentatonic Cosmic Sequence
        220.00, 261.63, 329.63, 392.00, 440.00, 523.25, 659.25, 523.25,
        392.00, 329.63, 440.00, 523.25, 659.25, 783.99, 659.25, 440.00
      ];
    }

    init() {
      if (this.ctx) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.70, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(0.20, this.ctx.currentTime);
        this.bgmGain.connect(this.masterGain);
      } catch (e) {
        console.warn('Web Audio API not supported', e);
      }
    }

    ensureContext() {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    setMuted(muted) {
      this.isMuted = muted;
      if (this.masterGain && this.ctx) {
        const target = muted ? 0.0001 : 1.0;
        this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.04);
      }
    }

    toggleMute() {
      this.setMuted(!this.isMuted);
      return this.isMuted;
    }

    // 1. Mouse Comet Collision & Shatter Sound Effect (Crystal Star Burst Chime & Spatial Combo Chords)
    playHit(combo = 1) {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime;

      // Pentatonic Musical Scale (C5, D5, E5, G5, A5, C6, D6, E6)
      const pentatonicScales = [
        523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51
      ];
      const scaleIndex = Math.min(pentatonicScales.length - 1, (combo - 1) % pentatonicScales.length);
      const freq = pentatonicScales[scaleIndex];

      // Spatial Stereo Pan (alternates across left/right channels on combo streaks)
      const panVal = Math.max(-0.65, Math.min(0.65, ((combo % 6) - 2.5) * 0.26));
      let panner = null;
      if (typeof this.ctx.createStereoPanner === 'function') {
        panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(panVal, now);
      }

      // Primary Crystal Bell Tone (Pure Sine)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);
      osc1.frequency.exponentialRampToValueAtTime(freq * 0.98, now + 0.15);

      gain1.gain.setValueAtTime(0.38, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      // Shimmering High Harmonic (Glass Sparkle at 2.76x)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2.76, now);

      gain2.gain.setValueAtTime(0.18, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      // Soft lowpass filter to keep sound warm and melodic
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3800, now);

      osc1.connect(gain1);
      osc2.connect(gain2);
      gain1.connect(filter);
      gain2.connect(filter);

      // Combo >= 4: Add Sub-Octave Fundamental Bass Resonance
      if (combo >= 4) {
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(freq * 0.5, now);
        subGain.gain.setValueAtTime(0.25, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        subOsc.connect(subGain);
        subGain.connect(filter);
        subOsc.start(now);
        subOsc.stop(now + 0.25);
      }

      // Combo >= 8: Add 3rd Harmonic Power Chord Overdrive
      if (combo >= 8) {
        const chordOsc = this.ctx.createOscillator();
        const chordGain = this.ctx.createGain();
        chordOsc.type = 'triangle';
        chordOsc.frequency.setValueAtTime(freq * 1.5, now);
        chordGain.gain.setValueAtTime(0.20, now);
        chordGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        chordOsc.connect(chordGain);
        chordGain.connect(filter);
        chordOsc.start(now);
        chordOsc.stop(now + 0.20);
      }

      if (panner) {
        filter.connect(panner);
        panner.connect(this.sfxGain);
      } else {
        filter.connect(this.sfxGain);
      }

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.16);
      osc2.stop(now + 0.09);
    }

    // 2. Triumphant Level Up / Rank Advancement Fanfare
    playLevelUp() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major Triad Fanfare
      const noteDuration = 0.07;

      notes.forEach((freq, idx) => {
        const noteStart = now + (idx * noteDuration);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq * 1.4, noteStart);
        filter.Q.setValueAtTime(3.0, noteStart);

        const dur = (idx === notes.length - 1) ? 0.60 : 0.12;
        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.28, noteStart + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(noteStart);
        osc.stop(noteStart + dur);
      });

      // Sub-bass celebratory boom
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(115, now + 0.42);
      subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.90);
      subGain.gain.setValueAtTime(0.30, now + 0.42);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.90);

      subOsc.connect(subGain);
      subGain.connect(this.sfxGain);
      subOsc.start(now + 0.42);
      subOsc.stop(now + 0.95);
    }

    // Spontaneous Personality Sound Effects
    playJump() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.24);
    }

    playBonk() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.16);
      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.20);
    }

    playDizzy() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.linearRampToValueAtTime(420, now + 0.12);
      osc.frequency.linearRampToValueAtTime(480, now + 0.24);
      osc.frequency.linearRampToValueAtTime(360, now + 0.38);
      osc.frequency.linearRampToValueAtTime(260, now + 0.55);
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.60);
    }

    playFanfare() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.50];
      chord.forEach((freq, idx) => {
        const start = now + (idx * 0.07);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.26, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + (idx === 3 ? 0.45 : 0.15));
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(start);
        osc.stop(start + 0.50);
      });
    }

    playLaserDeflect() {
      try {
        if (this.isMuted) return;
        this.ensureContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(360, now + 0.11);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.13);
      } catch (e) {}
    }

    playComboDing() {
      try {
        if (this.isMuted) return;
        this.ensureContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.50, now);
        osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.20);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.22);
      } catch (e) {}
    }

    // 3. Ambient Cosmic Background Music for Comets Falling
    startBGM() {
      if (this.isPlayingBGM) return;
      this.ensureContext();
      if (!this.ctx) return;
      this.isPlayingBGM = true;

      // Start Ambient Cosmic Arpeggiator Loop (~107 BPM)
      const stepInterval = 280;
      this.bgmStep = 0;

      const playBgmStep = () => {
        if (!this.isPlayingBGM || !this.ctx) return;
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }

        if (!this.isMuted) {
          const now = this.ctx.currentTime;
          const freq = this.bgmNotes[this.bgmStep % this.bgmNotes.length];

          // Lead Arp Note
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(950, now);
          filter.frequency.exponentialRampToValueAtTime(300, now + 0.38);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.12, now + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.bgmGain);

          osc.start(now);
          osc.stop(now + 0.38);

          // Sub bass drone on downbeats (every 8 steps)
          if (this.bgmStep % 8 === 0) {
            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            bassOsc.type = 'triangle';
            bassOsc.frequency.setValueAtTime(110.00, now); // A2
            bassGain.gain.setValueAtTime(0.001, now);
            bassGain.gain.linearRampToValueAtTime(0.09, now + 0.08);
            bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
            bassOsc.connect(bassGain);
            bassGain.connect(this.bgmGain);
            bassOsc.start(now);
            bassOsc.stop(now + 1.9);
          }
        }

        this.bgmStep++;
        this.bgmTimer = setTimeout(playBgmStep, stepInterval);
      };

      playBgmStep();
    }

    stopBGM() {
      this.isPlayingBGM = false;
      clearTimeout(this.bgmTimer);
    }
  }

  // ==========================================================================
  // 4. Sentinel-X Cyber-Bot Scoreboard & Gamified HUD
  // ==========================================================================
  class SentinelScoreboard {
    constructor() {
      this.score = 0;
      this.combo = 0;
      this.comboTimer = null;
      this.lastHitTime = 0;
      this.soundEngine = null;

      this.hudWidget = document.getElementById('botHudWidget');
      this.avatarBox = document.getElementById('botAvatarBox');
      this.faceEl = document.getElementById('botFace');
      this.rankEl = document.getElementById('botRank');
      this.scoreEl = document.getElementById('botScoreNum');
      this.comboBadge = document.getElementById('botComboBadge');
      this.msgEl = document.getElementById('botMessage');
      this.minBtn = document.getElementById('botMinimizeBtn');

      this.faces = {
        idle: ['[•_•]', '[o_o]', '[•_•]'],
        blink: '[-_-]',
        happy: ['[^_^]', '[^o^]', '[★_★]', '[✧_✧]'],
        fire: ['[⚡_⚡]', '[🔥_🔥]', '[💥_💥]'],
        poke: ['[>_<]', '[OwO]', '[♥_♥]', '[¬_¬]']
      };

      this.actionQuotes = [
        // OpenUSD & Scene Pipeline
        "USD stage composition running at 100%! ⚡",
        "USD sublayers resolved: 0 layer conflicts! 💎",
        "Hydra render delegate compiling shaders! ✨",
        "Overclocking USD schema parser! ⚡",
        "Payload unloaded, framerate locked @ 60 FPS! 🚀",
        "USD prim composition validated across shots! 📐",
        "Enterprise USD pipeline nominal! 🎬",

        // Render Farm & Distributed Computing
        "Render farm dispatching 10,000 blade nodes! 🔥",
        "GPU raytracing cores at peak thermal efficiency! ⚡",
        "Deadlock cleared on render cluster queue! 🏆",
        "Frame buffer cache hit rate: 99.8%! 🌌",
        "Baking ambient occlusion in real-time! 💥",
        "Multi-GPU render tiles syncing seamlessly! 🚀",

        // Conforming, Ingest & AI Models
        "Zero-touch conform pipeline active: 0 errors! 🛠️",
        "Auto-ingesting raw 8K EXR sequences at speed! ⚡",
        "Building pattern recognition neural models! 🧠",
        "Conform validation passed across all color spaces! 🎨",
        "OCIO ACEScg color pipeline calibrated! 🌈",
        "Shotgrid automated publish hook dispatched! 📦",

        // Arcade & Cosmic Combat
        "Cosmic photon beam dialed to maximum power! 🎯",
        "Direct comet hit! Debris vaporized! 💥",
        "Target lock acquired! Super streak active! 🔥",
        "Incoming comet cluster eradicated! ☄️",
        "Spacetime fabric restored! Keep blasting! 🌌",
        "Pew pew! Critical hit on cosmic anomaly! ⚡",
        "Photon lasers operating at 9,000 MW! 🚀",
        "Orb core shattered! +100 Style points! 💎"
      ];

      this.idleQuotes = [
        "Move mouse or click comets to vaporize! ☄️",
        "Radar detecting incoming comets! Take aim! 🎯",
        "USD stage ready... waiting for your laser cursor! 🚀",
        "Conform queue idle. Fire at will, Cadet! 🛰️"
      ];

      this.pokeQuotes = [
        "Bleep bloop! Keep blasting comets! 🛰️",
        "USD sublayer cache is running at 100%! ⚡",
        "Zero-touch automation online! 🚀",
        "Hey! Stop poking my antenna! (>_<)",
        "GPU temperature nominal. Fire away! 🔥",
        "Pattern match complete: You are awesome! ✨"
      ];

      this.milestones = [
        { count: 1, rank: 'CADET', msg: 'Target locked! Pew pew! 🎯' },
        { count: 10, rank: 'SCOUT', msg: 'Pipeline anomaly eradicated! 🛰️' },
        { count: 25, rank: 'SENTINEL', msg: 'Render farm running hot! ⚡' },
        { count: 50, rank: 'VFX SPECIALIST', msg: 'USD Sublayer cleared! You are a pro! 🚀' },
        { count: 100, rank: 'PHOTON DESTROYER', msg: 'Overclocking GPUs to 9000%! 🔥' },
        { count: 250, rank: 'COSMIC ARCHITECT', msg: 'Oscar-worthy precision achieved! 🏆' },
        { count: 500, rank: 'MULTIVERSE OVERLORD', msg: 'You vaporized the whole multiverse! 🌌' },
        { count: 1000, rank: 'SUPREME DEITY 👑', msg: '1,000+ Shattered! Infinite power! ⚡' }
      ];

      this.themesCycle = ['comet', 'solar', 'aurora', 'diamond'];
      this.currentThemeIndex = 0;
      this.onThemeChange = null;
      this.onSpeedChange = null;

      this.isMilestoneLocked = false;
      this.milestoneLockTimer = null;
      this.lastQuote = '';
      this.hitCountSinceQuote = 0;
      this.idleTimer = null;

      this.init();
    }

    init() {
      // Idle blink animation loop
      setInterval(() => {
        if (Math.random() > 0.6 && this.faceEl) {
          this.faceEl.innerText = this.faces.blink;
          setTimeout(() => {
            if (this.faceEl && this.faceEl.innerText === this.faces.blink) {
              this.faceEl.innerText = this.faces.idle[0];
            }
          }, 200);
        }
      }, 3500);

      // Click anywhere on minimized widget to Expand
      if (this.hudWidget) {
        this.hudWidget.addEventListener('click', (e) => {
          if (this.hudWidget.classList.contains('minimized')) {
            e.stopPropagation();
            this.hudWidget.classList.remove('minimized');
            if (this.minBtn) this.minBtn.innerHTML = '&minus;';
            if (this.avatarBox) this.avatarBox.setAttribute('title', 'Click to poke Cyber Charlie!');
          }
        });
      }

      // Poke reaction when open, or Expand if minimized
      if (this.avatarBox) {
        this.avatarBox.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.hudWidget && this.hudWidget.classList.contains('minimized')) {
            this.hudWidget.classList.remove('minimized');
            if (this.minBtn) this.minBtn.innerHTML = '&minus;';
            if (this.avatarBox) this.avatarBox.setAttribute('title', 'Click to poke Cyber Charlie!');
            return;
          }
          const pokeFace = this.faces.poke[Math.floor(Math.random() * this.faces.poke.length)];
          const pokeQuote = this.pokeQuotes[Math.floor(Math.random() * this.pokeQuotes.length)];
          this.setFace(pokeFace, 900);
          this.setMessage(pokeQuote);
        });
      }

      // Minimize / Expand Button
      if (this.minBtn && this.hudWidget) {
        this.minBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isMin = this.hudWidget.classList.toggle('minimized');
          this.minBtn.innerHTML = isMin ? '+' : '&minus;';
          if (this.avatarBox) {
            this.avatarBox.setAttribute('title', isMin ? 'Click to open Cyber Charlie Scoreboard!' : 'Click to poke Cyber Charlie!');
          }
        });
      }

      // Auto-minimize on mobile & small tablet screens (<= 768px) to prevent blocking content
      if (window.innerWidth <= 768 && this.hudWidget) {
        this.hudWidget.classList.add('minimized');
        if (this.minBtn) this.minBtn.innerHTML = '+';
        if (this.avatarBox) {
          this.avatarBox.setAttribute('title', 'Click to open Cyber Charlie Scoreboard!');
        }
      }
    }

    onHit(x, y, count = 1) {
      this.score += count;
      const now = Date.now();

      // Combo streak
      if (now - this.lastHitTime < 1400) {
        this.combo += count;
      } else {
        this.combo = count;
      }
      this.lastHitTime = now;

      // Play pointer comet collision sound
      if (this.soundEngine) {
        this.soundEngine.playHit(this.combo);
      }

      // Update score display with pop animation and localized comma format
      if (this.scoreEl) {
        this.scoreEl.innerText = this.score >= 1000 ? this.score.toLocaleString() : this.score;
        this.scoreEl.classList.remove('pop');
        void this.scoreEl.offsetWidth; // Force reflow
        this.scoreEl.classList.add('pop');
      }

      // Combo badge
      if (this.comboBadge) {
        if (this.combo >= 3) {
          this.comboBadge.innerText = `COMBO x${this.combo}!`;
          this.comboBadge.classList.remove('hidden');
        }
        clearTimeout(this.comboTimer);
        this.comboTimer = setTimeout(() => {
          if (this.comboBadge) this.comboBadge.classList.add('hidden');
          this.combo = 0;
        }, 1800);
      }

      // Robot facial expression reaction
      if (this.combo >= 5) {
        const fireFace = this.faces.fire[Math.floor(Math.random() * this.faces.fire.length)];
        this.setFace(fireFace, 600);
      } else {
        const happyFace = this.faces.happy[Math.floor(Math.random() * this.faces.happy.length)];
        this.setFace(happyFace, 500);
      }

      // Spawn floating visual score popup
      if (this.combo >= 8) {
        this.spawnPopup(x, y, `CRIT +${count * 10}! ⚡`, 'crit');
      } else if (this.combo >= 3) {
        this.spawnPopup(x, y, `+${count * 5} COMBO x${this.combo}! 🔥`, 'combo');
      } else {
        this.spawnPopup(x, y, `+${count} ✨`, 'normal');
      }

      // Check milestones first
      this.checkMilestones();

      // Reset idle timer
      clearTimeout(this.idleTimer);
      this.idleTimer = setTimeout(() => {
        if (!this.isMilestoneLocked && this.idleQuotes.length) {
          const idleQ = this.idleQuotes[Math.floor(Math.random() * this.idleQuotes.length)];
          this.setMessage(idleQ);
        }
      }, 6500);

      // Trigger dynamic randomized action quote every 3-5 hits or high combo
      this.hitCountSinceQuote++;
      if (!this.isMilestoneLocked && (this.hitCountSinceQuote >= 4 || this.combo === 4 || this.combo === 8)) {
        this.triggerRandomActionQuote();
        this.hitCountSinceQuote = 0;
      }
    }

    triggerRandomActionQuote() {
      if (this.isMilestoneLocked || !this.actionQuotes.length) return;
      let quote = this.actionQuotes[Math.floor(Math.random() * this.actionQuotes.length)];
      if (quote === this.lastQuote && this.actionQuotes.length > 1) {
        quote = this.actionQuotes[(this.actionQuotes.indexOf(quote) + 1) % this.actionQuotes.length];
      }
      this.lastQuote = quote;
      this.setMessage(quote);
    }

    setFace(faceStr, duration = 500) {
      if (!this.faceEl) return;
      this.faceEl.innerText = faceStr;
      if (faceStr.includes('🔥') || faceStr.includes('💥') || faceStr.includes('⚡') || faceStr.includes('♥') || faceStr.length > 5) {
        this.faceEl.classList.add('compact');
      } else {
        this.faceEl.classList.remove('compact');
      }
      clearTimeout(this._faceTimer);
      this._faceTimer = setTimeout(() => {
        if (this.faceEl) {
          this.faceEl.classList.remove('compact');
          this.faceEl.innerText = this.faces.idle[0];
        }
      }, duration);
    }

    setMessage(msg) {
      if (this.msgEl) {
        this.msgEl.innerText = msg;
      }
    }

    checkMilestones() {
      // 1. Auto-Preset Progression every 250 Points (Stable, beautiful speed)
      const targetThemeIndex = Math.min(3, Math.floor(this.score / 250));
      if (this.score >= 250 && targetThemeIndex !== this.currentThemeIndex) {
        this.currentThemeIndex = targetThemeIndex;
        const newTheme = this.themesCycle[targetThemeIndex];
        if (this.onThemeChange) this.onThemeChange(newTheme);
        if (this.soundEngine) this.soundEngine.playLevelUp();
        this.triggerScreenFlash();

        const shiftAnnouncements = {
          solar: { face: '[🔥_🔥]', msg: 'HYPERDRIVE: Solar Flare Stage 2 active! 🔥' },
          aurora: { face: '[✧_✧]', msg: 'HYPERDRIVE: Aurora Matrix Stage 3 online! 🌌' },
          diamond: { face: '[★_★]', msg: 'MAX VELOCITY: Hyper Diamond Overdrive! 💎' }
        };

        if (shiftAnnouncements[newTheme]) {
          this.setFace(shiftAnnouncements[newTheme].face, 2400);
          this.setMessage(shiftAnnouncements[newTheme].msg);
          this.isMilestoneLocked = true;
          clearTimeout(this.milestoneLockTimer);
          this.milestoneLockTimer = setTimeout(() => {
            this.isMilestoneLocked = false;
          }, 3800);
        }
      }

      // 2. Rank & Milestone Check
      for (let i = this.milestones.length - 1; i >= 0; i--) {
        const m = this.milestones[i];
        if (this.score >= m.count) {
          if (this.rankEl && this.rankEl.innerText !== m.rank) {
            this.rankEl.innerText = m.rank;
            if (this.soundEngine) this.soundEngine.playLevelUp();
            this.triggerScreenFlash();
          }
          if (this.score === m.count || this.score === m.count + 1) {
            this.setMessage(m.msg);
            this.isMilestoneLocked = true;
            clearTimeout(this.milestoneLockTimer);
            this.milestoneLockTimer = setTimeout(() => {
              this.isMilestoneLocked = false;
            }, 3800);
          }
          break;
        }
      }
    }

    spawnPopup(x, y, text, type = 'normal') {
      if (!x || !y) return;
      const el = document.createElement('div');
      el.className = `shatter-popup ${type === 'crit' ? 'crit-popup' : (type === 'combo' ? 'combo-popup' : '')}`.trim();
      el.innerText = text;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 850);
    }

    triggerScreenFlash() {
      const flash = document.createElement('div');
      flash.className = 'screen-milestone-flash';
      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 750);
    }
  }

  // ==========================================================================
  // 5. UI Navigation, FX Controls & Scroll Spy Initialization
  // ==========================================================================
  function init() {
    // 1. Initialize Particle Engine
    const engine = new ParticleEngine('cometCanvas');
    window.portfolioEngine = engine;
    window.portfolioCharlie = engine ? engine.charlie : null;

    // 2. Initialize Cosmic Audio Synthesizer Engine
    const soundEngine = new CosmicSoundEngine();
    window.portfolioSoundEngine = soundEngine;

    // Global User Gesture Audio Unlock (Unlocks Web Audio on first click / touch / key)
    const unlockAudio = () => {
      soundEngine.ensureContext();
    };
    ['click', 'pointerdown', 'keydown', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, unlockAudio, { passive: true });
    });

    // 3. Initialize Sentinel-X Scoreboard
    const scoreboard = new SentinelScoreboard();
    scoreboard.soundEngine = soundEngine;
    engine.onShatter = (x, y, count) => {
      scoreboard.onHit(x, y, count);
    };

    // 3. Setup Navbar Fun/Cosmic Mode Toggle Switch & Mission Announcement Toast
    const navFxToggle = document.getElementById('navFxToggle');
    const fxSwitchWrapper = document.getElementById('fxSwitchWrapper');
    const fxWidget = document.getElementById('fxWidget');
    const fxPanel = document.getElementById('fxPanel');
    const botHud = document.getElementById('botHudWidget');
    const missionToast = document.getElementById('missionToast');
    const missionToastClose = document.getElementById('missionToastClose');
    const fxToggleBtn = document.getElementById('fxToggleBtn');
    const fxThemeButtons = document.querySelectorAll('.fx-theme-btn');
    let toastTimer = null;

    function updateThemeUI(themeKey) {
      if (!engine) return;
      engine.setTheme(themeKey);
      fxThemeButtons.forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-theme') === themeKey);
      });
      const activeBtn = document.querySelector(`.fx-theme-btn[data-theme="${themeKey}"]`);
      if (activeBtn && fxToggleBtn) {
        const themeName = activeBtn.querySelector('span:first-child').innerText;
        fxToggleBtn.querySelector('span').innerText = `FX: ${themeName.replace(/[⚡🔥🌌💎]/g, '').trim()}`;
      }
    }
    window.setPortfolioThemeUI = updateThemeUI;

    scoreboard.onThemeChange = (themeKey) => {
      updateThemeUI(themeKey);
    };

    scoreboard.onSpeedChange = (mult) => {
      if (engine) engine.setSpeedMultiplier(mult);
    };

    function showMissionToast() {
      if (!missionToast) return;
      missionToast.classList.remove('hidden');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        if (missionToast) missionToast.classList.add('hidden');
      }, 5500);
    }

    if (missionToastClose && missionToast) {
      missionToastClose.addEventListener('click', (e) => {
        e.stopPropagation();
        missionToast.classList.add('hidden');
      });
    }

    const desktopNoticeToast = document.getElementById('desktopNoticeToast');
    const desktopNoticeToastClose = document.getElementById('desktopNoticeToastClose');
    const mobileDesktopHint = document.querySelector('.mobile-desktop-hint');
    let desktopNoticeTimer = null;

    function showDesktopOnlyNotice() {
      if (!desktopNoticeToast) return;
      desktopNoticeToast.classList.remove('hidden');
      clearTimeout(desktopNoticeTimer);
      desktopNoticeTimer = setTimeout(() => {
        if (desktopNoticeToast) desktopNoticeToast.classList.add('hidden');
      }, 5000);
    }

    if (desktopNoticeToastClose && desktopNoticeToast) {
      desktopNoticeToastClose.addEventListener('click', (e) => {
        e.stopPropagation();
        desktopNoticeToast.classList.add('hidden');
      });
    }

    if (mobileDesktopHint) {
      mobileDesktopHint.style.cursor = 'pointer';
      mobileDesktopHint.addEventListener('click', (e) => {
        e.stopPropagation();
        showDesktopOnlyNotice();
      });
    }

    function syncCharlieGameModeChips(isGameOn) {
      const welcomeChips = document.getElementById('aiWelcomeChips');
      const welcomeLabel = document.getElementById('aiWelcomeLabel');
      if (!welcomeChips) return;

      const isMuted = soundEngine && soundEngine.isMuted;
      const muteLabel = isMuted ? '🔊 Unmute Sound' : '🔇 Mute Sound';
      const muteQuery = isMuted ? 'unmute sound' : 'mute sound';

      if (isGameOn) {
        if (welcomeLabel) welcomeLabel.innerText = '🎮 Cosmic Game Mode Active Controls:';
        welcomeChips.innerHTML = `
          <button type="button" class="ai-followup-btn" data-query="turn off game mode">🛑 Turn Off Game Mode</button>
          <button type="button" class="ai-followup-btn" data-query="${muteQuery}">${muteLabel}</button>
          <button type="button" class="ai-followup-btn" data-query="switch fx to solar">⚡ Preset: Solar Flare</button>
          <button type="button" class="ai-followup-btn" data-query="switch fx to aurora">🌌 Preset: Aurora Borealis</button>
          <button type="button" class="ai-followup-btn" data-query="switch fx to diamond">💎 Preset: Hyper Diamond</button>
          <button type="button" class="ai-followup-btn" data-query="switch fx to comet">☄️ Preset: Comet Cascade</button>
          <button type="button" class="ai-followup-btn" data-query="Tell me about your AI certifications, accelerator credentials, and hackathons">📜 AI Certifications</button>
          <button type="button" class="ai-followup-btn" data-query="Who is Rajeev Mutyalu and why should we hire him?">🌟 Why Hire Rajeev?</button>
        `;
      } else {
        if (welcomeLabel) welcomeLabel.innerText = 'Executive Quick Links:';
        welcomeChips.innerHTML = `
          <button type="button" class="ai-followup-btn" data-query="Who is Rajeev Mutyalu and why should we hire him?">🌟 Why Hire Rajeev?</button>
          <button type="button" class="ai-followup-btn" data-query="Tell me about your AI certifications, accelerator credentials, and hackathons">📜 AI Certifications &amp; Hackathon</button>
          <button type="button" class="ai-followup-btn" data-query="Tell me about your 20-year engineering leadership and mentorship background">🏆 Leadership &amp; Filmography</button>
          <button type="button" class="ai-followup-btn" data-query="turn on game mode">🎮 Turn On Game Mode</button>
          <button type="button" class="ai-followup-btn" data-query="What is Model Context Protocol (MCP) and how is it used in production?">🔌 Model Context Protocol</button>
          <button type="button" class="ai-followup-btn" data-query="How do you deploy On-Premise LLMs (Nous Hermes, Ollama) and OpenClaw agents?">🔒 On-Prem LLMs &amp; OpenClaw</button>
          <button type="button" class="ai-followup-btn" data-query="Explain your OpenUSD VFX pipeline architecture">🎬 OpenUSD Architecture</button>
          <button type="button" class="ai-followup-btn" data-query="How does zero-touch n8n studio automation orchestrate pipelines?">⚡ n8n Automation</button>
        `;
      }
    }
    window.syncCharlieGameModeChips = syncCharlieGameModeChips;

    function toggleFunMode(forceState) {
      const floatingBtn = document.getElementById('floatingCharlieBtn');
      const dockRect = floatingBtn ? floatingBtn.getBoundingClientRect() : { left: window.innerWidth - 60, top: window.innerHeight - 60, width: 44, height: 44 };
      const dockCenterX = dockRect.left + dockRect.width / 2;
      const dockCenterY = dockRect.top + dockRect.height / 2;

      if (window.innerWidth <= 768) {
        if (forceState === false) {
          if (desktopNoticeToast) desktopNoticeToast.classList.add('hidden');
        } else {
          showDesktopOnlyNotice();
        }
        soundEngine.stopBGM();
        if (navFxToggle) navFxToggle.classList.remove('active');
        if (engine) engine.toggleState(false);
        if (fxWidget) fxWidget.classList.add('hidden');
        if (botHud) botHud.classList.add('hidden');
        if (missionToast) missionToast.classList.add('hidden');
        syncCharlieGameModeChips(false);
        return;
      }

      const isNowEnabled = (typeof forceState === 'boolean') ? forceState : !engine.isEnabled;
      engine.toggleState(isNowEnabled);

      if (isNowEnabled) {
        soundEngine.ensureContext();
        soundEngine.startBGM();
        if (navFxToggle) navFxToggle.classList.add('active');
        if (fxWidget) fxWidget.classList.remove('hidden');
        if (botHud) botHud.classList.remove('hidden');
        showMissionToast();
        syncCharlieGameModeChips(true);
        if (scoreboard) {
          scoreboard.setFace('[★_★]', 1800);
          scoreboard.setMessage('Cyber Charlie deployed! Vaporize comets, Cadet! 🚀');
        }

        // Charlie Supersonic Cyber Dash: directly to Cursor!
        // Game Mode unconditionally overrides everything
        const targetX = (engine.mouse && engine.mouse.x > 0) ? engine.mouse.x : (window.innerWidth / 2);
        const targetY = (engine.mouse && engine.mouse.y > 0) ? engine.mouse.y : (window.innerHeight / 2);

        // Lockout the chatbot & show that Charlie is busy destroying comets
        const charlieTerminal = document.querySelector('.ai-bot-terminal') || document.getElementById('charlie');
        if (charlieTerminal) {
          charlieTerminal.classList.add('game-mode-lockout');
        }
        const aiInput = document.getElementById('aiInputField');
        if (aiInput) {
          aiInput.disabled = true;
          aiInput.placeholder = 'Charlie is busy destroying comets... Click "Disable Game to Use Bot" to chat';
        }
        const aiSend = document.getElementById('aiSendBtn');
        if (aiSend) aiSend.disabled = true;

        const aiStatusPill = document.getElementById('aiBotStatusPill');
        if (aiStatusPill) {
          aiStatusPill.classList.add('combat-pill');
          const pulse = aiStatusPill.querySelector('.ai-status-pulse');
          if (pulse) pulse.classList.add('combat-pulse');
          const text = aiStatusPill.querySelector('.ai-status-text') || aiStatusPill.querySelector('span:last-child');
          if (text) text.textContent = 'CHARLIE DESTROYING COMETS';
        }

        if (floatingBtn) floatingBtn.classList.add('hidden');
        if (engine && engine.charlie) {
          engine.charlie.sectionActive = false;
          engine.charlie.isGameModeDeploy = true;
          const startX = (engine.charlie.x > -200) ? engine.charlie.x : dockCenterX;
          const startY = (engine.charlie.y > -200) ? engine.charlie.y : dockCenterY;
          engine.charlie.triggerDeploy(startX, startY, targetX, targetY, true);
        }
      } else {
        soundEngine.stopBGM();
        if (navFxToggle) navFxToggle.classList.remove('active');
        if (fxWidget) {
          fxWidget.classList.add('hidden');
          if (fxPanel) fxPanel.classList.remove('open');
        }
        if (botHud) botHud.classList.add('hidden');
        if (missionToast) missionToast.classList.add('hidden');
        syncCharlieGameModeChips(false);

        // Unlock the chatbot & restore normal state
        const charlieTerminal = document.querySelector('.ai-bot-terminal') || document.getElementById('charlie');
        if (charlieTerminal) {
          charlieTerminal.classList.remove('game-mode-lockout');
        }
        const aiInput = document.getElementById('aiInputField');
        if (aiInput) {
          aiInput.disabled = false;
          aiInput.placeholder = 'Ask about AI Certifications, OpenUSD, Conform Ingest, MCP, On-Prem LLMs, n8n, or Why Hire Rajeev...';
        }
        const aiSend = document.getElementById('aiSendBtn');
        if (aiSend) aiSend.disabled = false;

        const aiStatusPill = document.getElementById('aiBotStatusPill');
        if (aiStatusPill) {
          aiStatusPill.classList.remove('combat-pill');
          const pulse = aiStatusPill.querySelector('.ai-status-pulse');
          if (pulse) pulse.classList.remove('combat-pulse');
          const text = aiStatusPill.querySelector('.ai-status-text') || aiStatusPill.querySelector('span:last-child');
          if (text) text.textContent = 'LOCAL KB READY';
        }

        // Charlie Supersonic Reverse Return Dash: straight back to mascot station or dock!
        document.body.classList.remove('combat-cursor-active');
        if (engine && engine.charlie && engine.charlie.x > -200) {
          const anchor = engine.charlie.getChatMascotAnchor();
          if (anchor.isVisible) {
            engine.charlie.triggerDeploy(engine.charlie.x, engine.charlie.y, anchor.x, anchor.y, false);
          } else {
            engine.charlie.triggerDock(dockCenterX, dockCenterY);
          }
        } else {
          if (floatingBtn) floatingBtn.classList.remove('hidden');
        }
      }
    }
    window.togglePortfolioGameMode = toggleFunMode;

    // Ensure Game Mode and FX widget are strictly OFF on load and back-navigation
    toggleFunMode(false);
    window.addEventListener('pageshow', () => {
      toggleFunMode(false);
    });

    if (fxSwitchWrapper) {
      fxSwitchWrapper.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFunMode();
      });
    }

    // 4. Setup HUD Sound Toggle Button (SFX & Synth BGM)
    const botSoundBtn = document.getElementById('botSoundBtn');
    const aiChatSoundToggle = document.getElementById('aiChatSoundToggle');
    const aiChatSoundIcon = document.getElementById('aiChatSoundIcon');
    const aiChatSoundText = document.getElementById('aiChatSoundText');

    function setPortfolioAudioMute(forceMute) {
      if (!soundEngine) return false;
      soundEngine.ensureContext();
      let isMuted;
      if (typeof forceMute === 'boolean') {
        if (soundEngine.isMuted !== forceMute) {
          isMuted = soundEngine.toggleMute();
        } else {
          isMuted = soundEngine.isMuted;
        }
      } else {
        isMuted = soundEngine.toggleMute();
      }
      if (botSoundBtn) {
        botSoundBtn.innerHTML = isMuted ? '🔇' : '🔊';
        botSoundBtn.classList.toggle('muted', isMuted);
        botSoundBtn.setAttribute('title', isMuted ? 'Unmute Game Audio & Music' : 'Mute Game Audio & Music');
      }
      if (aiChatSoundToggle) {
        aiChatSoundToggle.classList.toggle('muted', isMuted);
        aiChatSoundToggle.setAttribute('title', isMuted ? 'Unmute Chat Audio & SFX' : 'Mute Chat Audio & SFX');
        if (aiChatSoundIcon) aiChatSoundIcon.textContent = isMuted ? '🔇' : '🔊';
        if (aiChatSoundText) aiChatSoundText.textContent = isMuted ? 'SFX MUTED' : 'SFX ON';
      }
      window.isChatAudioMuted = isMuted;
      try {
        localStorage.setItem('portfolio_audio_muted', isMuted ? 'true' : 'false');
      } catch (e) {}
      if (scoreboard) {
        scoreboard.setMessage(isMuted ? 'Audio muted. Silent stealth mode! 🤫' : 'Audio online! Synth BGM & FX active! 🔊');
      }
      syncCharlieGameModeChips(engine ? engine.isEnabled : false);
      return isMuted;
    }
    window.setPortfolioAudioMute = setPortfolioAudioMute;

    if (botSoundBtn) {
      botSoundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setPortfolioAudioMute();
      });
    }

    if (aiChatSoundToggle) {
      aiChatSoundToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setPortfolioAudioMute();
      });
    }

    // Initialize persisted audio preference on startup
    try {
      if (localStorage.getItem('portfolio_audio_muted') === 'true') {
        setPortfolioAudioMute(true);
      }
    } catch (e) {}

    // 5. Setup Floating FX Preset Switcher
    if (fxToggleBtn && fxPanel) {
      fxToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fxPanel.classList.toggle('open');
      });

      document.addEventListener('click', (e) => {
        if (!e.target.closest('#fxWidget')) {
          fxPanel.classList.remove('open');
        }
      });

      fxThemeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          fxThemeButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const themeKey = btn.getAttribute('data-theme');
          if (engine) engine.setTheme(themeKey);

          const themeName = btn.querySelector('span:first-child').innerText;
          fxToggleBtn.querySelector('span').innerText = `FX: ${themeName.replace(/[⚡🔥🌌💎]/g, '').trim()}`;
        });
      });
    }

    // 5. Setup Pipeline Architecture Flow (USD, n8n Automation & GenAI)
    const FLOWS = {
      usd: {
        nodes: [
          { title: '1. Asset Creation', sub: 'Model → Groom → Look → Rig' },
          { title: '2. Env Master Assembly', sub: 'Set Dressing & Instancing' },
          { title: '3. Layout Base Layer', sub: 'Camera, Blocking & Dressing' },
          { title: '4. Anim & Deforming Geo', sub: 'Character Caches & Overrides' },
          { title: '5. CFX & FX Caches', sub: 'Cloth, Crowds & Volumes' },
          { title: '6. Lighting & Shading', sub: 'Material Binds & Light Rigs' },
          { title: '7. USD Plate Architecture', sub: 'Dept Sublayers & Manifest' },
          { title: '8. Master Shot Assembly', sub: 'Hydra Viewport & Deep Comp', highlight: true }
        ],
        description: '<strong>USD Pipeline Architecture (Asset, Environment &amp; Shot Composition):</strong><br>' +
          '• <strong>Asset Creation Tier:</strong> Departmental isolation across Modeling, Groom, LookDev, and Rigging with LOD variants, published into unified, renderable asset packages.<br>' +
          '• <strong>Environment &amp; Set Assembly:</strong> Composes standalone published props and modular set assemblies into scalable master environments utilizing point instancing, transform hierarchies, and dynamic variant selections.<br>' +
          '• <strong>USD Plate Architecture:</strong> Designed and implemented department-layered USD composition for shot plates: per-dept sublayers (ingest / derivatives / lighting / session) composed under a manifest-driven umbrella, with strength-ordering and edit-target rules. Built as a composition layer over existing filesystem product storage; aligned with AYON backend integration.<br>' +
          '• <strong>Shot Composition Tier:</strong> Non-destructive multi-department sublayer stack (Layout &rarr; Animation &rarr; Simulation &rarr; FX &rarr; Lighting) authoring scoped opinions into master shot compositions, rendered via Hydra viewports and integrated into final compositing.'
      },
      automation: {
        nodes: [
          { title: '1. Inbound Webhook', sub: 'Editorial & Plate Event' },
          { title: '2. n8n Core Hub', sub: 'Logic & Branching Engine', highlight: true },
          { title: '3. Project Onboarding', sub: 'Auto Structure & Shot Setup' },
          { title: '4. Pattern Recognition', sub: 'VFX Plates & Color Space' },
          { title: '5. Ingest & Render', sub: 'Blade Dispatch & Transcode' },
          { title: '6. ShotGrid Update', sub: 'Version Metadata & Status' },
          { title: '7. Reverse Webhook', sub: 'Bidirectional Studio Callback' }
        ],
        description: '<strong>Zero-Touch n8n Studio Automation:</strong> Automated event-driven dispatch utilizing inbound <strong>webhooks</strong> and <strong>reverse webhooks</strong> for bidirectional studio communication. Ingests editorial turnovers, applies pattern recognition for raw VFX plates, dispatches farm render nodes, updates ShotGrid metadata, and triggers reverse webhook callbacks to production dashboards with zero human friction.'
      },
      genai: {
        nodes: [
          { title: '1. Script & Storyboard', sub: 'Scene Breakdown & Intent' },
          { title: '2. Character & Env Assets', sub: 'Consistent Visual DNA / LORAs' },
          { title: '3. Prompt Studio', sub: 'Directorial Directives & Lenses' },
          { title: '4. Generation Queue', sub: 'Veo / Kling / Seedance Dispatch', highlight: true },
          { title: '5. Latent Consistency', sub: 'Higgsfield & Temporal Flow' },
          { title: '6. Timeline Assembly', sub: 'Scene Sequencing & Cut' },
          { title: '7. Editorial Review', sub: 'Director Dailies & Approval' }
        ],
        description: '<strong>GenAI Prompt-to-Video Production Platform (Scene Weaver):</strong><br>' +
          '• <strong>Script & Visual Asset Foundation:</strong> Ingests screenplays and storyboards, establishing persistent visual identity for characters, environments, and stylistic DNA across multi-scene projects.<br>' +
          '• <strong>Prompt Studio & Multi-Model Generation Queue:</strong> Translates cinematic directorial directives into optimized model payloads dispatched across frontier foundation video models (Google Veo, Kling AI, Seedance).<br>' +
          '• <strong>Temporal Coherence & Editorial Review:</strong> Leverages latent consistency caching and Higgsfield models to eliminate character drift, assembling generated shots into an interactive editorial timeline ready for director dailies and final review.'
      }
    };

    const archButtons = document.querySelectorAll('.arch-btn');
    const archCanvas = document.getElementById('archCanvas');
    const archDetails = document.getElementById('archDetails');

    function renderArchitectureFlow(flowKey) {
      const flow = FLOWS[flowKey];
      if (!flow || !archCanvas || !archDetails) return;

      let html = '<div class="arch-flow-diagram">';
      flow.nodes.forEach((node, index) => {
        html += `
          <div class="arch-node ${node.highlight ? 'highlight' : ''}">
            <div class="arch-node-title">${node.title}</div>
            <div class="arch-node-sub">${node.sub}</div>
          </div>
        `;

        if (index < flow.nodes.length - 1) {
          html += `<div class="arch-arrow">&rarr;</div>`;
        }
      });
      html += '</div>';

      archCanvas.innerHTML = html;
      archDetails.innerHTML = flow.description;
    }

    function switchArchitectureTab(flowKey) {
      if (!flowKey || !FLOWS[flowKey]) return;
      if (archButtons && archButtons.length) {
        archButtons.forEach(b => {
          if (b.getAttribute('data-flow') === flowKey) {
            b.classList.add('active');
          } else {
            b.classList.remove('active');
          }
        });
      }
      renderArchitectureFlow(flowKey);
    }
    window.switchArchitectureTab = switchArchitectureTab;

    if (archButtons.length && archCanvas && archDetails) {
      renderArchitectureFlow('usd');
      archButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const flowKey = btn.getAttribute('data-flow');
          switchArchitectureTab(flowKey);
        });
      });
    }

    // 6. Scroll Spy Navigation
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset;
      sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 120;
        const sectionId = current.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);

        if (navLink) {
          if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLink.classList.add('active');
          } else {
            navLink.classList.remove('active');
          }
        }
      });
    });

    // 7. Mobile Navigation Drawer Toggle & Link Handler
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const mobileNavDrawer = document.getElementById('mobileNavDrawer');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (mobileNavToggle && mobileNavDrawer) {
      mobileNavToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = mobileNavDrawer.classList.toggle('open');
        mobileNavToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        mobileNavToggle.querySelector('.nav-bar-icon').innerHTML = isOpen ? '&times;' : '&#9776;';
      });

      mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
          mobileNavDrawer.classList.remove('open');
          mobileNavToggle.setAttribute('aria-expanded', 'false');
          mobileNavToggle.querySelector('.nav-bar-icon').innerHTML = '&#9776;';
        });
      });

      document.addEventListener('click', (e) => {
        if (!mobileNavDrawer.contains(e.target) && !mobileNavToggle.contains(e.target)) {
          mobileNavDrawer.classList.remove('open');
          mobileNavToggle.setAttribute('aria-expanded', 'false');
          mobileNavToggle.querySelector('.nav-bar-icon').innerHTML = '&#9776;';
        }
      });
    }

    // =========================================================================
    // 8. Interactive Charlie AI Assistant & Technical Knowledge Base
    // =========================================================================
    const aiChatStream = document.getElementById('aiChatStream');
    const aiChatForm = document.getElementById('aiChatForm');
    const aiInputField = document.getElementById('aiInputField');
    const aiBotStatusPill = document.getElementById('aiBotStatusPill');

    const AI_KNOWLEDGE_BASE = [
      {
        id: 'why_hire_rajeev',
        keywords: ['why hire', 'why should we hire', 'hire rajeev', 'who is rajeev', 'who si rajeev', 'who is', 'who si', 'pitch', 'recruit', 'recruiting', 'strengths', 'why choose', 'value proposition', 'summary', 'unique', 'role', 'senior', 'lead', 'architect', 'about rajeev', 'why hire him', 'rajeev mutyalu', 'rajeev', 'muthyalu', 'mutyalu'],
        title: 'Who is Rajeev Mutyalu & Why Hire Him? (Executive Pitch)',
        intros: [
          '🌟 <strong>EXECUTIVE OVERVIEW // LEAD ARCHITECT &amp; SYSTEMS DIRECTOR</strong>',
          '🎯 <strong>STRATEGIC VALUE PROPOSITION // RAJEEV MUTYALU</strong>',
          '💎 <strong>CORE LEADERSHIP PROFILE // 20-YEAR STUDIO PEDIGREE</strong>',
          '🚀 <strong>HIGH-LEVERAGE CAPABILITY BRIEF // RAJEEV MUTYALU</strong>'
        ],
        responses: [
          `<strong>📌 20-Year Production Pedigree:</strong> Lead Software Architect &amp; Creative Technologist with 20+ years of proven R&amp;D leadership across Astra Studios, Technicolor Group, and MPC Film on Oscar-winning blockbuster productions (<em>1917, RRR, Mufasa: The Lion King, Back in Action, Spaceman, Prehistoric Planet</em>).<br/>
• <strong>💎 The Rare "Dual-Threat" Moat:</strong> Bridges traditional mission-critical studio infrastructure (Python 3.x, PyQt/PySide, OpenUSD, ACES, OTIO, Conform Ingest) with applied AI frontier systems (Custom MCP Servers, Claude Code agent swarms, on-premise quantized LLMs like Nous Hermes, and n8n zero-touch automation).<br/>
• <strong>👥 Global Team Mentorship:</strong> Mentored 50+ engineers and pipeline TDs across international studio sites in London, Montreal, and Bangalore.<br/>
• <strong>🚀 Immediate ROI &amp; Zero Ramp-Up:</strong> A strategic visionary who still writes production-grade code daily. Proven track record aligning global cross-continental teams across London and Bangalore under strict Hollywood delivery deadlines.<br/><br/>
<a href="#initiatives" class="ai-section-link">🚀 Explore Technical Arsenal &rarr;</a>
<a href="#architecture" class="ai-section-link">🎬 View Live Studio Architecture &rarr;</a>
<a href="cv.html" class="ai-section-link">📄 Open Executive CV &amp; Bio &rarr;</a>
<a href="#contact" class="ai-section-link">📬 Direct Contact Matrix &rarr;</a>`,

          `<strong>💎 The Rare "Dual-Threat" Engineering Moat:</strong><br/>
Most senior leaders either manage people or write code; Rajeev bridges high-level architectural strategy with deep, daily code execution.<br/>
• <strong>🏗️ Traditional Heavyweight Foundation:</strong> 20+ years building Linux render clusters, low-level Python/C++ OpenUSD composition arcs, ShotGrid databases, and automated DI conform engines across Astra Studios, Technicolor Group, and MPC Film.<br/>
• <strong>⚡ Applied AI Frontier Leadership:</strong> Early pioneer in production MCP (Model Context Protocol) tool servers, autonomous Claude Code/Devin swarms, and air-gapped private LLM deployments (Nous Hermes, Ollama 4-bit GGUF).<br/>
• <strong>🎬 Oscar-Winning &amp; Landmark Deliverables:</strong> Key pipeline architect across Academy Award-winning productions and global tentpoles (<em>1917</em>, <em>RRR</em>, <em>Mufasa: The Lion King</em>, <em>Back in Action</em>, <em>Spaceman</em>, <em>Prehistoric Planet</em>).<br/>
• <strong>🏆 Production Heritage:</strong> Trusted technical leader on landmark VFX and animation sequences for Disney, Warner Bros, Universal, and Netflix.<br/><br/>
<a href="cv.html" class="ai-section-link">📄 Review Full Career Timeline &amp; Credits &rarr;</a>
<a href="#initiatives" class="ai-section-link">🚀 Inspect Technical Arsenal &rarr;</a>`,

          `<strong>🚀 Immediate Production ROI &amp; Engineering Velocity:</strong><br/>
• <strong>⚡ 5x–10x Delivery Acceleration:</strong> Replaces manual studio friction with zero-touch event-driven automation (n8n webhooks, automated QC verification loops, and agentic workflows).<br/>
• <strong>🎯 Zero Ramp-Up Time:</strong> Having architected pipelines for top-tier studios across London and Bangalore, Rajeev steps into any enterprise VFX, animation, or AI pipeline and delivers immediate impact on Day 1.<br/>
• <strong>👥 Cross-Continental Leadership:</strong> Mentored over 50+ TDs and engineers, establishing high-trust engineering cultures, automated code-review gates, and strict sprint cadences.<br/>
• <strong>📍 Location &amp; Status:</strong> Based in London, UK (British Citizen) with full global remote/onsite mobility.<br/><br/>
<a href="#contact" class="ai-section-link">📬 Connect with Rajeev Directly &rarr;</a>
<a href="cv.html" class="ai-section-link">📄 View 1-Click ATS Resume &rarr;</a>`,

          `<strong>🌐 Global Team Builder &amp; Technical Visionary:</strong><br/>
• <strong>🤝 London–Bangalore Engineering Bridge:</strong> Successfully aligned multi-site teams of 40+ software developers and pipeline TDs, delivering high-throughput 24/7 studio follow-the-sun workflows.<br/>
• <strong>📦 Open Standards Champion:</strong> Proven expert in OpenUSD 2-tier composition, OpenTimelineIO (OTIO) cut conforms, and OpenColorIO (OCIO / ACEScg) color science.<br/>
• <strong>🧠 Frontier AI Integration:</strong> Architect of <em>Scene Weaver (Studio.AI)</em>, integrating Google Veo, Kling, and Seedance into conformed VFX studio pipelines.<br/>
• <strong>🏆 Production Proof:</strong> Credits on <em>1917, RRR, Mufasa: The Lion King, Back in Action, Spaceman, Prehistoric Planet</em>.<br/><br/>
<a href="#architecture" class="ai-section-link">🎬 Launch Interactive Pipeline Visualizer &rarr;</a>
<a href="cv.html" class="ai-section-link">📄 Open Executive CV &rarr;</a>`
        ],
        followupPool: [
          'Tell me about your AI certifications, accelerator credentials, and hackathons',
          'Tell me about your 20-year engineering leadership and mentorship background',
          'What is Model Context Protocol (MCP) and how is it used in production?',
          'Explain your OpenUSD VFX pipeline architecture',
          'How do you deploy On-Premise LLMs (Nous Hermes, Ollama) and OpenClaw agents?',
          'How does zero-touch n8n studio automation orchestrate pipelines?',
          'Tell me about GenAI video pipelines with Veo, Kling, and Studio.AI'
        ]
      },
      {
        id: 'creative_technologist_vision',
        keywords: ['creative technologist', 'philosophy', 'vision', 'engineering mindset', 'craftsman', 'technologist', 'architecture philosophy'],
        title: 'Creative Technologist & Engineering Philosophy',
        intros: [
          '🌟 <strong>ENGINEERING PHILOSOPHY &amp; CREATIVE CRAFTSMANSHIP</strong>',
          '💎 <strong>SYSTEM ARCHITECTURE VISION // RAJEEV MUTYALU</strong>',
          '🚀 <strong>HIGH-LEVERAGE ENGINEERING MINDSET</strong>'
        ],
        responses: [
          `• <strong>🎨 Creative Technologist at Heart:</strong> Rajeev combines the sharp aesthetic eye of a seasoned visual effects artist with the rigorous mathematical foundations of a software systems architect.<br/>
• <strong>🎬 20-Year Evolution:</strong> Started in the early 2000s mastering traditional computer graphics, 3D modeling, and editorial plate conform, evolving into a Lead Architect across Oscar-winning tentpole films and landmark productions (<em>1917, RRR, Mufasa: The Lion King, Back in Action, Spaceman, Prehistoric Planet</em>).<br/>
• <strong>💎 The Dual-Threat Moat:</strong> Equally at home debugging low-level C++/Python OpenUSD composition arcs on Linux render clusters as he is designing cutting-edge agentic workflows, MCP servers, and local quantized LLMs.<br/>
• <strong>⌨️ Studio Craftsmanship:</strong> Passionate about clean code, ultra-responsive developer tooling, sub-second terminal latency, and optimizing studio pipelines down to the millisecond.<br/><br/>
<a href="#initiatives" class="ai-section-link">🚀 Explore Technical Arsenal &rarr;</a>
<a href="cv.html" class="ai-section-link">📄 Open Full Executive CV &amp; Bio &rarr;</a>`,

          `• <strong>🛠️ Engineering Purist:</strong> Obsessed with clean, robust code architecture, sub-second terminal latency, and zero-defect deployments.<br/>
• <strong>🎞️ Blockbuster Pedigree:</strong> Contributed technical leadership to Academy Award-winning sequences in <em>1917</em>, <em>RRR</em>, and landmark Disney production <em>Mufasa: The Lion King</em>.<br/>
• <strong>🚀 Modern Frontier:</strong> Leading the adoption of local private AI models, Model Context Protocol (MCP), and autonomous agent swarms in visual effects.<br/>
• <strong>🤝 Leadership Rigor:</strong> Champions test-driven development, automated code review gates, and non-blocking architectural patterns across multi-site studios.<br/><br/>
<a href="#films" class="ai-section-link">🏆 Browse Oscar-Winning Filmography &rarr;</a>
<a href="#contact" class="ai-section-link">📬 Get in Touch &rarr;</a>`,

          `• <strong>🌐 Global Engineering Bridge:</strong> Lived and led technical teams across India and the United Kingdom, fostering inclusive, highly collaborative, and agile engineering environments.<br/>
• <strong>🕹️ Real-Time Systems Passion:</strong> Built the custom <em>Comet Cascade</em> 60 FPS particle canvas engine and Web Audio synthesizer right inside this portfolio to demonstrate real-time interactive mathematics and event-driven architecture.<br/>
• <strong>📦 Open Standards Leadership:</strong> Deep proponent of open standards including OpenUSD, OpenTimelineIO (OTIO), and OpenColorIO (OCIO / ACEScg).<br/><br/>
<a href="cv.html" class="ai-section-link">📄 Open Full CV &rarr;</a>
<a href="#architecture" class="ai-section-link">🎬 View Live Studio Architecture &rarr;</a>`
        ],
        followupPool: [
          'Who is Rajeev Mutyalu and why should we hire him?',
          'Tell me about your 20-year engineering leadership and mentorship background',
          'What is Model Context Protocol (MCP) and how is it used in production?',
          'Explain your OpenUSD VFX pipeline architecture',
          'What is vibe coding and how do you use agentic AI systems?'
        ]
      },
      {
        id: 'mcp',
        keywords: ['mcp', 'model context protocol', 'mcp server', 'tooling', 'json-rpc', 'context bridges', 'api tool binding', 'anthropic mcp', 'tool schemas', 'custom mcp'],
        title: 'Model Context Protocol (MCP)',
        intros: [
          '🔌 <strong>MODEL CONTEXT PROTOCOL (MCP) // ARCHITECTURE SPEC</strong>',
          '⚡ <strong>ENTERPRISE AI TOOLING // MCP PROTOCOL BRIDGE</strong>',
          '🛠️ <strong>DCC &amp; DATABASE INTEGRATION // MCP SPECIFICATION</strong>'
        ],
        responses: [
          `• <strong>📌 What is it?</strong> An open, standardized JSON-RPC protocol created by Anthropic that allows AI models to dynamically discover, read, and invoke tools/resources from external studio applications.<br/>
• <strong>🎯 Where is it used?</strong> Connected directly to DCC applications (Maya, Houdini Solaris, Nuke), ShotGrid/Flow Production databases, file systems, and render farm queues.<br/>
• <strong>💡 Why is it used?</strong> LLMs inherently lack direct access to proprietary studio databases and internal file systems. MCP creates a secure, sandboxed bridge without writing custom API glue code for every new AI model.<br/>
• <strong>🚀 How it helps production:</strong> Enables AI agents to query live shot statuses, check asset dependencies, inspect USD stage composition arcs, and validate frames directly from natural language prompts with strict read-only security gates.<br/><br/>
<a href="#initiatives" class="ai-section-link">🚀 View MCP in Technical Arsenal &rarr;</a>`,

          `• <strong>🛡️ Sandboxed Security &amp; Air-Gapped Tool Binding:</strong><br/>
In visual effects, allowing cloud AI direct write access to storage is a critical security risk. Rajeev's MCP architecture enforces strict token-based read-only gates and schema validation.<br/>
• <strong>📦 JSON-RPC Contract:</strong> Exposes structured endpoints for asset queries, cut turnover validation, and render node health checks.<br/>
• <strong>🔌 DCC Connectors:</strong> AI agents can inspect active Houdini Solaris stage hierarchies or Nuke read nodes via localhost sockets without exposing file paths to public networks.<br/>
• <strong>⏱️ Zero Glue-Code Overhead:</strong> As new foundation models emerge, studio tools remain unchanged because MCP standardizes the communication layer.<br/><br/>
<a href="#initiatives" class="ai-section-link">🚀 Inspect MCP Server Stack &rarr;</a>`,

          `• <strong>🤖 Autonomous Agent Tool Execution:</strong><br/>
MCP acts as the nervous system connecting autonomous coding agents (Claude Code, Devin, custom subagents) to internal studio pipelines.<br/>
• <strong>🔍 Dynamic Tool Discovery:</strong> Agents automatically introspect available pipeline capabilities (e.g. <code>get_shot_status(shot_id)</code>, <code>inspect_usd_stage(stage_path)</code>, <code>query_transcode_queue()</code>).<br/>
• <strong>⚡ 10x Operational Speed:</strong> Technical Directors query complex multi-shot dependency trees in natural language and receive verified JSON-RPC responses in milliseconds.<br/><br/>
<a href="#architecture" class="ai-section-link">🎬 View Live Studio Architecture &rarr;</a>
<a href="cv.html" class="ai-section-link">📄 Open Executive CV &rarr;</a>`
        ],
        followupPool: [
          'How do you deploy On-Premise LLMs (Nous Hermes, Ollama) and OpenClaw agents?',
          'What is vibe coding and how do you use agentic AI systems?',
          'Explain your OpenUSD VFX pipeline architecture',
          'How does zero-touch n8n studio automation orchestrate pipelines?',
          'Who is Rajeev Mutyalu and why should we hire him?'
        ]
      },
      {
        id: 'vibe_coding',
        keywords: ['vibe coding', 'vibe code', 'vibe', 'agentic', 'agents', 'agent', 'claude code', 'antigravity', 'devin', 'swarms', 'autonomous coding', 'claude cowork', 'claude design', 'subagent'],
        title: 'Agentic AI & Vibe Coding',
        intros: [
          '🧠 <strong>AGENTIC AI &amp; FRONTIER VIBE CODING // SYSTEM SPEC</strong>',
          '⚡ <strong>HIGH-LEVERAGE SOFTWARE ENGINEERING // AGENTIC PARADIGM</strong>',
          '🚀 <strong>AUTONOMOUS CODE GENERATION &amp; VERIFICATION LOOPS</strong>'
        ],
        responses: [
          `• <strong>📌 What is it?</strong> A high-leverage engineering paradigm where software architects steer autonomous AI agents (Claude Code CLI, Google Antigravity, Devin) using natural language directives, architectural contracts, and automated verification loops.<br/>
• <strong>🎯 Where is it used?</strong> Full-stack pipeline engineering, UI development, API refactoring, test suite synthesis, and automated CI/CD workflows.<br/>
• <strong>💡 Why is it used?</strong> Eliminates repetitive manual boilerplate typing, allowing the Lead Architect to focus 100% on high-level system topology, data schemas, security boundaries, and edge cases.<br/>
• <strong>🚀 How it helps production:</strong> Accelerates feature delivery, tool prototyping, and bug remediation by <strong>5x–10x</strong> while enforcing enterprise code quality through automated test gates and human-in-the-loop architectural supervision.<br/><br/>
<a href="#initiatives" class="ai-section-link">🚀 Explore Agentic Stack in Arsenal &rarr;</a>`,

          `• <strong>🏗️ Architectural Supervision vs. Boilerplate Typing:</strong><br/>
Vibe coding in enterprise engineering is not haphazard guessing — it is the disciplined orchestration of AI subagent swarms against rigorous engineering specifications.<br/>
• <strong>🔒 Quality Control Loops:</strong> Every agentic output is backed by automated static analysis, lint verification, and unit test suites before merging.<br/>
• <strong>⚡ 10x Feature Velocity:</strong> Complex PyQt/PySide GUIs, FastAPI microservices, and database connectors that previously took weeks are scaffolded, refined, and hardened in hours.<br/>
• <strong>💎 Strategic Moat:</strong> Frees senior architects to solve deep mathematical and scalability challenges while agents handle mechanical implementation details.<br/><br/>
<a href="#initiatives" class="ai-section-link">🚀 View Agentic Workflows in Arsenal &rarr;</a>`,

          `• <strong>🤖 Subagent Swarms &amp; Antigravity Tooling:</strong><br/>
Rajeev utilizes state-of-the-art agentic tools including Google Antigravity, Claude Code, and custom subagent orchestration pipelines.<br/>
• <strong>📋 Contextual Architecture Prompts:</strong> Guides agents with strict type hints, dependency constraints, and enterprise security boundaries.<br/>
• <strong>🧪 Continuous Automated Verification:</strong> Incorporates headless browser testing and automated regression checks to guarantee bulletproof reliability.<br/><br/>
<a href="cv.html" class="ai-section-link">📄 Open Full Executive CV &rarr;</a>
<a href="#contact" class="ai-section-link">📬 Schedule a Technical Consultation &rarr;</a>`
        ],
        followupPool: [
          'What is Model Context Protocol (MCP) and how is it used in production?',
          'How do you deploy On-Premise LLMs (Nous Hermes, Ollama) and OpenClaw agents?',
          'Explain your OpenUSD VFX pipeline architecture',
          'Who is Rajeev Mutyalu and why should we hire him?'
        ]
      },
      {
        id: 'on_prem_llms',
        keywords: ['on-prem', 'on prem', 'quantization', 'local llm', 'ollama', 'vllm', 'gguf', 'awq', 'msty', 'lm studio', 'nous hermes', 'openclaw', 'security', 'privacy', 'open claw'],
        title: 'On-Premise LLMs & OpenClaw Agent Framework',
        intros: [
          '🔒 <strong>ON-PREMISE PRIVATE LLMS &amp; OPENCLAW // SECURITY SPEC</strong>',
          '🛡️ <strong>AIR-GAPPED STUDIO AI ARCHITECTURE // LOCAL INFERENCE</strong>',
          '⚡ <strong>QUANTIZED EDGE MODELS &amp; OPENCLAW RUNTIME</strong>'
        ],
        responses: [
          `• <strong>📌 What is it?</strong> Localized deployment of frontier open-weight models (Nous Hermes, Llama 3) inside air-gapped studio networks using 4-bit/8-bit quantization (GGUF, AWQ), orchestrated by Rajeev's upcoming <strong>OpenClaw</strong> agent framework.<br/>
• <strong>🎯 Where is it used?</strong> Private studio GPU compute nodes, local artist workstations, Ollama, and high-throughput vLLM inference clusters.<br/>
• <strong>💡 Why is it used?</strong> Movie studios have strict non-disclosure security requirements prohibiting proprietary scripts, prompts, and unreleased assets from reaching public cloud APIs.<br/>
• <strong>🚀 How it helps production:</strong> Reduces model GPU memory footprint by <strong>60%–75%</strong> while maintaining 98%+ reasoning precision. Delivers sub-50ms token generation locally with <strong>zero cloud data leakage</strong>.<br/><br/>
<a href="#initiatives" class="ai-section-link">🔒 View On-Premise LLMs in Arsenal &rarr;</a>`,

          `• <strong>🛡️ Strict Studio Non-Disclosure Compliance:</strong><br/>
Hollywood MPAA and TPN (Trusted Partner Network) security standards mandate that confidential pre-release content must never leave studio perimeter firewalls.<br/>
• <strong>⚡ 4-Bit/8-Bit Quantization:</strong> Models like Nous Hermes 70B and Llama 3 are quantized to GGUF and AWQ formats, allowing dense reasoning to run smoothly on standard studio workstations without expensive cloud subscriptions.<br/>
• <strong>🚀 vLLM High-Throughput Cluster:</strong> Batched inference pipelines delivering parallel token streaming across hundreds of artists simultaneously.<br/>
• <strong>🐾 OpenClaw Orchestration:</strong> Rajeev's custom agent runtime for sandboxed tool execution and local semantic retrieval.<br/><br/>
<a href="#initiatives" class="ai-section-link">🔒 Explore Private AI Architecture &rarr;</a>`,

          `• <strong>🐾 OpenClaw: The Air-Gapped Agent Framework:</strong><br/>
Engineered specifically for visual effects and gaming studios that require autonomous AI capabilities within completely disconnected local networks.<br/>
• <strong>💾 Local Embeddings &amp; Vector Search:</strong> Ingests internal studio documentation, Python codebase indices, and shot logs locally using ChromaDB/FAISS.<br/>
• <strong>⏱️ Zero Latency Bottlenecks:</strong> Sub-50ms token generation provides instant artist feedback for code generation, DCC script debugging, and metadata validation.<br/><br/>
<a href="cv.html" class="ai-section-link">📄 Open Executive CV &amp; Skills &rarr;</a>
<a href="#architecture" class="ai-section-link">🎬 Launch Architecture Visualizer &rarr;</a>`
        ],
        followupPool: [
          'What is Model Context Protocol (MCP) and how is it used in production?',
          'How does zero-touch n8n studio automation orchestrate pipelines?',
          'Explain your OpenUSD VFX pipeline architecture',
          'Who is Rajeev Mutyalu and why should we hire him?'
        ]
      },
      {
        id: 'openusd',
        keywords: ['usd', 'openusd', 'composition', 'solaris', 'hydra', 'sublayer', 'payload', 'stage', 'asset layering', 'shot composition', 'karma', 'materialx', 'astra vfx usd'],
        title: 'OpenUSD VFX Production Pipeline Architecture',
        intros: [
          '🎬 <strong>OPENUSD (UNIVERSAL SCENE DESCRIPTION) // PIPELINE SPEC</strong>',
          '🏗️ <strong>NON-DESTRUCTIVE 3D ARCHITECTURE // OPENUSD ENGINE</strong>',
          '📦 <strong>2-TIER ASSET &amp; SHOT COMPOSITION // USD STANDARD</strong>'
        ],
        responses: [
          `• <strong>📌 What is it?</strong> Pixar's open-source high-performance 3D scene description framework, file format, and composition engine for interchange across visual effects and animation.<br/>
• <strong>🎯 Where is it used?</strong> Core studio 3D pipeline across Maya, Houdini Solaris, Unreal Engine, and Hydra renderers (Karma, Arnold, RenderMan).<br/>
• <strong>💡 Why is it used?</strong> Monolithic scene files create multi-department bottlenecks. OpenUSD allows dozens of artists across Modeling, Groom, LookDev, Animation, and Lighting to collaborate simultaneously without overwriting data.<br/>
• <strong>🚀 How it helps production:</strong> Rajeev's <strong>2-Tier Architecture</strong> separates modular Asset Publishing from non-destructive Shot Sublayering (SH0010). Geometry is referenced via payloads with zero file bloat and sub-second shot load times.<br/><br/>
<a href="#architecture" data-arch-tab="usd" class="ai-section-link">🎬 Launch Interactive USD Architecture Visualizer &rarr;</a>`,

          `• <strong>🏗️ Rajeev's 2-Tier Modular USD Architecture:</strong><br/>
• <strong>Tier 1 — Asset Publishing:</strong> Departmental isolation across Modeling, Groom, LookDev, and Rigging with LOD variants, published into unified, renderable USD packages.<br/>
• <strong>Tier 2 — Shot Composition:</strong> Non-destructive sublayer stack (Layout &rarr; Animation &rarr; Simulation &rarr; FX &rarr; Lighting) authoring scoped opinions into master shot compositions (SH0010).<br/>
• <strong>⚡ Payload Referencing:</strong> Heavy geometry and volumetrics remain un-loaded until render time, keeping artist interactive viewport frame rates at 60 FPS.<br/>
• <strong>📦 Ingest &amp; Plate Sublayers:</strong> Manifest-driven plate architecture composed cleanly under Ayon backend integration.<br/><br/>
<a href="#architecture" data-arch-tab="usd" class="ai-section-link">🎬 Inspect USD Pipeline Node Graph &rarr;</a>`,

          `• <strong>🎬 Multi-Department Concurrency &amp; Hydra Viewports:</strong><br/>
Traditional studio pipelines suffer from massive file merge locks when multiple departments touch the same shot. OpenUSD resolves this through strength-ordered composition arcs.<br/>
• <strong>🎨 Houdini Solaris &amp; MaterialX:</strong> Live interactive look-development with real-time Karma and Arnold Hydra delegates.<br/>
• <strong>🐍 Python 3.x USD API:</strong> Custom Python stage authoring scripts to programmatically construct master sequences, override prim attributes, and validate stage integrity before dispatch.<br/><br/>
<a href="cv.html" class="ai-section-link">📄 Open Full CV &amp; USD Projects &rarr;</a>
<a href="#conform" class="ai-section-link">📦 View Conform Ingest Pipeline &rarr;</a>`
        ],
        followupPool: [
          'How does your Conform Ingest and editorial turnover pipeline work?',
          'Tell me about OpenTimelineIO (OTIO) and OpenColorIO (OCIO) standards',
          'How does zero-touch n8n studio automation orchestrate pipelines?',
          'What is Model Context Protocol (MCP) and how is it used in production?',
          'Who is Rajeev Mutyalu and why should we hire him?'
        ]
      },
      {
        id: 'otio_ocio',
        keywords: ['otio', 'opentimelineio', 'ocio', 'opencolorio', 'aces', 'acescg', 'color pipeline', 'editorial standards', 'lut', 'cdl'],
        title: 'OpenTimelineIO & OpenColorIO (ACES)',
        intros: [
          '📦 <strong>OPEN STANDARDS // OTIO TIMELINE &amp; OCIO/ACES COLOR</strong>',
          '🎞️ <strong>EDITORIAL SYNCHRONIZATION // OPEN COLOR SCIENCE</strong>',
          '🎨 <strong>STUDIO CONFORM &amp; COLOR PIPELINE SPECIFICATION</strong>'
        ],
        responses: [
          `• <strong>📌 What is it?</strong> Industry-standard open-source interchange formats for editorial timelines (OTIO) and scientific color management (OCIO / ACEScg).<br/>
• <strong>🎯 Where is it used?</strong> Editorial cut turnovers, dailies review systems, Nuke studio compositing, and DI grade color transforms.<br/>
• <strong>💡 Why is it used?</strong> Proprietary EDLs, XMLs, and custom LUTs cause cut mismatches, missing audio/video tracks, and color shifts between editorial and VFX.<br/>
• <strong>🚀 How it helps production:</strong> Guarantees 100% frame-accurate cut synchronization across Hiero/Nuke Studio, tracks VFX plate metadata at the track level, and ensures strict ACEScg color fidelity from camera raw to final theatrical master.<br/><br/>
<a href="#conform" class="ai-section-link">📦 Jump to Conform Ingest &amp; Editorial Turnover &rarr;</a>`,

          `• <strong>🎨 Mathematically Rigorous Color Science (ACEScg &amp; OCIO v2):</strong><br/>
• <strong>🌈 Wide Gamut Integrity:</strong> Standardizes on ACEScg for rendering and compositing, preserving dynamic range and spectral color information across camera packages (ARRI RAW, RED, Sony Venice).<br/>
• <strong>🔍 Track-Level Metadata:</strong> Embeds CDL (Color Decision List) offsets, camera color spaces, and shot frame ranges directly inside OpenTimelineIO schemas.<br/>
• <strong>⚡ Automated Nuke Configs:</strong> Ingest pipelines parse OTIO tracks and auto-generate Nuke scripts with pre-configured OCIO color nodes, saving hundreds of artist hours.<br/><br/>
<a href="#conform" class="ai-section-link">📦 Open Editorial Conform Pipeline &rarr;</a>`,

          `• <strong>🎞️ Modern Editorial Interchange vs. Fragile EDLs:</strong><br/>
Legacy CMX3600 EDLs truncate clip names to 8 characters and strip audio tracks. OTIO stores rich Python-accessible schemas for every cut transition, retime, and effect.<br/>
• <strong>🔄 Bidirectional Cut Conform:</strong> Instantly compares client turnover XMLs with studio databases to flag slipped cuts, resized plates, or head/tail frame discrepancies.<br/>
• <strong>🚀 99.4% Automated Conform Rate:</strong> Implemented across major blockbuster productions to ensure DI master conformity.<br/><br/>
<a href="cv.html" class="ai-section-link">📄 Open Executive CV &rarr;</a>
<a href="#architecture" class="ai-section-link">🎬 Launch Pipeline Visualizer &rarr;</a>`
        ],
        followupPool: [
          'How does your Conform Ingest and editorial turnover pipeline work?',
          'Explain your OpenUSD VFX pipeline architecture',
          'How does zero-touch n8n studio automation orchestrate pipelines?',
          'Who is Rajeev Mutyalu and why should we hire him?'
        ]
      },
      {
        id: 'n8n_automation',
        keywords: ['n8n', 'automation', 'webhook', 'webhooks', 'reverse webhook', 'event-driven', 'event routing', 'dispatch', 'zero-touch', 'reverse webhooks'],
        title: 'Zero-Touch n8n Studio Automation',
        intros: [
          '⚡ <strong>ZERO-TOUCH STUDIO AUTOMATION // N8N WORKFLOW HUB</strong>',
          '🔄 <strong>EVENT-DRIVEN DISPATCH &amp; REVERSE WEBHOOKS</strong>',
          '🚀 <strong>ENTERPRISE PIPELINE ORCHESTRATION // N8N CORE</strong>'
        ],
        responses: [
          `• <strong>📌 What is it?</strong> An event-driven, visual workflow automation hub utilizing bidirectional inbound webhooks and reverse webhooks to connect studio tools.<br/>
• <strong>🎯 Where is it used?</strong> Automated project onboarding, editorial plate ingest, render farm dispatch, and team messaging sync (Slack/Teams).<br/>
• <strong>💡 Why is it used?</strong> Traditional cron polling scripts poll databases every few minutes, creating massive database load and delayed notifications.<br/>
• <strong>🚀 How it helps production:</strong> Reacts instantaneously to studio events (e.g. editorial file drops or ShotGrid approvals), validates file integrity, initiates background farm jobs, and pushes real-time status alerts without human intervention.<br/><br/>
<a href="#architecture" data-arch-tab="automation" class="ai-section-link">⚡ View n8n Flow in Pipeline Visualizer &rarr;</a>`,

          `• <strong>🔄 Bidirectional Webhook Architecture:</strong><br/>
• <strong>Inbound Webhooks:</strong> Listens for editorial turnovers, ShotGrid version status changes, or artist publish events.<br/>
• <strong>Logic &amp; Branching Engine:</strong> Executes Python validation scripts, checks disk quotas, verifies color metadata, and constructs render farm job manifests.<br/>
• <strong>Reverse Webhooks:</strong> Sends callbacks back to studio dashboards, Slack channels, and production databases with verified delivery receipts.<br/>
• <strong>⏱️ Sub-Second Response:</strong> Eliminates human waiting time and manual file shuffling entirely.<br/><br/>
<a href="#architecture" data-arch-tab="automation" class="ai-section-link">⚡ Inspect n8n Node Topology &rarr;</a>`,

          `• <strong>🚀 Zero-Touch Pipeline Onboarding &amp; QC:</strong><br/>
• <strong>📁 Automated Project Scaffolding:</strong> Automatically sets up directory structures, permission groups, and initial shot hierarchies upon project creation.<br/>
• <strong>🔍 Automated Plate QC:</strong> Validates frame padding, aspect ratios, and EXR compression headers before artists even open their DCCs.<br/>
• <strong>📊 Production ROI:</strong> Reduces shot turnover turnaround time from hours to under 60 seconds.<br/><br/>
<a href="cv.html" class="ai-section-link">📄 Open Executive CV &rarr;</a>
<a href="#initiatives" class="ai-section-link">🚀 Explore Technical Arsenal &rarr;</a>`
        ],
        followupPool: [
          'How does your Conform Ingest and editorial turnover pipeline work?',
          'Tell me about GenAI video pipelines with Veo, Kling, and Studio.AI',
          'What is Model Context Protocol (MCP) and how is it used in production?',
          'Who is Rajeev Mutyalu and why should we hire him?'
        ]
      },
      {
        id: 'voice_ai',
        keywords: ['voice', 'retell', 'vapi', 'cal.ai', 'telephony', 'speech', 'conversational voice', 'voice ai', 'voice agent'],
        title: 'Conversational Voice AI (Retell AI & Vapi)',
        intros: [
          '🎙️ <strong>CONVERSATIONAL VOICE AI // TELEPHONY &amp; SPEECH SPECS</strong>',
          '🔊 <strong>REAL-TIME VOICE AGENT PIPELINE // RETELL &amp; VAPI</strong>',
          '⚡ <strong>LOW-LATENCY VOICE INTERFACES FOR PRODUCTION</strong>'
        ],
        responses: [
          `• <strong>📌 What is it?</strong> Ultra-low-latency real-time voice synthesis and conversational AI pipelines with bidirectional live speech recognition.<br/>
• <strong>🎯 Where is it used?</strong> Hands-free studio supervisor voice interfaces, mobile review calls, and automated review session booking with Cal.ai.<br/>
• <strong>💡 Why is it used?</strong> Supervisors and executives reviewing shots on calibrated monitors need fast pipeline information without having to switch windows or type on keyboards.<br/>
• <strong>🚀 How it helps production:</strong> Delivers sub-400ms voice round-trip response times, dynamically injecting live production schedules and shot metadata so leads can query asset statuses and schedule dailies via natural voice.<br/><br/>
<a href="#contact" class="ai-section-link">📬 Connect for a Live Voice AI Demo &rarr;</a>`,

          `• <strong>🎙️ Sub-400ms Real-Time Voice Pipelines:</strong><br/>
• <strong>⚡ WebRTC Streaming:</strong> Full-duplex bidirectional audio streaming engineered with Retell AI and Vapi for zero perceptible latency.<br/>
• <strong>📅 Cal.ai Automated Scheduling:</strong> Voice agents automatically query production calendar availabilities and book supervisory review sessions directly.<br/>
• <strong>🎯 Hands-Free Studio Workflow:</strong> VFX Supervisors can query shot delivery ETAs, farm render bottlenecks, and artist allocations entirely through voice during dailies sessions.<br/><br/>
<a href="#initiatives" class="ai-section-link">🚀 View Voice AI in Arsenal &rarr;</a>`,

          `• <strong>🔊 Conversational Telephony &amp; Studio Assistants:</strong><br/>
• <strong>🧠 Dynamic Tool Ingestion:</strong> Connects voice LLMs to live studio APIs (ShotGrid, render farm queues) via function calling.<br/>
• <strong>🔒 Voice Security &amp; Gatekeeping:</strong> Restricts sensitive asset inspection to verified production leads.<br/>
• <strong>🚀 Applied Production Innovation:</strong> Demonstrating how cutting-edge voice models remove friction from modern creative workflows.<br/><br/>
<a href="cv.html" class="ai-section-link">📄 Open Executive CV &rarr;</a>
<a href="#contact" class="ai-section-link">📬 Contact Rajeev Directly &rarr;</a>`
        ],
        followupPool: [
          'What is vibe coding and how do you use agentic AI systems?',
          'How do you deploy On-Premise LLMs (Nous Hermes, Ollama) and OpenClaw agents?',
          'Tell me about GenAI video pipelines with Veo, Kling, and Studio.AI',
          'Who is Rajeev Mutyalu and why should we hire him?'
        ]
      },
      {
        id: 'genai_video',
        keywords: ['video', 'veo', 'google veo', 'kling', 'higgsfield', 'seedance', 'scene weaver', 'studio.ai', 'genai video', 'latent', 'firecrawl', 'generative video'],
        title: 'GenAI Video Production & Studio.AI (Scene Weaver)',
        intros: [
          '🎥 <strong>STUDIO.AI (SCENE WEAVER) // PROMPT-TO-VIDEO PLATFORM</strong>',
          '🎬 <strong>GENERATIVE VIDEO PRODUCTION // MULTI-MODEL ROUTING</strong>',
          '✨ <strong>LATENT CONSISTENCY &amp; STUDIO INGEST ENGINE</strong>'
        ],
        responses: [
          `• <strong>📌 What is it?</strong> An enterprise multi-model generative AI platform for feature film storyboarding, visual development, and shot synthesis.<br/>
• <strong>🎯 Where is it used?</strong> Previsualization, concept ideation, multi-model prompt routing (Google Veo, Kling AI, Higgsfield), and web asset extraction via FireCrawl.<br/>
• <strong>💡 Why is it used?</strong> Out-of-the-box video models produce inconsistent character faces, unstable wardrobe details, and non-standard color spaces.<br/>
• <strong>🚀 How it helps production:</strong> Enforces character latent identity consistency across video shots, automates prompt generation from screenplays, and conformed outputs directly into OCIO/ACEScg for Nuke compositing.<br/><br/>
<a href="#architecture" data-arch-tab="genai" class="ai-section-link">✨ View GenAI Flow in Pipeline Visualizer &rarr;</a>`,

          `• <strong>🎥 Scene Weaver: Solving Character Visual DNA Consistency:</strong><br/>
• <strong>🧬 Persistent Latent Identity:</strong> Uses specialized reference vectors and LoRA embeddings so characters and environments remain identical across sequential camera shots.<br/>
• <strong>🔄 Multi-Model Prompt Router:</strong> Automatically routes prompts to Google Veo for cinematic lighting, Kling for complex human dynamics, and Seedance for atmospheric FX.<br/>
• <strong>📦 Automated Color Conform:</strong> Transcodes 8-bit sRGB AI video generations into 16-bit float ACEScg EXRs with matching frame rates and editorial handles.<br/><br/>
<a href="#architecture" data-arch-tab="genai" class="ai-section-link">✨ Inspect Scene Weaver Architecture &rarr;</a>`,

          `• <strong>🎬 Script-to-Screenplay Automated Ideation:</strong><br/>
• <strong>📜 Script Ingest:</strong> Ingests screenplays and storyboards, breaking text down into camera lens directives, lighting keys, and character blocking instructions.<br/>
• <strong>🕷️ FireCrawl Ingest:</strong> Scrapes reference imagery and visual moodboards to establish stylistic DNA.<br/>
• <strong>🚀 Seamless Nuke &amp; Editorial Turnover:</strong> Outputs conform cleanly into OTIO timelines for instant editorial review.<br/><br/>
<a href="cv.html" class="ai-section-link">📄 Open Executive CV &rarr;</a>
<a href="#initiatives" class="ai-section-link">🚀 Explore Technical Arsenal &rarr;</a>`
        ],
        followupPool: [
          'Explain your OpenUSD VFX pipeline architecture',
          'How does zero-touch n8n studio automation orchestrate pipelines?',
          'How do you deploy On-Premise LLMs (Nous Hermes, Ollama) and OpenClaw agents?',
          'Who is Rajeev Mutyalu and why should we hire him?'
        ]
      },
      {
        id: 'core_python_ui',
        keywords: ['python', 'pyqt', 'pyside', 'docker', 'containers', 'linux', 'shell', 'fastapi', 'rest', 'git', 'ui systems', 'software engineering', 'pyside6', 'qt'],
        title: 'Core Software, Python & PySide UI Systems',
        intros: [
          '🐍 <strong>CORE SOFTWARE ENGINEERING // PYTHON &amp; PYSIDE UI</strong>',
          '💻 <strong>DESKTOP TOOLING &amp; CLUSTER INFRASTRUCTURE</strong>',
          '🛠️ <strong>PRODUCTION SOFTWARE ARCHITECTURE // PYTHON 3.X</strong>'
        ],
        responses: [
          `• <strong>📌 What is it?</strong> Foundational software engineering stack: Python 3.x, Qt/PySide desktop GUIs, FastAPI microservices, Docker containers, and Linux cluster dispatch.<br/>
• <strong>🎯 Where is it used?</strong> In-DCC artist tools (Maya, Houdini, Nuke), standalone desktop review applications, and studio backend microservices.<br/>
• <strong>💡 Why is it used?</strong> Artists require responsive, multi-threaded desktop user interfaces that handle large datasets without freezing or crashing DCC viewports.<br/>
• <strong>🚀 How it helps production:</strong> 20+ years of architecting scalable, rock-solid desktop tools and modular Python libraries supporting hundreds of active studio artists across London and Bangalore with zero downtime.<br/><br/>
<a href="#initiatives" class="ai-section-link">🐍 View Core Systems in Arsenal &rarr;</a>`,

          `• <strong>💻 High-Performance PySide Desktop Tools:</strong><br/>
• <strong>🧵 Multi-Threaded Architecture:</strong> Offloads heavy I/O, hash computations, and thumbnail rendering to background QThread workers to ensure zero UI freeze.<br/>
• <strong>📦 Modular Python Packages:</strong> Architected centralized Python packages distributed via Rez/Venv across global studio facilities.<br/>
• <strong>🐳 Microservices &amp; Containers:</strong> Deploys FastAPI services inside lightweight Docker containers on Linux for asset validation and transcode dispatch.<br/><br/>
<a href="#initiatives" class="ai-section-link">🐍 Inspect Python Systems in Arsenal &rarr;</a>`,

          `• <strong>🚀 20 Years of Mission-Critical Code Reliability:</strong><br/>
• <strong>🧪 Rigorous Automated Testing:</strong> Pytest suites, continuous integration, and strict PEP 8 / type annotation standards.<br/>
• <strong>🐧 Linux Cluster Native:</strong> Deep familiarity with POSIX file systems, NFS caching, permissions, and headless batch processing.<br/>
• <strong>👥 Mentorship:</strong> Trained dozens of junior and mid-level TDs in modern object-oriented Python, Qt design patterns, and asynchronous I/O.<br/><br/>
<a href="cv.html" class="ai-section-link">📄 Open Executive CV &rarr;</a>
<a href="#contact" class="ai-section-link">📬 Get in Touch &rarr;</a>`
        ],
        followupPool: [
          'Explain your OpenUSD VFX pipeline architecture',
          'What is Model Context Protocol (MCP) and how is it used in production?',
          'Tell me about your 20-year engineering leadership and mentorship background',
          'Who is Rajeev Mutyalu and why should we hire him?'
        ]
      },
      {
        id: 'conform_ingest',
        keywords: ['conform', 'ingest', 'turnover', 'editorial', 'di', 'discrepancy', 'plate', 'regex', 'hiero', 'nuke studio', 'shotgrid', 'turnover inspection', 'vfx io', 'i/o'],
        title: 'Editorial Turnover, Conform & Ingest Systems',
        intros: [
          '📦 <strong>EDITORIAL CONFORM &amp; INGEST // SYSTEM SPECIFICATION</strong>',
          '🎞️ <strong>VFX PLATE I/O &amp; DI DISCREPANCY REPORTING</strong>',
          '🔍 <strong>AUTOMATED TURNOVER PACKAGE INSPECTION ENGINE</strong>'
        ],
        responses: [
          `• <strong>📌 What is it?</strong> Automated systems that ingest editorial turnover packages (AAF, XML, EDL, QuickTimes, raw plates) and validate them against studio databases.<br/>
• <strong>🎯 Where is it used?</strong> Ingest departments, editorial turnover stations, automated transcoding render farms, and ShotGrid synchronization.<br/>
• <strong>💡 Why is it used?</strong> High-budget tentpole films receive thousands of cut changes. Manual ingest is extremely slow and prone to costly frame discrepancies during final DI conform.<br/>
• <strong>🚀 How it helps production:</strong> Performs automated turnover package inspection, instant DI discrepancy reporting back to client editorial, dynamic regex camera metadata extraction, and automatic proxy creation with a <strong>99.4% automated pass rate</strong>.<br/><br/>
<a href="#conform" class="ai-section-link">📦 Launch Conform Ingest &amp; Editorial Turnover Pipeline &rarr;</a>`,

          `• <strong>🔍 Automated Turnover Inspection &amp; DI Discrepancy Reporting:</strong><br/>
• <strong>📋 Instant Discrepancy Reports:</strong> Automatically parses client XML/EDL cuts against raw EXR timecodes to flag missing frames, slipped cuts, or non-standard frame rates before assets reach artist disks.<br/>
• <strong>🧩 Dynamic Regex Parser:</strong> Extracts reel names, camera roll, shoot date, and shot codes from complex multi-vendor naming conventions.<br/>
• <strong>⚡ 99.4% Pass Rate:</strong> Eliminates human error on tentpole feature deliveries.<br/><br/>
<a href="#conform" class="ai-section-link">📦 Launch Conform Pipeline View &rarr;</a>`,

          `• <strong>📦 VFX Plate Ingest &amp; Proxy Automation:</strong><br/>
• <strong>🎞️ Automated Blade/Farm Dispatch:</strong> Ingests raw camera footage, generates half-res QuickTime proxies, extracts audio stems, and publishes ShotGrid versions with zero manual clicks.<br/>
• <strong>🔄 OTIO Synchronization:</strong> Transcribes cut changes into OpenTimelineIO tracks for Nuke Studio conform.<br/>
• <strong>💎 Proven on Blockbusters:</strong> Battle-tested across <em>1917, RRR, Mufasa: The Lion King, Back in Action, Spaceman, Prehistoric Planet</em>.<br/><br/>
<a href="cv.html" class="ai-section-link">📄 Open Full Executive CV &rarr;</a>
<a href="#architecture" class="ai-section-link">🎬 Launch Pipeline Visualizer &rarr;</a>`
        ],
        followupPool: [
          'How does zero-touch n8n studio automation orchestrate pipelines?',
          'Tell me about OpenTimelineIO (OTIO) and OpenColorIO (OCIO) standards',
          'Explain your OpenUSD VFX pipeline architecture',
          'Who is Rajeev Mutyalu and why should we hire him?'
        ]
      },
      {
        id: 'leadership_career',
        keywords: ['career', 'experience', 'timeline', 'background', 'credits', 'films', 'filmography', '1917', 'rrr', 'lion king', 'mufasa', 'back in action', 'spaceman', 'prehistoric planet', 'leadership', 'mentorship', 'r&d', 'management', 'agile', 'scrum', 'technicolor', 'mpc', 'astra'],
        title: 'Engineering Leadership & 20-Year Milestones',
        intros: [
          '👥 <strong>20-YEAR ENGINEERING LEADERSHIP // FILM CREDITS &amp; TENURES</strong>',
          '🏆 <strong>OSCAR-WINNING FILMOGRAPHY &amp; LEADERSHIP TRACK RECORD</strong>',
          '🌐 <strong>GLOBAL R&amp;D LEADERSHIP // LONDON &amp; BANGALORE</strong>'
        ],
        responses: [
          `• <strong>📌 Leadership Background:</strong> Lead Software Architect &amp; Creative Technologist based in London, UK (British Citizen) with <strong>20+ years of Tier-1 leadership</strong> across global visual effects studios.<br/>
• <strong>🎯 Verified Studio Tenures:</strong><br/>
&nbsp;&nbsp;• <strong>Astra Studios</strong> (London, UK) &mdash; Lead Software Architect (Sep 2025 &ndash; Present)<br/>
&nbsp;&nbsp;• <strong>Technicolor Group</strong> (London, UK) &mdash; R&amp;D Supervisor (Mar 2023 &ndash; Feb 2025)<br/>
&nbsp;&nbsp;• <strong>Technicolor Group</strong> (Bengaluru, India) &mdash; R&amp;D Supervisor (Jan 2022 &ndash; Feb 2023)<br/>
&nbsp;&nbsp;• <strong>MPC Film</strong> (Bengaluru, India) &mdash; Lead Pipeline Software Developer (Jul 2017 &ndash; Dec 2021)<br/>
&nbsp;&nbsp;• <strong>Technicolor</strong> (Bengaluru, India) &mdash; Team Lead &ndash; Technology &amp; R&amp;D Production (Jul 2012 &ndash; Jun 2017)<br/>
&nbsp;&nbsp;• <strong>Technicolor</strong> (Bengaluru / Los Angeles / Hannover) &mdash; Senior Software Engineer (May 2008 &ndash; Jun 2012)<br/>
&nbsp;&nbsp;• <strong>e4e &amp; Dhruva Interactive</strong> (Bengaluru, India) &mdash; Application Engineer &amp; Game Programmer (Sep 2006 &ndash; Apr 2008)<br/>
• <strong>💡 Major Film &amp; Tentpole Credits:</strong><br/>
&nbsp;&nbsp;• <strong>1917 (2019)</strong> &mdash; 🏆 Academy Award Winner: Best Visual Effects (MPC Film)<br/>
&nbsp;&nbsp;• <strong>RRR (2022)</strong> &mdash; 🏆 Academy Award Winner &amp; Global Phenomenon<br/>
&nbsp;&nbsp;• <strong>Mufasa: The Lion King (2024)</strong> &mdash; Disney Live-Action Feature<br/>
&nbsp;&nbsp;• <strong>Back in Action (2025)</strong> &mdash; Netflix Feature Production<br/>
&nbsp;&nbsp;• <strong>Spaceman (2024)</strong> &mdash; Sci-Fi Feature Production<br/>
&nbsp;&nbsp;• <strong>Prehistoric Planet (2022&ndash;2023)</strong> &mdash; Apple TV+ Natural History Landmark Series<br/><br/>
<a href="#films" class="ai-section-link">🏆 Browse Oscar-Winning Filmography &amp; Credits &rarr;</a>
<a href="cv.html" class="ai-section-link">📄 Open Full Executive CV &amp; Timeline &rarr;</a>`,

          `• <strong>🏆 Verified Filmography &amp; Production Pedigree:</strong><br/>
• <strong>1917 (2019):</strong> 🏆 Academy Award for Best Visual Effects &mdash; engineered core 2D Nuke pipeline and review architecture at MPC Film enabling seamless continuous-take shot assembly.<br/>
• <strong>RRR (2022):</strong> 🏆 Academy Award Winner &mdash; high-throughput visual effects execution, creature dynamics, and multi-facility shot delivery.<br/>
• <strong>Mufasa: The Lion King (2024):</strong> Disney Live-Action Feature &mdash; photorealistic digital cinematography, massive environments, and advanced review/comp toolsets.<br/>
• <strong>Back in Action (2025):</strong> Netflix Feature &mdash; high-energy VFX execution, plate ingestion conform, and automated review workflows.<br/>
• <strong>Spaceman (2024):</strong> Sci-Fi Drama &mdash; photorealistic creature integration and atmospheric cosmic environment pipelines.<br/>
• <strong>Prehistoric Planet (2022&ndash;2023):</strong> Apple TV+ Landmark Series &mdash; natural history VFX pipeline, live-action plate integration, and high-resolution review frameworks.<br/><br/>
<a href="#films" class="ai-section-link">🏆 View Filmography Gallery &rarr;</a>
<a href="cv.html" class="ai-section-link">📄 Open Executive CV &rarr;</a>`,

          `• <strong>👥 Mentorship, High-Trust Culture &amp; Agile Engineering:</strong><br/>
• <strong>Sprint Excellence:</strong> Led multi-disciplinary teams through high-stakes delivery cycles with predictable sprint velocity and zero production crunch.<br/>
• <strong>Cross-Continental Bridge:</strong> Successfully aligned London, Montreal, and Bangalore engineering hubs to operate as a unified, collaborative development engine.<br/>
• <strong>Architectural Evolution:</strong> Led studio modernization from monolithic legacy scripts to modular OpenUSD, MCP tooling, and automated CI/CD.<br/><br/>
<a href="cv.html" class="ai-section-link">📄 Open Full Executive CV &rarr;</a>
<a href="#contact" class="ai-section-link">📬 Direct Contact Matrix &rarr;</a>`
        ],
        followupPool: [
          'Who is Rajeev Mutyalu and why should we hire him?',
          'Tell me about your 20-year engineering leadership and mentorship background',
          'What is Model Context Protocol (MCP) and how is it used in production?',
          'Explain your OpenUSD VFX pipeline architecture',
          'How does zero-touch n8n studio automation orchestrate pipelines?'
        ]
      },
      {
        id: 'certifications_credentials',
        keywords: ['certificate', 'certificates', 'certification', 'certifications', 'credential', 'credentials', 'certifications_credentials', 'outskill', 'ai generalist', 'hackathon', 'hackathons', 'accelerator', 'upskilling', 'training', 'fellowship', 'awards', 'qualification', 'qualifications'],
        title: 'Frontier AI Certifications & Industry Fellowships',
        intros: [
          '📜 <strong>VERIFIED CERTIFICATIONS &amp; ACCELERATOR CREDENTIALS</strong>',
          '🎓 <strong>FRONTIER AI ACCELERATOR &amp; HACKATHON RECOGNITION</strong>',
          '🏆 <strong>INDUSTRY CREDENTIALS &amp; CONTINUOUS UPSKILLING</strong>'
        ],
        responses: [
          `• <strong>🎓 AI Generalist Accelerator Program (Outskill &bull; Aug 2026):</strong><br/>
14-Day Intensive Generative AI Accelerator mastering practical automation, MCP server tool deployment, AI agent systems, and no-code product development.<br/>
&nbsp;&nbsp;• <strong>Validated Competencies:</strong> Prompt Engineering, Workflow Automation using n8n, MCP Integration &amp; Deployment, Voice Agent Orchestration (Retell/Vapi), Multimodal AI &amp; Cloning, No-Code Product Development.<br/>
&nbsp;&nbsp;• <a href="docs/Rajeev-Mutyalu-AI-Generalist-certificate.pdf" target="_blank" class="ai-section-link">📄 Open Verified AI Generalist Certificate (PDF) &rarr;</a><br/><br/>
• <strong>⚡ Outskill AI Accelerator C13 Hackathon 2026 (2-Day Innovation Challenge):</strong><br/>
Awarded for rapid prototyping, creativity, and deployment of functional generative AI application architectures.<br/>
&nbsp;&nbsp;• <a href="docs/Rajeev-Mutyalu-hackathon-certificate.pdf" target="_blank" class="ai-section-link">⚡ Open Verified Hackathon Award (PDF) &rarr;</a><br/><br/>
<a href="cv.html" class="ai-section-link">📄 Open Full Executive CV &amp; Credentials &rarr;</a>
<a href="#awards" class="ai-section-link">🏆 View Honors &amp; Awards Matrix &rarr;</a>`,

          `• <strong>📜 Verified Modern AI Credentials &amp; Fellowships:</strong><br/>
• <strong>AI Generalist Accelerator (Outskill):</strong> Certified in hands-on MCP integration, n8n webhook automation, voice agent orchestration, and multimodal generative AI platforms.<br/>
• <strong>AI Hackathon 2026 Award:</strong> Recognized for rapid prototyping and live deployment under 48-hour challenge conditions.<br/>
• <strong>Technicolor Fellowship Network (2015&ndash;2025):</strong> Elected Associate Member for technical innovation, production leadership, and cross-site R&amp;D stewardship.<br/><br/>
<a href="docs/Rajeev-Mutyalu-AI-Generalist-certificate.pdf" target="_blank" class="ai-section-link">📄 View AI Generalist Certificate &rarr;</a>
<a href="docs/Rajeev-Mutyalu-hackathon-certificate.pdf" target="_blank" class="ai-section-link">⚡ View Hackathon Award &rarr;</a>`
        ],
        followupPool: [
          'Who is Rajeev Mutyalu and why should we hire him?',
          'What is Model Context Protocol (MCP) and how is it used in production?',
          'How does zero-touch n8n studio automation orchestrate pipelines?',
          'Tell me about your 20-year engineering leadership and mentorship background'
        ]
      },
      {
        id: 'contact_info',
        keywords: ['contact', 'email', 'phone', 'linkedin', 'reach', 'message', 'hire contact', 'call', 'location', 'london'],
        title: 'Direct Contact Matrix',
        intros: [
          '📬 <strong>DIRECT CONTACT MATRIX // RAJEEV MUTYALU</strong>',
          '🤝 <strong>GET IN TOUCH // LONDON, UNITED KINGDOM</strong>',
          '💼 <strong>EXECUTIVE CONSULTATION &amp; RECRUITING MATRIX</strong>'
        ],
        responses: [
          `• <strong>📍 Location:</strong> London, United Kingdom (British Citizen)<br/>
• <strong>📧 Email:</strong> <a href="mailto:mutyalu.rajeev@gmail.com" style="color:#38bdf8; font-weight:700;">mutyalu.rajeev@gmail.com</a><br/>
• <strong>📱 Phone:</strong> <a href="tel:+447827498399" style="color:#38bdf8; font-weight:700;">+44 7827 498399</a><br/>
• <strong>💼 LinkedIn:</strong> <a href="https://www.linkedin.com/in/rajeevmuthyalu/" target="_blank" style="color:#38bdf8; text-decoration:underline;">linkedin.com/in/rajeevmuthyalu</a><br/><br/>
<a href="#contact" class="ai-section-link">📬 Open Direct Contact Matrix &rarr;</a>`,

          `• <strong>🚀 Available for Lead Architecture &amp; Director Roles:</strong><br/>
• <strong>📍 Base:</strong> London, UK (Available for London onsite, hybrid, and global executive remote opportunities)<br/>
• <strong>📧 Direct Inbox:</strong> <a href="mailto:mutyalu.rajeev@gmail.com" style="color:#38bdf8; font-weight:700;">mutyalu.rajeev@gmail.com</a><br/>
• <strong>📱 Direct Line:</strong> <a href="tel:+447827498399" style="color:#38bdf8; font-weight:700;">+44 7827 498399</a><br/>
• <strong>💼 Professional Network:</strong> <a href="https://www.linkedin.com/in/rajeevmuthyalu/" target="_blank" style="color:#38bdf8; text-decoration:underline;">Connect on LinkedIn &rarr;</a><br/><br/>
<a href="cv.html" class="ai-section-link">📄 Open 1-Click ATS Resume &rarr;</a>`,

          `• <strong>💬 Fast-Track Communication:</strong><br/>
Feel free to email or message Rajeev directly regarding Lead Pipeline Architecture, Applied AI Systems, OpenUSD implementations, or executive technical advisory.<br/>
• <strong>📧 Email:</strong> <a href="mailto:mutyalu.rajeev@gmail.com" style="color:#38bdf8; font-weight:700;">mutyalu.rajeev@gmail.com</a><br/>
• <strong>📱 Mobile:</strong> <a href="tel:+447827498399" style="color:#38bdf8; font-weight:700;">+44 7827 498399</a> (UK)<br/>
• <strong>📄 Plaintext ATS Resume:</strong> Available for instant 1-click clipboard export on the CV page.<br/><br/>
<a href="cv.html" class="ai-section-link">📄 Open Executive CV &amp; Bio &rarr;</a>`
        ],
        followupPool: [
          'Who is Rajeev Mutyalu and why should we hire him?',
          'Tell me about your 20-year engineering leadership and mentorship background',
          'What is Model Context Protocol (MCP) and how is it used in production?',
          'Explain your OpenUSD VFX pipeline architecture'
        ]
      },
      {
        id: 'profile_photo_download',
        keywords: [
          'photo', 'picture', 'pic', 'portrait', 'headshot', 'profile pic', 'profile photo',
          'download photo', 'download pic', 'download portrait', 'download headshot', 'profile picture',
          'image', 'face', 'avatar', 'high res photo', 'hd photo', 'hi res', 'high resolution'
        ],
        title: 'High-Resolution Studio Portrait (Downloadable HD)',
        intros: [
          '📸 <strong>EXECUTIVE STUDIO PORTRAIT // 1024x1024 HIGH-RES</strong>',
          '🖼️ <strong>OFFICIAL STUDIO HEADSHOT // DIRECT ASSET DOWNLOAD</strong>',
          '💎 <strong>OFFICIAL BIOMETRIC PROFILE // HIGH-RESOLUTION PORTRAIT</strong>'
        ],
        responses: [
          `• <strong>Asset:</strong> Official Executive Studio Portrait of Rajeev Mutyalu (1024&times;1024 Master JPG).<br/>
• <strong>Format &amp; Quality:</strong> Full studio portraiture with soft cinematic key lighting and dark tailored styling.<br/>
• <strong>Production Uses:</strong> Media kits, keynote introductions, press releases, festival panel bios, and recruiter packages.<br/><br/>
<a href="profile.jpg" download="Rajeev-Mutyalu-Executive-Portrait.jpg" class="ai-section-link" style="display:inline-flex; align-items:center; gap:6px;">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle;">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
  📥 Download High-Resolution Portrait (1024x1024 JPG) &rarr;
</a><br/><br/>
<a href="profile.jpg" target="_blank" class="ai-section-link">🔍 Open Full-Resolution Image in New Tab &rarr;</a>
<a href="cv.html" class="ai-section-link">📄 Open Executive CV &rarr;</a>`,

          `• <strong>Official Speaker &amp; Leadership Headshot:</strong><br/>
You can download Rajeev's authentic executive portrait directly for event lineups, media press kits, or executive candidate dossiers.<br/>
• <strong>Resolution:</strong> 1024 &times; 1024 master studio file.<br/>
• <strong>Direct Download Link:</strong><br/><br/>
<a href="profile.jpg" download="Rajeev-Mutyalu-Executive-Portrait.jpg" class="ai-section-link" style="display:inline-flex; align-items:center; gap:6px;">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle;">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
  📥 Download HD Studio Portrait (1024x1024 JPG) &rarr;
</a><br/><br/>
<a href="#contact" class="ai-section-link">📬 Direct Contact Matrix &rarr;</a>`
        ],
        followupPool: [
          'Who is Rajeev Mutyalu and why should we hire him?',
          'Tell me about your AI certifications, accelerator credentials, and hackathons',
          'Tell me about your 20-year engineering leadership and mentorship background',
          'What is Model Context Protocol (MCP) and how is it used in production?'
        ]
      }
    ];

    function getRandomItem(arr) {
      if (!arr || !arr.length) return '';
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function getDynamicFollowups(pool, count = 4) {
      if (!pool || !pool.length) return [];
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      let selected = shuffled.slice(0, count);

      // If Cosmic Game Mode is active, inject a contextual game chip dynamically
      if (typeof window.isPortfolioGameModeActive === 'function' && window.isPortfolioGameModeActive()) {
        const gameChips = [
          '⚡ Preset: Solar Flare',
          '🌌 Preset: Aurora Borealis',
          '💎 Preset: Hyper Diamond',
          '☄️ Preset: Comet Cascade',
          '🔇 Mute Sound',
          '🛑 Turn Off Game Mode'
        ];
        const randomGameChip = gameChips[Math.floor(Math.random() * gameChips.length)];
        if (!selected.includes(randomGameChip) && selected.length > 0) {
          selected[selected.length - 1] = randomGameChip;
        }
      }
      return selected;
    }

    function matchQueryToKnowledge(query) {
      const q = query.toLowerCase().trim();

      // 1. Audio Mute / Unmute Interactive Control
      const isMute = /\b(mute(\s+sound|\s+audio|\s+music|\s+bgm)?|silence|turn\s+off\s+sound|turn\s+off\s+audio|disable\s+sound|stop\s+audio|sound\s+off|audio\s+off)\b/i.test(q);
      const isUnmute = /\b(unmute(\s+sound|\s+audio|\s+music|\s+bgm)?|enable\s+sound|turn\s+on\s+sound|turn\s+on\s+audio|start\s+audio|sound\s+on|audio\s+on)\b/i.test(q);

      if (isMute) {
        if (typeof window.setPortfolioAudioMute === 'function') {
          window.setPortfolioAudioMute(true);
        }
        const muteResponses = [
          `🔇 <strong>GAME AUDIO MUTED</strong><br/><br/>
• Ambient synth BGM and laser sfx have been silenced.<br/>
• Cyber Charlie HUD is running in stealth mode.<br/><br/>
<em>Type <code>unmute sound</code> or <code>sound on</code> anytime to bring back the audio!</em>`,
          `🔇 <strong>STEALTH MODE ENGAGED // AUDIO OFF</strong><br/><br/>
• Audio synthesizer silenced for focus.<br/>
• Particle physics, Cyber Charlie combat, and combo scoring continue uninterrupted.<br/><br/>
<em>Type <code>unmute sound</code> whenever you want to restore the synth BGM!</em>`
        ];
        return {
          id: 'audio_muted',
          title: 'Game Audio Muted',
          response: getRandomItem(muteResponses),
          followups: getDynamicFollowups([
            '🔊 Unmute Sound',
            '⚡ Preset: Solar Flare',
            '🌌 Preset: Aurora Borealis',
            '💎 Preset: Hyper Diamond',
            '🛑 Turn Off Game Mode',
            'Who is Rajeev Mutyalu and why should we hire him?'
          ], 4)
        };
      }

      if (isUnmute) {
        if (typeof window.setPortfolioAudioMute === 'function') {
          window.setPortfolioAudioMute(false);
        }
        const unmuteResponses = [
          `🔊 <strong>GAME AUDIO UNMUTED</strong><br/><br/>
• Ambient synthwave BGM and interactive collision sfx are now live.<br/>
• Cyber Charlie audio cues active.<br/><br/>
<em>Type <code>mute sound</code> anytime for silent play!</em>`,
          `🔊 <strong>SYNTH AUDIO ONLINE // 44.1kHz WEB AUDIO ACTIVE</strong><br/><br/>
• Dynamic pentatonic laser sfx and ambient pads engaged.<br/>
• Combos trigger ascending tonal chimes.<br/><br/>
<em>Type <code>mute sound</code> anytime to toggle silence!</em>`
        ];
        return {
          id: 'audio_unmuted',
          title: 'Game Audio Active',
          response: getRandomItem(unmuteResponses),
          followups: getDynamicFollowups([
            '🔇 Mute Sound',
            '⚡ Preset: Solar Flare',
            '🌌 Preset: Aurora Borealis',
            '💎 Preset: Hyper Diamond',
            '🛑 Turn Off Game Mode',
            'Explain your OpenUSD VFX pipeline architecture'
          ], 4)
        };
      }

      // 2. Live Game Mode Interactive Control
      const isGameModeOn = /\b(turn\s+on\s+game|game\s+mode\s+on|enable\s+game|start\s+game|play\s+game|activate\s+game|game\s+on|play\s+cosmic)\b/i.test(q) || q === 'game mode' || q === 'game' || q === 'on';
      const isGameModeOff = /\b(turn\s+off\s+game|game\s+mode\s+off|disable\s+game|stop\s+game|exit\s+game|deactivate\s+game|game\s+off)\b/i.test(q) || q === 'off';

      if (isGameModeOn) {
        if (window.innerWidth <= 768) {
          if (typeof window.togglePortfolioGameMode === 'function') {
            window.togglePortfolioGameMode(true);
          }
          return {
            id: 'game_mobile_notice',
            title: 'Desktop Precision Required for Cosmic Game Mode',
            response: `📱 <strong>DESKTOP &amp; LAPTOP PRECISION REQUIRED:</strong><br/><br/>
The interactive <strong>Comet Cascade Particle Physics Engine &amp; Cyber Charlie Combat System</strong> are engineered specifically for precision mouse/trackpad pointer physics, raycasted particle collision, and real-time Web Audio synthesis.<br/><br/>
💻 <em>Please open <strong>rajeev-mutyalu.github.io/portfolio-website</strong> on a desktop or laptop to vaporize comets, build multi-stage combos, and slash comets with Cyber Charlie!</em>`,
            followups: getDynamicFollowups([
              'Who is Rajeev Mutyalu and why should we hire him?',
              'Tell me about your 20-year engineering leadership and mentorship background',
              'What is Model Context Protocol (MCP) and how is it used in production?',
              'Explain your OpenUSD VFX pipeline architecture'
            ], 4)
          };
        }

        if (typeof window.togglePortfolioGameMode === 'function') {
          window.togglePortfolioGameMode(true);
        }
        const gameOnResponses = [
          `🎮 <strong>COSMIC GAME MODE ACTIVATED!</strong><br/><br/>
• <strong>Comet Cascade Canvas:</strong> Online &amp; responsive to mouse/trackpad physics.<br/>
• <strong>Cyber Charlie:</strong> Deployed as supersonic combat cursor with Astra Plasma Dagger!<br/>
• <strong>Audio Synthesizer:</strong> Ambient BGM and laser sfx unlocked.<br/>
• <strong>Controls:</strong> Guide Cyber Charlie to slash comets, trigger random combo flurries, and build multi-stage combos!<br/><br/>
<em>Switch visual presets, mute audio, or turn off below:</em>`,

          `🚀 <strong>CYBER CHARLIE COMET DEFENSE ONLINE!</strong><br/><br/>
• Supersonic cyber locomotion, randomized combat slashes, and raycasted blade collisions active.<br/>
• Chain comet hits within 1.5 seconds to trigger multi-stage combo multipliers (<code>+5 COMBO x3! 🔥</code>).<br/>
• Web Audio synthesizer reactive to hit velocity.<br/><br/>
<em>Select an FX preset or explore technical topics below:</em>`
        ];
        return {
          id: 'game_on',
          title: 'Cosmic Game Mode Activated',
          response: getRandomItem(gameOnResponses),
          followups: getDynamicFollowups([
            '🛑 Turn Off Game Mode',
            '🔇 Mute Sound',
            '⚡ Preset: Solar Flare',
            '🌌 Preset: Aurora Borealis',
            '💎 Preset: Hyper Diamond',
            '☄️ Preset: Comet Cascade',
            'Who is Rajeev Mutyalu and why should we hire him?'
          ], 4)
        };
      }

      if (isGameModeOff) {
        if (typeof window.togglePortfolioGameMode === 'function') {
          window.togglePortfolioGameMode(false);
        }
        const gameOffResponses = [
          `🌌 <strong>COSMIC GAME MODE DEACTIVATED.</strong><br/><br/>
• Cyber Charlie has returned to the dock in standby mode and the cursor is restored.<br/>
• Audio synthesis halted.<br/><br/>
<em>Type <code>turn on game mode</code> or click the Cosmic Switch in the top navbar anytime to jump back in!</em>`,

          `🛑 <strong>CYBER CHARLIE STANDBY // GAME MODE OFF</strong><br/><br/>
• Interactive particle arcade disengaged.<br/>
• High-contrast reading mode restored.<br/><br/>
<em>Type <code>turn on game mode</code> anytime to play again!</em>`
        ];
        return {
          id: 'game_off',
          title: 'Cosmic Game Mode Deactivated',
          response: getRandomItem(gameOffResponses),
          followups: getDynamicFollowups([
            '🎮 Turn On Game Mode',
            'Who is Rajeev Mutyalu and why should we hire him?',
            'Tell me about your 20-year engineering leadership and mentorship background',
            'Explain your OpenUSD VFX pipeline architecture',
            'What is Model Context Protocol (MCP) and how is it used in production?'
          ], 4)
        };
      }

      // 3. Comet FX Preset Live Switching
      if (/\b(solar\s*flare|preset:\s*solar|switch\s*fx\s*to\s*solar)\b/i.test(q) || q === 'solar') {
        if (window.innerWidth <= 768) {
          return {
            id: 'fx_mobile_notice',
            title: 'FX Presets on Desktop',
            response: `📱 <em>Cosmic FX presets are part of the desktop particle game engine. Please open this portfolio on a desktop or laptop to experience Solar Flare!</em>`,
            followups: ['Who is Rajeev Mutyalu and why should we hire him?', 'Tell me about your 20-year engineering leadership and mentorship background']
          };
        }
        if (typeof window.togglePortfolioGameMode === 'function') {
          window.togglePortfolioGameMode(true);
        }
        if (typeof window.setPortfolioThemeUI === 'function') {
          window.setPortfolioThemeUI('solar');
        }
        return {
          id: 'fx_solar',
          title: 'Solar Flare FX Active',
          response: `🔥 <strong>FX PRESET ACTIVATED: SOLAR FLARE</strong><br/><br/>
• <strong>Palette:</strong> High-energy Solar Amber, Golden Photons &amp; Orange Plasma.<br/>
• <strong>Particle Dynamics:</strong> Increased thermal speed with fiery impact shards.<br/><br/>
<em>Switch to another preset or turn off anytime below:</em>`,
          followups: getDynamicFollowups([
            '🌌 Preset: Aurora Borealis',
            '💎 Preset: Hyper Diamond',
            '☄️ Preset: Comet Cascade',
            '🛑 Turn Off Game Mode',
            'Who is Rajeev Mutyalu and why should we hire him?'
          ], 4)
        };
      }

      if (/\b(aurora\s*borealis|preset:\s*aurora|switch\s*fx\s*to\s*aurora)\b/i.test(q) || q === 'aurora') {
        if (window.innerWidth <= 768) {
          return {
            id: 'fx_mobile_notice',
            title: 'FX Presets on Desktop',
            response: `📱 <em>Cosmic FX presets are part of the desktop particle game engine. Please open this portfolio on a desktop or laptop to experience Aurora Borealis!</em>`,
            followups: ['Who is Rajeev Mutyalu and why should we hire him?', 'Tell me about your 20-year engineering leadership and mentorship background']
          };
        }
        if (typeof window.togglePortfolioGameMode === 'function') {
          window.togglePortfolioGameMode(true);
        }
        if (typeof window.setPortfolioThemeUI === 'function') {
          window.setPortfolioThemeUI('aurora');
        }
        return {
          id: 'fx_aurora',
          title: 'Aurora Borealis FX Active',
          response: `🌌 <strong>FX PRESET ACTIVATED: AURORA BOREALIS</strong><br/><br/>
• <strong>Palette:</strong> Bioluminescent Emerald, Cyan Waves &amp; Deep Forest Glow.<br/>
• <strong>Particle Dynamics:</strong> Smooth atmospheric flow with emerald nebular dust.<br/><br/>
<em>Switch to another preset or turn off anytime below:</em>`,
          followups: getDynamicFollowups([
            '⚡ Preset: Solar Flare',
            '💎 Preset: Hyper Diamond',
            '☄️ Preset: Comet Cascade',
            '🛑 Turn Off Game Mode',
            'Explain your OpenUSD VFX pipeline architecture'
          ], 4)
        };
      }

      if (/\b(hyper\s*diamond|preset:\s*diamond|switch\s*fx\s*to\s*diamond)\b/i.test(q) || q === 'diamond') {
        if (window.innerWidth <= 768) {
          return {
            id: 'fx_mobile_notice',
            title: 'FX Presets on Desktop',
            response: `📱 <em>Cosmic FX presets are part of the desktop particle game engine. Please open this portfolio on a desktop or laptop to experience Hyper Diamond!</em>`,
            followups: ['Who is Rajeev Mutyalu and why should we hire him?', 'Tell me about your 20-year engineering leadership and mentorship background']
          };
        }
        if (typeof window.togglePortfolioGameMode === 'function') {
          window.togglePortfolioGameMode(true);
        }
        if (typeof window.setPortfolioThemeUI === 'function') {
          window.setPortfolioThemeUI('diamond');
        }
        return {
          id: 'fx_diamond',
          title: 'Hyper Diamond FX Active',
          response: `💎 <strong>FX PRESET ACTIVATED: HYPER DIAMOND</strong><br/><br/>
• <strong>Palette:</strong> Crystalline Pure White, Prismatic Silver &amp; Platinum Highlights.<br/>
• <strong>Particle Dynamics:</strong> Maximum velocity stardust with sharp refractive shatter.<br/><br/>
<em>Switch to another preset or turn off anytime below:</em>`,
          followups: getDynamicFollowups([
            '⚡ Preset: Solar Flare',
            '🌌 Preset: Aurora Borealis',
            '☄️ Preset: Comet Cascade',
            '🛑 Turn Off Game Mode',
            'What is Model Context Protocol (MCP) and how is it used in production?'
          ], 4)
        };
      }

      if (/\b(comet\s*cascade|preset:\s*comet|switch\s*fx\s*to\s*comet)\b/i.test(q) || q === 'comet') {
        if (window.innerWidth <= 768) {
          return {
            id: 'fx_mobile_notice',
            title: 'FX Presets on Desktop',
            response: `📱 <em>Cosmic FX presets are part of the desktop particle game engine. Please open this portfolio on a desktop or laptop to experience Comet Cascade!</em>`,
            followups: ['Who is Rajeev Mutyalu and why should we hire him?', 'Tell me about your 20-year engineering leadership and mentorship background']
          };
        }
        if (typeof window.togglePortfolioGameMode === 'function') {
          window.togglePortfolioGameMode(true);
        }
        if (typeof window.setPortfolioThemeUI === 'function') {
          window.setPortfolioThemeUI('comet');
        }
        return {
          id: 'fx_comet',
          title: 'Comet Cascade FX Active',
          response: `☄️ <strong>FX PRESET ACTIVATED: COMET CASCADE (DEFAULT)</strong><br/><br/>
• <strong>Palette:</strong> Cyber Cyan, Deep Cobalt &amp; Neon Electric Blue.<br/>
• <strong>Particle Dynamics:</strong> Classic directional comet rain with cyan shatter bursts.<br/><br/>
<em>Switch to another preset or turn off anytime below:</em>`,
          followups: getDynamicFollowups([
            '⚡ Preset: Solar Flare',
            '🌌 Preset: Aurora Borealis',
            '💎 Preset: Hyper Diamond',
            '🛑 Turn Off Game Mode',
            'Who is Rajeev Mutyalu and why should we hire him?'
          ], 4)
        };
      }

      // 4. Resilient "Who is Rajeev / Why hire him" Check
      if (/\b(rajeev|muthyalu|mutyalu|who\s+(is|si)\s+rajeev|who\s+(is|si)|why\s+hire|hire\s+him|hire\s+rajeev|about\s+rajeev)\b/i.test(q) || q === 'rajeev' || q === 'why hire') {
        const whyHireItem = AI_KNOWLEDGE_BASE.find(item => item.id === 'why_hire_rajeev');
        if (whyHireItem) {
          const chosenIntro = getRandomItem(whyHireItem.intros);
          const chosenResponse = getRandomItem(whyHireItem.responses);
          return {
            id: whyHireItem.id,
            title: whyHireItem.title,
            response: (chosenIntro ? chosenIntro + '<br/><br/>' : '') + chosenResponse,
            followups: getDynamicFollowups(whyHireItem.followupPool, 4)
          };
        }
      }

      // 4b. Resilient AI Certifications & Credentials Check
      if (/\b(certificat(e|es|ion|ions)|credential(s)?|hackathon(s)?|outskill|accelerator|fellowship)\b/i.test(q) || q.includes('certifications_credentials') || q === 'certifications' || q === 'certificates') {
        const certItem = AI_KNOWLEDGE_BASE.find(item => item.id === 'certifications_credentials');
        if (certItem) {
          const chosenIntro = getRandomItem(certItem.intros);
          const chosenResponse = getRandomItem(certItem.responses);
          return {
            id: certItem.id,
            title: certItem.title,
            response: (chosenIntro ? chosenIntro + '<br/><br/>' : '') + chosenResponse,
            followups: getDynamicFollowups(certItem.followupPool, 4)
          };
        }
      }

      // 4c. Resilient Profile Photo / Portrait Download Check
      if (/\b(photo|picture|pic|headshot|portrait|profile\s*(pic|photo|picture|image|avatar)|download\s*(pic|photo|image|headshot|portrait|profile))\b/i.test(q) || q.includes('profile_photo') || q === 'photo' || q === 'portrait' || q === 'pic') {
        const photoItem = AI_KNOWLEDGE_BASE.find(item => item.id === 'profile_photo_download');
        if (photoItem) {
          const chosenIntro = getRandomItem(photoItem.intros);
          const chosenResponse = getRandomItem(photoItem.responses);
          return {
            id: photoItem.id,
            title: photoItem.title,
            response: (chosenIntro ? chosenIntro + '<br/><br/>' : '') + chosenResponse,
            followups: getDynamicFollowups(photoItem.followupPool, 4)
          };
        }
      }

      // 5. Standard Weighted Knowledge Base Search with Dynamic Variation Selector
      let bestMatch = null;
      let maxScore = 0;

      for (const item of AI_KNOWLEDGE_BASE) {
        let score = 0;
        for (const kw of item.keywords) {
          if (q.includes(kw)) {
            score += kw.length * 2;
          }
        }
        if (score > maxScore) {
          maxScore = score;
          bestMatch = item;
        }
      }

      if (maxScore > 0 && bestMatch) {
        const chosenIntro = getRandomItem(bestMatch.intros);
        const chosenResponse = getRandomItem(bestMatch.responses);
        return {
          id: bestMatch.id,
          title: bestMatch.title,
          response: (chosenIntro ? chosenIntro + '<br/><br/>' : '') + chosenResponse,
          followups: getDynamicFollowups(bestMatch.followupPool, 4)
        };
      }

      // Fallback with Dynamic Suggestions
      const fallbackIntros = [
        '<div class="ai-fallback-badge">🔒 TELEMETRY NOTICE // OFFLINE LOCAL-KB [v1.0.5]</div>',
        '<div class="ai-fallback-badge">⚡ LOCAL ENGINE READY // SEMANTIC ROUTING [v1.0.5]</div>'
      ];
      return {
        id: 'fallback',
        title: 'Telemetry Notice: Offline Local-KB Scope [v1.0.5]',
        response: `${getRandomItem(fallbackIntros)}
I am operating as a high-speed <strong>offline local knowledge engine</strong> dedicated exclusively to <strong>Rajeev Mutyalu's Technical Arsenal, VFX Pipeline Architecture, and GenAI Portfolio</strong>.<br/><br/>
<em>Live open-domain web exploration will unlock in the upcoming <strong>OpenClaw Real-Time Agent runtime</strong>. In the meantime, ask me in-depth technical questions about:</em><br/><br/>
• <strong>🌟 Executive Summary:</strong> <a href="javascript:void(0)" class="ai-followup-btn" data-query="Who is Rajeev Mutyalu and why should we hire him?" style="display:inline-block; margin-top:2px;">Why Hire Rajeev?</a><br/>
• <strong>📸 High-Res Portrait:</strong> <a href="javascript:void(0)" class="ai-followup-btn" data-query="Download Rajeev high resolution profile photo" style="display:inline-block; margin-top:2px;">Download HD Photo</a><br/>
• <strong>📜 AI Certifications &amp; Credentials:</strong> <a href="javascript:void(0)" class="ai-followup-btn" data-query="Tell me about your AI certifications, accelerator credentials, and hackathons" style="display:inline-block; margin-top:2px;">AI Generalist &amp; Hackathon</a><br/>
• <strong>🏆 Leadership &amp; Film Credits:</strong> <a href="javascript:void(0)" class="ai-followup-btn" data-query="Tell me about your 20-year engineering leadership and mentorship background" style="display:inline-block; margin-top:2px;">Leadership &amp; Tenures</a><br/>
• <strong>🎮 Interactive Game:</strong> Type <code>turn on game mode</code> or <code>turn off game mode</code><br/>
• <strong>🔌 Model Context Protocol (MCP):</strong> Custom JSON-RPC tool binding for DCCs<br/>
• <strong>🧠 Agentic AI &amp; Vibe Coding:</strong> Claude Code, Google Antigravity &amp; subagent swarms<br/>
• <strong>🔒 On-Premise LLMs &amp; OpenClaw:</strong> Nous Hermes, Ollama, and 4-bit GGUF/AWQ quantization<br/>
• <strong>🎬 OpenUSD Pipeline:</strong> Non-destructive 2-tier sublayer composition<br/>
• <strong>📦 Conform Ingest &amp; VFX I/O:</strong> Editorial turnovers, DI discrepancy reporting &amp; OTIO<br/>
• <strong>⚡ Zero-Touch n8n Automation:</strong> Inbound &amp; reverse webhooks for render dispatch<br/><br/>
<a href="#initiatives" class="ai-section-link">🚀 Explore Full Technical Arsenal &rarr;</a>`,
        followups: getDynamicFollowups([
          'Download Rajeev high resolution profile photo',
          'Tell me about your AI certifications, accelerator credentials, and hackathons',
          'Who is Rajeev Mutyalu and why should we hire him?',
          'Tell me about your 20-year engineering leadership and mentorship background',
          'What is Model Context Protocol (MCP) and how is it used in production?',
          'Explain your OpenUSD VFX pipeline architecture',
          'How does zero-touch n8n studio automation orchestrate pipelines?',
          'How do you deploy On-Premise LLMs (Nous Hermes, Ollama) and OpenClaw agents?'
        ], 4)
      };
    }

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function scrollStreamToBottom() {
      if (!aiChatStream) return;
      aiChatStream.scrollTop = aiChatStream.scrollHeight;
      const lastChild = aiChatStream.lastElementChild;
      if (lastChild && typeof lastChild.scrollIntoView === 'function') {
        lastChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    let isGeneratingResponse = false;

    function setChatGeneratingLock(isLocked) {
      isGeneratingResponse = !!isLocked;
      const terminal = document.querySelector('.ai-bot-terminal');
      if (terminal) {
        terminal.classList.toggle('chat-generating', isGeneratingResponse);
      }
      if (aiInputField) {
        aiInputField.disabled = isGeneratingResponse;
        if (isGeneratingResponse) {
          if (!aiInputField.getAttribute('data-orig-placeholder')) {
            aiInputField.setAttribute('data-orig-placeholder', aiInputField.placeholder || '');
          }
          aiInputField.placeholder = 'Charlie is delivering your answer...';
        } else {
          const orig = aiInputField.getAttribute('data-orig-placeholder');
          if (orig) aiInputField.placeholder = orig;
        }
      }
      if (aiSendBtn) {
        aiSendBtn.disabled = isGeneratingResponse;
      }
      document.querySelectorAll('.ai-sidebar-btn, .ai-followup-btn, .ai-topic-pill').forEach(btn => {
        btn.disabled = isGeneratingResponse;
        btn.setAttribute('aria-disabled', isGeneratingResponse ? 'true' : 'false');
      });
    }

    function setCharlieThinkingState(isThinking) {
      if (!aiBotStatusPill) return;
      const pulse = aiBotStatusPill.querySelector('.ai-status-pulse');
      const text = aiBotStatusPill.querySelector('.ai-status-text') || aiBotStatusPill.querySelector('span:last-child');
      
      if (isThinking) {
        if (pulse) pulse.classList.add('pulse-thinking');
        if (text) text.textContent = 'ANALYZING PROMPT SEMANTICS [LOCAL-KB]...';
      } else {
        if (pulse) pulse.classList.remove('pulse-thinking');
        if (text) text.textContent = 'LOCAL KB READY';
      }
    }

    function renderBotResponse(query) {
      if (!aiChatStream || !query) return;
      if (isGeneratingResponse) return; // Do NOT allow selecting other questions while generation is in progress!

      const trimmedQuery = query.trim();
      if (!trimmedQuery) return;

      // Lock all questions, chips, and input fields during active generation & animation
      setChatGeneratingLock(true);

      // 1. Append User Message (Theme-Aligned Sleek Terminal User Prompt)
      const userMsgDiv = document.createElement('div');
      userMsgDiv.className = 'ai-message ai-user-msg user-message';
      userMsgDiv.innerHTML = `
        <div class="ai-msg-avatar ai-user-avatar" title="Visitor / Technical Recruiter">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div class="ai-msg-body">
          <div class="ai-msg-author ai-user-author">You <span>[Terminal Prompt]</span></div>
          <div class="ai-msg-content">${escapeHtml(trimmedQuery)}</div>
        </div>
      `;
      aiChatStream.appendChild(userMsgDiv);
      scrollStreamToBottom();

      // 2. Set Status Telemetry to Thinking & Trigger Charlie Thinking Animation
      setCharlieThinkingState(true);
      if (window.portfolioCharlie) {
        window.portfolioCharlie.triggerThinking();
      }
      if (window.portfolioDockCharlie) {
        window.portfolioDockCharlie.triggerThinking();
      }

      const CYBER_CHARLIE_AVATAR_SVG = `
        <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
          <line x1="18" y1="3" x2="18" y2="9" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round"/>
          <circle cx="18" cy="3" r="2.8" fill="#00f2fe"/>
          <rect x="4" y="9" width="28" height="23" rx="6" fill="#090f1f" stroke="#00f2fe" stroke-width="2"/>
          <circle cx="3" cy="20" r="2.2" fill="#00f2fe"/>
          <circle cx="33" cy="20" r="2.2" fill="#00f2fe"/>
          <rect x="8" y="13" width="20" height="13" rx="3.5" fill="#02060f" stroke="rgba(0, 242, 254, 0.45)" stroke-width="1"/>
          <rect x="11" y="16" width="4.5" height="5.5" rx="1.5" fill="#00f2fe"/>
          <circle cx="14" cy="17.5" r="0.9" fill="#ffffff"/>
          <rect x="20.5" y="16" width="4.5" height="5.5" rx="1.5" fill="#00f2fe"/>
          <circle cx="23.5" cy="17.5" r="0.9" fill="#ffffff"/>
          <path d="M15 23.5 Q18 26 21 23.5" stroke="#00f2fe" stroke-width="1.4" stroke-linecap="round" fill="none"/>
        </svg>
      `;

      // 3. Append Typing Indicator Bubble
      const typingDiv = document.createElement('div');
      typingDiv.className = 'ai-message ai-bot-msg bot-message ai-typing-indicator';
      typingDiv.innerHTML = `
        <div class="ai-msg-avatar ai-bot-avatar" title="Charlie (AI Assistant)">${CYBER_CHARLIE_AVATAR_SVG}</div>
        <div class="ai-msg-body">
          <div class="ai-msg-author">Charlie <span>retrieving local weights...</span></div>
          <div class="ai-msg-content ai-typing-bubble">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        </div>
      `;
      aiChatStream.appendChild(typingDiv);
      scrollStreamToBottom();

      // 4. Match knowledge & Render after realistic simulated latency (450ms–650ms)
      const match = matchQueryToKnowledge(trimmedQuery);
      const thinkingDelay = Math.floor(Math.random() * 200) + 450;

      setTimeout(() => {
        if (typingDiv && typingDiv.parentNode) {
          typingDiv.parentNode.removeChild(typingDiv);
        }

        // Charlie enters Writing Mode with Triangular Lifecycle:
        // Point A (Mascot Anchor) -> Point B (Bottom-Center) -> Ascend while writing to Point C (Screen Center) -> Victory Celebration -> Return to Point A!
        const bottomCenter = window.portfolioCharlie ? window.portfolioCharlie.getChatBottomCenter() : { x: 0, y: 0 };
        const writeCenter = window.portfolioCharlie ? window.portfolioCharlie.getChatWritingCenter() : { x: 0, y: 0 };

        const botMsgDiv = document.createElement('div');
        botMsgDiv.className = 'ai-message ai-bot-msg bot-message';

        let followupsHtml = '';
        if (match.followups && match.followups.length) {
          followupsHtml = `
            <div class="ai-followup-container">
              <span class="ai-followup-label">Explore Next:</span>
              <div class="ai-followup-chips">
                ${match.followups.map(f => {
                  let queryText = f;
                  if (f.startsWith('🛑')) queryText = 'turn off game mode';
                  else if (f.startsWith('🔇')) queryText = 'mute sound';
                  else if (f.startsWith('🔊')) queryText = 'unmute sound';
                  else if (f.startsWith('⚡')) queryText = 'switch fx to solar';
                  else if (f.startsWith('🌌')) queryText = 'switch fx to aurora';
                  else if (f.startsWith('💎')) queryText = 'switch fx to diamond';
                  else if (f.startsWith('☄️')) queryText = 'switch fx to comet';
                  else if (f.startsWith('🎮')) queryText = 'turn on game mode';
                  return `<button type="button" class="ai-followup-btn" data-query="${escapeHtml(queryText)}">${escapeHtml(f)}</button>`;
                }).join('')}
              </div>
            </div>
          `;
        }

        botMsgDiv.innerHTML = `
          <div class="ai-msg-avatar ai-bot-avatar" title="Cyber Charlie (AI Assistant)">${CYBER_CHARLIE_AVATAR_SVG}</div>
          <div class="ai-msg-body">
            <div class="ai-msg-author">Charlie <span>Rajeev's AI Assistant</span></div>
            <div class="ai-msg-content"></div>
          </div>
        `;

        // Physical Delivery Synchronization:
        // Position botMsgDiv lower down at Point B where Charlie is typing
        const textTravelY = Math.max(65, Math.min(130, Math.round(bottomCenter.y - writeCenter.y)));
        botMsgDiv.style.animation = 'none';
        botMsgDiv.style.opacity = '1';
        botMsgDiv.style.willChange = 'transform';
        botMsgDiv.style.transform = `translateY(${textTravelY}px)`;

        aiChatStream.appendChild(botMsgDiv);
        scrollStreamToBottom();

        const contentEl = botMsgDiv.querySelector('.ai-msg-content');
        const fullResponse = match.response;

        const startTypingSequence = () => {
          if (aiBotStatusPill) {
            const text = aiBotStatusPill.querySelector('.ai-status-text') || aiBotStatusPill.querySelector('span:last-child');
            if (text) text.textContent = 'CHARLIE WRITING ANS [CYBER SPEED]...';
          }

          if (window.portfolioCharlie && (!window.portfolioEngine || !window.portfolioEngine.isEnabled)) {
            window.portfolioCharlie.state = 'writing';
            window.portfolioCharlie.face = 'writing';
            window.portfolioCharlie.x = bottomCenter.x;
            window.portfolioCharlie.y = bottomCenter.y;
            window.portfolioCharlie.targetX = bottomCenter.x;
            window.portfolioCharlie.targetY = bottomCenter.y;
            window.portfolioCharlie.facing = 1;
            window.portfolioCharlie.addSparks(bottomCenter.x, bottomCenter.y, '#00f2fe', 16);
          }

          // Supersonic Cyber Typewriter Effect: Stream text rapidly while Charlie scribbles with laser stylus at Point B!
          let charIndex = 0;
          const chunkSize = 16;
          const tickInterval = 14;

          const typeInterval = setInterval(() => {
            charIndex = Math.min(fullResponse.length, charIndex + chunkSize);
            contentEl.innerHTML = fullResponse.substring(0, charIndex) + (charIndex < fullResponse.length ? '<span class="typewriter-cursor">⚡</span>' : '');

            // At Point B: Charlie stays firmly locked at bottomCenter scribbling with his laser stylus!
            if (window.portfolioCharlie && (window.portfolioCharlie.state === 'writing')) {
              window.portfolioCharlie.x = bottomCenter.x;
              window.portfolioCharlie.y = bottomCenter.y;
              window.portfolioCharlie.targetX = bottomCenter.x;
              window.portfolioCharlie.targetY = bottomCenter.y;

              if (Math.random() > 0.25) {
                const stylusTipX = bottomCenter.x + window.portfolioCharlie.facing * 14 * window.portfolioCharlie.scale;
                const stylusTipY = bottomCenter.y - 2 * window.portfolioCharlie.scale;
                window.portfolioCharlie.addSparks(stylusTipX, stylusTipY, '#00f2fe', 2);
              }
            }

            scrollStreamToBottom();

            // When writing animation at Point B completes:
            if (charIndex >= fullResponse.length) {
              clearInterval(typeInterval);
              contentEl.innerHTML = fullResponse;
              scrollStreamToBottom();

              if (aiBotStatusPill) {
                const text = aiBotStatusPill.querySelector('.ai-status-text') || aiBotStatusPill.querySelector('span:last-child');
                if (text) text.textContent = 'TEXT ASCENDING [CHARLIE WAITING 20%]...';
              }

              // Writing at Point B is 100% COMPLETE!
              // Now text & background bubble start moving up first towards Point C.
              // Charlie WAITS at Point B until text moves 20%, then ATTACHES and ascends in lockstep!
              if (window.portfolioCharlie && (!window.portfolioEngine || !window.portfolioEngine.isEnabled)) {
                const ascentDuration = 650;
                const ascentStart = performance.now();
                const startX = bottomCenter.x;
                const startY = bottomCenter.y;
                const endX = writeCenter.x;
                const endY = writeCenter.y;

                const stepAscent = (now) => {
                  const elapsed = now - ascentStart;
                  const textProgress = Math.min(1.0, elapsed / ascentDuration);
                  const textEase = 1 - Math.pow(1 - textProgress, 3); // easeOutCubic

                  // 1. Text & Background bubble continuously moves up from Point B to Point C
                  const curTranslateY = (1 - textEase) * textTravelY;
                  botMsgDiv.style.transform = `translateY(${curTranslateY.toFixed(2)}px)`;

                  // 2. Charlie Sync: wait at Point B until text has moved 20%, then attach!
                  if (textProgress < 0.20) {
                    // Charlie WAITS at Point B, warming thrusters and emitting sparks
                    if (window.portfolioCharlie && window.portfolioCharlie.state === 'writing') {
                      window.portfolioCharlie.x = startX;
                      window.portfolioCharlie.y = startY;
                      window.portfolioCharlie.targetX = startX;
                      window.portfolioCharlie.targetY = startY;

                      if (Math.random() > 0.35) {
                        window.portfolioCharlie.addSparks(startX, startY + 14 * window.portfolioCharlie.scale, '#00f2fe', 2);
                      }
                    }
                    if (aiBotStatusPill) {
                      const text = aiBotStatusPill.querySelector('.ai-status-text') || aiBotStatusPill.querySelector('span:last-child');
                      if (text) text.textContent = 'TEXT ASCENDING [CHARLIE ATTACHING]...';
                    }
                  } else {
                    // textProgress >= 0.20: Charlie is ATTACHED to the ascending text!
                    const charlieNorm = (textProgress - 0.20) / 0.80;
                    const charlieEase = 1 - Math.pow(1 - charlieNorm, 3);
                    const curX = startX + (endX - startX) * charlieEase;
                    const curY = startY + (endY - startY) * charlieEase;

                    if (window.portfolioCharlie && window.portfolioCharlie.state === 'writing') {
                      window.portfolioCharlie.x = curX;
                      window.portfolioCharlie.y = curY;
                      window.portfolioCharlie.targetX = curX;
                      window.portfolioCharlie.targetY = curY;

                      if (Math.random() > 0.25) {
                        window.portfolioCharlie.addSparks(curX, curY + 14 * window.portfolioCharlie.scale, '#00f2fe', 2);
                      }
                    }
                    if (aiBotStatusPill) {
                      const text = aiBotStatusPill.querySelector('.ai-status-text') || aiBotStatusPill.querySelector('span:last-child');
                      if (text) text.textContent = 'CHARLIE & TEXT ASCENDING...';
                    }
                  }

                  scrollStreamToBottom();

                  if (textProgress < 1.0) {
                    requestAnimationFrame(stepAscent);
                  } else {
                    // Arrived at Point C (Screen Center): Delivery complete!
                    botMsgDiv.style.transform = 'translateY(0px)';
                    botMsgDiv.style.willChange = 'auto';

                    // Append followups smoothly once settled at Point C
                    if (followupsHtml && !botMsgDiv.querySelector('.ai-followup-container')) {
                      const followContainer = document.createElement('div');
                      followContainer.innerHTML = followupsHtml;
                      followContainer.style.animation = 'msgFadeIn 0.35s ease forwards';
                      botMsgDiv.querySelector('.ai-msg-body').appendChild(followContainer);
                      scrollStreamToBottom();
                    }

                    // Trigger Victory Celebration!
                    if (window.portfolioCharlie) {
                      window.portfolioCharlie.x = endX;
                      window.portfolioCharlie.y = endY;
                      window.portfolioCharlie.targetX = endX;
                      window.portfolioCharlie.targetY = endY;
                      window.portfolioCharlie.triggerVictory();
                    }
                    if (window.portfolioDockCharlie) {
                      window.portfolioDockCharlie.triggerVictory();
                    }

                    setCharlieThinkingState(false);
                    if (aiBotStatusPill) {
                      const text = aiBotStatusPill.querySelector('.ai-status-text') || aiBotStatusPill.querySelector('span:last-child');
                      if (text) text.textContent = 'ANS COMPLETE ✨';
                    }

                    setTimeout(() => {
                      if (window.portfolioCharlie && (!window.portfolioEngine || !window.portfolioEngine.isEnabled)) {
                        const homeAnchor = window.portfolioCharlie.getChatMascotAnchor();
                        window.portfolioCharlie.triggerReturnDash(window.portfolioCharlie.x, window.portfolioCharlie.y, homeAnchor.x, homeAnchor.y);
                      }
                      if (window.portfolioDockCharlie) {
                        window.portfolioDockCharlie.triggerWaiting();
                      }
                      if (aiBotStatusPill) {
                        const text = aiBotStatusPill.querySelector('.ai-status-text') || aiBotStatusPill.querySelector('span:last-child');
                        if (text) text.textContent = 'LOCAL KB READY';
                      }
                      // Re-enable selecting questions and inputs once return dash completes!
                      setChatGeneratingLock(false);
                    }, 1100);
                  }
                };

                requestAnimationFrame(stepAscent);
              } else {
                botMsgDiv.style.transform = 'translateY(0px)';
                if (followupsHtml && !botMsgDiv.querySelector('.ai-followup-container')) {
                  const followContainer = document.createElement('div');
                  followContainer.innerHTML = followupsHtml;
                  botMsgDiv.querySelector('.ai-msg-body').appendChild(followContainer);
                }
                setCharlieThinkingState(false);
                if (aiBotStatusPill) {
                  const text = aiBotStatusPill.querySelector('.ai-status-text') || aiBotStatusPill.querySelector('span:last-child');
                  if (text) text.textContent = 'LOCAL KB READY';
                }
                setChatGeneratingLock(false);
              }
            }
          }, tickInterval);
        };

        if (window.portfolioCharlie && (!window.portfolioEngine || !window.portfolioEngine.isEnabled)) {
          if (aiBotStatusPill) {
            const text = aiBotStatusPill.querySelector('.ai-status-text') || aiBotStatusPill.querySelector('span:last-child');
            if (text) text.textContent = 'CHARLIE DASHING TO CHAT...';
          }
          window.portfolioCharlie.triggerWriteDash(window.portfolioCharlie.x, window.portfolioCharlie.y, bottomCenter.x, bottomCenter.y, startTypingSequence);
        } else {
          startTypingSequence();
        }
      }, thinkingDelay);
    }

    // Delegated Click Listener for All Charlie Topic, Follow-up & Deep Link Buttons
    document.addEventListener('click', (e) => {
      // 1. In-page deep link click listener with Charlie Companion Escort Flight
      const sectionLink = e.target.closest('.ai-section-link, .ai-chat-stream a[href^="#"], .ai-bot-terminal a[href^="#"]');
      if (sectionLink) {
        const href = sectionLink.getAttribute('href');
        if (href && href.startsWith('#') && href.length > 1) {
          const targetEl = document.querySelector(href);
          if (targetEl) {
            e.preventDefault();

            // Auto-switch architecture tab if data-arch-tab present
            const archTab = sectionLink.getAttribute('data-arch-tab');
            if (archTab && typeof window.switchArchitectureTab === 'function') {
              window.switchArchitectureTab(archTab);
            }

            // Smooth scroll to target element
            const headerOffset = 70;
            const elPos = targetEl.getBoundingClientRect().top;
            const offsetPos = elPos + window.pageYOffset - headerOffset;
            window.scrollTo({
              top: offsetPos,
              behavior: 'smooth'
            });

            // Extract clean title
            let sectionTitle = href.replace('#', '');
            const heading = targetEl.querySelector('h1, h2, h3, .section-title');
            if (heading) {
              sectionTitle = heading.textContent.trim().replace(/^[\s⚡🎬📦🔒🎙️🎥🐍🐾🏆🌟🛑🌌💎☄️🎮🔇🔊•→]+\s*/g, '');
            }

            // Trigger Charlie Companion Flight & Escort!
            if (window.portfolioCharlie && (!window.portfolioEngine || !window.portfolioEngine.isEnabled)) {
              window.portfolioCharlie.triggerSectionEscort(targetEl, sectionTitle);
            } else if (window.portfolioEngine?.charlie) {
              window.portfolioEngine.charlie.triggerSectionEscort(targetEl, sectionTitle);
            }
            return;
          }
        }
      }

      // 2. Auto-switch architecture visualizer tab if link has data-arch-tab
      const archLink = e.target.closest('a[data-arch-tab]');
      if (archLink) {
        const tab = archLink.getAttribute('data-arch-tab');
        if (typeof window.switchArchitectureTab === 'function') {
          window.switchArchitectureTab(tab);
        }
      }

      // 2. Charlie sidebar / chip triggers
      const btn = e.target.closest('.ai-sidebar-btn, .ai-topic-pill, .ai-followup-btn');
      if (btn) {
        e.preventDefault();
        if (isGeneratingResponse) return; // Do NOT allow selecting other questions while generation is in progress!
        if (window.portfolioEngine?.isEnabled) return; // Chatbot paused while Game Mode is active
        const query = btn.getAttribute('data-query') || btn.textContent.replace(/^[\s→•🔌⚡🎬📦🔒🎙️🎥🐍🐾🏆🌟🛑🌌💎☄️🎮🔇🔊]+\s*/g, '').trim();
        if (query) {
          document.querySelectorAll('.ai-sidebar-btn').forEach(b => b.classList.remove('active'));
          if (btn.classList.contains('ai-sidebar-btn')) {
            btn.classList.add('active');
          }
          renderBotResponse(query);
        }
      }
    });

    if (aiChatForm && aiInputField) {
      aiChatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (isGeneratingResponse) return; // Do NOT allow submitting while generation is in progress!
        if (window.portfolioEngine?.isEnabled) return; // Chatbot paused while Game Mode is active
        const q = aiInputField.value.trim();
        if (!q) return;
        aiInputField.value = '';
        document.querySelectorAll('.ai-sidebar-btn').forEach(b => b.classList.remove('active'));
        renderBotResponse(q);
      });
    }

    // 3. Setup "Disable Game to Use Bot" Button on Chatbot Lockout Overlay
    const disableGameBtn = document.getElementById('aiDisableGameBtn');
    if (disableGameBtn) {
      disableGameBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.togglePortfolioGameMode === 'function') {
          window.togglePortfolioGameMode(false);
        }
        setTimeout(() => {
          const input = document.getElementById('aiInputField');
          if (input) {
            input.focus({ preventScroll: true });
            input.classList.add('input-pulse-highlight');
            setTimeout(() => input.classList.remove('input-pulse-highlight'), 1200);
          }
        }, 300);
      });
    }

    // 3. Setup Floating Quick-Launcher for Charlie (AI)
    const floatingCharlieBtn = document.getElementById('floatingCharlieBtn');

    if (floatingCharlieBtn) {
      floatingCharlieBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.portfolioDockCharlie) {
          window.portfolioDockCharlie.triggerJump();
        }
        if (typeof window.deployCharlieToAiSection === 'function') {
          window.deployCharlieToAiSection();
        }
        const targetSection = document.getElementById('ai-assistant') || document.getElementById('charlie') || document.querySelector('.ai-bot-terminal');
        if (targetSection) {
          const navOffset = 76; // Clean scroll clearance so "Meet Charlie — Rajeev's AI Assistant" header is fully visible
          const sectionTop = targetSection.getBoundingClientRect().top + window.pageYOffset - navOffset;
          window.scrollTo({
            top: Math.max(0, sectionTop),
            behavior: 'smooth'
          });
        }
        setTimeout(() => {
          const input = document.getElementById('aiInputField');
          if (input) {
            input.focus({ preventScroll: true });
            input.classList.add('input-pulse-highlight');
            setTimeout(() => input.classList.remove('input-pulse-highlight'), 1200);
          }
        }, 350);
      });
    }

    // 4. Setup Meet Charlie Section Fly-Out & Return Observer
    function setupCharlieSectionObserver() {
      const section = document.getElementById('ai-assistant');
      const terminal = document.querySelector('.ai-bot-terminal') || section;
      if (!section || !terminal) return;

      const deployToSection = () => {
        const engine = window.portfolioEngine;
        if (!engine || !engine.charlie) return;
        if (engine.isEnabled) return; // Do not interrupt Game Mode!
        if (engine.charlie.sectionActive || engine.charlie.state === 'cyber_dash') return;

        const floatingBtn = document.getElementById('floatingCharlieBtn');
        const dockRect = floatingBtn ? floatingBtn.getBoundingClientRect() : { left: window.innerWidth - 60, top: window.innerHeight - 60, width: 44, height: 44 };
        const dockCenterX = dockRect.left + dockRect.width / 2;
        const dockCenterY = dockRect.top + dockRect.height / 2;

        const anchor = engine.charlie.getChatMascotAnchor();
        if (!anchor.isVisible) return;

        if (floatingBtn) floatingBtn.classList.add('hidden');
        engine.charlie.triggerDeploy(dockCenterX, dockCenterY, anchor.x, anchor.y, false);
      };

      const returnToDock = () => {
        const engine = window.portfolioEngine;
        if (!engine || !engine.charlie) return;
        if (engine.isEnabled) return; // Game Mode controls its own return
        if (!engine.charlie.sectionActive && engine.charlie.state !== 'waiting' && engine.charlie.state !== 'thinking' && engine.charlie.state !== 'writing' && engine.charlie.state !== 'victory') return;
        if (engine.charlie.x < -200) return;

        const floatingBtn = document.getElementById('floatingCharlieBtn');
        const dockRect = floatingBtn ? floatingBtn.getBoundingClientRect() : { left: window.innerWidth - 60, top: window.innerHeight - 60, width: 44, height: 44 };
        const dockCenterX = dockRect.left + dockRect.width / 2;
        const dockCenterY = dockRect.top + dockRect.height / 2;

        engine.charlie.triggerDock(dockCenterX, dockCenterY);
      };

      window.deployCharlieToAiSection = deployToSection;
      window.returnCharlieToDock = returnToDock;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            deployToSection();
          } else {
            returnToDock();
          }
        });
      }, {
        threshold: 0.15
      });

      observer.observe(section);

      // Keep Charlie deployment in sync on scroll so he never desyncs from chat view
      window.addEventListener('scroll', () => {
        const engine = window.portfolioEngine;
        if (!engine || !engine.charlie || engine.isEnabled) return;
        if (engine.charlie.state === 'cyber_dash') return;

        const anchor = engine.charlie.getChatMascotAnchor();
        if (anchor.isVisible) {
          if (!engine.charlie.sectionActive && engine.charlie.x < -200) {
            deployToSection();
          }
        } else {
          if (engine.charlie.sectionActive && engine.charlie.x > -200) {
            returnToDock();
          }
        }
      }, { passive: true });

      // Connect top navbar & mobile drawer quick-links to trigger fly-out proactively
      document.querySelectorAll('a[href="#ai-assistant"]').forEach(link => {
        link.addEventListener('click', () => {
          setTimeout(() => {
            deployToSection();
          }, 150);
        });
      });
    }

    setupCharlieSectionObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
