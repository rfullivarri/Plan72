# Plan72

Plan72 is a Next.js (App Router) project for generating actionable 72-hour protocols. The generator outputs exactly one
printable card per catastrophe scenario (A6 by default, A7 optional) with:

- Escape route summary from start through DP1..DP3 to the destination.
- Stage actions for STG0..STG3, written as bullets.
- Do/don&apos;t lists tailored to the scenario.
- A simple map imprint with the key points so the card works offline.

The site is only the generator plus export, and it also highlights the Survival brand offer: an emergency go-bag, stash kits
A/B/C/D, and a maintenance service that includes printed/laminated cards.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

## Structure

- `app/` – landing, generator, and results routes.
- `components/` – shared UI primitives such as card previews and wizard helpers.
- `lib/` – schema definitions, constants, and the placeholder plan engine.
- `docs/` – product and design spec (see `PLAN72_REPO_SEED_SPEC.md`).

## Product expectations

- Landing page explains the single-card-per-scenario objective and shows the Survival brand upsell.
- Generator guides you through city/level, scenario + moment, and assigning decision points (DP1..DP3) before export.
- Results screen exports the card in A6 or A7 for print/lamination.

## Design Notes

- Typography uses Bebas Neue (display), Inter (body), and IBM Plex Mono (mono).
- Theme colors follow the paper/ink/olive/rust palette described in the spec.

## Deploying to GitHub Pages

The project is configured for static export with a `basePath` and `assetPrefix` of `/Plan72`, matching the repository name. To publish the landing on GitHub Pages:

1. Build the static site:

   ```bash
   npm run build
   ```

   The exported site is written to `out/` and includes a `.nojekyll` marker so GitHub Pages will serve the `_next` assets.
2. Push the contents of `out/` to your `gh-pages` branch (for example, using `git subtree push --prefix out origin gh-pages`) and enable GitHub Pages for that branch in the repository settings.
