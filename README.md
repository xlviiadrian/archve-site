> ## 2026 publication/CMS foundation update
> This project now includes a centralized article catalog, local ARCHVE CMS, permanent static article generation, sitemap/search generation, and validation tooling. Start with **`ARCHVE-CMS-GUIDE.md`** and **`ARCHVE-CLAUDE-HANDOFF.md`**. The older architectural notes below describe the visual site's original data model and are retained for reference; where they conflict with the new guides, the new guides are authoritative.

# ARCHVE — Editorial Website + Site Manager

A fully static, data-driven editorial website for **ARCHVE**, recreating the DAZED
homepage layout (see `REFERENCE_AUDIT.md`) and re-skinning it in ARCHVE's monochrome
identity — pure-black background, cool-gray type, translucent-white rules. Ships with
a companion **ARCHVE Site Manager** for editing content without touching code.

No build step. No backend. No database. Just HTML, CSS, vanilla JS and JSON —
deployable directly to GitHub Pages.

```
archve-project/
├── website/                     ← the public site
│   ├── index.html               ← homepage shell; everything renders from JSON
│   ├── latest.html              ← Latest      (story-list template)
│   ├── the-index.html           ← The Index   (story-list template)
│   ├── music.html               ← Music       (category template)
│   ├── art.html                 ← Art         (category template)
│   ├── fashion.html             ← Fashion     (category template)
│   ├── film.html                ← Film        (category template)
│   ├── photography.html         ← Photography (category template)
│   ├── culture.html             ← Culture     (category template)
│   ├── assets/
│   │   ├── css/styles.css        ← full design system (tokens, components, responsive)
│   │   ├── js/main.js            ← vanilla render engine + interactions (all pages)
│   │   ├── fonts/                ← Neue Haas Grotesk Display (woff2, local)
│   │   ├── images/               ← monochrome SVG placeholders (replace via Manager)
│   │   └── logos/                ← ARCHVE wordmark + favicon
│   ├── content/
│   │   ├── site.json             ← brand, nav, newsletter copy, footer (all pages)
│   │   ├── home.json             ← hero + ordered homepage sections
│   │   └── pages.json            ← the 8 category/list pages (Latest, Music, …, The Index)
│   └── archve-project.json       ← combined package (import/export unit for Manager)
├── site-manager/                ← the editor (see its own README)
│   ├── index.html
│   ├── assets/{css,js,vendor}/   ← vendor/ holds JSZip locally (no CDN)
│   └── README.md
├── REFERENCE_AUDIT.md           ← DAZED layout blueprint
├── QA_REPORT.md                 ← what was tested and how
└── README.md                    ← this file
```

## How the site works

`index.html` is a thin semantic shell with mount points (`#site-header`,
`#hero-mount`, `#sections-mount`, `#site-footer`). On load, `main.js`:

1. reads `content/site.json` + `content/home.json` (or the Manager's live preview
   payload from `localStorage` when opened with `?preview=1`),
2. renders the header, hero, every section, and footer from that data using one
   component per section `type`, and
3. wires interactions: mobile overlay menu (focus-trapped, ESC-closable), search
   panel, carousel arrows, lazy-loading images with graceful fallbacks, scroll
   reveals (disabled under `prefers-reduced-motion`), and the newsletter form.

Because content is **data, not markup**, you edit JSON (by hand or via the Manager) —
never the HTML.

### Section types (homepage)

`newsletter`, `featured-grid`, `spotlight`, `cover-carousel`, `category-grid`,
`cta-band`. Each maps to a protected template in the Manager so new sections always
inherit the grid rules. Schemas are documented in `site-manager/README.md`.

## Category & list pages

Every primary nav item opens a dedicated page, built to match the supplied DAZED
category-page references (see `REFERENCE_AUDIT.md`) and rendered by the same
`main.js` engine from `content/pages.json`. Two templates cover them all:

- **Category template** — Music, Art, Fashion, Film, Photography, Culture. Order:
  page title → hero **mosaic** (one large feature + a 2×2 card grid + two peek
  tiles) → **Editor's Pick** dark band (3) → **Latest** grid (12) → newsletter →
  **Trending** (3) → **The Collective** band → footer.
- **Story-list template** — Latest and The Index. Order: page title → vertical
  **story list** with category / headline / dek / date · author, a working **Show
  More** that reveals more rows → newsletter → an 8-tile **category mosaic** that
  links back out to the sections → footer.

Each page is a thin shell (e.g. `music.html`) carrying `data-page` and `data-slug`
on `<body>`; `main.js` reads those, fetches the matching entry in `pages.json`, sets
the active nav state, and renders. Deep links and the browser back/forward button
work normally because these are real, separate URLs.

