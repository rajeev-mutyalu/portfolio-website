# 🚀 Rajeev Mutyalu — VFX & Frontier AI Portfolio Ecosystem
## Complete System Architecture, Interactive Engines, Executive Document Suite & Charlie AI Specification

**Author & Subject:** Rajeev Mutyalu  
**Role:** Lead Software Architect &bull; Production Technology Architect &bull; Creative Technology & AI Systems Lead  
**Pedigree:** 20+ Years Technical Leadership (Astra Studios, Technicolor Group, MPC Film, Prime Focus World)  
**Selected Credits:** *1917*, *RRR*, *Mufasa: The Lion King*, *Life of Pi*  
**Production Release Version:** `v5.1-stable` &bull; Cache Buster `v=202` &bull; Git Tag: `perfect_phase_36`

---

## 📑 Table of Contents
1. [Executive Summary & Design Philosophy](#1-executive-summary--design-philosophy)
2. [Visual Design System: Obsidian Dark Glassmorphism](#2-visual-design-system-obsidian-dark-glassmorphism)
   - [Interactive Navigation & Frozen Section Scroll HUD (`#frozenSectionHUD`)](#-interactive-navigation--frozen-section-scroll-hud-frozensectionhud)
3. [🤖 Cyber Charlie AI & Character System](#3--cyber-charlie-ai--character-system)
   - [Charlie Docking Stations & Escort Architecture](#-charlie-docking-stations--escort-architecture)
   - [Air-Gapped Offline Local Mode Architecture](#-air-gapped-offline-local-mode-architecture)
   - [Supersonic Cyber Dash & Combat Deployment](#supersonic-cyber-dash--combat-deployment)
   - [Multi-Skin Wardrobe System (Cyber, Architect, Shinobi)](#multi-skin-wardrobe-system)
   - [Cyber Charlie Character Lab (`charlie-lab.html`)](#cyber-charlie-character-lab)
4. [🎮 10/10 Arcade Gamification & Comet Cascade Engine](#4-1010-arcade-gamification--comet-cascade-engine)
   - [Game Mode Lifecycle & UI Transformations](#-game-mode-lifecycle--ui-transformations)
   - [Canvas Physics & Raycasting](#canvas-physics--raycasting)
   - [Visual Shaders & FX Presets](#visual-shaders--fx-presets)
   - [Arcade Scoring, Shockwaves & Milestones](#arcade-scoring-shockwaves--milestones)
   - [Procedural Spatial Web Audio Synthesizer](#procedural-spatial-web-audio-synthesizer)
5. [📄 Executive Document Suite: 3-Page CV & Print Perfection (`cv.html`)](#5-executive-document-suite-3-page-cv--print-perfection-cvhtml)
   - [Dual CV Themes: Colorful Dark vs. Plain B&W](#dual-cv-themes-colorful-dark-vs-plain-bw)
   - [1-Click ATS Plaintext Resume Export](#1-click-ats-plaintext-resume-export)
   - [Print & PDF Export Options](#print--pdf-export-options)
   - [Executive Portrait Download](#executive-portrait-download)
   - [Interactive Domain Spotlight Focus Filters](#interactive-domain-spotlight-focus-filters)
   - [Contact Matrix & Quick Actions](#contact-matrix--quick-actions)
6. [🎬 Production Architecture Visualizers](#6-production-architecture-visualizers)
   - [Astra VFX USD v3 Pipeline](#astra-vfx-usd-v3-pipeline)
   - [Zero-Touch n8n Studio Automation Hub](#zero-touch-n8n-studio-automation-hub)
   - [Studio.AI Prompt-to-Video Workflow (Scene Weaver)](#studioai-prompt-to-video-workflow-scene-weaver)
7. [💻 Display Resilience, Zoom Tolerance & Layer Hierarchy](#7-display-resilience-zoom-tolerance--layer-hierarchy)

---

## 1. Executive Summary & Design Philosophy

The Rajeev Mutyalu portfolio ecosystem is a dual-purpose digital platform engineered to demonstrate **technical mastery at the intersection of Hollywood VFX pipelines and Frontier Generative AI**. 

Unlike conventional static portfolios, this application serves as:
1. **An Executive Technology Showcase:** Demonstrating large-scale OpenUSD shot architectures, studio workflow automation (n8n), private on-premise LLMs, Model Context Protocol (MCP) agents, and Oscar-winning filmography.
2. **A Live Interactive Software Product:** Built entirely with vanilla Web APIs (HTML5 Canvas, Web Audio API, CSS Glassmorphism, zero heavy runtime frameworks), delivering sub-millisecond offline local latency, 60–120 FPS physics, and responsive desktop computing across Full HD, 4K, and varied zoom levels.

---

## 2. Visual Design System: Obsidian Dark Glassmorphism

Built upon the bespoke **Vetric Design System**, the visual presentation establishes an authoritative, high-density engineering aesthetic:

| Design Token | Value / Specification | Context / Application |
| :--- | :--- | :--- |
| **Cosmic Void Background** | `#06080e` &bull; `rgba(6, 8, 14, 0.95)` | Primary page background |
| **Glassmorphic Surface** | `rgba(13, 19, 32, 0.75)` + `backdrop-filter: blur(20px)` | Cards, HUDs, modals, and toolbars |
| **Card Borders** | `1px solid rgba(255, 255, 255, 0.08)` | Crisp high-precision separation |
| **Electric Cyber Blue** | `#3b82f6` / `#60a5fa` | Primary interactive accents & buttons |
| **Luminous Cyan** | `#00f2fe` / `#38bdf8` | Tech highlights, Charlie energy glows |
| **Frontier Violet** | `#8b5cf6` / `#a855f7` | Architecture node graph badges |
| **Solar Plasma Amber** | `#fbbf24` / `#f59e0b` | Game Mode badges & combo indicators |
| **Aurora Emerald** | `#34d399` / `#10b981` | Live status pills, verification badges |
| **Typography (Headings)** | `Outfit` / `Plus Jakarta Sans` (`700–800` weight) | Bold, modern display typography |
| **Typography (Body)** | `Plus Jakarta Sans` / `Inter` (`400–500` weight) | High legibility technical prose |
| **Typography (Code & Stats)** | `JetBrains Mono` (`0.82rem`) | Telemetry, stats, shell commands, chips |

### 📌 Interactive Navigation & Frozen Section Scroll HUD (`#frozenSectionHUD`)
A key UX innovation of the portfolio is the **Real-Time Frozen Section HUD**, an active section title bar pinned immediately beneath the fixed glassmorphic navbar:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [RM] Rajeev Mutyalu          [Architecture] [Endorsements] [Contact]   [Game Mode] ( ) │ ← Fixed Navbar
├────────────────────────────────────────────────────────────────────────────────────────┤
│ (●) Active Section // What Leaders Say   [▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░] 52.4%              │ ← Frozen HUD
└────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Active Title Freeze & Dynamic Visibility:**
   - As the user scrolls through the portfolio, the HUD detects when a section header reaches the bottom edge of the navbar (`triggerLine = navHeight + 12px`).
   - The HUD smoothly slides in (`.is-visible`), freezing the active section's title so the visitor always maintains clear spatial orientation.
   - When a section ends, or while in the natural buffer gap between major sections (such as Hero and Footer), the HUD gracefully slides away.
2. **Smooth Cross-Fade Title Morphing (`.hud-morphing`):**
   - When crossing from one section into the next, the title does not jump abruptly. A 100ms cubic-bezier transition fades the text out and morphs cleanly into the incoming section name.
3. **Live Section Scroll Percentage Indicator (`#hudProgressFill`):**
   - Embedded directly within the frozen pill is a precision progress bar calculating exactly how much of that specific section has been traversed:
     $$\text{activeProgress} = \min\left(100, \max\left(0, \frac{\text{triggerLine} - \text{headerRect.top}}{\text{totalFrozenDist}} \times 100\right)\right)$$
   - Provides immediate, dynamic visual feedback on section depth and content remaining.
   - When transitioning into a new section, the progress bar snaps to `0%` without backward tweening, then resumes linear tracking.
4. **1-Click Scroll-to-Top Navigation:**
   - Clicking anywhere on the frozen HUD pill automatically triggers a smooth scroll back to the top anchor of that active section.

---

## 3. 🤖 Cyber Charlie AI & Character System

**Charlie** is Rajeev’s proprietary interactive cyber companion, operating in two synchronized modes:
1. **Executive Assistant Mode:** An intelligent, offline conversational knowledge base.
2. **Cosmic Combat Mode:** An animated 60 FPS foreground mascot that deploys to the mouse cursor, vaporizes celestial comets, and deflects cosmic anomalies.

```
                    ┌────────────────────────────────────────┐
                    │           CYBER CHARLIE SYSTEM         │
                    └───────────────────┬────────────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
     [ EXECUTIVE ASSISTANT ]                       [ COSMIC COMBAT MODE ]
  - Offline Local RAG KB                        - Supersonic Cyber Dash to cursor
  - 4-Pillar Deep Dives                         - Particle raycast comet slicing
  - Dynamic Shuffled Chips                      - Dynamic glowing sword trail
  - Webpage Active Control                      - Multi-Skin Wardrobe System
```

### ⚓ Charlie Docking Stations & Escort Architecture
Charlie maintains two permanent, context-aware docking stations on the webpage:

1. **Floating Quick-Access Launcher (`#floatingCharlieBtn`):**
   - **Location:** Anchored to the bottom-right corner of the viewport (`bottom: 24px; right: 24px; z-index: 9998`).
   - **Live Miniature Canvas (`#charlieDockCanvas`):** Hosts a live, rendered 72×72 miniature version of Charlie looking around, blinking, and standing guard.
   - **Pulsing Energy Beacon (`.floating-charlie-pulse`):** Emits gentle periodic cyan light rings inviting recruiter interaction.
   - **Escort Flight Navigation:** Clicking the launcher does not just pop open a window; Charlie escorts the user with smooth page scrolling directly to the `#ai-assistant` terminal, automatically focusing the input field and presenting fresh suggested prompts.
   - **Combat Hiding:** When Game Mode is engaged, Charlie launches *out* of this dock into the battlefield, and the floating button smoothly hides to prevent UI clutter.

2. **Terminal Mascot Station (`#botAvatarBox`):**
   - **Location:** Integrated directly into the header of the AI Assistant terminal (`#charlie`).
   - **Mascot Perch:** When the terminal is scrolled into view, Charlie docks onto this perch, actively reflecting conversational states:
     - `waiting`: Scanning the visitor with calm eye blinks.
     - `writing`: Typing response letters with rapid focused visor animations.
     - `celebrating`: Triumphant hops and celebratory particle sparks.
   - If the user scrolls away from the chat terminal while Charlie is perched there, he smoothly executes a return dash back to the bottom-right floating dock!

### 🔒 Air-Gapped Offline Local Mode Architecture
Charlie is engineered to function **100% offline without relying on external cloud LLM APIs**:

* **Zero External Dependencies & Zero Data Leakage:** All inference, keyword matching, and knowledge retrieval occurs entirely in-browser memory. Recruiter questions and interactions never leave the client device.
* **Deterministic Keyword & Semantic Scoring Engine:**
  - Evaluates user queries against a comprehensive multi-domain matrix: OpenUSD, n8n automation, on-premise private LLMs, MCP, production filmography, leadership pedigree, and why to hire Rajeev.
  - Computes match confidence across technical tokens and semantic synonyms with sub-millisecond local latency.
* **Dynamic Multi-Variation Response Trees:**
  - To prevent robotic repetition, every single core topic contains **3 to 4 distinctly authored response variations**:
    - *Variation A:* Architectural scalability, data structures, and pipeline throughput.
    - *Variation B:* Business ROI, production cost reduction, and turnaround times.
    - *Variation C:* Low-level DCC integration mechanics (Maya, Houdini, Nuke, ShotGrid).
    - *Variation D:* Team leadership, mentorship, and engineering culture.
  - Each response randomly cycles between conversational opening phrases (*"Let's break down Rajeev's OpenUSD architecture...", "From a systems scalability standpoint...", "In high-throughput feature film pipelines..."*).
* **Optional BYOK (Bring Your Own Key) Modal:**
  - For visitors wishing to test frontier models, an optional configuration modal (`#aiConfigModal`) allows users to supply their own OpenAI API key stored strictly in `localStorage`, but offline local mode remains the default, high-speed baseline.

### Supersonic Cyber Dash & Combat Deployment
* **Launch Dash (`to_cursor`):** When Game Mode is toggled ON, Charlie performs a supersonic dash with electric cyan spark bursts directly from his dock/mascot station to the user's cursor position.
* **Combat State Machine:** Charlie transitions fluidly between states:
  - `idle`: Hovering near the cursor with dynamic hovering physics.
  - `cyber_dash`: High-speed directional travel with trailing neon blade trails.
  - `slash`: Dynamic sword swing upon comet impact or user click with multi-frame trail arcs.
  - `jump` & `aerial_flip`: Evasive flips and acrobatics.
  - `dizzy`: Humorous reaction upon excessive rapid clicking.
* **Reverse Return Dash (`to_dock` / `to_mascot`):** When Game Mode is turned OFF, Charlie smoothly dashes back to his docked position in the bottom-right corner or the chat terminal mascot station.

### Multi-Skin Wardrobe System
Charlie features 3 completely functional, distinct skins that synchronize seamlessly between the main portfolio and the Character Lab:

```
┌─────────────────────────┬─────────────────────────┬─────────────────────────┐
│   1. CLASSIC CYBER ⚡   │  2. JET-BLACK ARCHITECT │   3. SHINOBI NINJA 🥷   │
├─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ • Cyan neon visor       │ • Natural jet-black hair│ • Midnight stealth hood │
│ • Dual antenna sensors  │ • Sleek architect frames│ • Crimson accent band   │
│ • Iconic robot chassis  │ • Refined studio look   │ • Dual cyber-katana     │
│ • Electric cyan trails  │ • High-contrast styling │ • Obsidian slash trails │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

1. **Classic Cyber (Default):** Iconic cyan neon visor, antenna sensors, and luminous cyan photon thrusters.
2. **Jet-Black Architect:** Features natural jet-black styled hair and precision architect glasses, reflecting Rajeev's software architecture persona.
3. **Shinobi Ninja:** Midnight stealth hood, crimson headband, dark armor, and obsidian blade trail effects.

### Cyber Charlie Character Lab (`charlie-lab.html`)
A dedicated standalone character engineering workbench accessible via `/charlie-lab.html`:
* **Wardrobe Selector:** 1-click live skin switching (Classic Cyber, Jet-black Architect, Ninja).
* **Live Telemetry Card:** Real-time data card (calibrated to `196px` height) displaying runtime state, coordinates, facing direction, dash velocity, and sound engine context.
* **Animation State Triggers:** Buttons to test all character states (`Idle`, `Combat Slash`, `Supersonic Dash`, `Jump`, `Dizzy`).
* **Procedural Sound Board:** Dedicated buttons to trigger synthetic SFX (`Ding`, `Laser`, `Level Up`, `BGM Drone`).
* **Interactive Canvas Stage:** Live stage with click-to-slash hit detection and particle testing.

---

## 4. 🎮 10/10 Arcade Gamification & Comet Cascade Engine

The portfolio features a fully interactive 60 FPS HTML5 Canvas physics engine (`#cometCanvas`) running behind the UI.

### 🕹️ Game Mode Lifecycle & UI Transformations

Game Mode is engineered as a complete ambient state transformation of the portfolio:

#### A. Trigger Mechanisms
Game Mode can be engaged through three seamless entry points:
1. **Navbar Toggle Switch:** Clicking `#fxSwitchWrapper` in the top right navigation bar.
2. **Chat Command:** Asking Charlie in chat: *"turn on game mode"*, *"play game"*, or *"deploy charlie"*.
3. **Dynamic Quick Chips:** Clicking the `🎮 Turn On Game Mode` chip in the suggested prompts.

#### B. Active UI Transformations
When Game Mode turns ON, the portfolio transforms into an interactive arcade environment:
1. **Combat Cursor Activation:** `body.combat-cursor-active` is applied across the DOM, switching the mouse pointer into a precision crosshair reticle.
2. **Mission Toast Banner (`#missionToast`):** Slides into view announcing:
   > ⚡ **COSMIC WEAPONS ONLINE!** Use your mouse pointer weapon or click anywhere to vaporize incoming comets & level up your score!
3. **Live Scoreboard HUD (`#botHudWidget`):** Deploys to the bottom-left of the viewport:
   - Displays real-time **Shattered Score** counter.
   - Shows active **Combo Multiplier** (`COMBO x3!`, `COMBO x5!`).
   - Houses the audio mute/unmute speaker toggle.
   - Displays the current **Sentinel-X Rank Badge** (`Cadet` &rarr; `Vanguard`).
4. **Floating FX Preset Widget (`#fxWidget`):** Appears on screen, allowing 1-click switching between particle shaders (`Comet Cascade`, `Solar Flare`, `Aurora Borealis`, `Hyper Diamond`).
5. **Chatbot Terminal Lockout (`.game-mode-lockout`):**
   - Because Charlie is physically deployed in the skies defending the page, the chat input field is locked with the placeholder: *"Charlie is busy destroying comets... Click 'Disable Game to Use Bot' to chat"*.
   - A dedicated **`[ Disable Game to Use Bot ]`** button appears inside the chat card, giving recruiters instant 1-click access to return to conversational mode whenever they wish.
6. **Full-Screen Terminal Auto-Restore:** If the visitor had expanded the terminal to full-screen before turning on the game, Game Mode automatically restores the terminal to normal bounds so the user is never trapped in a full-screen view.

#### C. Restoration Lifecycle
When Game Mode is toggled OFF:
1. Procedural cosmic BGM stops immediately.
2. `body.combat-cursor-active` is removed, restoring standard system pointers.
3. Scoreboard HUD, FX widget, and mission toast slide away.
4. Chatbot terminal unlocks, restoring the input field and normal query chips.
5. Charlie executes a supersonic return dash back to his dock or mascot station.

The portfolio features a fully interactive 60 FPS HTML5 Canvas physics engine (`#cometCanvas`) running behind the UI.

### Canvas Physics & Raycasting
* **Ambient Celestial Rainfall:** Procedurally generates comets, radiant photon orbs, and luminous drops with randomized velocities, lengths, and opacities ($0.25$ to $0.95$).
* **Dynamic Directional Tilt:** Global celestial rain angle tilts smoothly based on mouse pointer X coordinates:
  $$\text{targetAngle} = \frac{\pi}{2} + \left(\frac{x_{\text{mouse}}}{w_{\text{viewport}}} - 0.5\right) \times 0.65$$
* **Pointer Raycast Collision:** Mouse pointer acts as a crosshair reticle. Moving the cursor over incoming comets or clicking detonates them into geometric shards.

### Visual Shaders & FX Presets
Users can cycle through 4 curated atmospheric shaders via the floating FX widget or Charlie AI:
1. **Comet Cascade (Default):** Deep space electric cyan and violet photons.
2. **Solar Flare:** Golden solar rays, plasma sparks, and amber warmth.
3. **Aurora Borealis:** Bioluminescent emerald and turquoise atmospheric curtains.
4. **Hyper Diamond:** High-contrast crystalline white shards and icy cyan glow.

### Arcade Scoring, Shockwaves & Milestones
* **Floating Combat Bursts:**
  - Standard hit: `+1 ✨` (Cyan)
  - Streak combo ($\ge 3$ hits in 1.5s): `+5 COMBO x3! 🔥` (Amber-Violet gradient)
  - Critical burst ($\ge 7$ hits): `CRIT +10! ⚡` (Electric Gold)
* **Dual Concentric Shockwaves:** Detonated comets emit dual expanding neon shockwaves with canvas `shadowBlur` bloom.
* **Sentinel-X Rank Milestones:** HUD tracks score progression:
  $$\text{Cadet} \longrightarrow \text{Pilot} \longrightarrow \text{Commander} \longrightarrow \text{Cosmic Ace} \longrightarrow \text{Vanguard}$$
  Promotions trigger a full-screen chromatic perimeter flash (`.screen-milestone-flash`).

### Procedural Spatial Web Audio Synthesizer
Built natively using the **Web Audio API** with **zero external MP3/WAV audio assets**:
* **Spatial Stereo Panning:** Dynamically pans sound (`StereoPannerNode`) across left and right channels according to the comet's X position on screen.
* **Multi-Harmonic Synthesizer Chords:**
  - *Base Hit:* Crisp sine wave chirp with exponential frequency decay ($880\text{ Hz} \to 220\text{ Hz}$).
  - *Combo Streak ($\ge 4$):* Triggers a sub-octave fundamental bass oscillator ($110\text{ Hz}$) with subtle sawtooth distortion.
  - *Hyper Streak ($\ge 8$):* Adds a 3rd harmonic triangle power chord ($1320\text{ Hz}$).
* **Procedural Ambient BGM:** Cosmic space drone generated using gentle low-pass filtered oscillators.
* **Synchronized Mute State:** Audio mute/unmute state syncs across the scoreboard HUD, Charlie chat controls, and the FX panel.

---

## 5. 📄 Executive Document Suite: 3-Page CV & Print Perfection (`cv.html`)

Accessible directly via the navigation bar (`View CV`), the Executive CV is a dedicated document suite built to cater to both digital recruiter screening and physical/PDF corporate printing.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            EXECUTIVE CV TOOLBAR                             │
│  [ ← Profile ]   [ 📋 Copy ATS Text ]   [ 📄 Switch to B&W ]   [ 🖨️ Print ] │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Dual CV Themes: Colorful Dark vs. Plain B&W
Users can toggle between two presentation modes using the `#cvThemeToggle` button:

1. **🌈 Colorful Dark (Default Screen Mode):**
   - Obsidian dark glassmorphism (`#06080e` background).
   - Neon cyan headers, purple badges, and emerald status chips.
   - Ideal for modern screen review, executive presentations, and creative technology showcases.
2. **📄 Plain B&W / Print-Standard Mode:**
   - Crisp white background with deep black typography (`#0f172a`).
   - Clean slate borders, high-contrast monochrome badges, and zero decorative glow.
   - Ideal for traditional corporate recruiters, enterprise HR portals, and monochrome office printing.

### 1-Click ATS Plaintext Resume Export
* Located on the top action toolbar (`[ 📋 Copy ATS Text ]`).
* With a single click, copies a **100% ATS-compliant, cleanly structured Markdown/Plaintext resume** directly to the user's clipboard.
* Features clean headings, bullet points, standard date formatting, clear section dividers, and complete career achievements across Astra Studios, Technicolor, and MPC Film, ready to paste directly into Taleo, Workday, Greenhouse, or Lever.

### Print & PDF Export Options
* Topbar **`[ Print / Save PDF ]`** button triggers native `window.print()` formatted by rigorous `@media print` rules.
* **Page-Break Discipline:** Engineered into a clean **3-page document**:
  - **Page 1:** Executive Identity, Selected Production Credits (*1917*, *RRR*, *Mufasa*), Core Technical Competencies & Architecture Toolkit.
  - **Page 2:** Professional Career History (Astra Studios, Technicolor Group / MPC Film, Prime Focus World), Architecture Milestones.
  - **Page 3:** Frontier AI Certifications, Generative AI Accelerators, Hackathons, Key Architecture Projects & Education.
* **Print Cleansing Rules:**
  - Automatically hides all screen-only elements: action toolbar, ambient glow blobs, toasts, and buttons.
  - Disables card borders and resets all card opacities to `1.0` unconditionally.
  - Applies `break-inside: avoid;` to all experience items and competency cards to prevent awkward cross-page splitting.

### Executive Portrait Download
* Clicking Rajeev's profile photo on either the CV header (`cv.html`) or the portfolio hero section (`index.html`) triggers an instant download of the high-resolution, professional studio portrait:
  - File: `Rajeev-Mutyalu-Executive-Portrait.jpg` (1024×1024 high-resolution JPEG).
  - Explicit tooltip: *"Click to Download High-Resolution Studio Portrait (1024x1024 JPG)"*.

### Interactive Domain Spotlight Focus Filters
A horizontal sticky filter bar allows recruiters to spotlight relevant domain experience:
* Filters: `[ All ]`, `[ OpenUSD & VFX ]`, `[ Agentic AI & LLMs ]`, `[ Ingest & Conform ]`, `[ Automation & n8n ]`, `[ Leadership ]`.
* **Spotlight Behavior:** Clicking a filter highlights matching cards with a cyan border and badge, while dimming unrelated cards (`opacity: 0.22; filter: grayscale(0.7)`), enabling instant recruiter skimming.

### Contact Matrix & Quick Actions
* **1-Click Email Copy:** Click `Copy Email` to copy `mutyalu.rajeev@gmail.com` to the clipboard with visual toast confirmation.
* **LinkedIn Direct Connect:** Direct link to [`linkedin.com/in/rajeevmuthyalu`](https://www.linkedin.com/in/rajeevmuthyalu/).
* **Back to Profile Guard:** `Interactive Profile` button returns cleanly to `index.html?top=1` with scroll guard to ensure landing at the top of the page.

---

## 6. 🎬 Production Architecture Visualizers

The portfolio features three interactive architecture flow diagrams demonstrating Rajeev's real-world pipeline deployments:

### Astra VFX USD v3 Pipeline
Visualizes the two-tier USD pipeline architecture:
1. **Tier 1 (Modular Asset Creation):**
   $$\text{Modeling} \longrightarrow \text{Groom} \longrightarrow \text{Look Dev} \longrightarrow \text{Rigging} \longrightarrow \text{Assembly } (\texttt{assembly.usda} + \texttt{rig.ma})$$
2. **Tier 2 (Shot Pipeline SH0010 Sublayer Stack):**
   - **Asset Packages:** Modular asset payloads with clean namespaces.
   - **Layout Setup:** Seeds `usdShot`, sets camera optics, framing, and environment dressing.
   - **Animation Cache:** Bakes deforming geometry cache into `/Characters` with class prims `/__class__` and rest-pose `Pref`.
   - **CFX & FX Simulation:** Cloth and hair dynamics into `/Crowds`, Houdini caches & VDBs into `/FX`.
   - **Lighting & Final Render:** Lookdev class binding, `/Lights` prims, compiling down to a single unified renderable `SH0010_usdShot.usda`.

### Zero-Touch n8n Studio Automation Hub
Visualizes the 7-stage production turnover pipeline:
1. **Event Trigger:** Inbound webhooks, turnover drops, or directory watchers.
2. **n8n Core Hub:** Payload validation, routing, and auth orchestration.
3. **Show Onboarding:** Automated folder provisioning, permissions, and ShotGrid project setup.
4. **Smart Plate Pattern Validation:** Regex inspection of raw client plates, resolution, and color metadata.
5. **Ingest & Conform Dispatch:** Automated EXR transcode, ACEScg transforms, and render farm dispatch.
6. **ShotGrid Sync:** Bidirectional synchronization of cut durations, versions, and thumbnails.
7. **Production Notification:** Automated Slack and email briefs with review links.

### Studio.AI Prompt-to-Video Workflow (Scene Weaver)
Visualizes the 5-node GenAI platform integration:
1. **Script & Storyboards:** Automated scene breakdown and prompt extraction.
2. **Prompt Studio & Router:** Multi-model routing across **Google Veo**, **Kling AI**, **Higgsfield**, and **Seedance**.
3. **Frame Consistency:** Character identity locking via multi-view latent anchors and IP-adapter embeddings.
4. **Editorial & Review:** Timeline assembly, visual diff, and director review workflows.
5. **ACES Studio Conform:** ACEScg plate matching, upscaling, and Nuke comp turnover.

---

## 7. 💻 Display Resilience, Zoom Tolerance & Layer Hierarchy

### Strict `(pointer: fine)` Desktop Detection
To eliminate mobile false positives on modern Windows laptops (which frequently report `navigator.maxTouchPoints > 0` due to touchscreens or precision trackpads), the codebase utilizes strict pointer media queries:
```javascript
const isFine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
const isPureDesktop = isFine && !isCoarse && !document.body.classList.contains('in-simulator');
```
* Desktops and laptops with mouse/touchpad input are **strictly guaranteed full desktop privileges**, preventing Charlie from disappearing when windows are snapped, split, or resized.

### Resolution & Zoom Matrix
The system is tested and verified across all standard viewport dimensions and zoom levels:
* **Full HD 100% Zoom / Split Screen (756×488):** Desktop layout maintained; Charlie active; 0 console errors.
* **90% Zoom (840×542):** Proportions and typography scale cleanly; Game Mode remains fully functional.
* **80% Zoom (945×610):** Cards and badges expand smoothly without overlapping.
* **1024px Boundary (1024×600):** Fine-pointer guard prevents tablet hiding; full features accessible.
* **4K UHD (3840×2160):** Vector typography and high-density cards render razor-sharp.

### Absolute Canvas Layering Hierarchy
To ensure that Game Mode never obscures page text or UI controls, the canvas stack adheres to strict z-index separation:

```
┌────────────────────────────────────────────────────────┐
│  z-index: 99990  │ #charlieCanvas (Foreground Mascot)  │ ← Transparent background
├────────────────────────────────────────────────────────┤
│  z-index: 1000   │ Navigation Bar & Header             │
├────────────────────────────────────────────────────────┤
│  z-index: 100    │ Interactive Modals & Scoreboard HUD │
├────────────────────────────────────────────────────────┤
│  z-index: 10     │ Content Cards, Headings, Text, Grid │
├────────────────────────────────────────────────────────┤
│  z-index: 0      │ #cometCanvas (Cosmic Particle FX)   │ ← Radial gradient background
└────────────────────────────────────────────────────────┘
```

* **`#cometCanvas` (z-index: 0):** Operates as the background canvas. Its radial gradient stays strictly behind all text, headers, and cards.
* **`#charlieCanvas` (z-index: 99990):** Operates as the transparent foreground canvas, allowing Charlie to fly over content without hiding underlying prose.

---

## 8. Summary of File Artifacts & Routes

| URL / File Path | Purpose / Description |
| :--- | :--- |
| **`index.html`** | Main Interactive Portfolio (Obsidian Glassmorphism, OpenUSD visualizer, Charlie mascot, arcade game). |
| **`cv.html`** | Executive 3-Page CV Document Suite (Colorful Dark & Plain B&W modes, ATS copy, PDF print, photo download). |
| **`charlie-lab.html`** | Cyber Charlie Character & Motion Lab (Multi-skin wardrobe, 196px telemetry card, animation and audio controls). |
| **`app.js`** | Core engine (ParticleEngine, Charlie Mascot Engine, Procedural Sound Engine, Offline RAG knowledge base). |
| **`style.css`** | Vetric Design System, responsive grid tokens, glassmorphism, `@media print` rules, and canvas layering. |
| **`profile.jpg`** | High-resolution 1024×1024 official studio portrait (downloadable directly via avatar click). |

---
*Documentation generated for production deployment `v5.1-stable` (Commit `0cccd83`).*
