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

    createParticle(initial = false) {
      const angleVariation = (Math.random() - 0.5) * 0.16;
      const angle = this.globalAngle + angleVariation;

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
        radius: radius,
        length: length,
        opacity: opacity,
        baseOpacity: opacity,
        shadeTier: shadeTier,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.03 + Math.random() * 0.05
      };
    }

    triggerShatterBurst(x, y, count = 8, isExtra = false) {
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
          decay: 0.022 + Math.random() * 0.028
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
        lineWidth: isExtra ? 2.4 : 1.6
      });
      if (isExtra) {
        this.ripples.push({
          x: x,
          y: y,
          radius: 1,
          maxRadius: 26,
          alpha: 0.8,
          speed: 1.3,
          lineWidth: 1.2
        });
      }
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

      // 1. Draw Shockwave Ripples with Neon Glow
      this.ripples.forEach(r => {
        this.ctx.beginPath();
        this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = this.theme.midBright;
        this.ctx.lineWidth = r.lineWidth || 1.4;
        this.ctx.globalAlpha = r.alpha;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = this.theme.highlight;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
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
            if (this.avatarBox) this.avatarBox.setAttribute('title', 'Click to poke Sentinel-X!');
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
            if (this.avatarBox) this.avatarBox.setAttribute('title', 'Click to poke Sentinel-X!');
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
            this.avatarBox.setAttribute('title', isMin ? 'Click to open Sentinel Scoreboard!' : 'Click to poke Sentinel-X!');
          }
        });
      }

      // Auto-minimize on mobile & small tablet screens (<= 768px) to prevent blocking content
      if (window.innerWidth <= 768 && this.hudWidget) {
        this.hudWidget.classList.add('minimized');
        if (this.minBtn) this.minBtn.innerHTML = '+';
        if (this.avatarBox) {
          this.avatarBox.setAttribute('title', 'Click to open Sentinel Scoreboard!');
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

    // 2. Initialize Cosmic Audio Synthesizer Engine
    const soundEngine = new CosmicSoundEngine();

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
          <button type="button" class="ai-followup-btn" data-query="Who is Rajeev Mutyalu and why should we hire him?">🌟 Why Hire Rajeev?</button>
        `;
      } else {
        if (welcomeLabel) welcomeLabel.innerText = 'Executive Quick Links:';
        welcomeChips.innerHTML = `
          <button type="button" class="ai-followup-btn" data-query="Who is Rajeev Mutyalu and why should we hire him?">🌟 Why Hire Rajeev?</button>
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
          scoreboard.setMessage('Weapons & Synth BGM online! Vaporize comets, Cadet! 🚀');
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
        keywords: ['certificate', 'certificates', 'certification', 'certifications', 'credentials', 'outskill', 'ai generalist', 'hackathon', 'accelerator', 'upskilling', 'training', 'fellowship'],
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
• Sentinel-X HUD is running in stealth mode.<br/><br/>
<em>Type <code>unmute sound</code> or <code>sound on</code> anytime to bring back the audio!</em>`,
          `🔇 <strong>STEALTH MODE ENGAGED // AUDIO OFF</strong><br/><br/>
• Audio synthesizer silenced for focus.<br/>
• Particle physics and combo scoring continue uninterrupted.<br/><br/>
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
• Sentinel-X audio cues active.<br/><br/>
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
The interactive <strong>Comet Cascade Particle Physics Engine &amp; Sentinel-X Scoreboard</strong> are engineered specifically for precision mouse/trackpad pointer physics, raycasted particle collision, and real-time Web Audio synthesis.<br/><br/>
💻 <em>Please open <strong>rajeev-mutyalu.github.io/portfolio-website</strong> on a desktop or laptop to vaporize comets, build multi-stage combos, and unlock Sentinel-X ranks!</em>`,
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
• <strong>Sentinel-X HUD:</strong> Tracking combos, rank, and score in the bottom-right corner.<br/>
• <strong>Audio Synthesizer:</strong> Ambient BGM and laser sfx unlocked.<br/>
• <strong>Controls:</strong> Hover or click on falling comets to vaporize them and build combos!<br/><br/>
<em>Switch visual presets, mute audio, or turn off below:</em>`,

          `🚀 <strong>SENTINEL-X COMET DEFENSE ONLINE!</strong><br/><br/>
• Dual shockwave physics and raycasted particle collisions active.<br/>
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
• The comet canvas and Sentinel-X HUD have returned to standby mode.<br/>
• Audio synthesis halted.<br/><br/>
<em>Type <code>turn on game mode</code> or click the Cosmic Switch in the top navbar anytime to jump back in!</em>`,

          `🛑 <strong>SENTINEL-X STANDBY // GAME MODE OFF</strong><br/><br/>
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

      const trimmedQuery = query.trim();
      if (!trimmedQuery) return;

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

      // 2. Set Status Telemetry to Thinking
      setCharlieThinkingState(true);

      // 3. Append Typing Indicator Bubble
      const typingDiv = document.createElement('div');
      typingDiv.className = 'ai-message ai-bot-msg bot-message ai-typing-indicator';
      typingDiv.innerHTML = `
        <div class="ai-msg-avatar" title="Charlie (AI Assistant)">🤖</div>
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

        setCharlieThinkingState(false);

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
          <div class="ai-msg-avatar" title="Charlie (AI Assistant)">🤖</div>
          <div class="ai-msg-body">
            <div class="ai-msg-author">Charlie <span>Rajeev's AI Assistant</span></div>
            <div class="ai-msg-content">${match.response}</div>
            ${followupsHtml}
          </div>
        `;

        aiChatStream.appendChild(botMsgDiv);
        scrollStreamToBottom();
      }, thinkingDelay);
    }

    // Delegated Click Listener for All Charlie Topic, Follow-up & Deep Link Buttons
    document.addEventListener('click', (e) => {
      // 1. Auto-switch architecture visualizer tab if link has data-arch-tab
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
        const q = aiInputField.value.trim();
        if (!q) return;
        aiInputField.value = '';
        document.querySelectorAll('.ai-sidebar-btn').forEach(b => b.classList.remove('active'));
        renderBotResponse(q);
      });
    }

    // 3. Setup Floating Quick-Launcher for Charlie (AI)
    const floatingCharlieBtn = document.getElementById('floatingCharlieBtn');

    if (floatingCharlieBtn) {
      floatingCharlieBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
