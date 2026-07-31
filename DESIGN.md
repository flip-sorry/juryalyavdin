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
darkened to `--color-gray-900` (2026-07-30), **5.92:1** on `--color-accent` — passes AA
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

Three of the four are exact halves at `@media (max-width:560px)`: `--space-block-sm` 16→8,
`--space-block` 32→16, `--space-section` 160→80. `--space-block-lg` does **not** halve — it goes
64→40, matching the source's own `.spacer-1` (which was never a true half either). Body/heading
text size steps down in the same media query — see Typography.

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

## Theming

Two modes, one token set: `:root` is the dark default (unchanged, byte-identical except
additive lines), and `[data-theme="light"]` overrides the same semantic tokens plus five
theme-switched literals (scrim, the three shadows, hairline). There is no
`prefers-color-scheme` — the toggle is manual-only, a deliberate product decision, not an
oversight. Absence of `localStorage['theme']` means dark; `'light'` means light. `color-scheme`
is set per theme (`dark` on `:root`, `light` on the light block) so native form controls and
scrollbars follow. The bootstrap that reads `localStorage` and sets `data-theme` before first
paint lives in `BaseLayout`'s existing head `is:inline` IIFE, immediately after
`classList.add('js')` — this keeps `data-theme` set before any stylesheet loads, so there's no
flash of the wrong theme. `.theme-switching` (added to `<html>` for two animation frames around
a toggle click, `base.css`) forces `transition: none` on every element, because
`CaseCard`/`Button`/`SocialIcons` all use bare `transition:` (= `all`) and would otherwise
animate 150–300ms during the flip while everything else snaps instantly.

`site.webmanifest` / `browserconfig.xml` stay dark-only — installed-tile/OS-chrome context has
no runtime theme to read, so it's out of scope.

### Two-mode semantic token table

| Token | Dark (`:root`) | Light (`[data-theme="light"]`) |
|---|---|---|
| `--color-bg` | gray-900 `#1E1E1F` | sand-50 `#F6F0E5` |
| `--color-bg-scrim` | `rgb(30 30 31/.9)` | `rgb(246 240 229/.9)` |
| `--color-surface` | gray-800 `#2B2C2D` | sand-100 `#ECE4D5` |
| `--color-surface-hover` | gray-700 `#323639` | sand-200 `#DFD4C0` |
| `--color-border` | gray-800 | sand-200 |
| `--color-text` | sand-300 `#CCC5BA` | gray-900 `#1E1E1F` |
| `--color-text-muted` | sand-600 `#8F8A80` | sand-700 `#6E675B` |
| `--color-accent` | orange-500 `#FC700B` | orange-700 `#AC4600` |
| `--color-accent-hover` | orange-400 `#FE811B` | orange-600 `#C25200` |
| `--color-text-on-accent` | gray-900 | white — flips, see decisions below |
| `--color-focus-ring` | orange-500 | orange-700 |
| `--shadow-card` | `inset 0 1px 0 rgb(255 255 255/.08)` | `inset 0 1px 0 rgb(255 255 255/.65)` |
| `--shadow-card-hover` | `inset 0 -2px 0 rgb(0 0 0/.4)` | `inset 0 -2px 0 rgb(0 0 0/.12)` |
| `--shadow-raise` | `0 4px 16px rgb(0 0 0/.35)` | `0 4px 16px rgb(0 0 0/.15)` |
| `--border-hairline` | `.5px solid rgb(255 255 255/.05)` | `.5px solid rgb(0 0 0/.08)` |

`--opacity-dim: .55` is shared, unchanged in both themes.

### Light-theme ratios (verified `node -e` WCAG math, same method as the Color section above)

| Pair | Ratio | Verdict |
|---|---|---|
| text `#1E1E1F` / bg `#F6F0E5` | 14.69 | pass |
| text / surface `#ECE4D5` | 13.19 | pass |
| muted `#6E675B` / bg | 4.93 | pass (dark parity 4.85) |
| muted / surface | 4.43 | fails — same "bg-only token" constraint as dark (4.07) |
| accent `#AC4600` / bg | 5.10 | pass |
| accent / surface | 4.58 | pass |
| accent-hover `#C25200` / bg | 4.11 | pass-large (transient) |
| accent-hover / surface | 3.69 | pass-large (transient; dark parity 4.33) |
| white-on-accent | 5.79 | pass |
| focus-ring / bg | 5.10 | pass (≥3:1 non-text bar) |
| inverted social glyph @ .55 / bg | 4.61 (4.30 on ≤560 sand-200 chip) | pass (≥3:1 non-text bar) |

**CONSTRAINT (re-verified):** `--color-text-muted` fails AA on `--color-surface` **in both
themes** (4.43 light / 4.07 dark) — background-only token in both modes; never place muted text
on a card/surface fill in either theme.

