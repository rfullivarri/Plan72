# Plan72 — Repo Seed Spec (UI/UX + Business Logic) v0.1

This document is intended to be committed as the **initial spec** in a new repository.
It defines the **product UX**, **design system**, and **plan-generation engine** constraints.

---

## 1) Product goal

A web app that lets users:
- Set their **location** and **plan level** (Basic/Standard/Advanced)
- Choose **scenario** (AIR/NUK/CIV/EQK/UNK) and **moment** (PRE/POST)
- Generate a **72h protocol** with compact **printable cards** (A6/A7)
- Export a **PDF** ready for print + laminate

---

## 2) Non-negotiable safety constraint (product rule)

The app must **not** generate instructions for:
- Concealing supplies in public spaces
- Accessing property without consent
- Bypassing locks/security
- Any illegal or violent action

Instead, “stash” is defined as **consented resource nodes**:
- User’s home, work, or private storage
- Trusted contacts’ locations (explicit consent)
- Other legitimate, user-owned locations

The UX should phrase this as **“Resource Nodes”** (not “hidden stashes”) in the UI, while preserving the A/B/C typing model.

---

## 3) Style / visual direction (Fallout-like + TVA/Loki clock vibe)

### 3.1 Mood
- Retro “civil defense manual” / “Fallout Pip-Boy” tone
- Warm aged paper background (sepia), ink outlines, olive/army green accents
- UI feels like a **printed manual** turned into an interface
- Slight playful tone via a **mascot** that “guides” the user through steps

### 3.2 Layout & density
- High readability, **scannable blocks**
- Minimal paragraphs; prefer **chips**, **callouts**, **checklists**, **3 Do / 3 Don’t**
- Cards are small: A6/A7, single-screen / single-glance

### 3.3 Brand primitives
**Palette (suggested defaults; adjust to match provided images)**
- Paper: `#F3E2C2` (base), `#E7D2AB` (shadow), `#C9A773` (edge)
- Ink: `#1B1A14`
- Olive: `#4A5A3A`
- Rust: `#B35A2A`
- Warning: `#D9A441`
- Accent (radioactive-ish): `#8AAE3B`

**Typography**
- Display: “Bebas Neue” or “Oswald” (titles)
- Mono: “IBM Plex Mono” or “Space Mono” (codes / IDs / stage labels)
- Body: “Inter” or “Source Sans 3”

**Texture**
- Paper grain background (CSS overlay)
- Subtle corner ornaments (like sample frames)
- Thick ink borders with rounded corners

### 3.4 Mascot
A persistent character (provided by user) that:
- Appears on the right/bottom edge across pages
- Changes expression per scenario (AIR/NUK/EQK/UNK)
- Displays short contextual tips (1 line)
- Animations: simple idle bounce + blink + “attention” wave on step change

---

## 4) Information architecture (screens)

### 4.1 Landing
- Hero: “Generate a 72h Protocol”
- CTA: “Start Generator”
- Secondary: “How it works” (3 steps)
- Visual: big mascot + a sample printed card preview

### 4.2 Generator (wizard)
A 5-step wizard with a top “manual tab” navigation:
1) **Location**
2) **Scenario**
3) **Preferences**
4) **Resource Nodes**
5) **Review & Generate**

Each step has:
- Left: form controls
- Right: live preview (card layout + mascot)

### 4.3 Results
- Card stack view (scroll)
- Buttons:
  - Export PDF (A6/A7)
  - Copy “Codex JSON” (debug)
  - Save profile (local storage)
- Map panel (optional): corridor + DP markers

---

## 5) Card system (print-first)

### 5.1 Card sizes
- Primary: **A6** (105×148mm)
- Compact: **A7** (74×105mm)
PDF export should support both.

### 5.2 Card types
- `RTE` Route card (corridor + DPs + ALT)
- `ACT` Action card (scenario + moment + stage)
- `STS` Resource Node priorities (A/B/C/D/E/F)
- `CHK` Checklist card (universal quick checks)

### 5.3 Card naming convention
**ID format:** `CITY–TYPE–SCN–MOM`
- Example: `BCN–ACT–NUK–POST`
- Route base: `BCN–RTE–BASE`

### 5.4 Stage model
- `STG0` 0–60 min
- `STG1` 1–6 h
- `STG2` 6–24 h
- `STG3` 24–72 h

### 5.5 Card template (front)
- Header bar: `ID` + chips for `STG` + `MODE` (MOVE/SHELTER)
- “Objective” (1 line)
- “Trigger” (1 line)
- **3 DO / 3 DON’T** (bullets, max 6 words each)
- Footer: “Next” (reference to next card)

### 5.6 Card template (back)
- Route snippet: DP list (DP1..DPn) + ALT1/ALT2
- Resource order (e.g., `D → A → C → B`)
- Checkboxes: Water / Warmth / Rest / Comms
- Fallback: 2 bullets max

