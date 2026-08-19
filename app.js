/**
 * Rajeev Mutyalu Portfolio — Frame-by-Frame Donut Animation Engine
 * 
 * Features:
 * - 4-Frame Dynamic Running Cycle (Moving legs, open panting mouth)
 * - 4-Frame Sitting & Wagging Idle Cycle (Panting with pink tongue, alert ears, tail wagging)
 * - 4-Frame Jumping & Catch Cycle (Leaping up, biting ball with jaws around ball, landing proudly)
 * - Correct directional facing: Donut's face ALWAYS looks at the ball
 * - 15-Second Idle Catch timer
 * - Click on Donut to release the ball back to cursor & repeat
 * - Interactive Pipeline Architecture Flow switcher
 * - Smooth scroll navigation spy
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. Frame-by-Frame Donut Companion Engine
  // ==========================================================================
  const fetchBall = document.getElementById('fetchBall');
  const donutDog = document.getElementById('donutDog');
  const donutSprite = document.getElementById('donutSprite');
  const donutSpeech = document.getElementById('donutSpeech');
  const donutChomp = document.getElementById('donutChomp');

  if (fetchBall && donutDog && donutSprite) {
    // Animation Frames Preloader
    const FRAMES = {
      run: ['sprites/run_1.png', 'sprites/run_2.png', 'sprites/run_3.png', 'sprites/run_4.png'],
      sit: ['sprites/sit_1.png', 'sprites/sit_2.png', 'sprites/sit_3.png', 'sprites/sit_4.png'],
      catch: ['sprites/catch_1.png', 'sprites/catch_2.png', 'sprites/catch_3.png', 'sprites/catch_4.png']
    };

    // Preload all frames in browser cache
    Object.values(FRAMES).flat().forEach(src => {
      const img = new Image();
      img.src = src;
    });

    // Ball State
    const ball = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
      bouncing: true
    };

    // Donut State
    const dog = {
      x: window.innerWidth - 180,
      y: window.innerHeight - 220,
      targetX: window.innerWidth - 180,
      targetY: window.innerHeight - 220,
      state: 'sit', // 'run' | 'sit' | 'catch'
      frameIdx: 0,
      facingRight: false,
      isHoldingBall: false,
      speed: 0.085
    };

    // Timers
    let idleCatchTimer = null;
    let stopMotionTimer = null;
    let animFrameInterval = null;
    const IDLE_CATCH_DELAY = 15000; // 15 Seconds

    // Frame Animation Loop
    function startFrameAnimation(stateKey, intervalMs) {
      if (dog.state === stateKey && animFrameInterval) return;
      clearInterval(animFrameInterval);
      dog.state = stateKey;
      dog.frameIdx = 0;

      animFrameInterval = setInterval(() => {
        const frameList = FRAMES[dog.state];
        if (!frameList) return;

        if (dog.state === 'catch') {
          // Play catch sequence once and hold on the final frame (catch_4.png)
          if (dog.frameIdx < frameList.length - 1) {
            dog.frameIdx++;
          }
        } else {
          dog.frameIdx = (dog.frameIdx + 1) % frameList.length;
        }

        donutSprite.src = frameList[dog.frameIdx];
      }, intervalMs);
    }

    // Mouse Tracking
    window.addEventListener('mousemove', (e) => {
      ball.targetX = e.clientX;
      ball.targetY = e.clientY;

      if (!dog.isHoldingBall) {
        fetchBall.style.display = 'flex';
        fetchBall.style.opacity = '1';
        fetchBall.classList.remove('bouncing');
        ball.bouncing = false;

        // Reset 15s idle timer
        clearTimeout(idleCatchTimer);
        clearTimeout(stopMotionTimer);

        // When mouse pauses for 200ms, start bouncing & send Donut
        stopMotionTimer = setTimeout(() => {
          if (!dog.isHoldingBall) {
            fetchBall.classList.add('bouncing');
            ball.bouncing = true;

            sendDonutToBall();
            startIdleCatchTimer();
          }
        }, 200);
      }
    });

    function startIdleCatchTimer() {
      clearTimeout(idleCatchTimer);
      idleCatchTimer = setTimeout(() => {
        if (!dog.isHoldingBall) {
          executeDonutCatch();
        }
      }, IDLE_CATCH_DELAY);
    }

    function sendDonutToBall() {
      // Offset Donut so his head faces the ball
      const offsetX = ball.targetX > dog.x ? -100 : 30;
      const offsetY = -40;
      dog.targetX = Math.max(30, Math.min(window.innerWidth - 160, ball.targetX + offsetX));
      dog.targetY = Math.max(30, Math.min(window.innerHeight - 200, ball.targetY + offsetY));
    }

    function executeDonutCatch() {
      dog.isHoldingBall = true;
      clearTimeout(idleCatchTimer);

      // Snap Donut to exact ball coordinates
      const catchOffsetX = dog.facingRight ? -80 : -20;
      dog.targetX = ball.x + catchOffsetX;
      dog.targetY = ball.y - 70;
      dog.x = dog.targetX;
      dog.y = dog.targetY;

      // Hide standalone bouncing ball
      fetchBall.style.display = 'none';
      fetchBall.style.opacity = '0';
      fetchBall.classList.remove('bouncing');

      donutDog.classList.add('catching', 'show-chomp');
      startFrameAnimation('catch', 160);

      donutSpeech.innerText = 'Click Donut to throw again! 🐶';
      donutDog.classList.add('show-speech');

      setTimeout(() => {
        donutDog.classList.remove('show-chomp');
      }, 1600);
    }

    // Click on Donut to Release Ball
    donutDog.addEventListener('click', (e) => {
      e.stopPropagation();

      if (dog.isHoldingBall) {
        // Release Ball back to cursor
        dog.isHoldingBall = false;
        donutDog.classList.remove('catching');
        
        fetchBall.style.display = 'flex';
        fetchBall.style.opacity = '1';
        ball.x = e.clientX || ball.targetX;
        ball.y = e.clientY || ball.targetY;
        fetchBall.classList.add('bouncing');

        startFrameAnimation('sit', 240);

        donutSpeech.innerText = 'Woof! Throw it again! 🎾';
        donutDog.classList.add('show-speech');

        setTimeout(() => {
          donutDog.classList.remove('show-speech');
        }, 2200);

        startIdleCatchTimer();
      } else {
        // Pet Donut
        donutSpeech.innerText = '*Pants happily & wags tail* 🐾';
        donutDog.classList.add('show-speech');

        setTimeout(() => {
          donutDog.classList.remove('show-speech');
        }, 1800);
      }
    });

    // 60 FPS Physics & Motion Loop
    function updateCompanion() {
      // 1. Smooth Ball Movement
      if (!dog.isHoldingBall) {
        ball.x += (ball.targetX - ball.x) * 0.18;
        ball.y += (ball.targetY - ball.y) * 0.18;
        fetchBall.style.transform = `translate3d(${ball.x}px, ${ball.y}px, 0)`;
      }

      // 2. Smooth Dog Motion
      const dx = dog.targetX - dog.x;
      const dy = dog.targetY - dog.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 8 && !dog.isHoldingBall) {
        dog.x += dx * dog.speed;
        dog.y += dy * dog.speed;

        // Switch to 4-Frame Run Animation
        startFrameAnimation('run', 110);
        donutDog.classList.add('running');
        donutDog.classList.remove('wagging');

        // Direction facing: Face the movement direction
        dog.facingRight = dx > 0;
        donutSprite.style.transform = dog.facingRight ? 'scaleX(1)' : 'scaleX(-1)';
      } else {
        donutDog.classList.remove('running');

        if (!dog.isHoldingBall) {
          // Switch to 4-Frame Sitting & Wagging Idle Animation
          startFrameAnimation('sit', 260);
          donutDog.classList.add('wagging');

          // Face towards the ball so head/eyes always look at ball
          dog.facingRight = ball.x >= dog.x;
          donutSprite.style.transform = dog.facingRight ? 'scaleX(1)' : 'scaleX(-1)';
        }
      }

      donutDog.style.transform = `translate3d(${dog.x}px, ${dog.y}px, 0)`;

      requestAnimationFrame(updateCompanion);
    }

    // Initial setup
    fetchBall.style.transform = `translate3d(${ball.x}px, ${ball.y}px, 0)`;
    donutDog.style.transform = `translate3d(${dog.x}px, ${dog.y}px, 0)`;
    startFrameAnimation('sit', 260);
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
