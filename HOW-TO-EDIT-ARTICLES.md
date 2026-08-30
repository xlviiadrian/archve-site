# How to Edit ARCHVE Articles

The article system has been upgraded. The authoritative guide is now:

`ARCHVE-CMS-GUIDE.md`

## Recommended workflow

```bash
npm run cms
```

Then open:

`http://127.0.0.1:4173/admin/`

Article records are stored centrally in:

`website/content/articles.json`

Complete published articles generate permanent static pages with:

```bash
npm run publication:build
```

The original body-only JSON is preserved as `website/content/articles.legacy.json` for migration/reference. Do not manually restore the old split-content workflow unless you intentionally want to undo the CMS foundation.
