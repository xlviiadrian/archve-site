# ARCHVE Editable Site Folder

## Latest update

- Restored the site to an all-caps editorial type treatment.
- Connected the shop and **Support ARCHVE** buttons/amount selector to this live Stripe Payment Link:
  `https://buy.stripe.com/28E4gz7EQ5BBceV6F4fjG00`


This folder is set up so you can upload/replace assets without digging through one giant HTML file.

## What to open
Open `index.html` in your browser.

## Main folders
- `assets/images/editorial/` — hero cover, feature cards, and article preview images
- `assets/images/products/` — shop/product images
- `assets/images/logos/` — optional logo exports you want to keep with the project
- `assets/css/styles.css` — all styling
- `assets/js/site.js` — page content, image paths, Stripe links, and Tally popup settings

## How to replace images
Keep the same filename and overwrite the image.

Example:
- Replace `assets/images/editorial/hero-cover.png` to change the main hero image.
- Replace `assets/images/products/sticker-dropi.png` to change that product image.

Use PNG or JPG exports. If you change the file extension or filename, update the matching `img:` path inside `assets/js/site.js`.

## Where to edit content
Open `assets/js/site.js` and look for:
- `const features = [...]`
- `const rows = {...}`
- `const products = [...]`

Each item has an `img:` field that points to the asset file.

## Stripe + Tally setup
At the top of `assets/js/site.js`, replace:
- The shop/support checkout links are set to `https://buy.stripe.com/28E4gz7EQ5BBceV6F4fjG00`

The site now uses two Tally popups:

### Submit / Pitch form
Form ID: `eqoRyO`

Buttons/links that say Submit, Submit a Pitch, or Submit Your Work open this popup.

Attributes used:

`data-tally-open="eqoRyO" data-tally-align-left="1" data-tally-overlay="1" data-tally-emoji-animation="none" data-tally-auto-close="0"`

### Get on the List / Newsletter form
Form ID: `kdrEPd`

Buttons/links that say Newsletter, Subscribe, Join the Waitlist, Get on the List, or Notify Me open this popup.

Attributes used:

`data-tally-open="kdrEPd" data-tally-layout="modal" data-tally-overlay="1" data-tally-auto-close="0"`

The Tally script is loaded once in the `<head>` of `index.html`:

`<script async src="https://tally.so/widgets/embed.js"></script>`

To swap to different Tally forms later, update the IDs in `index.html` and the `TALLY_PITCH_ID` / `TALLY_LIST_ID` values inside `assets/js/site.js`.

## Font note
The original single HTML had embedded font data. I removed embedded font files from this editable folder and left clean CSS fallbacks plus the existing Google Anton import.


## VICE-inspired restyle notes

This version was restyled toward a stark editorial homepage: black masthead, compact category nav, large image-led story cards, a "The Latest" rail, thick black dividers, and heavier headline typography.

### Logo

Your uploaded logo is now stored here:

`assets/images/logos/ARCHVELOGO.svg`

The header and footer both use this file. Replace that SVG with a new export using the same filename if you update the mark.

### Fonts

The site now loads free Google Font approximations:

- `Archivo Black` for big editorial headlines
- `Archivo` for body, navigation, metadata, buttons, and forms

I did not include any proprietary VICE font files. To change fonts, edit the `--display`, `--body`, and `--mono` variables near the bottom of `assets/css/styles.css` in the `VICE-INSPIRED EDITORIAL SKIN` section.

## Black homepage / white right rail update

This version uses a black editorial homepage background and a white rectangle right column for the "The Latest" rail, similar to the reference screenshot. The update lives at the bottom of `assets/css/styles.css` under:

`BLACK HOMEPAGE + WHITE RIGHT RAIL UPDATE`

To tweak the white column width, edit the `.hero-grid` rule in that section.


## Tally popups

The old custom submission modal and old newsletter endpoint form have been removed. The site now opens your Tally popups directly.

- Submit / Pitch form: `eqoRyO`
- Get on the List / Newsletter form: `kdrEPd`

Large files and video links should be handled inside the Submit / Pitch Tally form instructions.


## Mixed-case typography

This version removes the forced all-caps treatment from the main CSS. To bring all-caps back for a specific element, add `text-transform: uppercase;` only to that element in `assets/css/styles.css`.

## Franklin Gothic Regular headline update

All main headline/title styles now use the `--display` font variable set to Franklin Gothic Regular. The stylesheet includes a local/browser reference for Franklin Gothic and points to `assets/fonts/Franklin Gothic Regular.ttf` if you choose to add the font file to that folder before publishing.
