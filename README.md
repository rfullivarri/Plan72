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

## Deploying to GitHub Pages

The project is configured for static export with a `basePath` and `assetPrefix` of `/Plan72`, matching the repository name. To publish the landing on GitHub Pages:

1. Build the static site:

   ```bash
   npm run build
   ```

   The exported site is written to `out/` and includes a `.nojekyll` marker so GitHub Pages will serve the `_next` assets.
2. Push the contents of `out/` to your `gh-pages` branch (for example, using `git subtree push --prefix out origin gh-pages`) and enable GitHub Pages for that branch in the repository settings.