### DAZED-style scroll behaviour

`main.js` reproduces the reference site's interaction feel: a **smart sticky
header** that slides away as you scroll down and returns the instant you scroll up
(and gains a subtle divider once you leave the top), **smooth in-page anchor
scrolling** with header-aware offset, lazy image fade-in, scroll-reveal of sections,
hover zoom on cards / mosaic tiles / portals, and the **Show More** progressive
reveal on the list pages. All motion respects `prefers-reduced-motion`.

> **Editing the category/list pages:** the Site Manager currently edits the
> homepage (`home.json`). The category and list pages are data-driven too — edit
> `content/pages.json` directly (same card schema). Extending the Manager UI to
> these pages is a natural next step; the data contract is already in place.

## Article pages (every module is clickable)

Every story card, feature, and cover across the site links to a working article page.
Rather than one HTML file per story, there is a **single `article.html` template**:
each module's `href` is `article.html?id=<slug>`, and `main.js` looks that id up
across `home.json` + `pages.json`, then renders the reading view in the DAZED
single-article layout:

- a slim top promo strip,
- a **centered** header — category / format / accession breadcrumb, headline, and
  standfirst,
- a full-width **hero image with a caption** (date · "Text [author]"),
- a **narrow centred body column** with a drop-cap and support for **inline images
  with captions**,
- a **"More on these topics"** tag row,
- the newsletter block, the Collective band, and a **Trending** featured-grid
  (one large feature + a grid, mixed across the archive) — then the footer.

Details:

- Every module carries a stable `id` (a slug of its headline). Cards that share a
  headline (e.g. a Trending card repeating a feature) share an id and open the
  **same** article.
- **Body copy:** if a story has a `body` array it's used (each entry is either a
  paragraph string or an inline `{ "image": {…}, "caption": "…" }`); otherwise a
  placeholder body — including one inline image — is generated so the page is never
  empty. The Film feature (`film` page) is filled in as a **worked example** with a
  real multi-paragraph body, a `format` of "Q+A", a byline, and topics.
- Optional per-story fields the article page understands: `format` (e.g. "Q+A",
  "Interview"), `date`, `author`, `topics` (array). Missing `date`/`author` fall back
  to a stable default so the byline line always appears.
- Unknown or removed ids show a tidy "Story not found" page rather than erroring.

To add a new clickable story: add a card to the relevant section in `home.json` or
`pages.json` with a `title`, `image`, an `eyebrow`, `"id": "your-slug"`, and
`"href": "article.html?id=your-slug"` (the `id` and the href slug must match). Add a
`body`, `format`, `date`, `author`, and `topics` to give it the full treatment.

## Footer

The global footer follows the Dazed Club reference rhythm: the final newsletter
becomes a compact white-field signup, followed by a full-width repeating ARCHVE
wordmark ticker, centered social icons, legal links, network links, and fine print.
The ticker pauses on hover and stops automatically for reduced-motion visitors.
Footer links, social profiles, ticker destination, and fine print remain editable in
the Site Manager or `content/site.json`.

The Collective submission banner carries the same saturated-to-black gradient
language as the Dazed Club hero, translated into ARCHVE purple (`#9c2f8b`) with a
responsive glow and high-contrast button treatment. The glow slowly drifts, expands,
and contracts to create continuous atmospheric movement; reduced-motion visitors
receive the same composition as a still gradient.

Desktop header categories use the Dazed-style rectangular tab interaction: a white
panel drops in from the top on hover or keyboard focus, the label flips to black, and
the current category remains highlighted. The active press state compresses subtly
without shifting the surrounding navigation.

## Running locally

Because the site fetches JSON, browsers block `file://` fetches. Use any static
server from inside `website/`:

```bash
cd website
python3 -m http.server 8000      # then open http://localhost:8000
# or:  npx serve .
```

Opening `index.html` directly via `file://` will show a friendly error explaining
this — it is expected, not a bug.

## Deploying to GitHub Pages

All asset paths are **relative**, so the site works whether it's served from a
domain root or a repo subdirectory (`https://user.github.io/repo/`).

**Option A — project site (recommended):**

1. Create a repo and push this folder.
2. Repo → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `/root`.
3. Your site: `https://<user>.github.io/<repo>/website/`.
   (To serve the site at the repo root instead, move the contents of `website/` up
   one level, or set Pages to a `/docs` folder containing them.)

**Option B — quick preview:** commit and use Pages as above; the Manager is served
at `https://<user>.github.io/<repo>/site-manager/`.

No secrets, tokens or Actions are required. Nothing runs server-side.

## Editing content

