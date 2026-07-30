# DESIGN.md — j-alyavdin.com token & component reference

Authoritative for any UI change. Read before touching a `.astro` file or its `<style>` block.
Apply tokens exactly — never hardcode a hex, px, or timing that a token already covers.

## Philosophy

This is a **refactor, not a redesign**: every token and component encodes what the legacy
hand-written HTML/CSS actually rendered (including its bugs, where fixing them was in scope —
see each component's doc comment for the specific source it ports). Tokens are the *only*
styling layer — `src/styles/tokens.css` is the one file where raw values are allowed to
originate. Everywhere else, reference a token. The two narrow exceptions (component-local
custom properties, and a handful of single-use page literals) are enumerated in **Conventions**
below — anything outside that list is a bug, not a precedent.

## Color

Three tiers — primitives feed semantics, semantics are what components actually use.

**Primitives** (never referenced directly in components):
`--color-gray-900:#1E1E1F` `--color-gray-800:#2B2C2D` `--color-gray-700:#323639`
`--color-sand-300:#CCC5BA` `--color-sand-600:#8F8A80`
`--color-orange-500:#FC700B` `--color-orange-400:#FE811B` `--color-white:#FFF`

**Semantic:**
`--color-bg` (gray-900) · `--color-bg-scrim: rgb(30 30 31/.9)` (header blur backdrop)
`--color-surface` (gray-800) · `--color-surface-hover` (gray-700) · `--color-border` (gray-800)
`--color-text` (sand-300) · `--color-text-muted` (sand-600)
`--color-accent` (orange-500) · `--color-accent-hover` (orange-400)
`--color-text-on-accent` (gray-900) · `--color-focus-ring` (orange-500)
`--opacity-dim: .55` — icons/images only, **never text**

**Muted-text decision:** the source rendered secondary text at `opacity:.4` on `--color-sand-300`
(and, on the privacy page, the equivalent `rgba(204,197,186,.4)`) — roughly **2.4:1** contrast,
failing AA. Both call sites were consolidated into `--color-text-muted` (`#8F8A80` solid),
**4.85:1** on `--color-bg` — passes AA. To revert a single call site, swap the token back for
`opacity:.4` (or `rgba(204,197,186,.4)`) on `--color-text` — the visual result is identical to
pre-refactor.

**Button-label contrast decision:** the source rendered primary-button labels in `azure`
(near-white) on `--color-accent` — roughly **2.81:1**, failing AA. `--color-text-on-accent` was
darkened to `--color-gray-900` (2026-07-30), **≈8.8:1** on `--color-accent` — passes AA
comfortably. To revert, point the token back at `--color-white`, knowingly reintroducing the
2.81:1 failure.

**CONSTRAINT:** `--color-text-muted` fails AA on `--color-surface` (4.07:1). Background-only
token — never place muted text on a card/surface fill.

## Typography

One family, two weights: `'Aeonik','Helvetica Neue',Arial,sans-serif` at 400 (regular) and 500
(medium) only — `--font-weight-regular` / `--font-weight-medium`. **No 700.** The source's
mobile `h2` was set to `font-weight:700` on a family with no 700 file, which browsers fake via
synthetic bold (visibly different glyph shapes); the refactor pins it to 500 everywhere,
including ≤560px. Every place the source named the *fake family* `'Aeonik-medium'` with no
explicit weight (basic.css, privacy's inline style) now gets `font-weight: var(--font-weight-medium)`
explicitly — the family string alone doesn't carry weight once it's a real `@font-face`.
`--font-mono: 'SF Mono', Menlo, monospace` for code blocks. `font-display: swap` on both faces.

Scale pairs (desktop → ≤560px override):
| Token | Desktop | ≤560px | Used for |
|---|---|---|---|
| `--text-heading-size/leading` | 40/56 | 32/44 | h1, h2 (base.css global rule) |
| `--text-body-size/leading` | 24/40 | 20/32 | body copy (base.css `body`) |
| `--text-small-size/leading` | 20/32 | *(same)* | meta lines, small buttons |
| `--text-prose-size/leading` | 20/36 | *(same)* | privacy policy paragraphs/list items |
| `--text-caption-size` | 18 | *(same)* | code blocks (no dedicated leading token) |

`--tracking-body: .4px` — applied once, globally, on `body` in base.css.

## Space

8pt scale: `--space-1:4` `--space-2:8` `--space-3:16` `--space-4:24` `--space-5:32`
`--space-6:40` `--space-7:64` `--space-8:80` `--space-9:120` `--space-10:160`.
Three source outliers (14/28/30px) were snapped to the nearest step during the port.

Four rhythm tokens replace the source's `.spacer-05`/`.spacer-0`/`.spacer-1`/`.spacer-2` divs
(each page had 1–5 of these, purely for vertical gaps):
- `--space-block-sm` → `--space-3` (16)
- `--space-block` → `--space-5` (32)
- `--space-block-lg` → `--space-7` (64)
- `--space-section` → `--space-10` (160) — `ContentBlock`'s `margin-top`, replacing the
  `.spacer-2` every case-study content section used to need explicitly

All four (plus body/heading text size) halve under `@media (max-width:560px)` in tokens.css —
the source's own responsive spacer-halving behavior, centralized instead of duplicated per page.

## Radius / Shadow

`--radius-sm:4` `--radius-md:8` `--radius-lg:16` `--radius-full:50%`.

Shadows: `--shadow-card` (inset highlight, rest state) · `--shadow-card-hover` (inset shade,
hover) · `--shadow-raise` (button hover lift) · `--shadow-glow: 0 0 240px` (paired with a
per-image dominant-color hex on `OrbitAvatar`).

**Inset-only card decision:** the source declared a drop-shadow on `.project` and then
immediately overwrote it with an inset shadow in the same rule (rest *and* hover) — the drop
shadow never rendered in any browser. `CaseCard` ports only the inset shadow: this matches what
actually shipped, not a stylistic choice.

## Motion

`--duration-fast: 150ms` (hover/active micro-interactions) · `--duration-base: 300ms` (header
reveal, card hover, link/icon fades) · `--duration-reveal: 1s` (`.fade-content` scroll reveal) ·
`--ease-default: ease-in-out`.

**Orbit spec** (`OrbitAvatar`): `@keyframes orbit { from { transform: rotate(0deg) } to
{ transform: rotate(-360deg) } }`, `15s linear infinite`. Starts at **0deg, not −90deg** — the
legacy per-frame JS (`script-end.js`) overwrote the SVG's CSS base rotation on its very first
animation frame, so 0deg is what actually rendered, not the CSS-only base. 15s is nominal: the
old canvas-stepped animation was frame-rate dependent, this CSS version is exact.

**Reduced motion:** base.css's global damper (`@media (prefers-reduced-motion: reduce)`)
collapses every `animation`/`transition` to a single 0.01ms iteration — this freezes the orbit
SVG at its unanimated 0deg state (no extra rule needed) and collapses `.fade-content`'s
transition. Separately, `BaseLayout`'s inline reveal script checks
`matchMedia('(prefers-reduced-motion: reduce)')` itself and marks every `.fade-content` visible
immediately, skipping the `IntersectionObserver` entirely, so reduced-motion users never wait on
a scroll trigger either.

## Z-index

`--z-behind: -1` (avatar sits behind its orbiting SVG; experience-timeline bar sits behind its
dot) · `--z-header: 100` (`SiteHeader`'s fixed bar) · `--z-sticky: 10` — defined, reserved for
sticky elements (`ContentBlock`'s `.content-title`, `SectionTitle`'s sticky variant); neither
currently sets an explicit z-index, so this token is unused today. Wire it in if a sticky
element ever needs to win a stacking conflict.

## Layout

Three containers: `--container-max: 1160px` (`.container` utility — nearly every section) ·
`--container-narrow: 800px` (`sorry.astro`'s `.intro`) · `--container-prose: 720px`
(`privacy.astro`'s `.policy-wrap`). `--container-pad: 24px` side gutter on all three.

Breakpoints, desktop-first `max-width`, canonical everywhere: **1160 / 880 / 560 / 380**.

## Component index

All 17 components in `src/components/`. Read the file's own doc comment for the exact source
CSS it ports — this table is the props contract, not the full rationale.

| Component | Purpose | Props |
|---|---|---|
| `Button` | Primary/ghost CTA, real `<a>` | `href, variant?:'primary'\|'ghost', download?, external?` |
| `CaseCard` | Index case-study grid card | `title, tagline, image, href, external?, locked?` |
| `ContentBlock` | Sticky-title two-column case-study section (+ slot) | `title` |
| `ContentMedia` | Aspect-ratio-safe image/video embed | `src, alt, kind?:'img'\|'video', poster?:string\|false, controls?, webm?, width, height` |
| `DetailsGrid` | 3/2/1-col responsive stat grid (case-study intro) | `items:{label,value}[]` |
| `Divider` | Hairline rule | — |
| `ExperienceSlot` | One timeline row in the experience list (+ slot) | `dates, company, role, current?, isLast?` |
| `Eyebrow` | Accent-colored kicker label (+ slot) | `as?:'p'\|'h3'` |
| `FocusItem` | One cell of the "Focus on" icon grid | `icon?, text` |
| `HeroImage` | Hero media frame — bg-image div, or slotted video/iframe (+ slot) | `image?` |
| `OrbitAvatar` | Avatar + rotating circular-text SVG | `image, topText, bottomText, glow?, topOffset?, bottomOffset?` |
| `SectionTitle` | Numbered section heading, standalone or sticky | `number, title, id?, variant?:'block'\|'sticky'` |
| `SiteFooter` | Footer + copyright + social icons | `spaced?` (default `true`) |
| `SiteHeader` | Fixed top bar — scroll-revealed on home, pinned on inner pages | `variant:'home'\|'page'` |
| `SocialIcons` | 4-icon social row (reads `data/site.ts`) | — |
| `StatsList` | 2-col (1-col ≤380) stat grid with its own leading divider | `items:{label,value}[]` |
| `TestimonialItem` | One quote + attribution link | `quote, author, href` |

Layouts (not counted above, one level up): `BaseLayout` (head/meta/OG, `title, description, path,
ogType?, noindex?`) and `CaseStudyLayout` (the shared case-study skeleton over `BaseLayout`).

## Conventions

- **Raw values live only in `tokens.css`** — with two narrow, enumerated exceptions:

  **1. Component-local custom properties** — declared inside a component's own `<style>` block
  when a value repeats ≥2× within that one file and isn't a candidate for the global token set
  (too implementation-specific to reuse elsewhere). Current inventory:
  `--card-pad-x` (CaseCard, 28px) · `--button-height` (Button, 72px / 56px ≤560) ·
  `--focus-icon-size` (FocusItem, 64px) · `--orbit-size` / `--avatar-size` (OrbitAvatar, 160px /
  88px) · `--site-header-height` / `--header-blur` (SiteHeader, 64px / 28px — `--site-header-height`
  is also SiteHeader's published layout contract, consumed by other components/pages to offset
  their first section) · `--copyright-min-width` (SiteFooter, 280px) · `--social-icon-size`
  (SocialIcons, 40px).

  **2. Single-use page-local literals** — a value with nowhere else to earn a shared token,
  documented at the call site instead of promoted:
  - `iris/privacy.astro`'s `.policy-wrap h2 { margin-top: 48px }` — off the 8pt scale's named
    steps (between `--space-6`:40 and `--space-7`:64); the size/line-height pair next to it
    *does* match `--text-body-size`/`--text-body-leading` (24/40) and uses those tokens.
  - `casestudy/pepsi.astro`'s `.worker-media { max-width: 280px }` — constrains one portrait
    video (478×956) that the source capped at `width="280px "` (an invalid attribute value,
    the plan's named bug) instead of the other two GIFs' full-width treatment.
  - `casestudy/market.astro`'s `.solution-image` / `.solution-image-grid` — a single-use layout
    between two content blocks; internally still built from tokens (`--container-max`,
    `--radius-sm`, `--space-1`, `--space-2`), just not promoted to a shared component since
    nothing else uses this shape.
  - `casestudy/run.astro`'s `.hero { aspect-ratio: 16/9 }` — the standard video aspect ratio, not
    a design-scale value; reserves the YouTube iframe's box so nothing shifts once it loads (a11y
    fix, 2026-07-30, alongside dropping the iframe's invalid `width="100%" height="100%"` attrs).

- **Scoped styles by default.** Every component/page owns its own `<style>` (Astro's
  data-attribute scoping). `:global()` is the escape hatch, used only for slotted markup a
  component doesn't render directly (`HeroImage`'s slotted `video.hero`/`iframe.hero`,
  `ContentBlock`'s `.circle-list`, `ExperienceSlot`'s slotted links) — plus the handful of true
  cross-page globals that live in `base.css` itself: the reset, `:focus-visible`, `.container`,
  `.eyebrow`, `.lead-in`, `.fade-content`, and the reduced-motion damper.
