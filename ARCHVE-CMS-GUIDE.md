# ARCHVE CMS Guide

ARCHVE now uses a local no-code editor plus a static publication build. The public site remains fully compatible with GitHub Pages: the CMS runs only on your computer, while published output is static HTML/CSS/JS.

## Start the CMS

From the project root:

```bash
npm run cms
```

Open:

`http://127.0.0.1:4173/admin/`

The editor is local-only and should not be deployed as a public admin backend.

## Central article source

All editorial article content lives in:

`website/content/articles.json`

Current catalog:

- 67 normalized article records.
- 29 contain genuine body copy and are eligible for permanent static publication.
- 38 migrated legacy cards still need genuine editorial copy and are intentionally excluded from permanent SEO publication.

The pre-normalization body source is retained at:

`website/content/articles.legacy.json`

## What the CMS supports

Article metadata:

- Headline and permanent slug.
- Draft / Published / Unpublished status.
- Primary category and additional cross-post categories.
- Author, publish date and updated date.
- Deck/description and tags.
- Show on Homepage / Show in Latest placement controls.
- Existing homepage placement choices: Latest, In Rotation, Music, Art & Photography, Fashion, Life & Culture, Film & TV, Photography and Trending.
- Thumbnail, hero and optional social/Open Graph image.
- SEO title, meta description, primary keyword, canonical URL, OG title and OG description.

Article builder blocks:

- Paragraph / lightweight rich text (bold, italic and links).
- Heading and subheading.
- Image and full-width image.
- Gallery.
- Quote.
- Video / embed.
- Spotify embed.
- SoundCloud embed.
- Related ARCHVE article.
- Divider and spacer.
- Link / CTA.
- Credit.

Editor utilities:

- Create, edit, duplicate, preview and delete articles.
- Save drafts and publish/unpublish.
- Reorder blocks.
- Inline image uploads for article media.
- Media Library browser for existing site images, with search, copy-path and assign-to-thumbnail/hero/social-image actions.
- Live SEO/readiness warnings.
- Published-slug change confirmation.
- Trigger the static publication build from the CMS.

## Images

New article uploads are stored under:

`website/assets/images/articles/<article-slug>/`

Do not store large Base64 images in article JSON. Keep alt text, captions and credits in article block data.

## Permanent article pages

Run:

```bash
npm run publication:build
```

Every complete published article generates:

`website/articles/<slug>/index.html`

Public URL:

`https://archvemag.com/articles/<slug>/`

The full body is present directly in the generated HTML, so search engines do not need client-side JavaScript to retrieve article copy.

Generated article pages include:

- Unique title and meta description.
- Canonical URL.
- Open Graph and Twitter/X metadata.
- Article JSON-LD.
- One H1 and semantic article body.
- Image alt text.
- Author/publish/update data when available.
- Category links and honest topic labels.
- Related-article blocks when configured.

A published slug is treated as permanent. Changing the headline does not automatically change the slug. The CMS warns before manually changing a published slug.

## Placement architecture

Homepage/category layouts remain curated, but article content is centralized.

Internal ARCHVE cards in editorial page `#page-data` now use lightweight references such as:

```json
{ "articleId": "article-id" }
```

The renderer hydrates those references from `website/content/articles.json`. This means a CMS edit to an article headline, thumbnail or deck updates all internal modules that reference that article without duplicating article content in page HTML.

Curated positioning remains separate from automatic feeds: publishing a new article will not unexpectedly replace a manually selected hero or feature.

Automatic behavior:

- Primary/additional categories control category feeds.
- `Show in Latest` controls Latest eligibility.
- `Show on Homepage` plus the selected existing homepage section controls homepage eligibility.
- Removing an article from Homepage or Latest never deletes its permanent article page.
- Unpublishing removes it from public feeds/static SEO output but preserves the source record.

## Legacy route

`website/article.html?id=<id>` remains supported for backward compatibility and CMS preview/fallback behavior.

New complete published cards prefer `/articles/<slug>/`.

## Search

The publication build generates:

`website/content/search-index.json`

The public search page is:

`website/search.html`

Header search forms route queries to `search.html?q=...`. Search covers headline, deck, categories, tags and article text using the static index. The search page is intentionally `noindex,follow` and is not included in the XML sitemap.

## RSS

The build generates:

`website/rss.xml`

Public pages include RSS discovery metadata in their `<head>`.

## Sitemap and SEO output

`npm run publication:build` generates/refreshes:

- `website/sitemap.xml`
- `website/robots.txt`
- `website/rss.xml`
- `website/content/search-index.json`
- `website/content/article-manifest.json`
- permanent article HTML
- `ARCHVE-PUBLICATION-REPORT.md`
- `ARCHVE-PUBLICATION-REPORT.json`

Only complete published articles enter permanent article SEO output. Placeholder cards are excluded until genuine copy exists.

## Validation

Run:

```bash
npm run publication:validate
```

Validation checks duplicate slugs, missing required publication data, missing assets and migrated legacy slug/title mismatches.

## Full GitHub Pages build

Run:

```bash
npm run build
```

This regenerates publication output and copies the deployable static site into:

`dist/`

Deploy the contents of `dist/` using your normal GitHub Pages workflow.

## Editorial cleanup applied before deployment

The current source also includes these cleanup fixes:

- Removed ARCHVE accession-style UI numbering such as `NO. 031` from modules/article breadcrumbs and structured page data.
- Preserved legitimate editorial names/references such as photographer `No.223` where they are actual content rather than UI numbering.
- Corrected the Frank Ocean headline to: `'He never needs to drop again': The legacy of Frank Ocean's Blonde`.
- Removed every `BOLD TITLE HEADER:` prefix while preserving the heading that follows it, including `MONTSERRAT, 28`.
- Corrected the initial migrated permanent slugs for all complete articles so their new static URLs correspond to their actual article titles before deployment.

## Recommended publishing workflow

1. Run `npm run cms`.
2. Create/edit the article and add genuine body copy.
3. Choose categories, placement and SEO fields.
4. Preview it.
5. Publish it.
6. Run/build the static site (CMS build control or `npm run build`).
7. Inspect `dist/` locally if desired.
8. Commit/push the finished static site/source through your normal GitHub workflow.
