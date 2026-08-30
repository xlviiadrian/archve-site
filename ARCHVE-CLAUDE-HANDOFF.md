# ARCHVE — Implementation Handoff

## Current status

The core CMS/static-publication work and the pre-deployment correction pass are complete. Do not re-architect the project unless a new requirement specifically calls for it.

## Architecture

Public site:

- Static HTML/CSS/vanilla JavaScript.
- GitHub Pages compatible.
- Shared renderer: `website/assets/js/main.js`.
- Shared chrome/data: `website/content/site.json`.

Central article source:

- `website/content/articles.json` (schema v2).
- 67 normalized records.
- 29 complete/genuine articles eligible for permanent publication.
- 38 legacy placeholder records intentionally excluded from static SEO pages until genuine body copy is supplied.
- Original body source retained at `website/content/articles.legacy.json`.

Static publication:

- Builder: `scripts/publication/build-publication.mjs`.
- Validator: `scripts/publication/validate.mjs`.
- Library/migration helpers: `scripts/publication/lib.mjs`.
- Permanent pages: `website/articles/<slug>/index.html`.
- Generated SEO/discovery output: sitemap, robots, RSS, search index and article manifest.

Local CMS:

- `cms/server.mjs`.
- `cms/public/index.html`.
- `cms/public/admin.js`.
- `cms/public/admin.css`.
- Start: `npm run cms`.
- Local-only: `127.0.0.1:4173`.

## Centralized placement is complete

Internal ARCHVE article modules on editorial pages now use central `articleId` references wherever a catalog record exists. Article content is hydrated from `website/content/articles.json`; page data retains layout/placement rather than duplicate headline/image/deck information.

Curated heroes/features stay curated. Automatic category/Latest/home feeds use publication/placement metadata and do not replace manually selected hero positions.

Expanded homepage feed placements use existing ARCHVE module designs only: Latest, In Rotation, Music, Art & Photography, Fashion, Life & Culture, Film & TV, Photography and Trending.

## Permanent URL correction completed

The original migrated complete records had unrelated placeholder-style slugs. Before deployment, all 29 complete article slugs were corrected to correspond to their real article headline/content while preserving immutable article IDs. Old migrated values are recorded under migration metadata.

Future published headline edits do not silently change slugs. Manual published-slug changes require confirmation.

## CMS capabilities now present

- Create/edit/duplicate/delete.
- Draft/published/unpublished states.
- Primary + cross-post categories.
- Author/publish/updated dates.
- Deck/tags.
- Homepage/Latest placement + existing homepage section selection.
- Thumbnail/hero/social image.
- SEO/OG metadata.
- Modular article builder with paragraph rich formatting, heading/subheading, image/full image, gallery, quote, video/embed, Spotify, SoundCloud, related article, divider, spacer, CTA and credit.
- Inline media uploads.
- Media Library API/browser.
- Preview/static build controls.
- SEO validation and published-slug safeguards.

## Public discovery now present

- `website/search.html` reads the generated static search index and receives header search queries.
- `website/rss.xml` is generated from complete published articles.
- RSS discovery metadata is included in public page heads.
- Arbitrary tags render as labels unless a real category destination exists; they are not falsely linked to Latest.

## Editorial cleanup completed

- ARCHVE UI accession numbering such as `NO. 031` removed from article/module presentation and structured page data.
- Legitimate content references such as `No.223` retained.
- Frank Ocean title corrected to `'He never needs to drop again': The legacy of Frank Ocean's Blonde`.
- `BOLD TITLE HEADER:` prefixes removed from all article copy while retaining the actual heading text (`MONTSERRAT, 28`, etc.).

## Useful commands

```bash
npm run cms
npm run publication:migrate
npm run publication:validate
npm run publication:build
npm run build
```

## Last automated verification

- Catalog: 67 records.
- Complete static articles: 29.
- Central article references in editorial page data: 72.
- Remaining matching internal literal cards that should have been central refs: 0.
- Unresolved central refs: 0.
- Complete slug/title migration mismatches: 0.
- `publication:validate`: 0 errors, 0 warnings.
- `publication:build`: pass.
- full `npm run build`: pass.
- CMS API create/publish/build/delete round-trip: pass in local test.
- Media Library API: pass (352 image files discovered in test).
- Search page and RSS endpoint: pass in local HTTP test.

## If further work is requested

Make focused changes only. Do not broadly re-audit or rebuild the architecture. Preserve GitHub Pages compatibility and the existing ARCHVE visual system.