### Decisions (revert-instruction format)

**Light accent darkens:** brand `#FC700B` is 2.48:1 on cream — fails even the 3:1 large-text
bar. Brute-forcing sRGB at the brand hue puts the chroma ceiling at ~4.5:1 (bg) around `#B84D00`;
beating it needs a ~10° hue rotation toward vermilion, a bigger brand break than accepted here.
`--color-orange-700: #AC4600` clears AA on **both** `--color-bg` (5.10:1) and `--color-surface`
(4.58:1 — eyebrows render on cards at 20px regular ≤560px, so the surface figure is load-bearing,
not decorative). To revert, point `--color-accent`/`--color-focus-ring` back at a lighter orange,
knowingly reintroducing the sub-3:1 failure on cream.

**Light button-label flips to white:** gray-900 on the darkened accent is ≈3:1 (fails the
≤560px 20px button label); `--color-text-on-accent: var(--color-white)` passes at 5.79:1. Dark
theme is unaffected — it keeps gray-900 on `--color-accent` at 5.92:1 (see the correction below).

**Light glow is off, not muted:** `OrbitAvatar`'s dark-mode `box-shadow: var(--shadow-glow)
var(--glow)` renders per-image dominant-color glows (9 hexes) that only read against a dark
canvas. Muting doesn't fix it: at 45% via `color-mix()`, the homepage's `#080808` glow composites
to a 3.13:1 grey smudge on cream, while `#f8f8f8` vanishes (1.03:1) — a dark-tuned glow can't be
tuned to work on a light background. `color-mix()` is also a fallback trap: per the CSS Variables
spec, a `var()` referenced inside an unsupported function is invalid at computed-value-time and
drops the *earlier* declaration, computing to `box-shadow: none` in pre-`color-mix` browsers — a
dark-mode regression, not just a light-mode gap. Light instead overrides to `--shadow-raise` (a
flat, theme-appropriate lift) via `:global(html[data-theme='light']) .avatar.has-glow`; the dark
rule and all 9 glow hexes are untouched. To revert, delete the light override — light then
inherits the invisible/smudged dark-tuned glow.

**Icon filters (invert / invert+hue-rotate):** icon assets stay as the existing `public/` PNGs
(immutable URL contracts) — theming is CSS filters only, no new image files.
- `SocialIcons`' `.social-icons-icon`, `CaseCard`'s `.locker`: pure white/grayscale glyphs on a
  transparent PNG. `filter: invert(1)` flips them to near-black, which reads on cream (social
  ≈4.61:1 effective at rest, ≈15:1 hover; locker 13.49:1).
- `FocusItem`'s `.focus-img`: grayscale pixels are invariant under `hue-rotate()`, so the pale
  plate regions (60–79% of the asset, 1.26:1 on cream unmodified) invert to near-black
  (`#171717`, ≈13:1) under `invert(1) hue-rotate(180deg)`, while the one baked-in orange
  (`#F87818`) lands at ≈`#DE5E00` — same hue family, slightly deeper, not an accidental color
  shift. `drop-shadow` was rejected: it only traces the alpha silhouette, so interiors would
  still wash out on cream.
- To revert any of the three, drop its `:global(html[data-theme='light'])` filter rule — the
  asset falls back to invisible/near-invisible on a light background, matching pre-theming
  behavior.

**Toggle placement — header only:** `ThemeToggle` lives beside `SocialIcons` in `SiteHeader`,
nowhere else. Accepted quirks: on the homepage the control only appears once the header slides
in at the 700px scroll threshold (same reveal as the social links); `/sorry` has no header, so it
has no toggle — a stored light preference still applies there, just uncontrollable from that
page.

**Compact header row at ≤560px:** the ≤560px row was already at zero slack (name + 4 social
icons filled the full width); adding `ThemeToggle` overflowed it, wrapping the header name
`{site.name}` to two lines. `SocialIcons` gained a `compact?: boolean` prop
(`class:list={['social-icons', { compact }]}`) that, only inside the existing ≤560px media
block, drops `--social-icon-size` to 36px and `grid-gap` to `--space-2`; `SiteHeader` passes
`compact` and tightens `.header-actions`' own gap to `--space-2` at the same breakpoint;
`ThemeToggle` drops `--toggle-size` to 36px in its matching block. Math at 390px: 4×36 (icons) +
3×8 (icon gaps) + 8 (actions gap) + 36 (toggle) = 212px, plus the ≈116px name, well under the
≈342px available. **Header-only, deliberately**: `SiteFooter`'s `<SocialIcons />` call never
passes `compact`, so `class:list` renders it as plain `class="social-icons"` — byte-identical to
before this change. To revert, drop the `compact` prop pass in `SiteHeader` and the three
`.compact`/`--toggle-size` overrides — the row returns to its pre-toggle 40px sizing and
overflows again once `ThemeToggle` is present.

