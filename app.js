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
  // 1. Dynamic Comet & Particle Engine
  // ==========================================================================
  class ParticleEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.isEnabled = true;

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

      // Flow Dynamics
      this.globalAngle = Math.PI / 2; // Default 90 deg vertical rain
      this.targetAngle = Math.PI / 2;
      this.particles = [];
      this.shards = [];
      this.ripples = [];
      this.particleCount = 100;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.onShatter = null;

      this.init();
    }

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize());

      // Mouse Trackers
      window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.mouse.isHovered = true;

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

      // Supernova Click Burst & Comet Shatter
      window.addEventListener('click', (e) => {
        if (!this.isEnabled) return;
        this.triggerShatterBurst(e.clientX, e.clientY, 20);

        let blastedCount = 0;
        this.particles.forEach((p, index) => {
          const dx = e.clientX - p.x;
          const dy = e.clientY - p.y;
          if (Math.hypot(dx, dy) < 95) {
            this.triggerShatterBurst(p.x, p.y, 8);
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
    }

    setTheme(themeKey) {
      if (this.themes[themeKey]) {
        this.currentThemeKey = themeKey;
        this.theme = this.themes[themeKey];
      }
    }

    toggleState(enable) {
      this.isEnabled = (typeof enable === 'boolean') ? enable : !this.isEnabled;
      if (this.isEnabled) {
        this.canvas.classList.remove('fx-disabled');
      } else {
        this.canvas.classList.add('fx-disabled');
      }
    }

    createParticle(initial = false) {
      const angleVariation = (Math.random() - 0.5) * 0.16;
      const angle = this.globalAngle + angleVariation;

      // 65% Streak/Comet vs 35% Glowing Circular Orb
      const isOrb = Math.random() < 0.35;

      // Opacity: Random variation from 0.25 to 0.95 (light and dark layered depth)
      const opacity = 0.25 + Math.random() * 0.70;

      // Shade tone variation: 0 = deepDark, 1 = midDark, 2 = midBright, 3 = highlight
      const shadeTier = Math.floor(Math.random() * 4);

      // Speed & Size
      const speed = 1.4 + Math.random() * 2.8;
      const radius = isOrb ? (1.5 + Math.random() * 4.0) : (1.0 + Math.random() * 1.8);
      const length = isOrb ? 0 : (30 + Math.random() * 65);

      const spawnX = initial ? Math.random() * (this.width + 600) - 300 : Math.random() * (this.width + 800) - 400;
      const spawnY = initial ? Math.random() * this.height : -80 - Math.random() * 140;

      return {
        x: spawnX,
        y: spawnY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        baseSpeed: speed,
        angleOffset: angleVariation,
        isOrb: isOrb,
        radius: radius,
        length: length,
        opacity: opacity,
        baseOpacity: opacity,
        shadeTier: shadeTier,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.03 + Math.random() * 0.05
      };
    }

    triggerShatterBurst(x, y, count = 8) {
      for (let i = 0; i < count; i++) {
        const pAngle = Math.random() * Math.PI * 2;
        const pSpeed = 1.5 + Math.random() * 3.5;
        this.shards.push({
          x: x,
          y: y,
          vx: Math.cos(pAngle) * pSpeed,
          vy: Math.sin(pAngle) * pSpeed,
          radius: 1.0 + Math.random() * 1.5,
          alpha: 1.0,
          decay: 0.025 + Math.random() * 0.03
        });
      }

      this.ripples.push({
        x: x,
        y: y,
        radius: 2,
        maxRadius: 28,
        alpha: 0.8,
        speed: 1.4
      });
    }

    update() {
      if (!this.isEnabled) return;

      // Smoothly interpolate wind angle
      this.globalAngle += (this.targetAngle - this.globalAngle) * 0.05;

      // 1. Update Particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];

        // SHATTER IMPACT ON POINTER TOUCH (No tornado!)
        if (this.mouse.isHovered) {
          const dx = this.mouse.x - p.x;
          const dy = this.mouse.y - p.y;
          const dist = Math.hypot(dx, dy);

          // Impact collision radius ~36px
          if (dist < 36) {
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
    }    draw() {
      if (!this.isEnabled) return;
      this.ctx.clearRect(0, 0, this.width, this.height);

      // 1. Draw Ripples
      this.ripples.forEach(r => {
        this.ctx.beginPath();
        this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = this.theme.midBright;
        this.ctx.lineWidth = 1.2;
        this.ctx.globalAlpha = r.alpha;
        this.ctx.stroke();
      });

      // 2. Draw Particles (Streaks & Orbs)
      this.particles.forEach(p => {
        this.ctx.globalAlpha = p.opacity;

        if (p.isOrb) {
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
        this.ctx.fillStyle = this.theme.spark;
        this.ctx.globalAlpha = s.alpha;
        this.ctx.shadowBlur = 6;
        this.ctx.shadowColor = this.theme.midBright;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      });

      this.ctx.globalAlpha = 1;
    }

    animate() {
      this.update();
      this.draw();
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
  // 3. Sentinel-X Cyber-Bot Scoreboard & Gamified HUD
  // ==========================================================================
  class SentinelScoreboard {
    constructor() {
      this.score = 0;
      this.combo = 0;
      this.comboTimer = null;
      this.lastHitTime = 0;

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

      this.pokeQuotes = [
        "Bleep bloop! Keep blasting comets! 🤖",
        "USD sublayer cache is running at 100%! ⚡",
        "Zero-touch automation online! 🚀",
        "Hey! Stop poking my antenna! (>_<)",
        "GPU temperature nominal. Fire away! 🔥"
      ];

      this.milestones = [
        { count: 1, rank: 'CADET', msg: 'Target locked! Pew pew! 🎯' },
        { count: 10, rank: 'SCOUT', msg: 'Pipeline anomaly eradicated! 🤖' },
        { count: 25, rank: 'SENTINEL', msg: 'Render farm running hot! ⚡' },
        { count: 50, rank: 'VFX SPECIALIST', msg: 'USD Sublayer cleared! You are a pro! 🚀' },
        { count: 100, rank: 'PHOTON DESTROYER', msg: 'Overclocking GPUs to 9000%! 🔥' },
        { count: 200, rank: 'COSMIC ARCHITECT', msg: 'Oscar-worthy precision achieved! 🏆' },
        { count: 500, rank: 'MULTIVERSE OVERLORD', msg: 'You vaporized the whole multiverse! 🌌' }
      ];

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

      // Poke reaction
      if (this.avatarBox) {
        this.avatarBox.addEventListener('click', (e) => {
          e.stopPropagation();
          const pokeFace = this.faces.poke[Math.floor(Math.random() * this.faces.poke.length)];
          const pokeQuote = this.pokeQuotes[Math.floor(Math.random() * this.pokeQuotes.length)];
          this.setFace(pokeFace, 900);
          this.setMessage(pokeQuote);
        });
      }

      // Minimize / Expand
      if (this.minBtn && this.hudWidget) {
        this.minBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.hudWidget.classList.toggle('minimized');
          this.minBtn.innerHTML = this.hudWidget.classList.contains('minimized') ? '+' : '&times;';
        });
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

      // Update score display with pop animation
      if (this.scoreEl) {
        this.scoreEl.innerText = this.score;
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
      this.spawnPopup(x, y, this.combo >= 4 ? `+${count} COMBO!` : `+${count}💥`);

      // Check milestones
      this.checkMilestones();
    }

    setFace(faceStr, duration = 500) {
      if (!this.faceEl) return;
      this.faceEl.innerText = faceStr;
      clearTimeout(this._faceTimer);
      this._faceTimer = setTimeout(() => {
        if (this.faceEl) this.faceEl.innerText = this.faces.idle[0];
      }, duration);
    }

    setMessage(msg) {
      if (this.msgEl) {
        this.msgEl.innerText = msg;
      }
    }

    checkMilestones() {
      for (let i = this.milestones.length - 1; i >= 0; i--) {
        const m = this.milestones[i];
        if (this.score >= m.count) {
          if (this.rankEl) this.rankEl.innerText = m.rank;
          if (this.score === m.count || this.score === m.count + 1) {
            this.setMessage(m.msg);
          }
          break;
        }
      }
    }

    spawnPopup(x, y, text) {
      if (!x || !y) return;
      const el = document.createElement('div');
      el.className = 'shatter-popup';
      el.innerText = text;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 700);
    }
  }

  // ==========================================================================
  // 4. UI Navigation, FX Controls & Scroll Spy Initialization
  // ==========================================================================
  function init() {
    // 1. Initialize Particle Engine
    const engine = new ParticleEngine('cometCanvas');

    // 2. Initialize Sentinel-X Scoreboard
    const scoreboard = new SentinelScoreboard();
    engine.onShatter = (x, y, count) => {
      scoreboard.onHit(x, y, count);
    };

    // 3. Setup Navbar On/Off Slide Switch (No text)
    const navFxToggle = document.getElementById('navFxToggle');
    const fxWidget = document.getElementById('fxWidget');
    const fxPanel = document.getElementById('fxPanel');
    const botHud = document.getElementById('botHudWidget');

    if (navFxToggle) {
      navFxToggle.addEventListener('click', () => {
        const isNowEnabled = !engine.isEnabled;
        engine.toggleState(isNowEnabled);

        if (isNowEnabled) {
          navFxToggle.classList.add('active');
          navFxToggle.setAttribute('title', 'Background FX: ON');
          if (fxWidget) fxWidget.classList.remove('hidden');
          if (botHud) botHud.classList.remove('hidden');
        } else {
          navFxToggle.classList.remove('active');
          navFxToggle.setAttribute('title', 'Background FX: OFF');
          if (fxWidget) {
            fxWidget.classList.add('hidden');
            if (fxPanel) fxPanel.classList.remove('open');
          }
          if (botHud) botHud.classList.add('hidden');
        }
      });
    }

    // 4. Setup Floating FX Preset Switcher
    const fxToggleBtn = document.getElementById('fxToggleBtn');
    const fxThemeButtons = document.querySelectorAll('.fx-theme-btn');

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

    // 5. Setup Architecture Flow
    renderArchitectureFlow('usd');
    archButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        archButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const flowKey = btn.getAttribute('data-flow');
        renderArchitectureFlow(flowKey);
      });
    });

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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
