---
name: vfx-ai-portfolio-system
description: Complete architecture, design specifications, interactive Comet Cascade canvas engine, and production standards for Rajeev Mutyalu's VFX & GenAI Pipeline Portfolio. Covers OpenUSD pipeline specifications (Astra VFX USD v3), zero-touch n8n studio automation flows, Studio.AI (Scene Weaver) GenAI platform integration, and glassmorphic UI engineering.
---

# VFX & GenAI Portfolio System

A specialized, production-ready framework for architecting, designing, and maintaining high-performance portfolios and technical platforms for VFX Pipeline TDs, Systems Architects, and GenAI Automation Engineers.

---

## 🎨 1. Visual Design System & Aesthetics

### Color Tokens & Atmosphere
* **Deep Cosmic Void Canvas:** `#06080e` &bull; `rgba(6, 8, 14, 0.95)`
* **Frosted Glass Cards:** `rgba(13, 19, 32, 0.75)` with `backdrop-filter: blur(20px)` and subtle border `rgba(255, 255, 255, 0.08)`
* **Hover Accent Glows:** `rgba(0, 242, 254, 0.35)` (Cyan) &bull; `rgba(59, 130, 246, 0.4)` (Cyber Blue)
* **Vibrant Accent Spectrum:**
  * **Electric Cyber Blue:** `#3b82f6` / `#60a5fa`
  * **Neon Luminous Cyan:** `#00f2fe` / `#06b6d4`
  * **Solar Amber / Gold:** `#fbbf24` / `#f59e0b`
  * **Aurora Emerald:** `#34d399` / `#10b981`
* **Typography:**
  * Headings & Identity: `Plus Jakarta Sans` / `Outfit` (`700-800` weight, `-0.025em` tracking)
  * Body Text: `Plus Jakarta Sans` (`400-500` weight, `1.65` line height)
  * Monospace Telemetry: `JetBrains Mono` / `Geist Mono` (`0.82rem` badge font)

---

## 🌌 2. Interactive Comet Cascade Particle Engine

A 60 FPS HTML5 Canvas engine providing ambient cosmic rainfall, pointer-following gravity tilt, and impact shattering.

### Core Physics Architecture
1. **Dynamic Directional Tilt:**
   * Global rain angle tilts dynamically based on mouse X position (`normX = (mouse.x / width) - 0.5; targetAngle = (Math.PI / 2) + (normX * 0.65)`).
   * Tilts seamlessly from Top-Right &rarr; Center 90° &rarr; Top-Left.
2. **Velocity & Stream Calibration:**
   * Gentle, non-distracting stream velocity: `1.4` to `4.2` px/frame.
3. **Collision Shatter Sparks:**
   * When particles contact the cursor (`distance < 36px`), they shatter into 6-8 glittering outward spark shards and expanding micro-ripples instead of artificial tornado vortexes.
4. **Geometric & Shading Diversity:**
   * **65% Sleek Comets:** Length 30-95px, width 1.0-2.8px.
   * **35% Glowing Circular Orbs:** Radius 1.5-5.5px with ambient radial glow.
   * **4-Tier Shading:** Highlight White (`#ffffff`), Vibrant Mid-tone, Deep Tone, Dark Base with random opacities from `0.25` to `0.95`.
5. **Slide Switch & Conditional Visibility:**
   * Top-right minimalist slide switch (`.fx-slider-switch`) next to "Get in Touch" controls engine state.
   * Bottom-right floating **`[FX: Preset]`** menu is **only visible when animation is ON**; it hides unconditionally (`display: none !important; opacity: 0 !important`) when toggled OFF.

---

## 🎬 3. Grounded Studio Architecture Specifications

### 🎬 A. Astra VFX USD Pipeline (from `Astra_VFX_USD_Pipeline_v3.pdf`)
* **Two-Tier Architecture:**
  * **Tier 1 (Modular Asset Creation):** `Modeling` &rarr; `Groom` &rarr; `Look Dev` &rarr; `Rigging` &rarr; `Assembly` (`assembly.usda + rig.ma`).
  * **Tier 2 (Shot Pipeline SH0010 usdShot Sublayer Stack):**
    1. **Asset Creation:** Modular asset packages with clean namespaces.
    2. **Layout Setup:** Seeds `usdShot`, sets camera optics, framing, and environment set dressing.
    3. **Animation Cache:** Bakes deforming geometry cache into `/Characters` with class prims `/__class__` and rest-pose `Pref`.
    4. **CFX & FX Simulation:** Cloth and hair dynamics into `/Crowds`, Houdini caches & VDBs into `/FX`.
    5. **Lighting & Final Render:** Lookdev class binding, `/Lights` prims, and single unified renderable deliverable `SH0010_usdShot.usda`.

### ⚡ B. Zero-Touch n8n Studio Automation
* **7-Stage Production Sequence:**
  1. **Event Trigger:** Slack message, turn-over webhook, or automated directory watcher.
  2. **n8n Core Hub:** Central logic router, authentication, and validation engine.
  3. **Project Onboarding:** Automated project folder provisioning, permission matrix, and ShotGrid project setup.
  4. **Pattern Recognition for VFX Plates:** Smart regex validation of raw client plates, resolution, and color space metadata.
  5. **Ingest and Render:** Automated EXR/ProRes transcode, color transform (ACEScg), and farm dispatch.
  6. **ShotGrid Update:** Bidirectional update of shot status, cut durations, versions, and thumbnails.
  7. **Production Notification:** Automated Slack and email artist briefs with review links.

### 🤖 C. Studio.AI GenAI Prompt-to-Video Platform (`Scene Weaver`)
* **Platform URL:** `https://astra-aipipeline2.lovable.app/`
* **5-Node Pipeline Flow:**
  1. **Script & Storyboards:** Automated scene breakdown, beat sheets, and prompt sequence extraction.
  2. **Prompt Studio & Router:** Multi-model prompt optimization across **Google Veo**, **Kling AI**, **Higgsfield**, and **Seedance**.
  3. **Frame Consistency:** Character identity locking via multi-view latent anchors and IP-adapter embeddings.
  4. **Editorial & Review:** Director review, timeline assemble, visual diff, and approval workflows.
  5. **ACES Studio Conform:** ACEScg plate matching, upscaling, and Nuke comp turnover.

---

## 📇 4. Layout & Content Standards

1. **Executive Terminology Rule:**
   * Avoid raw code keywords like `/__class__` or `{shot}_usdShot` in marketing headers.
   * Use clean executive terms: `OpenUSD Architecture`, `Modular Asset Creation`, `Shot Sublayer Pipeline`, `Non-Destructive Workflow`, `Unified Deliverables`.
2. **Compact Contact Card:**
   * Clamped single-line title (`Let's Build the Future of VFX & AI Pipelines`).
   * Zero void space, concise subtext, and immediate social/email actions.
3. **Clean Git Deployment:**
   * Never commit temporary sprite sheets, generation scripts, or uncompressed video cutouts.
   * Push directly to `main` branch with clean semantic commit messages.
