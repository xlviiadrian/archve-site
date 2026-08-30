# ARCHVE no-flash rendering

The publication build keeps crawlable SEO snapshots in the initial HTML for main/category/G6 pages, but normal visitors must never see those snapshots while JavaScript is booting.

`build.mjs` therefore:

- injects a tiny parser-blocking `data-no-flash-bootstrap` script at the start of `<head>`;
- switches `<html>` from `no-js` to `js` before first paint;
- hides only `.seo-prerender` when `html.js` is present;
- preserves the snapshot for crawlers and true no-JavaScript clients;
- forces the critical first-paint background to black;
- keeps old `.html` redirect shims black so they cannot flash a white page.

Do not delete the SEO snapshot merely to prevent flashing. The correct behavior is to keep it crawlable and hide it immediately only when JavaScript is available.

## Validation

Final build verification confirmed:

- `npm run build` passes.
- SEO crawl audit passes for all 54 canonical public URLs.
- 21 public pages containing `.seo-prerender` also contain the early no-flash bootstrap and the JS-only hide rule.
- 0 prerender pages are missing the protection.
- Legacy `.html` redirect shims use a black critical background before redirecting.
