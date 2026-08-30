# ARCHVE Google Indexing / SEO Notes

This build is configured so real public ARCHVE pages are crawlable and eligible for Google indexing.

## Included in the sitemap

`https://archvemag.com/sitemap.xml`

The generated sitemap includes:

- Homepage
- Latest, Fashion, Beauty, Art, Film, Music, Culture, Photography and The Index
- Public G6 pages (home, services, individual services, work, models, apply and contact)
- Every complete published article with a permanent `/articles/<slug>/` URL

## Indexing directives

Real public pages use:

`index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1`

Permanent article pages also contain canonical URLs, unique title/description metadata, Open Graph/Twitter metadata, and Article structured data.

Two utility/duplicate routes intentionally remain `noindex,follow`:

- `/search.html` — internal search-result page
- `/article.html?id=...` — legacy dynamic article route; permanent `/articles/<slug>/` pages are the canonical indexable versions

Keeping these two routes out of the index prevents duplicate/thin search pages from competing with the real article URLs.

## robots.txt

`https://archvemag.com/robots.txt` allows public crawling and advertises the XML sitemap.

## Recommended after deployment

In Google Search Console, verify `archvemag.com`, submit `https://archvemag.com/sitemap.xml`, and use URL Inspection / Request Indexing for the homepage and the most important new article URLs. Indexing and ranking are controlled by Google, so appearing for a headline can take time even when a page is technically indexable.
