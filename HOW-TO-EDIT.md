# ARCHVE — How to Edit (self-editing, no Site Manager)

The **Site Manager has been removed.** Every page now edits itself: each page's
content lives in a plain block right inside that page's `.html` file, so you can
swap a photo or change a headline by opening the page and editing it directly.

## The one rule to remember

Open a page's `.html` file and find this block near the bottom:

```html
<!-- ==================================================================
     EDIT THIS PAGE HERE  ·  MUSIC PAGE
     ...
==================================================================== -->
<script type="application/json" id="page-data">
{
  "title": "Music",
  "hero": { "image": { "src": "assets/images/music-hero.jpg", "alt": "..." } },
  ...
}
</script>
```

- **Swap an image** → change its `"src"`, e.g.
  `"src": "assets/images/my-new-photo.jpg"`. Drop the file into
  `website/assets/images/` and point `src` at it.
- **Change text** → edit `"title"`, `"dek"`, `"heading"`, etc.
- Save the file, reload the page. That's it.

There is no shared content file to hunt through and no manager app to run.

## Where each thing lives

| You want to edit…                     | Open this file                                  |
|---------------------------------------|-------------------------------------------------|
| Homepage (hero + all sections)        | `website/index.html`                            |
| A category page (Music, Fashion, …)   | `website/music.html`, `website/fashion.html`, … |
| Latest / The Index                    | `website/latest.html`, `website/the-index.html` |
| Any G6 Agency page                    | `website/g6.html`, `website/g6-*.html`          |
| **Site-wide header + footer + newsletter** | `website/content/site.json`               |

`content/site.json` is the **only** shared file — it holds the global nav,
footer and newsletter copy, because those are the same on every page. Editing it
once updates every page's header/footer.

## Articles

`article.html` shows the long-form view of any story via `article.html?id=…`.
It has no content of its own — on load it reads the `page-data` blocks from the
homepage and category pages and finds the matching story. So to edit an article's
headline or hero image, edit it on **its category page** (where its card lives);
the article view picks up the change automatically.

## G6 note (small trade-off)

Each G6 page carries the full G6 dataset inline, so every G6 page is
self-contained and editable on its own. The trade-off: a change to something
shared across all G6 views (e.g. the client list) means editing it on the G6
pages where it appears. If you'd rather keep G6 in a single shared file instead,
that's a one-line switch — just ask.

## Smooth scrolling / no pop-in

Images now load **eagerly** and are decoded ahead of time, and each media block
sits on its own compositor layer. Modules render fully before you reach them and
stay painted while you scroll — no blank-then-fade pop-in, no re-loading. Scroll
behavior is smooth site-wide (and respects "reduce motion" system settings).
