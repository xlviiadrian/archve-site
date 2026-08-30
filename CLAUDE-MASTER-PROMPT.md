# CLAUDE CODE MASTER PROMPT — ARCHVE CMS (POST-FOUNDATION)

The ARCHVE MAGAZINE CMS/static publication architecture is already implemented and has passed its pre-deployment correction pass.

Before making future changes, read:

1. `ARCHVE-CLAUDE-HANDOFF.md`
2. `ARCHVE-CMS-GUIDE.md`
3. `QA_REPORT.md`

Do **not** broadly re-audit the repository, redesign ARCHVE, or rebuild the publishing architecture unless the requested change specifically requires it.

## Preserve these non-negotiables

- Public site remains static and GitHub Pages compatible.
- `website/content/articles.json` remains the central editorial source of truth.
- Internal ARCHVE homepage/category modules hydrate from central `articleId` references rather than duplicating article content.
- Complete published articles generate permanent `/articles/<slug>/` static HTML with full body copy, canonical/meta/OG/Twitter/Article JSON-LD, sitemap and search-index inclusion.
- Legacy `article.html?id=<id>` remains supported.
- Published slugs never change automatically when a headline changes.
- Homepage/Latest/category placement never deletes a permanent article page.
- Curated hero/feature positioning remains separate from automatic feeds.
- Do not introduce React, Next.js, WordPress, a database or a required public server runtime merely for convenience.
- CMS remains local-only; never place secrets in public frontend code.
- Preserve the existing ARCHVE visual system and module layouts.

## Current capabilities

The local CMS (`npm run cms`) already supports article creation/editing, draft/published/unpublished states, primary/cross-post categories, dates, tags, homepage/Latest placement, existing homepage section placement, thumbnail/hero/social images, SEO/OG fields, modular content blocks, inline image uploads, Media Library, duplicate, preview and static build controls.

The public build already includes permanent static articles, category/Latest/home feeds, static search (`search.html` + search index), RSS, sitemap, robots and article manifest.

## Editorial cleanup already applied

Do not reintroduce:

- accession-style UI numbers such as `NO. 031` in modules/article breadcrumbs;
- the Frank Ocean typo `drop agai`;
- `BOLD TITLE HEADER:` prefixes.

The Frank Ocean headline must remain:

`'He never needs to drop again': The legacy of Frank Ocean's Blonde`

Headings such as `MONTSERRAT, 28` must remain without the `BOLD TITLE HEADER:` prefix.

Legitimate editorial names/references such as photographer `No.223` are content and should not be removed.

## Commands

```bash
npm run cms
npm run publication:validate
npm run publication:build
npm run build
```

Before completing any future architecture/content-system change, run the relevant syntax checks plus `npm run publication:validate` and `npm run build`, and update the handoff/guide only when the documented behavior actually changed.
