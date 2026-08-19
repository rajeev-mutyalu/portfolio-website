/**
 * Rajeev Mutyalu Portfolio - Interactive Engine
 */

(function () {
  'use strict';

  // --- Architecture Flow Definitions ---
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

  // --- DOM Elements ---
  const archButtons = document.querySelectorAll('.arch-btn');
  const archCanvas = document.getElementById('archCanvas');
  const archDetails = document.getElementById('archDetails');

  // --- Render Architecture Flow ---
  function renderArchitectureFlow(flowKey) {
    const flow = FLOWS[flowKey];
    if (!flow) return;

    // Render Canvas Nodes
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

  // --- Event Listeners ---
  function init() {
    // Initialize default flow
    renderArchitectureFlow('usd');

    // Button click handlers
    archButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        archButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const flowKey = btn.getAttribute('data-flow');
        renderArchitectureFlow(flowKey);
      });
    });

    // Smooth Scroll Active Link Spy
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
