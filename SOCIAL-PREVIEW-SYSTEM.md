# ARCHVE Social Preview System

The site now uses dedicated Open Graph / Twitter sharing images:

- Homepage and main editorial/index pages: `assets/images/social/archve-preview-main-v2.jpg`
- Every G6 route: `assets/images/social/g6-preview-v2.jpg`
- Permanent article pages: the article hero image first, then article image/thumbnail, then the ARCHVE preview as fallback.
- Utility/legacy routes use the ARCHVE preview fallback.

Both supplied brand cards are 1200×630 JPEGs. The `v2` filenames are intentional so social apps that cached the former preview URL are prompted to fetch a fresh asset.

The build-time SEO audit also verifies every canonical public URL has an on-domain Open Graph image and matching Twitter image.