---

## 6) Route logic (Barcelona template v0)

### 6.1 Route intention (not hard-coded street-by-street)
From **Forum** heading **NW** via a **Diagonal corridor** (or parallel streets),
toward **Zona Universitària**, then into **Collserola**, then optional extension to **Vallès**.

### 6.2 Corridor rules
- Generate a **corridor**, not a single line
- Add at least **3 Decision Points**:
  - DP1 ~ Glòries area
  - DP2 ~ Francesc Macià area
  - DP3 ~ Zona Universitària area
- Provide 2 alternatives:
  - ALT1: more interior, fewer arteries
  - ALT2: fastest path

### 6.3 Avoid filters (preference-based)
Penalize segments near:
- Infrastructure critical (port/airport/major hubs)
- Tourist clusters
- Large avenues (optional; user toggle)
- Underground passages (user toggle)

---

## 7) Engine model (business logic)

### 7.1 Scenario codes
- `AIR` conventional air attack
- `NUK` nuclear
- `CIV` civil unrest/collapse
- `EQK` earthquake
- `UNK` unknown/non-conventional

### 7.2 Moment
- `PRE` warning time exists
- `POST` event already happened / no warning

### 7.3 Mode selection (MOVE vs SHELTER)
Default rules:
- `NUK–POST`: **SHELTER** for STG0–STG1; controlled MOVE starting STG2
- `AIR–POST`: **MOVE** if safe corridor exists
- `EQK`: MOVE if immediate structural risk; otherwise short SHELTER then MOVE
- `CIV`: MOVE early to avoid crowding; low profile
- `UNK`: conservative; minimize observability

### 7.4 Resource Node types (A..F)
- `A` hydration
- `B` nutrition
- `C` warmth/clothing
- `D` medical
- `E` power/signal
- `F` minimal tools

### 7.5 Resource priority per scenario
- `AIR–POST`: `D → A → C → B`
- `NUK–PRE`: `C → A → E` (then follow NUK–POST)
- `NUK–POST`: (no collection STG0–STG1); once moving: `A → C → E → B`
- `CIV`: `A → B → D → E`
- `EQK`: `D → A → C`

---

## 8) Data schema (JSON)

### 8.1 UserInput
```json
{
  "city": "BCN",
  "start": { "lat": 41.41, "lng": 2.22, "label": "Forum" },
  "peopleCount": 2,
  "scenario": "NUK",
  "moment": "POST",
  "level": "STANDARD",
  "preferences": {
    "avoidAvenues": true,
    "avoidUnderground": true,
    "avoidTourist": true,
    "avoidCriticalInfra": true
  },
  "resourceNodes": [
    { "id": "N0", "label": "Home", "lat": 41.39, "lng": 2.16, "types": ["A","C","E"] }
  ]
}
```

### 8.2 PlanOutput
```json
{
  "meta": { "id": "BCN-NUK-POST-STANDARD", "generatedAt": "ISO" },
  "mode": "SHELTER",
  "stages": [
    { "stage": "STG0", "actions": { "do": [], "dont": [] }, "nextCard": "BCN–ACT–NUK–POST#STG1" }
  ],
  "routes": {
    "base": { "corridor": [], "decisionPoints": [], "alts": [] }
  },
  "cards": [
    { "id": "BCN–ACT–NUK–POST", "stage": "STG0", "front": {}, "back": {} }
  ]
}
```

---

## 9) UX details (components)

### 9.1 Core components
- `MascotPanel` (persistent; mood per scenario)
- `CardPreview` (A6 rendering)
- `CardStack` (result list)
- `ScenarioSelector` (icon grid in retro frames)
- `StageTimeline` (STG0..STG3 with TVA clock feel)
- `MapCorridor` (MapLibre/Leaflet)
- `PDFExport` (react-pdf or html-to-pdf flow)

### 9.2 Microinteractions
- Step change: mascot wave + “stamp” sound optional (toggle)
- Card reveal: subtle slide-in
- Buttons: thick ink border + press-down effect

---

## 10) Engineering milestones

### M1 — Skeleton UI
- Next.js + Tailwind + fonts
- Landing + wizard scaffold + card preview placeholder

### M2 — Engine v0
- planEngine module (pure functions)
- generate cards for scenarios (no map routing yet)

### M3 — Route v0
- corridor approximations + DP markers
- preference penalties applied to routing (even if simplified)

### M4 — PDF export
- A6/A7 export, margins, crop marks

### M5 — Polish
- mascot states, textures, responsive layout
- saved profiles

---

## Appendix: Copy tone
- Short, directive, printed-manual style
- Avoid panic language
- Use “Protocol”, “Stage”, “Decision Point”, “Resource Node”
