# j-alyavdin.com

Jury Alyavdin's product design portfolio. Static site, [Astro](https://astro.build), deployed to
GitHub Pages on the apex domain `j-alyavdin.com`. Rebuilt from a hand-written HTML/CSS site into
a token-based component architecture, preserving all legacy `.html` URLs byte-for-byte.

Plain Astro components + scoped CSS only — no client framework, no Tailwind, no jQuery.

See **DESIGN.md** for the design-token system and component inventory, and **AGENTS.md** for
repo conventions and hard rules before making changes.

## Commands

- `npm run dev` — dev server at `localhost:4321`
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the build locally
- `npm run check:links` — recursive broken-link check (linkinator) against a running dev/preview
  server; external URLs skipped
- `node scripts/compare.mjs capture --base <URL> --out <dir>` / `diff --a <dirA> --b <dirB>` —
  deterministic Playwright + pixelmatch screenshot diffing for visual-fidelity checks
- `node scripts/dominant-color.mjs <image>` — dominant hex of an image, for `OrbitAvatar`'s
  `glow` prop

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages on every push
to `main` — no manual deploy step.
