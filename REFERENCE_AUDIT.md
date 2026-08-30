# REFERENCE_AUDIT.md

A structural analysis of the supplied DAZED homepage reference
(`Dazed___Confused_Magazine…Dazed.pdf`, a single tall capture ≈ 3992 × 21415 px).
This audit is the blueprint the ARCHVE component system was built from. It records
**layout, structure and proportion only** — none of DAZED's copy, imagery or code
was reused. The ARCHVE identity (pure-black background, cool-gray type, monochrome
rules) is then mapped onto this skeleton.

The reference was inspected by rasterizing the tall page into horizontal bands and
reading each band for section type, column count, proportions and type hierarchy.

---

## 1. Global frame

| Property | Reference | ARCHVE implementation |
|---|---|---|
| Max content width | ~1280–1320 px centered gutter | `--container: 1280px`; wide bands `--container-wide: 1720px` |
| Outer gutter | ~24–40 px, growing with viewport | `clamp()`-based container padding |
| Background | White | `#000000` (`--bg`) |
| Body text | Near-black | `#dce0df` (`--text`) |
| Dividers | Hairline gray | translucent white (`--rule: rgba(255,255,255,.14)`) |
| Type family | Neue Haas Grotesk Display | same, loaded locally as `woff2` |

## 2. Header / navigation

- **Row 1:** centered wordmark. Utility icons pinned left (search, a "＋"/subscribe
  affordance); hamburger pinned right.
- **Row 2:** a single centered horizontal nav row of primary categories, hairline
  rule beneath.
- **Behavior:** nav collapses into a full-screen overlay menu on narrow viewports;
  search expands into an inline panel.
- **ARCHVE mapping:** identical structure. 9 nav items to mirror the reference's
  count — The Collective, Latest, Music, Art, Fashion, Film, Photography, Culture,
  The Index. Wordmark swapped for `archve-wordmark.svg`.

## 3. Hero

- Full-bleed split hero: large image with a right-side scrim carrying an eyebrow
  (category/label), a large headline, and a short dek.
- Aspect ≈ 16:9 on desktop, recomposing to stacked image-over-text on mobile.
- **ARCHVE mapping:** same split hero; eyebrow uses the ARCHVE accession motif
  ("No. 001 — MUSIC").

## 4. Section inventory & order

The reference alternates **feature grids**, **image-led promos**, a **cover/issue
rail**, **category grids**, and a **membership/CTA band**, with a repeated
newsletter block near top and bottom. ARCHVE reproduces this rhythm 1:1:

| # | Reference band | Columns | ARCHVE section (`type`) | ARCHVE label |
|---|---|---|---|---|
| — | Newsletter strip (upper) | full-bleed | `newsletter` | — |
| 1 | Lead feature grid | 4-col; lead card spans 2×2 | `featured-grid` | Latest |
| 2 | Sponsored/brand spotlight | split image + list | `spotlight` | In Rotation |
| 3 | Magazine cover rail | horizontal scroll, 3:4 covers | `cover-carousel` | The Issues |
| 4 | Category grid | 3-col | `category-grid` | Music |
| 5 | Category grid | 3-col | `category-grid` | Art |
| 6 | Category grid | 3-col | `category-grid` | Fashion |
| 7 | Category grid | 3-col | `category-grid` | Culture |
| 8 | Membership / club band | full-bleed color band | `cta-band` | The Collective |
| 9 | Category grid | 3-col | `category-grid` | Film |
| 10 | Category grid | 3-col | `category-grid` | Photography |
| 11 | Trending feature grid | 4-col; lead 2×2 | `featured-grid` | Trending |
| — | Newsletter strip (lower) | full-bleed | `newsletter` | — |
| — | Footer | multi-column | footer | — |

> The reference's green "Dazed Club" band is re-themed as **The Collective**, an
> open-submissions CTA — the same full-bleed banner shape, rendered in ARCHVE's
> monochrome palette (no green).

## 5. Card & image proportions

| Component | Ratio | Notes |
|---|---|---|
| Hero image | 16:9 | scrim overlay right |
| Featured lead card | 16:9 | spans 2 cols × 2 rows in the 4-col grid |
| Standard feature/category card | 4:3 | image over eyebrow → headline → (dek) |
| Magazine cover | 3:4 | portrait, horizontal rail |

All images use `object-fit: cover` with a per-image **focal point** →
`object-position`, so replacements never stretch a card.

## 6. Typography hierarchy (relative)

1. **Hero headline** — largest, Bold/Black, tight leading, mixed-case.
2. **Section headings** ("Latest", "Music") — medium display weight, generous space above.
3. **Card headlines** — Bold, ~1.1 leading, 2–3 line wraps.
4. **Eyebrows / metadata** — small, uppercase, wide letter-spacing (ARCHVE accession numbers live here).
5. **Deks / body** — Roman, comfortable leading, muted gray.

