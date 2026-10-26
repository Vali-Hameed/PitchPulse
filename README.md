<div align="center">

# PitchPulse Studio

> **Containerized Real-Time Match Intelligence, Cultural Broadcast Adaptation, Interactive Pitch Telestrator & Multi-Agent Verification Engine**  
> *Built for the Microsoft & Premier League "Inside the Game: Developer Hackathon"*

<br />

![Microsoft Azure](https://img.shields.io/badge/Microsoft_Azure-0078D4?style=flat-square&logo=microsoftazure&logoColor=white)
![Azure OpenAI](https://img.shields.io/badge/Azure_OpenAI_GPT--4o-0078D4?style=flat-square&logo=openai&logoColor=white)
![Azure Container Apps](https://img.shields.io/badge/Azure_Container_Apps-0089D6?style=flat-square&logo=microsoftazure&logoColor=white)
![Premier League](https://img.shields.io/badge/Premier_League-38003C?style=flat-square&logo=premierleague&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic_v2-E92063?style=flat-square&logo=pydantic&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=flat-square&logo=numpy&logoColor=white)
![SciPy](https://img.shields.io/badge/SciPy-8CAAE6?style=flat-square&logo=scipy&logoColor=white)
![Pytest](https://img.shields.io/badge/Pytest-0A9EDC?style=flat-square&logo=pytest&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![HTML5 Canvas](https://img.shields.io/badge/HTML5_Canvas-E34F26?style=flat-square&logo=html5&logoColor=white)
![Web Speech API](https://img.shields.io/badge/Web_Speech_API-F1502F?style=flat-square&logo=w3c&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

</div>

<hr />

## 1. Executive Summary & Problem Positioning

### Why Standard AI Match Commentary Fails in Live Broadcasts
1. **Unverified Hallucinations Destroy Credibility:** Piping raw match event JSON into an unconstrained LLM prompt yields factual hallucinations (*"bypassed 4 defenders"* when spatial telemetry records 2). Live broadcasters (**Sky Sports, TNT Sports, Premier League Productions**) cannot risk putting hallucinated AI on air.
2. **Literal Translation Feels Robotic:** Word-for-word translation alienates global football audiences. A viewer in Madrid expects *LaLiga* tactical radio rhythm, a viewer in Munich expects *Bundesliga* `Halbraum` & `Gegenpressing` breakdowns, and a UK viewer expects *Monday Night Football* studio punditry.
3. **Static One-Way Presentation:** Traditional TV broadcasts offer no interactive rewind, tactical freeze-frame drawing, or persona-based customization. Data-hungry tactical analysts, casual fans, and club supporters receive the exact same static lower-third graphic.

### The PitchPulse Solution: Verifiable "Studio Receipts", Cultural Adaptation & Post-Analysis Telestration
**PitchPulse Studio** is a production-grade **Obsidian Broadcast Studio** console that executes the mandatory 5-stage hackathon pipeline in real time—visibly illuminated on screen for every event:

1. **Stage 1 — Ingest (`10Hz SSE + Custom JSON Ingest API`):** Streams 22-player synthetic tracking and ball physics at 10Hz via Server-Sent Events (`/api/stream`), backed by 5 deterministic scenario triggers and an interactive **Custom Synthetic Telemetry JSON Ingest Lab (`POST /api/events/ingest`)**.
2. **Stage 2 — Interpret (`Deterministic Spatial Mathematics`):** Computes explainable football metrics in pure Python/NumPy without LLM guesswork:
   - **Expected Threat Delta ($\Delta xT$)** across a calibrated $8 \times 12$ transition grid
   - **Pass Difficulty Rating ($0\text{–}99$)** & **Spatial Pass Distance ($m$)**
   - **Defender Pressure Index ($0\text{–}100\%$)** & **Ball/Sprint Velocity ($\text{km/h}$)**
   - **Rolling Control vs. Chaos Index ($0\text{–}100$)** & **Final-Third Territory Dominance ($\%$)**
3. **Stage 3 — Explain (`Agent 1: Azure OpenAI GPT-4o Narrator`):** Synthesizes causal explanations of *why* a moment matters strictly grounded in computed spatial facts.
4. **Stage 4 — Verify & Render (`Agent 2: Studio Verifier + TV Chyron`):** Cross-examines every numerical claim and entity in the draft against ground-truth telemetry before broadcast. If a discrepancy is detected, Agent 2 auto-corrects the copy, displays an **inline strikethrough diff** (`~Bypassed 4 defenders~ → 2`) directly on the main TV chyron, and emits a machine-readable **Production Path Overlay Downlink JSON (`pl.studio.overlay.v2`)**.
5. **Stage 5 — Personalize (`Agent 3: Cultural Broadcast Idiom & Lens Router`):** Simultaneously adapts verified intelligence across:
   - **3 Viewing Modes:** `Tactical Analyst`, `Casual Fan`, and `Dynamic 22-Player Cam` (focused on whichever player the viewer clicks on the pitch).
   - **7 Cultural Broadcast Dialects:** Authentic regional idioms (UK *Sky MNF*, España/LatAm *Pizarra Táctica*, MENA *beIN Studio*, Korea *SPOTV*, France *Canal+*, Brasil *Mesa Tática*, DACH *Bundesliga Taktik-Feed*).
   - **Club Perspective Lens (`ALL` / `NLR` / `MSB`) & Single Performance Metric Lens (`ΔxT` / `Pass Difficulty` / `Pressure` / `Speed`)**.
6. **Tactical Director Suite:**
   - **Interactive Pitch Telestrator:** Freeze-frame tactical pen with directional arrowheads, vector passing arrows, spotlight halo rings, and one-click "Ask Studio Pundit About This Space".
   - **60-Second Broadcast DVR Time-Shift Engine:** Zero-latency client-side circular ring buffer, $-5\text{s} / +5\text{s}$ nudge controls, smooth timeline scrubber, and instant `⤏ GO TO LIVE` catch-up.

---

## 2. Alignment with Official Hackathon Judging Rubric

| Judging Criterion (20% Each) | How PitchPulse Studio Delivers |
|---|---|
| **1. Technological Implementation (20%)** | Containerized FastAPI + Next.js 14 architecture with 10Hz SSE fanout, 300ms LERP canvas interpolation, 60-second rolling DVR circular buffer, Azure OpenAI GPT-4o integration with `<2.5s` SLA fallback, automated pytest suite, and single-command Azure Container Apps (`infra/deploy-aca.ps1`) deployment. |
| **2. Agentic Design & Innovation (20%)** | 3-Agent **Narrator → Studio Verifier → Cultural Persona Router** pipeline. The Studio Verifier deterministically intercepts and auto-corrects LLM hallucinations before broadcast, exposing both an inline strikethrough diff and a cryptographic-style telemetry audit receipt. |
| **3. Real-World Impact & Applicability (20%)** | Solves the #1 barrier preventing live sports broadcasters from adopting Generative AI (on-air factual reliability) while emitting machine-readable `pl.studio.overlay.v2` JSON ready for Vizrt / Ross Video / HTML5 production graphics pipelines. |
| **4. User Experience & Presentation (20%)** | High-craft **Obsidian Broadcast Studio** UI featuring a live 5-Stage Pipeline Visualizer strip, TV Split Scorebug, regulation FIFA 2D slate-turf pitch with Voronoi space control & xT heatmaps, TV pundit telestrator suite, 60-second DVR scrubber, F1-style linear telemetry instruments, and multilingual Web Speech synthesis. |
| **5. Adherence to Hackathon Category (20%)** | 100% synthetic, trademark-clean Premier League studio engine implementing all 5 pipeline stages, Pass Difficulty/Distance ratings, AI Vision Homography auto-eventing (`/api/vision/inspect`), 30-second catch-up recaps, and multi-dimensional fan personalization. |

---

## 3. Cloud & Multi-Agent Architecture

```mermaid
flowchart TB
    subgraph Azure["Microsoft Azure Cloud Infrastructure"]
        subgraph ACA["Azure Container Apps Managed Environment"]
            subgraph BackendContainer["pitchpulse-backend (FastAPI :8000)"]
                GEN["Stage 1: 10Hz Pitch Simulator &<br/>POST /api/events/ingest (Custom JSON)"]
                ENG["Stage 2: Deterministic Metrics Engine<br/>ΔxT, Pass Difficulty (0-99), Dist (m), Chaos"]
                ORCH["Stages 3-5: Multi-Agent Orchestrator<br/>Narrator → Verifier → Cultural Router"]
                SSE["High-Performance SSE Hub (:8000/api/stream)"]
                PUNDIT["POST /api/studio/ask<br/>Live Grounded Tactical Q&A"]
                
                GEN --> ENG
                ENG -->|Key Moment / Custom Ingest| ORCH
                ENG -->|10Hz Frame / 1Hz Tick| SSE
                ENG -->|Spatial Telemetry| PUNDIT
            end

            subgraph FrontendContainer["pitchpulse-frontend (Next.js 14 :3000)"]
                STRIP["PipelineStatusStrip.tsx<br/>Live 5-Stage Telemetry Visualizer"]
                CANVAS["PitchCanvas.tsx<br/>FIFA Slate-Turf & Voronoi Control"]
                TELE["PitchTelestrator.tsx<br/>Tactical Pen, Arrows & Spotlight Halos"]
                DVR["PitchDVRBar.tsx<br/>60s DVR Buffer, Scrubber & Live Catch-Up"]
                OVERLAY["BroadcastOverlay.tsx<br/>TV Chyron & Inline Hallucination Diff"]
                FEED["PersonaFeed.tsx<br/>7 Cultural Dialects · Studio Pundit Dock"]
                DRAWER["ReceiptsDrawer.tsx<br/>Audit Table & Production Downlink JSON"]
                INGEST["TelemetryIngestModal.tsx<br/>External JSON Upload & Verifier Lab"]
                VISION["VisionInspectorModal.tsx<br/>YOLOv8 Homography Projection"]
            end
        end

        subgraph AzureAI["Azure AI Services"]
            AOAI["Azure OpenAI Service (GPT-4o)"]
        end
    end

    ORCH <-->|Causal & Cultural Idiom Prompts| AOAI
    ORCH -->|Verified BroadcastOverlayPayload| SSE
    SSE ==>|Persistent SSE Stream| STRIP
    SSE ==>|10Hz LERP Frames| DVR
    DVR ==>|Time-Shifted or Live Frames| CANVAS
    TELE -.->|Drawing Centroid Query| PUNDIT
    CANVAS --> TELE
    SSE ==>|Verified Chyron & Diff| OVERLAY
    SSE ==>|Personalized Feed| FEED
    INGEST ==>|POST /api/events/ingest| GEN
    VISION ==>|Emit Auto-Event| INGEST
```

---

## 4. Key Capabilities & Feature Highlights

### 📺 Interactive TV Pitch Telestrator (`PitchTelestrator.tsx`)
- **Freeze-Frame Analysis:** Clicking `Telestrate` immediately pauses the simulation, locking all 22 player tokens and the ball in place for tactical review.
- **Three Pundit Drawing Tools:**
  1. `Tactical Pen`: Smooth freehand drawing with auto-orienting directional arrowheads at path tips.
  2. `Vector Arrow`: High-contrast straight passing or movement vector arrows with glowing broadcast shadows.
  3. `Spotlight Halo Ring`: Radial gradient spotlight with solid perimeter and dashed outer tactical halo to highlight players or half-space pockets.
- **4 Studio Color Presets:** Premier League Gold (`#E5C158`), NLR Crimson (`#E11D48`), MSB Cobalt (`#2563EB`), and Broadcast White (`#FFFFFF`).
- **Undo / Clear / Pin Controls:** Fast single-stroke undo, full clear, and an optional "Pin Drawings" toggle.
- **Smart Broadcast Auto-Fade:** When playback resumes and drawings are unpinned, strokes smoothly fade out over 3.5 seconds using a `requestAnimationFrame` alpha interpolator (matching Sky Sports / BBC MOTD).
- **One-Click "Ask Studio Pundit":** Calculates the spatial centroid of all active drawing strokes and queries `POST /api/studio/ask` to generate verified AI tactical commentary for that exact pitch zone.

### ⏪ 60-Second Rolling Broadcast DVR Scrubber (`PitchDVRBar.tsx`)
- **Zero-Latency Ring Buffer:** Stores up to 600 frames (60 seconds at 10Hz) in client-side memory with zero network roundtrips during scrubbing.
- **Hardware Director Transport:** Play / Pause freeze-frame toggle, discrete $-5\text{s}$ and $+5\text{s}$ nudge buttons, and $1\times, 2\times, 4\times$ speed multipliers.
- **Interactive Scrubber Slider Track:** Drag smoothly across the past 60 seconds with instant pitch canvas updates of all 22 players and ball positions.
- **Timecode Readout:** Shows current scrubbed match clock (`63:42`) and live clock (`LIVE: 64:12 (-0:30s)`).
- **Instant "GO TO LIVE" Catch-Up:** Displays a pulsing `● LIVE` badge when synchronized with real time; automatically switches to a glowing amber `⤏ GO TO LIVE (-0:XXs)` button when behind live for instant synchronization.

### 🏟️ FIFA Regulation Pitch Geometry on Both Canvases
Both the main 2D Tactical Pitch [`PitchCanvas.tsx`] and the AI Vision Inspector [`VisionInspectorModal.tsx`] feature hairline-precision FIFA regulation geometry:
- 16 alternating tonal mowing grass bands.
- Outer pitch boundary and halfway line.
- Center circle and center spot ($9.15\text{m}$ radius).
- Both 18-yard penalty boxes ($16.5\text{m} \times 40.32\text{m}$) and 6-yard goal areas ($5.5\text{m} \times 18.32\text{m}$).
- Penalty spots ($11\text{m}$) and $9.15\text{m}$ penalty D-arcs.
- $7.32\text{m}$ goal net frames.
- 4 corner arcs ($1\text{m}$ radius).
- Obsidian Emerald radial gradient background.

### 🤖 Verifier Guardrail Pattern & Inline Hallucination Strikethrough
### ⏪ 60-Second Rolling Broadcast DVR Scrubber (`PitchDVRBar.tsx`)
- **Zero-Latency Ring Buffer:** Stores up to 600 frames (60 seconds at 10Hz) in client-side memory with zero network roundtrips during scrubbing.
- **Hardware Director Transport:** Play / Pause freeze-frame toggle, discrete $-5\text{s}$ and $+5\text{s}$ nudge buttons, and $1\times, 2\times, 4\times$ speed multipliers.
- **Interactive Scrubber Slider Track:** Drag smoothly across the past 60 seconds with instant pitch canvas updates of all 22 players and ball positions.
- **Timecode Readout:** Shows current scrubbed match clock (`63:42`) and live clock (`LIVE: 64:12 (-0:30s)`).
- **Instant "GO TO LIVE" Catch-Up:** Displays a pulsing `● LIVE` badge when synchronized with real time; automatically switches to a glowing amber `⤏ GO TO LIVE (-0:XXs)` button when behind live for instant synchronization.

### 🏟️ FIFA Regulation Pitch Geometry on Both Canvases
Both the main 2D Tactical Pitch [`PitchCanvas.tsx`] and the AI Vision Inspector [`VisionInspectorModal.tsx`] feature hairline-precision FIFA regulation geometry:
- 16 alternating tonal mowing grass bands.
- Outer pitch boundary and halfway line.
- Center circle and center spot ($9.15\text{m}$ radius).
- Both 18-yard penalty boxes ($16.5\text{m} \times 40.32\text{m}$) and 6-yard goal areas ($5.5\text{m} \times 18.32\text{m}$).
- Penalty spots ($11\text{m}$) and $9.15\text{m}$ penalty D-arcs.
- $7.32\text{m}$ goal net frames.
- 4 corner arcs ($1\text{m}$ radius).
- Obsidian Emerald radial gradient background.

### 🤖 Verifier Guardrail Pattern & Inline Hallucination Strikethrough
```mermaid
sequenceDiagram
    autonumber
    participant Ingest as Stage 1-2: Telemetry & Math Engine
    participant Narrator as Stage 3: Agent 1 (Narrator GPT-4o)
    participant Verifier as Stage 4: Agent 2 (Studio Verifier)
    participant Router as Stage 5: Agent 3 (Cultural Router)
    participant Broadcast as On-Air TV Chyron & Feed

    Ingest->>Narrator: Event + Computed Math (Bypassed=2, ΔxT=+0.34, Difficulty=89/99)
    Narrator->>Verifier: Draft Narrative (Claims: "Bypassed 4 defenders...")
    Note over Verifier: Audits claims against Euclidean ground-truth telemetry
    alt All claims match ground truth
        Verifier->>Router: Verified Narrative (Confidence: 100%, Status: MATCH)
    else Hallucination / Discrepancy Detected
        Note over Verifier: Auto-corrects 4 → 2, logs claim diff in VerificationReceipt
        Verifier->>Router: Auto-Corrected Narrative + Intercepted Claim Diff
    end
    Router->>Broadcast: 7 Cultural Broadcast Dialects × 3 Personas + Production Sync JSON
    Broadcast-->>Broadcast: Renders inline strikethrough diff (~4~ → 2) & Audit Receipt
```

---

## 5. Deterministic Football Metric Formulas

$$\Delta xT = xT(x_{\text{end}}, y_{\text{end}}) - xT(x_{\text{start}}, y_{\text{start}})$$

$$\text{Pressure Index} = \min\left(100.0, \max\left(0.0, 100.0 \times \exp(-0.45 \times d_{\text{def}})\right)\right)$$

$$\text{Pass Difficulty} = \min\left(99.0, \max\left(5.0, 0.35 \cdot P + 0.30 \cdot \left(\frac{D}{45} \cdot 100\right) + 0.25 \cdot (B \cdot 22) + 0.10 \cdot S\right)\right)$$

Where $P$ is Pressure Index ($0\text{–}100\%$), $D$ is spatial pass distance in meters, $B$ is defenders bypassed, $S$ is ball speed ($\text{km/h}$), and $d_{\text{def}}$ is nearest defender distance in meters.

---

## 6. Strict Trademark & Synthetic Data Compliance

Per hackathon rules, all match telemetry is 100% synthetic and all club/player identities are fictional:

| Club Identity | Color Tokens | Tactical Setup | Spotlight Star (22-Player Cam) |
|---|---|---|---|
| **North London Red (NLR)** | `#E11D48` (Crimson) | 4-3-3 High Possession | **#8 M. Vance-Sim** (Playmaker / AM) |
| **Merseyside Blue (MSB)** | `#2563EB` (Royal Cobalt) | 4-3-3 Compact Mid-Block | **#9 D. Calvert-Sim** (Center Forward / CF) |

---

## 7. Quick Start & Docker Deployment

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- *(Optional)* Azure OpenAI Service API Key and Endpoint for live GPT-4o generation (runs out-of-the-box with zero configuration using the deterministic cultural engine if omitted).

### Single-Command Launch
```bash
# Clone the repository
git clone https://github.com/Vali-Hameed/PitchPulse.git
cd PitchPulse

# (Optional) Configure Azure OpenAI credentials
cp backend/.env.example backend/.env

# Build and start containerized frontend (:3000) & backend (:8000)
docker compose up --build -d
```

- **Studio Broadcast Deck:** [http://localhost:3000](http://localhost:3000)
- **FastAPI SSE & Telemetry API:** [http://localhost:8000](http://localhost:8000)
- **Custom Event Ingest Endpoint:** `POST http://localhost:8000/api/events/ingest`
- **Interactive Studio Pundit Q&A Endpoint:** `POST http://localhost:8000/api/studio/ask`
- **Club & Persona-Tailored Recap Endpoint:** `GET http://localhost:8000/api/recap?persona=analyst&lang=en&club=NLR`
- **Computer Vision Auto-Eventing Endpoint:** `GET http://localhost:8000/api/vision/inspect`
- **Engine Health Endpoint:** [http://localhost:8000/api/health](http://localhost:8000/api/health)

### Running Automated Tests
```bash
docker compose exec backend pytest -v
```

---

## 8. Azure Container Apps (ACA) Cloud Deployment

PitchPulse Studio includes an automated PowerShell deployment script (`infra/deploy-aca.ps1`) for Microsoft Azure:

```powershell
az login

./infra/deploy-aca.ps1 `
    -ResourceGroup "rg-pitchpulse-studio" `
    -Location "westus3" `
    -AzureOpenAiKey "<YOUR_AZURE_KEY>" `
    -AzureOpenAiEndpoint "https://<YOUR_RESOURCE>.openai.azure.com/" `
    -AzureOpenAiDeployment "gpt-4o"
```

---

## 9. License

Built for the Microsoft & Premier League *"Inside the Game: Developer Hackathon"*. Distributed under the MIT License.

