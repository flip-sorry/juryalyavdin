# Analytics — measurement plan

GA4 property `G-61W5TLDRRQ`, loaded in `BaseLayout.astro`. Custom events live in one
delegated inline script in the same file — no per-component wiring, so new links and
sections are tracked automatically. Red-teamed pre-ship 2026-08-02; the schema below is
the post-review version.

**Goal:** the site is a lead-generation funnel. Analytics answers three questions:
1. Where do visitors drop off ("stuck") — per page, per section, per depth?
2. Which visitors show hiring intent, and what did they look at first?
3. Which inbound channels produce those visitors?

## Event schema (contract)

Event names and param names are **frozen once shipped** — renaming breaks GA4 reporting
continuity. Changes are additive only (new events / new params).

| Event | Fires on | Params | Key event |
|---|---|---|---|
| `contact_click` | any `mailto:` link | `link_location` | **yes** |
| `cv_download` | `.pdf` links whose filename contains `cv` | `file_name`, `link_location` | **yes** |
| `case_open` | case card (`a.project`), incl. middle-click | `case_name`, `case_target` | no — funnel step |
| `social_click` | social icon (`a.social-icons-link`) | `network`, `link_location` | no — soft signal |
| `section_view` | first scroll into a content block | `section_id`, `section_index` | no — stuck map |
| `scroll_depth` | 25 / 50 / 75 % page depth, once each | `percent_scrolled` | no — stuck map |
| `page_not_found` | 404 page render | — (URL is in auto `page_location`) | no — alarm |

Plus GA4 enhanced measurement defaults: `page_view`, `scroll` (90 %), `click` (outbound),
`file_download` (any PDF — `cv_download` is the curated CV-only subset and the key event;
non-CV PDFs deliberately stay out of it).

**`section_id`** is the section's name only (`focus_and_principles`, `experience`,
`overview`, `solution`) — order travels separately in **`section_index`**, so inserting or
reordering sections never renames the values that follow (dimension history survives
content edits). Caveat: retitling a section *does* mint a new value — note the date when
you rename one. Values come from `SectionTitle`/`ContentBlock` titles at runtime.

**`case_target`** = `case` (real case-study page) / `locked` (→ sorry page) / `external`
(leaves the site). Only `case` rows can continue down the funnel — always segment by this
before reading conversion rates: of 24 home cards today, only 7 are `case`.

**`case_name`**: for `case` targets it's the path slug (`avito`, `impress-app`) — stable
across title edits and joinable to `page_path`. For `locked`/`external` (which share or
lack an on-site path) it's the slugified card title. `case_target=locked` clicks are
demand for private work — cross-reference with the sorry page's "Ask for a case
description" `contact_click`.

**`link_location`** is `header` / `footer` / `intro` / the enclosing section's id. Today
every contact/CV link on the site sits in an `.intro` (home hero, sorry, privacy), so this
dimension only becomes informative once more CTAs exist — see Backlog.

## GA4 property configuration

- **Key events:** `contact_click`, `cv_download`.
- **Custom dimensions** (event-scoped, dimension name = param name): `link_location`,
  `case_name`, `case_target`, `network`, `section_id`, `section_index`.
  Not `file_name`/`percent_scrolled` — GA4 has predefined dimensions for those params.
- **Data retention:** 14 months (default is 2 — too short for a job-hunt cycle).
- **Audience "Hot leads":** users with `contact_click` OR `cv_download` in the last 7 days.
- **Custom insights + email:** (1) daily `contact_click` ≥ 1 — a portfolio lead goes cold
  in days; the alert is the trigger to follow up while they remember you. (2) daily
  `page_not_found` ≥ 1 — backstops the never-break-legacy-URLs hard rule.

## Reading the data

**Lead funnel** (Explore → Funnel exploration, open funnel):
`page_view (/)` → `case_open (case_target=case)` → `section_view` on a case page →
`contact_click` OR `cv_download` **anywhere later in the same session** (indirect step —
today there is no contact link on case pages, so a direct next-step would show ~100 %
drop by construction, not behaviour; see Backlog).

**Stuck map** (Explore → Free form): rows `page_path` + `section_id`, ordered by
`section_index`, value Event count, event `section_view`. The sharpest count drop between
consecutive sections is where people bail. Read it together with `scroll_depth`:
`section_view` means *entered*, not *read* — the home Experience section is ~11 000 px
tall, and a visitor who left after its first screen still fired its `section_view`.

**Lead source** (Reports → Acquisition, filter: session had a key event): which channel
produces contacts, not just traffic. Requires tagging every link you publish — untagged =
lumped into direct/referral and unattributable. Convention (mediums must come from GA4's
default channel-group vocabulary or they land in "Unassigned"):

| Where you share | Tag |
|---|---|
| LinkedIn post / profile | `?utm_source=linkedin&utm_medium=social&utm_campaign=<e.g. post-2026-08>` |
| LinkedIn / other DMs | `?utm_source=linkedin&utm_medium=social&utm_campaign=dm` |
| Link inside the CV PDF | `?utm_source=cv&utm_medium=referral&utm_campaign=job-hunt` |
| Job application form | `?utm_source=job-application&utm_medium=referral&utm_campaign=<company>` |
| Email signature / outreach | `?utm_source=email-signature&utm_medium=email` |
| Dribbble / Behance profile | `?utm_source=dribbble&utm_medium=social` |

**Weekly ritual (10 min):** Hot-leads audience → who, from where, what did they read
(User explorer) → follow up. Then stuck map: one drop-off, one hypothesis, one fix.

## Backlog — what the schema already shows is missing

1. **No contact CTA on case-study pages** (the funnel's terminal gap): a convinced reader
   must navigate back home and scroll to the hero to act. A contact/CV block at the end
   of `CaseStudyLayout` (after the content slot, before the footer) is the single
   highest-leverage conversion fix this plan can point at. UI change → DESIGN.md rules.
2. Once (1) ships, `link_location` starts separating "contacted from hero" from
   "contacted after reading a case" — the doc's lead-quality read depends on it.

## Known gaps (accepted)

- **No consent banner** — GA4 runs unconditionally; EU-visitor data is therefore
  best-effort and the setup is a GDPR gray zone (personal portfolio, no ads, no
  remarketing). Revisit if traffic or stakes grow. No PII leaves the page: params carry
  only Iurii's own headings, filenames, and slugs (verified in review).
- **Ad-blockers** drop a meaningful share of a designer/dev audience — treat counts as a
  floor, trends and ratios as the signal.
- `mailto:` clicks ≠ sent emails; `cv_download` is the more honest intent proxy.
- gtag.js loads `async`: a click in the first ~instants of a visit can be lost to
  same-tab navigation before the library initializes. Unverified at runtime, likely
  negligible (all tracked links sit below the fold or require reading time).
- The hero video and the intro (always in the first viewport) are deliberately untracked.
- `section_view`/`scroll_depth` fire per pageview, not per user — refreshes inflate them.