Supplied weights are mapped to real files only (no synthesised faux-bold/italic):
XXThin 100 · XThin 200 · Thin 250 · Light 300 · Roman 400 · Medium 500 · Bold 700 · Black 900, each with its italic.

## 7. Dividers & spacing

- Section separation is primarily **whitespace rhythm** plus occasional hairline rules.
- Rules are 1px translucent white in ARCHVE; used between the nav and content and to
  delineate some grids.
- Vertical spacing scales with viewport via `clamp()` tokens.

## 8. Footer

- Multi-column: brand + social row, then link columns, then a lower "network"/legal row.
- **ARCHVE mapping:** socials = Instagram, TikTok, X, YouTube, Spotify; link columns
  from `site.json`; lower network row preserved.

## 9. Likely responsive transformations (validated in build)

| Breakpoint | Transform |
|---|---|
| ≥1024px | full desktop composition per PDF |
| ≤1200px | wide bands relax to container width |
| ≤1023px | primary nav collapses to hamburger overlay |
| ≤900px | 4-col feature grid → 2-col; lead card stops spanning |
| ≤760px | 3-col category grids → 2-col |
| ≤600px | grids → 1-col; hero stacks image over text |
| ≤480px | tightened gutters, single-column everything, larger touch targets |

Cover rail remains a horizontal scroll at all sizes (touch-friendly, arrow controls
on pointer devices).

## 10. Category & list page templates

The additional DAZED reference PDFs (Latest, Fashion, Beauty, Art & Photography,
Film & TV, Music, Life & Culture) resolve into **two** reusable page templates.

### 10a. Category page (Fashion / Beauty / Art & Photography / Film & TV / Music / Life & Culture)

All six are the same template with different content. Top-to-bottom:

| Band | Structure | Columns | ARCHVE mapping |
|---|---|---|---|
| Page title | Large left-aligned category name | — | `.page-title` |
| **Hero mosaic** | One tall feature (headline + dek on scrim) at left; a grid of cards at right (2 cols), each image + category label + headline; two image-only "peek" tiles cropped at the bottom edge | feature + 2-col grid | `.hero-mosaic` (feature + `.mosaic-grid` + `.mosaic-tile`) |
| **Editor's Pick** | Full-bleed **black** band, heading + 3 cards (image + headline) | 3 | `.band--dark` + `.band-3` |
| **Latest** | Grid of cards (image + headline) | 3 × 4 = 12 | `.cat-grid` |
| Newsletter | "Escape the algorithm" repeated | full-bleed | global `newsletter` |
| **Trending** | 3 cards (often repeating strong stories) | 3 | `.band-3` |
| **Club band** | Full-bleed membership band (green in DAZED) with logo + copy + app badges | 2-col | `.club-band` — re-themed as **The Collective**, monochrome per ARCHVE identity |
| Footer | — | — | global footer |

The mosaic's fixed height crops the bottom tiles in the reference, giving the
signature "peek". ARCHVE reproduces this on desktop and stacks the mosaic cleanly on
narrow viewports.

### 10b. Story-list page (Latest → ARCHVE Latest & The Index)

| Band | Structure | ARCHVE mapping |
|---|---|---|
| Page title | "Latest" | `.page-title` |
| **Story list** | Vertical rows: landscape thumb (≈4:3) at left; category label, headline, dek, and `date · author` metadata at right; hairline rule between rows | `.story-list` / `.story-row` |
| **Show More** | Centered black pill that loads more rows | `.show-more` (progressive reveal) |
| Newsletter | repeated | global |
| **Category mosaic** | 4 × 2 grid of eight square portal tiles with centered uppercase labels (NEWS, FASHION, MUSIC, …), each linking to a section | `.portal-grid` / `.portal` |
| Footer | — | global |

ARCHVE maps the eight portals to Music, Fashion, Art, Film, Photography, Culture,
The Collective and The Index. **The Index** reuses this list template as an
accession-numbered ledger of the whole archive.

### 10c. Responsive transforms (category/list)

Hero mosaic → single column ≤900px (feature on top, then the card grid); dark-band
and trending 3-up → 2-up ≤900px → 1-up ≤600px; story rows stack image-over-text
≤600px; portal grid 4→2→1. The smart sticky header applies on every page.

---

*Prepared as the implementation blueprint. Layout/structure derived from the
reference; all ARCHVE copy and imagery are original placeholders, fully editable via
the ARCHVE Site Manager (homepage) or `content/pages.json` (category/list pages).*