- **Small tweaks:** edit `content/site.json` / `content/home.json` directly.
- **Everything else:** use the **ARCHVE Site Manager** (`site-manager/`) — import →
  edit → preview → export → commit. Full instructions in
  [`site-manager/README.md`](site-manager/README.md).

## Fonts

Neue Haas Grotesk Display is loaded locally from `assets/fonts/*.woff2` (converted
from the supplied TTFs; ~464 KB total). Only weights that were actually supplied are
declared — no faux-bold or faux-italic synthesis. Fallback stack:
`"Neue Haas Grotesk Display", "Helvetica Neue", Helvetica, Arial, sans-serif`.

## Images

The included images are original monochrome SVG placeholders sized to the exact card
ratios (16:9, 4:3, 3:4). Replace them through the Manager, which preserves each card's
aspect ratio and lets you set alt text and a focal point (`object-position`) so
swaps never distort the layout.

## Accessibility & performance

Semantic landmarks and heading order, skip link, keyboard-operable nav and menu with
visible focus, `aria` state on the mobile overlay and search, descriptive alt text,
monochrome contrast that meets AA for body text, native lazy-loading below the fold,
reduced-motion support, and no external runtime dependencies.

See `QA_REPORT.md` for exactly what was verified.

## G6 Agency section

A complete **G6 Agency** section is built into this same architecture — same header,
footer, nav behaviour, routing convention (`.html` files), design system and Site
Manager. All G6 content lives in one file, `website/content/g6.json`, so nothing is
hard-coded and everything is editable.

**Navigation.** The main-nav *Subscribe* item is now **G6 AGENCY** (same styling), and
the hamburger menu's *Series → G6 Agency* both open `g6.html`. The newsletter "+"
icon still handles subscriptions.

**Routes (GitHub-Pages-safe, relative paths):**

| Page | File |
| --- | --- |
| G6 homepage | `g6.html` |
| Services (parent) | `g6-services.html` |
| Styling | `g6-styling.html` |
| Model Casting | `g6-model-casting.html` |
| Creative Direction | `g6-creative-direction.html` |
| Personal Shopping | `g6-personal-shopping.html` |
| Music/Video Production | `g6-music-video-production.html` |
| Work (master grid + filters) | `g6-work.html` |
| Models roster | `g6-models.html` |
| Apply | `g6-apply.html` |
| Contact / inquiry | `g6-contact.html` |

Each shell carries `data-page="g6"` and `data-view="…"` (service pages also carry
`data-service="…"`); `main.js` renders the view into `#g6-mount` from `g6.json`. All
G6 styling is scoped under `.g6-page`, so ARCHVE pages are untouched. The Dazed Club
reference informed **only** the service-card proportions, glass finish and hover; the
rest is ARCHVE's black-and-white, image-led language.

**Replace the G6 logo:** swap `website/assets/logos/G6.svg` (keep the filename) or set
`meta.logo` in `g6.json` / Site Manager → *G6 → Logo*. Proportions are preserved via
`clamp()`; it is never stretched or recoloured.

**Replace the hero image/video:** Site Manager → *G6 → Hero* (or `hero.media` in
`g6.json`). Set *Media type* to `video`, point *source* at a file under `assets/`
(don't hotlink), and add a poster. Videos play `autoplay muted loop playsinline`, no
controls, `object-fit:cover`, with poster + fallback text.

**Add portfolio projects (photo or video):** Site Manager → *G6 → Work / portfolio*
(or the `projects` array). One shared list feeds Featured Work, the Work page and every
service grid. Set `service`, `type` (`photo`/`video`), `ratio`, media, and optionally
`client`/`role`/`year` (left blank → no credits shown, never fabricated). Video items
render a poster + play indicator and lazy-load — full videos never autoplay in grids.

**Add models:** Site Manager → *G6 → G6 Models* (or `models.roster`). Empty by default,
which shows a documented placeholder — **no fake models are ever generated**. Add real,
consented profiles to populate the roster page.

**Forms (Contact + Apply):** there is no server backend in this static project, so the
forms compose a `mailto:` to the address you set in *G6 → Contact* / *G6 → Apply*
(`contact.email` / `apply.email`). Until an address is set, the form shows a clear
notice and prints the entered details so **nothing is lost** — connect a real backend
(e.g. Formspree / Netlify Forms) or set the email to go live.

**Edit everything else** (intro, taglines, CTA labels/links, service names/overviews/
processes/deliverables, mood-board, reel URL, featured selection, clients &
testimonials, section visibility) in the Site Manager's **G6 Agency** group, or in
`g6.json`. The inline preview shows the G6 homepage while a G6 item is selected; other
G6 pages preview via `g6-*.html?preview=1`.