**Transition guard:** `.theme-switching * { transition: none !important; }` (`base.css`, next to
the reduced-motion damper) is added to `<html>` for two animation frames around every toggle
click and removed after. Without it, `CaseCard`/`Button`/`SocialIcons`' bare `transition:`
shorthand (= `all`) animates 150–300ms during the theme flip while every other property snaps
instantly.

**Correction:** the button-label decision (Color section, above) previously claimed "~8.8:1" for
gray-900-on-`--color-accent` in dark theme, and `tokens.css`'s line-comment repeated the same
figure. Re-measured by the same `node -e` method that produced every ratio in this document, the
actual figure is **5.92:1**. Still comfortably AA — the number was wrong, not the token choice.
Both this file and the `tokens.css` comment are corrected.

## Component index

All 18 components in `src/components/`. Read the file's own doc comment for the exact source
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
| `SocialIcons` | 4-icon social row (reads `data/site.ts`) | `compact?` (header-only ≤560px sizing) |
| `StatsList` | 2-col (1-col ≤380) stat grid with its own leading divider | `items:{label,value}[]` |
| `TestimonialItem` | One quote + attribution link | `quote, author, href` |
| `ThemeToggle` | Header sun/moon manual dark/light switch | — |

Layouts (not counted above, one level up): `BaseLayout` (head/meta/OG, `title, description, path,
ogType?, noindex?`) and `CaseStudyLayout` (the shared case-study skeleton over `BaseLayout`).

## Conventions

- **Raw values live only in `tokens.css`** — with three narrow, enumerated exceptions:

  **1. Component-local custom properties** — declared inside a component's own `<style>` block
  when a value repeats ≥2× within that one file and isn't a candidate for the global token set
  (too implementation-specific to reuse elsewhere). Current inventory:
  `--card-pad-x` (CaseCard, 28px) · `--button-height` (Button, 72px / 56px ≤560) ·
  `--focus-icon-size` (FocusItem, 64px) · `--orbit-size` / `--avatar-size` (OrbitAvatar, 160px /
  88px) · `--site-header-height` / `--header-blur` (SiteHeader, 64px / 28px — `--site-header-height`
  is also SiteHeader's published layout contract, consumed by other components/pages to offset
  their first section) · `--copyright-min-width` (SiteFooter, 280px) · `--social-icon-size`
  (SocialIcons, 40px) · `--cases-grid-gap` (index.astro, 12px — page-level rather than a
  component, but the same rule: off the 8pt scale by origin, matching the source's own
  `.cases-grid { grid-gap: 12px 12px }`).

  These are genuine local design decisions — distinct from **per-instance passthrough
  properties** (`--avatar-image`, `--card-image`, `--glow`, `--hero-image`, `--icon`,
  `--media-ratio`), which carry a *value* (a URL, a hex, a ratio) computed per component
  instance via an inline `style` attribute, not a *design constant*. They're exempt from the
  "raw values live only in tokens.css" rule because they aren't raw design values at all — just
  a plumbing mechanism for getting instance data into scoped CSS.

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

  **3. Meta-tag color literals** — `<meta name="theme-color">` / `<meta name="msapplication-TileColor">`
  need a literal hex at parse time, before any stylesheet has run, so they've always carried
  `#1E1E1F` directly in `BaseLayout`'s `<head>`, outside `tokens.css`. Theming extends this same
  exception to the two script literals that rewrite `theme-color` at runtime — `#F6F0E5` (light)
  and `#1E1E1F` (dark), in `BaseLayout`'s bootstrap IIFE and `ThemeToggle`'s `sync()` — because JS
  running before any stylesheet loads can't read a CSS custom property either.

- **Scoped styles by default.** Every component/page owns its own `<style>` (Astro's
  data-attribute scoping). `:global()` is the escape hatch, used only for slotted markup a
  component doesn't render directly (`HeroImage`'s slotted `video.hero`/`iframe.hero`,
  `ContentBlock`'s `.circle-list`, `ExperienceSlot`'s slotted links), the theme overrides that key
  off `html[data-theme='light']` from inside a scoped component style (`OrbitAvatar`,
  `SocialIcons`, `FocusItem`, `CaseCard`, `ThemeToggle`'s icon swap — sanctioned, since the
  attribute lives on `<html>`, outside any component's own markup) — plus the handful of true
  cross-page globals that live in `base.css` itself: the reset, `:focus-visible`, `.container`,
  `.eyebrow`, `.lead-in`, `.fade-content`, `.theme-switching`, and the reduced-motion damper.
