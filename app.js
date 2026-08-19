/**
 * Rajeev Mutyalu Portfolio — Interactive Engine & "Play Fetch With Donut" Companion
 * Features:
 * - Duo-Tone Fetch Ball: Smooth cursor follower + gentle idle bounce when stationary
 * - Donut (Smooth Fox Terrier): Runs freely across screen towards the ball
 * - Arrives & wags tail happily
 * - 10-Second Idle Catch: Donut leaps, catches the ball with "CHOMP! 🐾✨", holds in mouth
 * - Click to Release: Clicking Donut releases the ball back to cursor & repeats
 * - Interactive Pipeline Architecture Flow switcher
 * - Smooth scroll navigation spy
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. "Play Fetch With Donut" Interactive Companion Engine
  // ==========================================================================
  const fetchBall = document.getElementById('fetchBall');
  const donutDog = document.getElementById('donutDog');
  const donutSprite = document.getElementById('donutSprite');
  const donutSpeech = document.getElementById('donutSpeech');
  const donutChomp = document.getElementById('donutChomp');

  if (fetchBall && donutDog && donutSprite) {
    // Ball State
    const ball = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
      visible: true,
      bouncing: true
    };

    // Donut Dog State
    const dog = {
      x: window.innerWidth - 140,
      y: window.innerHeight - 140,
      targetX: window.innerWidth - 140,
      targetY: window.innerHeight - 140,
      facingRight: false,
      isRunning: false,
      isHoldingBall: false,
      speed: 0.075 // smooth interpolation speed
    };

    // Idle Timer (10 Seconds)
    let idleTimer = null;
    let stopMotionTimer = null;
    const IDLE_CATCH_DELAY = 10000; // 10 seconds

    // Mouse Tracking
    window.addEventListener('mousemove', (e) => {
      ball.targetX = e.clientX;
      ball.targetY = e.clientY;

      if (!dog.isHoldingBall) {
        fetchBall.classList.remove('bouncing');
        ball.bouncing = false;

        // Reset 10s idle catch timer on movement
        clearTimeout(idleTimer);
        clearTimeout(stopMotionTimer);

        // When mouse stops moving for 200ms, start idle bounce & send Donut
        stopMotionTimer = setTimeout(() => {
          if (!dog.isHoldingBall) {
            fetchBall.classList.add('bouncing');
            ball.bouncing = true;

            // Send Donut running towards the ball
            sendDonutToBall();

            // Start 10s idle countdown to catch
            startIdleCatchTimer();
          }
        }, 200);
      }
    });

    function startIdleCatchTimer() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (!dog.isHoldingBall) {
          executeDonutCatch();
        }
      }, IDLE_CATCH_DELAY);
    }

    function sendDonutToBall() {
      // Position Donut slightly offset so ball stays visible next to him
      const offsetX = ball.targetX > dog.x ? -45 : 45;
      const offsetY = 15;
      dog.targetX = Math.max(40, Math.min(window.innerWidth - 100, ball.targetX + offsetX));
      dog.targetY = Math.max(40, Math.min(window.innerHeight - 100, ball.targetY + offsetY));
    }

    function executeDonutCatch() {
      dog.isHoldingBall = true;
      clearTimeout(idleTimer);

      // Snap Donut to ball
      dog.targetX = ball.x - 20;
      dog.targetY = ball.y - 20;

      donutDog.classList.remove('running', 'wagging');
      donutDog.classList.add('catching', 'show-chomp');

      // Pop "CHOMP!" effect
      setTimeout(() => {
        donutSprite.src = 'donut_catch.png';
        fetchBall.style.opacity = '0'; // hide standalone ball
        donutSpeech.innerText = 'Click Donut to throw again! 🐶';
        donutDog.classList.add('show-speech');
      }, 300);

      setTimeout(() => {
        donutDog.classList.remove('show-chomp');
      }, 1500);
    }

    // Click on Donut to Release Ball
    donutDog.addEventListener('click', (e) => {
      e.stopPropagation();

      if (dog.isHoldingBall) {
        // Release Ball back to mouse
        dog.isHoldingBall = false;
        donutSprite.src = 'donut_idle.png';
        fetchBall.style.opacity = '1';
        donutDog.classList.remove('catching');
        
        donutSpeech.innerText = 'Woof! Throw it again! 🎾';
        donutDog.classList.add('show-speech');

        // Pop ball slightly
        ball.x = e.clientX || ball.targetX;
        ball.y = e.clientY || ball.targetY;
        fetchBall.classList.add('bouncing');

        setTimeout(() => {
          donutDog.classList.remove('show-speech');
        }, 2200);

        startIdleCatchTimer();
      } else {
        // Pet Donut
        donutSpeech.innerText = '*Tail wags happily* 🐾';
        donutDog.classList.add('show-speech');
        donutDog.classList.add('wagging');

        setTimeout(() => {
          donutDog.classList.remove('show-speech');
        }, 1800);
      }
    });

    // Companion Physics Loop (60 FPS)
    function updateCompanion() {
      // 1. Update Ball Position (smooth lerp)
      if (!dog.isHoldingBall) {
        ball.x += (ball.targetX - ball.x) * 0.18;
        ball.y += (ball.targetY - ball.y) * 0.18;
        fetchBall.style.transform = `translate3d(${ball.x}px, ${ball.y}px, 0)`;
      }

      // 2. Update Donut Position (running lerp)
      const dx = dog.targetX - dog.x;
      const dy = dog.targetY - dog.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 8) {
        dog.x += dx * dog.speed;
        dog.y += dy * dog.speed;
        dog.isRunning = true;

        // Flip Donut sprite based on movement direction
        dog.facingRight = dx > 0;
        donutSprite.style.transform = dog.facingRight ? 'scaleX(-1)' : 'scaleX(1)';

        donutDog.classList.add('running');
        donutDog.classList.remove('wagging');
      } else {
        if (dog.isRunning) {
          dog.isRunning = false;
          donutDog.classList.remove('running');

          if (!dog.isHoldingBall) {
            donutDog.classList.add('wagging');
            donutSpeech.innerText = 'Donut is ready! 🎾';
            donutDog.classList.add('show-speech');
            setTimeout(() => {
              donutDog.classList.remove('show-speech');
            }, 2000);
          }
        }
      }

      donutDog.style.transform = `translate3d(${dog.x}px, ${dog.y}px, 0)`;

      requestAnimationFrame(updateCompanion);
    }

    // Initial setup
    fetchBall.style.transform = `translate3d(${ball.x}px, ${ball.y}px, 0)`;
    donutDog.style.transform = `translate3d(${dog.x}px, ${dog.y}px, 0)`;
    startIdleCatchTimer();
    updateCompanion();
  }

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
