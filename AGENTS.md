# j-alyavdin.com

Static portfolio site — Astro 7, deployed to GitHub Pages via Actions, served on the apex domain
j-alyavdin.com. Ten legacy `.html` URLs preserved byte-for-byte from the pre-Astro hand-written
site. See **DESIGN.md** for the token system before touching any UI.

## Commands

- `npm run dev` — dev server (`astro dev`; one instance per project — reuses an already-running
  one instead of erroring)
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the build
- `npm run build:cv` — re-render `public/j-alyavdin-cv.pdf` (one-page A4) from `scripts/cv/cv.html`
  via Playwright; edit content there, never the PDF. Must stay 1 page — check with `pdfinfo`
- `node scripts/compare.mjs capture --base <URL> --out <dir>` — deterministic Playwright
  screenshot capture across all 10 legacy URLs × 5 widths (1440/1024/880/560/390)
- `node scripts/compare.mjs diff --a <dirA> --b <dirB> --out <dir> [--threshold 0.1]` —
  pixelmatch diff between two capture runs
- `node scripts/dominant-color.mjs <image> [...more]` — prints each image's dominant hex, for
  `OrbitAvatar`'s `glow` prop

## Hard rules

- **DESIGN.md is authoritative** for any UI change — tokens only, never a hardcoded hex/px/timing.
- **ANALYTICS.md is the GA4 event-schema contract** — shipped event/param names are frozen;
  changes are additive-only. New links/sections are auto-tracked by the delegated script in
  `BaseLayout.astro`; check the schema before touching any DOM hook it keys on: classes
  `.project`, `.social-icons-link`, `.content-block`, `.fade-content`, `.section-title`,
  `.cases-title`, `.content-title`, `.intro`; elements `header`/`footer`; CaseCard's
  `<Eyebrow as="h3">` (locked/external `case_name` reads the card's `h3` — drop the `as`
  prop and those collapse to junk values); `mailto:`/`*cv*.pdf` href shapes.
- **Never break the 10 legacy `.html` URLs.** `build.format:'file'` + `trailingSlash:'never'` in
  `astro.config.mjs` are load-bearing for this — don't change either without re-verifying every
  URL still resolves.
- **`og:url`/canonical come only from each page's explicit `path` prop** — never `Astro.url` (it
  yields directory-style URLs that 404 under `format:'file'`).
- **No client frameworks, no Tailwind, no jQuery.** Plain Astro components + scoped CSS only.
- **`public/` media paths are stable URL contracts.** The OG images and the CV PDFs are hotlinked
  externally (social-card scrapers, possible inbound links) — don't rename or move anything
  under `public/` without a redirect plan.
- **No further force-pushes.** History was rewritten once, 2026-07; the full pre-rewrite bundle
  lives at `~/Archives/juryalyavdin-pre-astro-2026-07.bundle`. Treat `main` as append-only from
  here on.
- **A11y floor:** alt text on every image, `aria-label` on icon-only links, a visible
  `:focus-visible` ring (base.css), and `prefers-reduced-motion` honored — both base.css's
  animation damper and `BaseLayout`'s reveal script check it independently.
