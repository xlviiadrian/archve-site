# ARCHVE — Google Crawl / Indexability Audit

This build has been hardened so canonical public pages expose meaningful text and crawlable links in the **first HTML response**, rather than requiring JavaScript before a crawler can discover the page content.

## Automated verification

Final build result:

- 54 canonical public URLs in `sitemap.xml`
- 21 public homepage/category/G6 URLs
- 33 permanent article URLs
- 54/54 canonical URLs resolve to a deployable `index.html`
- 54/54 use `index,follow`
- 54/54 have self-referencing canonical URLs
- 54/54 have a title
- 54/54 have a meta description
- 54/54 contain a crawlable H1 in the initial HTML response
- 54/54 contain meaningful non-script text in the initial HTML response
- 0 legacy `.html` internal links on canonical sitemap pages
- 33/33 permanent article pages include Article/NewsArticle structured data
- 54/54 sitemap URLs returned HTTP 200 in a local production-output crawl test
- `robots.txt` allows public crawling and advertises `https://archvemag.com/sitemap.xml`

## First-response HTML hardening

Permanent article pages already contain their full article text directly in static HTML.

Category, homepage and G6 pages are normally enhanced/rendered by JavaScript. This build now also injects a semantic prerender snapshot into their normal page mount at build time. It includes the real page copy, section/service text, article headlines/decks, and crawlable article/service links. The normal JavaScript renderer replaces that snapshot for visitors, so the visual site remains unchanged while crawlers receive meaningful text before JavaScript execution.

## Regression protection

Run:

```bash
npm run seo:audit
```

The normal production command now automatically runs this audit:

```bash
npm run build
```

If a canonical sitemap page becomes `noindex`, loses its canonical, title, description, H1, first-response text, article structured data, or reintroduces `.html` internal links, the build exits with an error instead of silently deploying the SEO regression.

## Important limitation

Technical crawlability and indexability can be made very strong, but no website can force Google to index every URL, preserve every text fragment in its index, or rank the site for every possible phrase. Google ultimately decides crawling frequency, indexing, canonical selection and ranking.

After deployment, submit `https://archvemag.com/sitemap.xml` in Google Search Console and use URL Inspection / Request Indexing for the homepage and important new articles.
