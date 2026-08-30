# ARCHVE Pre-Deployment QA Report

This report covers the CMS/static-publication correction pass performed before deployment.

## Automated status

- `node --check website/assets/js/main.js` — PASS
- `node --check cms/public/admin.js` — PASS
- `node --check cms/server.mjs` — PASS
- `node --check scripts/publication/build-publication.mjs` — PASS
- `node --check scripts/publication/lib.mjs` — PASS
- `node --check scripts/publication/validate.mjs` — PASS
- `npm run publication:validate` — PASS: 67 articles, 0 errors, 0 warnings
- `npm run publication:build` — PASS: 29 static article pages, 29 search records
- `npm run build` — PASS

## Data/architecture verification

- 67 centralized article records.
- 29 genuine complete articles generate permanent static HTML.
- 38 legacy placeholder records remain excluded from permanent SEO publication.
- 72 internal page-data article references use the central catalog.
- 0 matching internal ARCHVE cards remain duplicated as literal article metadata where a central record exists.
- 0 unresolved `articleId` references.
- 0 complete migrated slug/title mismatches after correction.

## Editorial cleanup verification

- No remaining ARCHVE accession-style `NO. 0xx` indicators in generated module/article UI.
- Legitimate editorial references such as `No.223` were intentionally preserved.
- Frank Ocean title is corrected to `'He never needs to drop again': The legacy of Frank Ocean's Blonde`.
- No remaining `BOLD TITLE HEADER:` prefixes in source or generated publication output.
- Frank Ocean headings include `MONTSERRAT, 28`, `MANNAV, 23`, `AMARÍ, 24`, `ISABEL, 27` and `JACOB, 29` without the prefix.

## Functional local checks

A temporary complete published article was created through the CMS API, built, and deleted again. The test verified:

- Permanent static page creation.
- Full body copy in raw generated HTML.
- Sitemap inclusion while published.
- Search-index inclusion while published.
- New block rendering for subheading/divider/spacer/Spotify/related article.
- Honest non-link treatment of arbitrary topic labels.
- Homepage/category placement metadata compatibility.
- Removal of the temporary static page after deletion/rebuild.

The Media Library API was also tested and returned 352 image files. CMS admin, public search page and RSS feed returned HTTP 200 on the local server test.

## SEO/discovery checks

- Complete published articles get canonical/meta/OG/Twitter/Article JSON-LD.
- Sitemap contains complete published article URLs only plus appropriate public index/category pages.
- `search.html` is `noindex,follow` and intentionally excluded from the sitemap.
- RSS feed is generated at `rss.xml`.
- Search index is generated and connected to `search.html`.
- Arbitrary tags are not falsely linked to unrelated destinations.

## Remaining manual check recommended

The code/build pipeline passes, but a final real-browser visual spot-check is still recommended before pushing live. Specifically inspect homepage/category modules, one permanent article on desktop/mobile, the CMS editor, media library, search page, and a few images/embeds. Automated code checks cannot guarantee pixel-level browser rendering.
