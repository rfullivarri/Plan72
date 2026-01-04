# Plan72

Plan72 is a Next.js (App Router) project that seeds a retro-styled 72-hour protocol generator.

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

## Design Notes

- Typography uses Bebas Neue (display), Inter (body), and IBM Plex Mono (mono).
- Theme colors follow the paper/ink/olive/rust palette described in the spec.
