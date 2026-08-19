/**
 * Rajeev Mutyalu Portfolio — Interactive Engine & Hybrid Cyber Physics Canvas
 * Features:
 * - Floating ambient glowing spheres (gumballs / orbs)
 * - Mouse pointer proximity physics (acceleration, elastic bounce, repulsion)
 * - Luminous comet particle trails
 * - Interactive Pipeline Architecture Flow switcher
 * - Smooth scroll navigation spy
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. Hybrid Cyber Physics Canvas Engine
  // ==========================================================================
  const canvas = document.getElementById('fxCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // Mouse State
  const mouse = {
    x: -1000,
    y: -1000,
    radius: 140,
    active: false
  };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
  });

  // Color Palette for Glowing Spheres & Comet Trails
  const PALETTE = [
    { fill: 'rgba(0, 242, 254, 0.85)', glow: '#00f2fe', trail: 'rgba(0, 242, 254, ' },
    { fill: 'rgba(59, 130, 246, 0.85)', glow: '#3b82f6', trail: 'rgba(59, 130, 246, ' },
    { fill: 'rgba(0, 245, 155, 0.85)', glow: '#00f59b', trail: 'rgba(0, 245, 155, ' },
    { fill: 'rgba(245, 166, 35, 0.85)', glow: '#f5a623', trail: 'rgba(245, 166, 35, ' },
    { fill: 'rgba(255, 87, 66, 0.85)', glow: '#ff5742', trail: 'rgba(255, 87, 66, ' },
    { fill: 'rgba(168, 85, 247, 0.85)', glow: '#a855f7', trail: 'rgba(168, 85, 247, ' }
  ];

  class CyberOrb {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.radius = Math.random() * 9 + 5; // sphere size: 5px to 14px
      this.x = initial ? Math.random() * width : Math.random() < 0.5 ? 0 : width;
      this.y = initial ? Math.random() * height : Math.random() * height;
      
      // Ambient floating drift velocity
      this.vx = (Math.random() - 0.5) * 1.2;
      this.vy = (Math.random() - 0.5) * 1.2;
      this.baseVx = this.vx;
      this.baseVy = this.vy;

      this.colorObj = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      this.friction = 0.96; // deceleration after mouse push
      this.trail = [];
      this.maxTrail = 10;
    }

    update() {
      // Record trailing points for comet streak
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > this.maxTrail) {
        this.trail.shift();
      }

      // Mouse Repulsion & Impulse Physics
      if (mouse.active) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          const pushPower = force * 6.5;

          this.vx += Math.cos(angle) * pushPower;
          this.vy += Math.sin(angle) * pushPower;
        }
      }

      // Apply friction towards ambient drift
      this.vx *= this.friction;
      this.vy *= this.friction;

      // Soft ambient nudge so orbs keep floating smoothly
      this.vx += (this.baseVx - this.vx) * 0.03;
      this.vy += (this.baseVy - this.vy) * 0.03;

      this.x += this.vx;
      this.y += this.vy;

      // Elastic Wall Bounce with damping
      if (this.x - this.radius <= 0) {
        this.x = this.radius;
        this.vx = -this.vx * 0.85;
      } else if (this.x + this.radius >= width) {
        this.x = width - this.radius;
        this.vx = -this.vx * 0.85;
      }

      if (this.y - this.radius <= 0) {
        this.y = this.radius;
        this.vy = -this.vy * 0.85;
      } else if (this.y + this.radius >= height) {
        this.y = height - this.radius;
        this.vy = -this.vy * 0.85;
      }
    }

    draw() {
      // 1. Draw Subtle Comet Tail
      if (this.trail.length > 2) {
        for (let i = 0; i < this.trail.length - 1; i++) {
          const p1 = this.trail[i];
          const p2 = this.trail[i + 1];
          const alpha = (i / this.trail.length) * 0.45;
          const strokeWidth = (i / this.trail.length) * (this.radius * 0.8);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `${this.colorObj.trail}${alpha})`;
          ctx.lineWidth = strokeWidth;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      // 2. Draw Glowing Core Sphere (Gumball Orb)
      ctx.save();
      ctx.shadowColor = this.colorObj.glow;
      ctx.shadowBlur = 14;

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.colorObj.fill;
      ctx.fill();

      // Inner highlight reflection
      ctx.beginPath();
      ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fill();

      ctx.restore();
    }
  }

  let particles = [];
  function initParticles() {
    particles = [];
    const count = Math.min(Math.floor((width * height) / 22000), 55); // Responsive particle count (30-55)
    for (let i = 0; i < count; i++) {
      particles.push(new CyberOrb());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    requestAnimationFrame(animate);
  }

  initParticles();
  animate();

  // ==========================================================================
  // 2. Interactive Pipeline Architecture Visualizer
  // ==========================================================================
  const FLOWS = {
    usd: {
      nodes: [
        { title: 'Asset Modeling', sub: 'Geometry & UVs' },
        { title: 'USD Stage', sub: 'Layering & Variants', highlight: true },
        { title: 'Lighting & Shading', sub: 'Hydra / MaterialX' },
        { title: 'Live Nuke USD', sub: 'Deep Comp Integration' },
        { title: 'Final Delivery', sub: 'ACES / Plate Match' }
      ],
      description: '<strong>OpenUSD Pipeline Architecture:</strong> End-to-end stage composition unifying modeling, layout, lighting, and compositing with non-destructive layering and real-time Hydra viewport feedback.'
    },
    automation: {
      nodes: [
        { title: 'Event Trigger', sub: 'Slack / Webhook' },
        { title: 'n8n Core Hub', sub: 'Logic & Branching', highlight: true },
        { title: 'DCC Tool Task', sub: 'Nuke / Maya API' },
        { title: 'ShotGrid Update', sub: 'Status & Metadata' },
        { title: 'Artist Notification', sub: 'Zero Friction' }
      ],
      description: '<strong>Zero-Touch n8n Studio Automation:</strong> Automated event-driven dispatch eliminating manual repetitive tasks across review systems, render monitoring, and ingest/egress pipelines.'
    },
    genai: {
      nodes: [
        { title: 'Prompt & Directives', sub: 'Text / Multi-modal' },
        { title: 'GenAI Router', sub: 'Veo / Kling / Seedance', highlight: true },
        { title: 'Frame Consistency', sub: 'Higgsfield / Latent Match' },
        { title: 'Upscale & Color', sub: 'Studio ACES Conform' },
        { title: 'Comp Pipeline', sub: 'Plate Merge & Final' }
      ],
      description: '<strong>GenAI Prompt-to-Video Engine:</strong> Autonomous generation pipelines harnessing Google Veo, Kling AI, Higgsfield, and Seedance for high-fidelity content generation from text prompts.'
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
  // 3. UI Navigation & Scroll Spy Initialization
  // ==========================================================================
  function initUI() {
    renderArchitectureFlow('usd');

    archButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        archButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const flowKey = btn.getAttribute('data-flow');
        renderArchitectureFlow(flowKey);
      });
    });

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
    document.addEventListener('DOMContentLoaded', initUI);
  } else {
    initUI();
  }
})();
