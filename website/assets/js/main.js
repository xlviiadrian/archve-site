/* =========================================================================
   ARCHVE — render engine + interactions

   CONTENT MODEL (self-editing, no Site Manager):
   • Each page carries its OWN content inline, in a
       <script type="application/json" id="page-data"> … </script>
     block near the bottom of that page's .html file. Edit that block to
     change the page — swap an image "src", edit a "title", etc. That is the
     only place a page's content lives.
   • The single shared file is content/site.json, which holds the GLOBAL
     header + footer + newsletter (the chrome that every page shares).
   • The article page (article.html?id=…) has no content of its own; it
     gathers every story from the other pages' inline data at load time.

   No build step, no framework, no external dependencies.
   ========================================================================= */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("js");

  /* ---------- inline per-page data ---------- */
  // Reads the JSON embedded in this page's #page-data block. Returns null if
  // the block is missing so callers can fall back gracefully.
  function readInline(id) {
    var el = document.getElementById(id || "page-data");
    if (!el) return null;
    try { return JSON.parse(el.textContent); } catch (e) {
      console.error("ARCHVE: could not parse inline page data:", e);
      return null;
    }
  }
  // Global chrome (header/footer/newsletter) — the one shared file.
  function loadSite() {
    return fetch("content/site.json").then(function (r) { return r.json(); });
  }
  function loadArticles() {
    return fetch("content/articles.json")
      .then(function (r) { return r.ok ? r.json() : { articles: {} }; })
      .catch(function () { return { articles: {} }; });
  }
  // Content pages that carry stories, used to build the article library.
  var CONTENT_PAGES = [
    "index.html", "latest.html", "music.html", "art.html", "fashion.html",
    "beauty.html", "film.html", "photography.html", "culture.html", "the-index.html"
  ];

  /* ---------- tiny helpers ---------- */
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var attr = esc; // attribute-safe = same escaping here
  var h = function (html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };
  var frag = function (html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content;
  };

  /* ---------- Tally newsletter + submissions ---------- */
  // These are the same forms and popup settings used by the original ARCHVE
  // site. Keeping the destinations here gives every page one shared source of
  // truth for newsletter and pitch buttons.
  var TALLY = {
    newsletter: {
      id: "kdrEPd",
      href: "#tally-open=kdrEPd&tally-layout=modal&tally-overlay=1&tally-auto-close=0",
      options: { layout: "modal", overlay: true, autoClose: 0 }
    },
    pitch: {
      id: "eqoRyO",
      href: "#tally-open=eqoRyO&tally-align-left=1&tally-overlay=1&tally-emoji-animation=none&tally-auto-close=0",
      options: { alignLeft: true, overlay: true, emojiAnimation: "none", autoClose: 0 }
    }
  };
  var tallyScriptPromise = null;

  function ensureTallyScript() {
    if (window.Tally && typeof window.Tally.openPopup === "function") return Promise.resolve(window.Tally);
    if (tallyScriptPromise) return tallyScriptPromise;
    tallyScriptPromise = new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="https://tally.so/widgets/embed.js"]');
      var script = existing || document.createElement("script");
      function ready() {
        if (window.Tally && typeof window.Tally.openPopup === "function") resolve(window.Tally);
        else reject(new Error("Tally popup API unavailable"));
      }
      script.addEventListener("load", ready, { once: true });
      script.addEventListener("error", reject, { once: true });
      if (!existing) {
        script.src = "https://tally.so/widgets/embed.js";
        script.async = true;
        document.head.appendChild(script);
      } else if (window.Tally) {
        ready();
      }
    });
    return tallyScriptPromise;
  }

  function tallyKindFromId(id) {
    if (id === TALLY.newsletter.id) return "newsletter";
    if (id === TALLY.pitch.id) return "pitch";
    return "";
  }

  function openTally(kind, hiddenFields) {
    var config = TALLY[kind];
    if (!config) return;
    var options = Object.assign({}, config.options);
    if (hiddenFields) options.hiddenFields = hiddenFields;
    ensureTallyScript().then(function (api) {
      api.openPopup(config.id, options);
    }).catch(function () {
      // A direct form page keeps the action usable if an extension or network
      // policy blocks the popup script.
      window.location.href = "https://tally.so/r/" + config.id;
    });
  }

  function wireTallyTriggers() {
    document.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-tally-open], a[href*='tally-open=']");
      if (!trigger) return;
      var id = trigger.getAttribute("data-tally-open") || "";
      if (!id) {
        var match = (trigger.getAttribute("href") || "").match(/tally-open=([^&]+)/);
        id = match ? match[1] : "";
      }
      var kind = tallyKindFromId(id);
      if (!kind) return;
      event.preventDefault();
      openTally(kind);
    });
  }

  /* ---------- inline icon set ---------- */
  var ICON = {
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>',
    left: '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 5 8 12 15 19"/></svg>',
    right: '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 5 16 12 9 19"/></svg>'
  };
  var SOCIAL = {
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c2.7 0 3 0 4.1.1 1.1 0 1.8.2 2.5.5.7.3 1.2.6 1.8 1.2.6.6.9 1.1 1.2 1.8.3.7.5 1.4.5 2.5.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c0 1.1-.2 1.8-.5 2.5-.3.7-.6 1.2-1.2 1.8-.6.6-1.1.9-1.8 1.2-.7.3-1.4.5-2.5.5-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-1.1 0-1.8-.2-2.5-.5-.7-.3-1.2-.6-1.8-1.2-.6-.6-.9-1.1-1.2-1.8-.3-.7-.5-1.4-.5-2.5C2 15 2 14.7 2 12s0-3 .1-4.1c0-1.1.2-1.8.5-2.5.3-.7.6-1.2 1.2-1.8.6-.6 1.1-.9 1.8-1.2.7-.3 1.4-.5 2.5-.5C9 2 9.3 2 12 2zm0 1.8c-2.7 0-3 0-4 .1-.9 0-1.4.2-1.7.3-.4.2-.7.4-1 .7-.3.3-.5.6-.7 1-.1.3-.3.8-.3 1.7-.1 1-.1 1.3-.1 4s0 3 .1 4c0 .9.2 1.4.3 1.7.2.4.4.7.7 1 .3.3.6.5 1 .7.3.1.8.3 1.7.3 1 .1 1.3.1 4 .1s3 0 4-.1c.9 0 1.4-.2 1.7-.3.4-.2.7-.4 1-.7.3-.3.5-.6.7-1 .1-.3.3-.8.3-1.7.1-1 .1-1.3.1-4s0-3-.1-4c0-.9-.2-1.4-.3-1.7-.2-.4-.4-.7-.7-1-.3-.3-.6-.5-1-.7-.3-.1-.8-.3-1.7-.3-1-.1-1.3-.1-4-.1zm0 3.1a5.1 5.1 0 1 1 0 10.2 5.1 5.1 0 0 1 0-10.2zm0 1.8a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6zm5.3-3.1a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5 3c.3 2 1.5 3.6 3.5 3.9v2.5c-1.3.1-2.5-.3-3.5-1v6.1a5.9 5.9 0 1 1-5.9-5.9c.3 0 .6 0 .9.1v2.6a3.3 3.3 0 1 0 2.3 3.1V3h2.7z"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.2 3H21l-6.4 7.3L22 21h-5.9l-4.6-6-5.3 6H3.5l6.9-7.9L2 3h6l4.2 5.5L18.2 3zm-2 16h1.6L7.9 4.7H6.2L16.2 19z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 12s0-3.2-.4-4.7c-.2-.8-.9-1.5-1.7-1.7C19.4 5.2 12 5.2 12 5.2s-7.4 0-8.9.4c-.8.2-1.5.9-1.7 1.7C1 8.8 1 12 1 12s0 3.2.4 4.7c.2.8.9 1.5 1.7 1.7 1.5.4 8.9.4 8.9.4s7.4 0 8.9-.4c.8-.2 1.5-.9 1.7-1.7.4-1.5.4-4.7.4-4.7zM9.8 15.2V8.8l5.5 3.2-5.5 3.2z"/></svg>',
    spotify: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 14.4c-.2.3-.5.4-.8.2-2.2-1.3-4.9-1.6-8.2-.9-.3.1-.6-.1-.7-.4-.1-.3.1-.6.4-.7 3.5-.8 6.6-.4 9 1 .3.2.4.5.3.8zm1.2-2.7c-.2.3-.6.5-.9.3-2.5-1.5-6.3-2-9.2-1.1-.4.1-.8-.1-.9-.5-.1-.4.1-.8.5-.9 3.4-1 7.5-.5 10.4 1.3.3.2.4.6.1 1zm.1-2.8C15 9.2 9.9 9 7 9.9c-.4.1-.9-.1-1-.6-.1-.5.1-.9.6-1C10 7.2 15.6 7.4 19 9.4c.4.2.6.8.3 1.2-.2.4-.7.6-1.3.3z"/></svg>'
  };

  var state = { site: null, home: null };

  /* ---------- data loading ---------- */
  // Homepage: content comes from this page's inline #page-data block; the
  // shared chrome comes from content/site.json. (If the inline block is
  // absent for any reason, fall back to the legacy content/home.json.)
  function loadData() {
    var inlineHome = readInline("page-data");
    return loadSite().then(function (site) {
      if (inlineHome) return { site: site, home: inlineHome };
      return fetch("content/home.json")
        .then(function (r) { return r.json(); })
        .then(function (home) { return { site: site, home: home }; });
    });
  }

  /* ---------- reusable fragments ---------- */
  // Category label only (accession / "No." removed site-wide). Returns nothing
  // when there's no category, so empty eyebrows never render.
  function eyebrowHTML(eb, forceLight) {
    if (!eb || !eb.category) return "";
    var cls = "eyebrow" + (forceLight ? " eyebrow--light" : "");
    return '<p class="' + cls + '"><span>' + esc(eb.category) + "</span></p>";
  }

  function mediaHTML(image, ratioClass, eager) {
    var im = image || {};
    var fitClass = im.fit === "contain" ? " media--fit-contain" : "";
    var naturalRatio = (im.fit === "contain" && im.w && im.h) ? "aspect-ratio:" + attr(im.w) + "/" + attr(im.h) + ";" : "";
    var focal = (im.focal ? "--focal:" + esc(im.focal) + ";" : "") + naturalRatio;
    var src = im.src || "";
    // Every image loads eagerly so all modules are fully painted and stay
    // painted — nothing defers or pops in on scroll. Above-the-fold media keeps
    // high fetch priority; everything else streams in right behind it.
    var loadingMode = "eager";
    var loading = 'loading="' + loadingMode + '"';
    var fetchp = eager ? 'fetchpriority="high"' : 'fetchpriority="low"';
    // Intrinsic dimensions (when known) let the browser reserve the correct
    // aspect box before load, so natural-ratio figures don't shift layout.
    var dims = (im.w && im.h) ? ' width="' + attr(im.w) + '" height="' + attr(im.h) + '"' : "";
    return (
      '<div class="media ' + ratioClass + fitClass + '" data-loaded="false" style="' + focal + '">' +
      (src
        ? '<img src="' + attr(src) + '"' + dims + ' alt="' + attr(im.alt || "") + '" ' + loading + ' decoding="async" ' + fetchp + ">"
        : "") +
      '<span class="media-fallback" aria-hidden="true">' + esc((im.alt || "ARCHVE").toUpperCase()) + "</span>" +
      "</div>"
    );
  }

  function cardHTML(c, opts) {
    opts = opts || {};
    var featured = opts.featured;
    var showEyebrow = !!opts.showEyebrow;   // category label only where explicitly allowed
    var cls = "card reveal" + (featured ? " card--featured" : "");
    var ratio = featured ? "media--wide" : "media--card";
    var dek = c.dek ? '<p class="dek">' + esc(c.dek) + "</p>" : "";
    var foot = (featured && showEyebrow)
      ? '<div class="card-foot">' + eyebrowHTML(c.eyebrow) + "</div>"
      : "";
    var topEyebrow = (!featured && showEyebrow) ? eyebrowHTML(c.eyebrow) : "";
    return (
      '<a class="' + cls + '" href="' + attr(c.href || "#") + '">' +
      mediaHTML(c.image, ratio, false) +
      '<div class="card-body">' +
      topEyebrow +
      "<h3>" + esc(c.title) + "</h3>" +
      dek +
      foot +
      "</div>" +
      "</a>"
    );
  }

  /* ---------- section renderers ---------- */
  var RENDER = {
    newsletter: function (sec) {
      // Category/list content paints before site.json finishes, so keep an
      // exact local fallback for this small shared block instead of delaying
      // the entire editorial page behind one network request.
      var n = (state.site && state.site.newsletter) || {
        heading: "Escape the algorithm! Get The Drop",
        placeholder: "Enter email address",
        button: "Sign up",
        sub: "Get must-see stories direct to your inbox every weekday.",
        privacyLabel: "Privacy policy",
        privacyHref: "#privacy"
      };
      var s = h(
        '<section class="section newsletter' + (sec && sec.id === "newsletter-bottom" ? " newsletter--footer" : "") + ' reveal"' +
        (sec && sec.id ? ' id="' + attr(sec.id) + '"' : "") + ' aria-labelledby="nl-' + Math.random().toString(36).slice(2) + '"></section>'
      );
      var id = "nl-h-" + Math.random().toString(36).slice(2);
      s.innerHTML =
        '<div class="container">' +
        '<h2 id="' + id + '">' + esc(n.heading || "") + "</h2>" +
        '<form novalidate>' +
        '<label class="visually-hidden" for="' + id + '-e">Email address</label>' +
        '<input id="' + id + '-e" type="email" required placeholder="' + attr(n.placeholder || "") + '">' +
        '<button class="btn btn--fill" type="submit">' + esc(n.button || "Sign up") + "</button>" +
        "</form>" +
        '<p class="sub">' + esc(n.sub || "") + "</p>" +
        '<p class="fineprint"><a href="' + attr(n.privacyHref || "#") + '">' + esc(n.privacyLabel || "Privacy policy") + "</a></p>" +
        "</div>";
      s.setAttribute("aria-labelledby", id);
      var form = s.querySelector("form");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = form.querySelector("input");
        if (!input.checkValidity()) { input.focus(); return; }
        openTally("newsletter", { email: input.value.trim() });
      });
      return s;
    },

    "featured-grid": function (sec) {
      var s = h('<section class="section" id="' + attr(sec.id) + '"></section>');
      // Category labels appear only in the home page "Latest" section.
      var showEb = sec.id === "latest";
      var cards = (sec.cards || []).map(function (c) { return cardHTML(c, { showEyebrow: showEb }); }).join("");
      s.innerHTML =
        '<div class="container">' +
        '<div class="section-head reveal"><h2>' + esc(sec.title) + "</h2>" +
        (sec.index ? '<span class="section-index">' + esc(sec.index) + "</span>" : "") +
        "</div>" +
        '<div class="feature-grid">' +
        (sec.featured ? cardHTML(sec.featured, { featured: true, showEyebrow: showEb }) : "") +
        cards +
        "</div>" +
        "</div>";
      return s;
    },

    "category-grid": function (sec) {
      var wrap = document.createDocumentFragment();
      if (sec.dividerBefore) {
        wrap.appendChild(h('<div class="container"><hr class="divider"></div>'));
      }
      var s = h('<section class="section" id="' + attr(sec.id) + '"></section>');
      var cards = (sec.cards || []).map(function (c) { return cardHTML(c); }).join("");
      s.innerHTML =
        '<div class="container">' +
        '<div class="section-head reveal"><h2>' + esc(sec.title) + "</h2>" +
        (sec.index ? '<span class="section-index">' + esc(sec.index) + "</span>" : "") +
        "</div>" +
        '<div class="cat-grid">' + cards + "</div>" +
        "</div>";
      wrap.appendChild(s);
      return wrap;
    },

    "cover-carousel": function (sec) {
      var s = h('<section class="section" id="' + attr(sec.id) + '"></section>');
      var covers = (sec.covers || []).map(function (c) {
        return (
          '<a class="cover reveal" href="' + attr(c.href || "#") + '">' +
          mediaHTML(c.image, "media--cover", false) +
          '<div class="card-body">' +
          "<h3>" + esc(c.title) + "</h3>" +
          "</div></a>"
        );
      }).join("");
      s.innerHTML =
        '<div class="container">' +
        '<div class="section-head reveal"><h2>' + esc(sec.title) + "</h2>" +
        (sec.index ? '<span class="section-index">' + esc(sec.index) + "</span>" : "") +
        "</div>" +
        '<div class="carousel">' +
        '<div class="carousel-track" tabindex="0" role="group" aria-label="' + attr(sec.title) + ' covers">' + covers + "</div>" +
        '<div class="carousel-nav">' +
        '<button class="carousel-arrow" data-dir="-1" aria-label="Previous">' + ICON.left + "</button>" +
        '<button class="carousel-arrow" data-dir="1" aria-label="Next">' + ICON.right + "</button>" +
        "</div></div>" +
        (sec.cta ? '<div class="section-cta"><a class="btn btn--pill" href="' + attr(sec.cta.href) + '">' + esc(sec.cta.label) + "</a></div>" : "") +
        "</div>";
      wireCarousel(s.querySelector(".carousel"));
      return s;
    },

    spotlight: function (sec) {
      var s = h('<section class="promo reveal" id="' + attr(sec.id) + '"></section>');
      var promoTitle = sec.id === "rotation"
        ? '<img class="promo-title-image" src="assets/logos/stripe.svg" alt="' + attr(sec.title || "In Rotation") + '">'
        : '<p class="promo-title">' + esc(sec.title) + "</p>";
      var items = (sec.items || []).map(function (c) {
        return (
          '<a class="spot" href="' + attr(c.href || "#") + '">' +
          mediaHTML(c.image, "media--card", false) +
          "<h3>" + esc(c.title) + "</h3></a>"
        );
      }).join("");
      s.innerHTML =
        '<div class="container container--wide">' +
        '<div class="promo-head"><div>' + promoTitle +
        (sec.sub ? '<p class="promo-sub">' + esc(sec.sub) + "</p>" : "") + "</div>" +
        '<div class="carousel-nav" style="position:static">' +
        '<button class="carousel-arrow" data-dir="-1" aria-label="Previous">' + ICON.left + "</button>" +
        '<button class="carousel-arrow" data-dir="1" aria-label="Next">' + ICON.right + "</button>" +
        "</div></div>" +
        '<div class="carousel">' +
        '<div class="carousel-track" tabindex="0" role="group" aria-label="' + attr(sec.title) + '">' + items + "</div>" +
        "</div>" +
        (sec.cta ? '<div class="section-cta"><a class="btn btn--pill" href="' + attr(sec.cta.href) + '">' + esc(sec.cta.label) + "</a></div>" : "") +
        "</div>";
      // wire the external arrows to this track
      var carousel = s.querySelector(".carousel");
      var track = carousel.querySelector(".carousel-track");
      s.querySelectorAll(".promo-head .carousel-arrow").forEach(function (b) {
        b.addEventListener("click", function () { scrollTrack(track, parseInt(b.dataset.dir, 10)); });
      });
      return s;
    },

    "cta-band": function (sec) {
      var s = h('<section class="section" id="' + attr(sec.id) + '"></section>');
      var actions = (sec.actions || []).map(function (a) {
        var cls = a.style === "fill" ? "btn btn--fill" : "btn btn--pill";
        return '<a class="' + cls + '" href="' + attr(a.href) + '">' + esc(a.label) + "</a>";
      }).join("");
      s.innerHTML =
        '<div class="container"><div class="cta-band reveal"><div class="cta-band-inner">' +
        '<div class="cta-copy">' +
        (sec.kicker ? '<p class="cta-kicker">' + esc(sec.kicker) + "</p>" : "") +
        "<h2>" + esc(sec.title) + "</h2>" +
        (sec.body ? "<p>" + esc(sec.body) + "</p>" : "") +
        "</div>" +
        '<div class="cta-actions">' + actions + "</div>" +
        "</div></div></div>";
      return s;
    }
  };

  /* ---------- header / nav / menu ---------- */
  function brandMarkup(site) {
    var b = site.brand || {};
    return (
      '<a class="brand" href="' + attr(b.homeHref || "index.html") + '" aria-label="' + attr(b.name || "ARCHVE") + ' home">' +
      '<img src="' + attr(b.logo) + '" alt="' + attr(b.name || "ARCHVE") + '" width="176" height="34">' +
      "</a>"
    );
  }

  function renderHeader() {
    var site = state.site;
    var header = document.getElementById("site-header");
    var navItems = (site.nav || []).map(function (n) {
      return '<li><a href="' + attr(n.href) + '">' + esc(n.label) + "</a></li>";
    }).join("");
    header.innerHTML =
      '<div class="header-top"><div class="container container--wide">' +
      '<div class="header-bar">' +
      brandMarkup(site) +
      '<div class="header-utility right header-icon-cluster">' +
      '<div class="hsearch"><label class="visually-hidden" for="hsearch-input">Search</label>' +
      '<input id="hsearch-input" type="search" placeholder="' + attr((site.search && site.search.placeholder) || "Search") + '"></div>' +
      '<button class="icon-btn" id="search-toggle" aria-label="Search" aria-expanded="false" aria-controls="search-panel">' + ICON.search + "</button>" +
      '<a class="icon-btn" href="' + attr(TALLY.newsletter.href) + '" data-tally-open="' + TALLY.newsletter.id + '" aria-label="Subscribe">' + ICON.plus + "</a>" +
      '<button class="icon-btn hamburger-btn" id="menu-open" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">' + ICON.menu + "</button>" +
      "</div></div></div></div>" +
      '<nav class="primary-nav" aria-label="Sections"><div class="container"><ul>' + navItems + "</ul></div></nav>" +
      '<div class="search-panel" id="search-panel"><div class="container"><form novalidate role="search">' +
      '<label class="visually-hidden" for="site-search">Search</label>' +
      '<input id="site-search" type="search" placeholder="' + attr((site.search && site.search.placeholder) || "Search") + '"></form></div></div>';

    // Editorial menu panel
    var menu = document.getElementById("mobile-menu");
    var socials = (site.footer && site.footer.socials || []).map(function (sc) {
      return '<a href="' + attr(sc.href) + '" aria-label="' + attr(sc.label) + '" target="_blank" rel="noopener noreferrer">' + (SOCIAL[sc.icon] || "") + "</a>";
    }).join("");
    var menuLinks = function (items) {
      return (items || []).map(function (item) {
        return '<a href="' + attr(item.href || "#") + '">' + esc(item.label || "") + "</a>";
      }).join("");
    };
    var explore = (site.nav || []).slice();   // mirrors the updated nav bar
    var series = [
      { label: "ARCHVE Magazine", href: "index.html" },
      { label: "G6 Agency", href: "g6.html" },
      { label: "World Mafia Media", href: "#" },
      { label: "XLVII47", href: "https://xlvii47.com" },
      { label: "Subscribe", href: TALLY.newsletter.href }
    ];
    var latestIssue = [
      { label: "Read The Latest Issue", href: "the-index.html" },
      { label: "Explore The Archive", href: "index.html#issues" },
      { label: "Get A Copy", href: "https://shop.archvemag.com" }
    ];
    menu.setAttribute("role", "navigation");
    menu.setAttribute("aria-label", "Expanded site menu");
    menu.removeAttribute("aria-modal");
    menu.innerHTML =
      '<div class="menu-shell"><div class="menu-grid">' +
      '<section class="menu-column" aria-labelledby="menu-explore"><h2 class="menu-title" id="menu-explore">Explore</h2><nav class="menu-links" aria-label="Explore">' + menuLinks(explore) + "</nav></section>" +
      '<section class="menu-column" aria-labelledby="menu-series"><h2 class="menu-title" id="menu-series">Series</h2><nav class="menu-links" aria-label="Series">' + menuLinks(series) + "</nav></section>" +
      '<div class="menu-stack">' +
      '<section aria-labelledby="menu-latest"><h2 class="menu-title" id="menu-latest">Latest Issue</h2><nav class="menu-links" aria-label="Latest issue">' + menuLinks(latestIssue) + "</nav></section>" +
      '<section aria-labelledby="menu-newsletter"><h2 class="menu-title" id="menu-newsletter">Newsletter</h2><nav class="menu-links" aria-label="Newsletter"><a href="' + attr(TALLY.newsletter.href) + '" data-tally-open="' + TALLY.newsletter.id + '">Subscribe To First Access</a></nav></section>' +
      "</div>" +
      '<a class="menu-feature" href="the-index.html" aria-label="Read the latest ARCHVE issue"><img src="assets/images/menu-feature.png" alt="ARCHVE latest issue cover" loading="eager" decoding="async"></a>' +
      '</div><div class="menu-socials" aria-label="ARCHVE social channels">' + socials + "</div></div>";

    markActiveNav(header);
    wireHeaderInteractions();
  }

  function markActiveNav(header) {
    var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (!here || here === "index.html") return; // home has no active section (as on DAZED)
    header.querySelectorAll(".primary-nav a").forEach(function (a) {
      var target = (a.getAttribute("href") || "").split("#")[0].toLowerCase();
      if (target === here) a.setAttribute("aria-current", "page");
    });
  }

  function renderFooter() {
    var f = state.site.footer || {};
    var footer = document.getElementById("site-footer");
    var ticker = f.ticker || {};
    var socials = (f.socials || []).map(function (s) {
      return '<a href="' + attr(s.href) + '" aria-label="' + attr(s.label) + '" target="_blank" rel="noopener noreferrer">' + (SOCIAL[s.icon] || "") + "</a>";
    }).join("");
    var links = (f.links || []).map(function (l) { return '<a href="' + attr(l.href) + '">' + esc(l.label) + "</a>"; }).join("");
    var net = (f.network && f.network.items || []).map(function (l) { return '<a href="' + attr(l.href) + '">' + esc(l.label) + "</a>"; }).join('<span class="sep">·</span>');
    var netLead = (f.network && f.network.lead) ? '<span class="lead">' + esc(f.network.lead) + '</span><span class="sep">|</span>' : "";
    footer.innerHTML =
      '<div class="container container--wide footer-core">' +
      '<a class="footer-brand" href="' + attr(ticker.href || "index.html") + '" aria-label="' + attr((ticker.label || "ARCHVE") + " home") + '">' +
      '<img src="assets/logos/FOOTER.svg" alt="' + attr(ticker.label || "ARCHVE Magazine") + '">' +
      "</a>" +
      '<div class="footer-socials">' + socials + "</div>" +
      '<nav class="footer-links" aria-label="Footer">' + links + "</nav>" +
      '<div class="footer-network">' + netLead + net + "</div>" +
      '<p class="footer-fine">' + esc(f.fine || "") + "</p>" +
      "</div>";
  }

  /* ---------- interactions ---------- */
  var lastFocus = null;
  function positionMenu() {
    var menu = document.getElementById("mobile-menu");
    var top = document.querySelector(".header-top");
    if (!menu || !top) return;
    menu.style.setProperty("--menu-top", Math.max(0, top.getBoundingClientRect().bottom) + "px");
  }
  function openMenu() {
    var menu = document.getElementById("mobile-menu");
    lastFocus = document.activeElement;
    document.getElementById("site-header").classList.remove("header--hidden");
    positionMenu();
    menu.classList.add("open");
    document.body.style.overflow = "hidden";
    var trigger = document.getElementById("menu-open");
    trigger.setAttribute("aria-expanded", "true");
    trigger.setAttribute("aria-label", "Close menu");
    trigger.innerHTML = ICON.close;
    document.addEventListener("keydown", onMenuKey);
    window.addEventListener("resize", positionMenu);
  }
  function closeMenu() {
    var menu = document.getElementById("mobile-menu");
    menu.classList.remove("open");
    document.body.style.overflow = "";
    var trigger = document.getElementById("menu-open");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", "Open menu");
    trigger.innerHTML = ICON.menu;
    document.removeEventListener("keydown", onMenuKey);
    window.removeEventListener("resize", positionMenu);
    if (lastFocus && lastFocus !== trigger) lastFocus.focus();
  }
  function onMenuKey(e) {
    if (e.key === "Escape") { closeMenu(); return; }
  }

  function wireHeaderInteractions() {
    var header = document.getElementById("site-header");
    var menu = document.getElementById("mobile-menu");
    document.getElementById("menu-open").addEventListener("click", function () {
      if (menu.classList.contains("open")) closeMenu();
      else openMenu();
    });
    menu.querySelectorAll("a[href]").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });

    /* Search: inline left-expanding input on desktop, panel under the header on
       mobile. A single .search-open class on the header drives both; CSS decides
       which surface shows at the current viewport. */
    var st = document.getElementById("search-toggle");
    var panel = document.getElementById("search-panel");
    var hInput = document.getElementById("hsearch-input");
    var isDesktop = function () { return matchMedia("(min-width:1024px)").matches; };
    function focusSearch() {
      var el = isDesktop() ? hInput : (panel && panel.querySelector("input"));
      if (el) { try { el.focus(); } catch (e) {} }
    }
    function onSearchKey(e) { if (e.key === "Escape") { closeSearch(); try { st.focus(); } catch (x) {} } }
    function onDocClick(e) {
      if (!header.classList.contains("search-open")) return;
      var t = e.target;
      if (t.closest(".hsearch") || t.closest("#search-panel") || t.closest("#search-toggle")) return;
      closeSearch();
    }
    function openSearch() {
      if (menu.classList.contains("open")) closeMenu();
      header.classList.remove("header--hidden");
      header.classList.add("search-open");
      st.setAttribute("aria-expanded", "true");
      setTimeout(focusSearch, 60);              // let the expand begin, then focus
      document.addEventListener("keydown", onSearchKey);
      document.addEventListener("click", onDocClick, true);
    }
    function closeSearch() {
      header.classList.remove("search-open");
      st.setAttribute("aria-expanded", "false");
      document.removeEventListener("keydown", onSearchKey);
      document.removeEventListener("click", onDocClick, true);
    }
    st.addEventListener("click", function () {
      if (header.classList.contains("search-open")) closeSearch();
      else openSearch();
    });
    function submitSearch(value) {
      var q = String(value || "").trim();
      if (!q) return;
      location.href = "search.html?q=" + encodeURIComponent(q);
    }
    if (panel) {
      var pf = panel.querySelector("form");
      var pInput = panel.querySelector("input");
      if (pf) pf.addEventListener("submit", function (e) { e.preventDefault(); submitSearch(pInput && pInput.value); });
    }
    if (hInput) hInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); submitSearch(hInput.value); }
    });
  }

  function scrollTrack(track, dir) {
    var card = track.querySelector(":scope > *");
    var step = card ? card.getBoundingClientRect().width + 20 : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * step * 1, behavior: "smooth" });
  }
  function wireCarousel(carousel) {
    var track = carousel.querySelector(".carousel-track");
    carousel.querySelectorAll(".carousel-arrow").forEach(function (b) {
      b.addEventListener("click", function () { scrollTrack(track, parseInt(b.dataset.dir, 10)); });
    });
    function update() {
      var arrows = carousel.querySelectorAll(".carousel-arrow");
      if (arrows.length < 2) return;
      var maxScroll = track.scrollWidth - track.clientWidth - 2;
      arrows.forEach(function (a) {
        var d = parseInt(a.dataset.dir, 10);
        if (d < 0) a.toggleAttribute("disabled", track.scrollLeft <= 2);
        else a.toggleAttribute("disabled", track.scrollLeft >= maxScroll);
      });
    }
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  function ensureGalleryLightbox(gallery) {
    var existingId = gallery && gallery.getAttribute("data-lightbox-id");
    var existing = existingId ? document.getElementById(existingId) : null;
    if (existing) return existing;
    var lb = document.createElement("div");
    var id = "gallery-lightbox-" + (document.querySelectorAll(".gallery-lightbox").length + 1);
    if (gallery) gallery.setAttribute("data-lightbox-id", id);
    lb.id = id;
    lb.className = "gallery-lightbox";
    lb.setAttribute("aria-hidden", "true");
    lb.innerHTML =
      '<div class="gallery-lightbox__backdrop" data-lightbox-close></div>' +
      '<div class="gallery-lightbox__dialog" role="dialog" aria-modal="true" aria-label="Image viewer">' +
      '<button class="gallery-lightbox__close" type="button" aria-label="Close image viewer" data-lightbox-close>&times;</button>' +
      '<button class="gallery-lightbox__nav gallery-lightbox__nav--prev" type="button" aria-label="Previous image" data-lightbox-prev>&lsaquo;</button>' +
      '<div class="gallery-lightbox__stage"><img class="gallery-lightbox__image" alt=""><div class="gallery-lightbox__count" aria-live="polite"></div></div>' +
      '<button class="gallery-lightbox__nav gallery-lightbox__nav--next" type="button" aria-label="Next image" data-lightbox-next>&rsaquo;</button>' +
      '</div>';
    document.body.appendChild(lb);
    return lb;
  }

  function wireGalleryLightboxes(root) {
    (root || document).querySelectorAll(".body-gallery").forEach(function (gallery) {
      if (gallery.getAttribute("data-lightbox-wired") === "true") return;
      var items = Array.prototype.slice.call(gallery.querySelectorAll(".body-gallery-media img"));
      if (items.length < 1) return;
      gallery.setAttribute("data-lightbox-wired", "true");
      var wrappingLink = gallery.closest("a.body-media-link");
      if (wrappingLink) {
        wrappingLink.setAttribute("tabindex", "-1");
        wrappingLink.addEventListener("click", function (e) { e.preventDefault(); });
      }
      var lb = ensureGalleryLightbox(gallery);
      var lbImg = lb.querySelector(".gallery-lightbox__image");
      var count = lb.querySelector(".gallery-lightbox__count");
      var prev = lb.querySelector("[data-lightbox-prev]");
      var next = lb.querySelector("[data-lightbox-next]");
      var closeButtons = lb.querySelectorAll("[data-lightbox-close]");
      var active = 0, lastFocus = null, touchX = null;

      function show(index) {
        active = (index + items.length) % items.length;
        var source = items[active];
        lbImg.src = source.currentSrc || source.src;
        lbImg.alt = source.alt || "Expanded gallery image";
        count.textContent = (active + 1) + " / " + items.length;
      }
      function open(index, trigger) {
        lastFocus = trigger || document.activeElement;
        show(index);
        lb.classList.add("is-open");
        lb.setAttribute("aria-hidden", "false");
        document.body.classList.add("lightbox-open");
        lb.querySelector(".gallery-lightbox__close").focus();
      }
      function close() {
        lb.classList.remove("is-open");
        lb.setAttribute("aria-hidden", "true");
        document.body.classList.remove("lightbox-open");
        lbImg.removeAttribute("src");
        if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
      }

      items.forEach(function (img, index) {
        var media = img.closest(".body-gallery-media");
        if (!media) return;
        media.setAttribute("role", "button");
        media.setAttribute("tabindex", "0");
        media.setAttribute("aria-label", "Open image " + (index + 1) + " of " + items.length);
        function activate(e) {
          if (e) { e.preventDefault(); e.stopPropagation(); }
          open(index, media);
        }
        media.addEventListener("click", activate);
        media.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") activate(e);
        });
      });

      prev.addEventListener("click", function () { if (lb.classList.contains("is-open")) show(active - 1); });
      next.addEventListener("click", function () { if (lb.classList.contains("is-open")) show(active + 1); });
      closeButtons.forEach(function (button) { button.addEventListener("click", close); });
      lb.querySelector(".gallery-lightbox__stage").addEventListener("touchstart", function (e) {
        touchX = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : null;
      }, { passive: true });
      lb.querySelector(".gallery-lightbox__stage").addEventListener("touchend", function (e) {
        if (touchX == null || !e.changedTouches || !e.changedTouches[0]) return;
        var dx = e.changedTouches[0].clientX - touchX;
        touchX = null;
        if (Math.abs(dx) > 45) show(active + (dx < 0 ? 1 : -1));
      }, { passive: true });
      document.addEventListener("keydown", function (e) {
        if (!lb.classList.contains("is-open")) return;
        if (e.key === "Escape") close();
        else if (e.key === "ArrowLeft") show(active - 1);
        else if (e.key === "ArrowRight") show(active + 1);
      });
    });
  }

  function wireImages(root) {
    (root || document).querySelectorAll(".media img").forEach(function (img) {
      var media = img.closest(".media");
      function done() { media.setAttribute("data-loaded", "true"); }
      if (img.complete && img.naturalWidth) done();
      else {
        img.addEventListener("load", done);
        img.addEventListener("error", function () { media.classList.add("media--error"); media.setAttribute("data-loaded", "true"); });
      }
    });
    wireGalleryLightboxes(root || document);
  }

  function wireReveal() {
    // Everything is shown immediately and stays shown. There is no observer,
    // render virtualization, decoding queue, fade, or scroll-triggered work.
    document.querySelectorAll(".reveal").forEach(function (e) { e.classList.add("in"); });
  }

  /* ---------- hero ---------- */
  function renderHero() {
    var hero = state.home.hero;
    var host = document.getElementById("hero-mount");
    if (!hero) { host.innerHTML = ""; return; }
    var heroImage = hero.image || {};
    var blurFocal = heroImage.focal ? ' style="--focal:' + attr(heroImage.focal) + ';"' : "";
    var blurImage = heroImage.src
      ? '<div class="hero-blur"' + blurFocal + ' aria-hidden="true"><img src="' + attr(heroImage.src) + '" alt="" loading="eager" decoding="async"></div>'
      : '<div class="hero-blur" aria-hidden="true"></div>';
    host.innerHTML =
      '<section class="hero" aria-label="Lead story"><div class="container container--wide"><a class="hero-inner" href="' + attr(hero.href || "#") + '">' +
      mediaHTML(hero.image, "media--hero", true) +
      blurImage +
      '<div class="hero-scrim"></div>' +
      '<div class="hero-content">' +
      eyebrowHTML(hero.eyebrow, true) +
      "<h1>" + esc(hero.title) + "</h1>" +
      (hero.dek ? '<p class="dek">' + esc(hero.dek) + "</p>" : "") +
      "</div></a></div></section>";
  }

  /* ---------- category + list pages ---------- */
  function mosaicHTML(hero, tileLinks) {
    var f = hero.feature || {};
    var feat =
      '<a class="mosaic-feature reveal" href="' + attr(f.href || "#") + '">' +
      mediaHTML(f.image, "", true) +
      '<div class="mosaic-scrim"></div>' +
      '<div class="mosaic-copy">' +
      "<h2>" + esc(f.title) + "</h2>" +
      (f.dek ? '<p class="dek">' + esc(f.dek) + "</p>" : "") +
      "</div></a>";
    var cards = (hero.cards || []).map(function (c) { return cardHTML(c); }).join("");
    tileLinks = tileLinks || [];
    var tiles = (hero.tiles || []).map(function (t, i) {
      var link = t.href && t.href !== "#" ? t.href : (tileLinks[i] || "#");
      return '<a class="mosaic-tile reveal" href="' + attr(link) + '" aria-label="More from ' + attr((hero.feature && hero.feature.eyebrow && hero.feature.eyebrow.category) || "ARCHVE") + '">' + mediaHTML(t.image, "", false) + "</a>";
    }).join("");
    return '<div class="hero-mosaic">' + feat + '<div class="mosaic-grid">' + cards + tiles + "</div></div>";
  }

  // The Collective / Open Submissions band. Identical design + copy to the home
  // page block, reused verbatim on category and article pages.
  var COLLECTIVE_SPEC = {
    type: "cta-band",
    id: "collective",
    title: "Submit something for a chance to be featured on ARCHVE",
    body: "Submit your work for a chance to be featured in ARCHVE Magazine and on our website.",
    actions: [{ label: "Submit / Pitch", href: TALLY.pitch.href, style: "fill" }]
  };
  function clubBandEl() { return RENDER["cta-band"](COLLECTIVE_SPEC); }

  function portalGridEl(mosaic) {
    var inner = (mosaic || []).map(function (m) {
      return '<a class="portal reveal" href="' + attr(m.href || "#") + '">' +
        mediaHTML(m.image, "", false) +
        '<span class="portal-label">' + esc(m.label) + "</span></a>";
    }).join("");
    return h('<section class="section"><div class="container"><div class="portal-grid">' + inner + "</div></div></section>");
  }

  function renderCategoryPage(pg) {
    var mount = document.getElementById("page-mount");
    mount.innerHTML =
      '<section class="section page-title"><div class="container"><h1>' + esc(pg.title) + "</h1></div></section>" +
      '<section class="section" aria-label="' + attr(pg.title) + ' highlights"><div class="container">' + mosaicHTML(pg.hero || {}, (pg.latest || []).slice(-2).map(function (c) { return c.href; })) + "</div></section>" +
      '<section class="band band--dark" aria-labelledby="ep-h"><div class="container">' +
      '<div class="section-head reveal"><h2 id="ep-h">Editor\u2019s Pick</h2></div>' +
      '<div class="band-3">' + (pg.editorsPick || []).map(function (c) { return cardHTML(c); }).join("") + "</div>" +
      "</div></section>" +
      '<section class="section" aria-labelledby="lt-h"><div class="container">' +
      '<div class="section-head reveal"><h2 id="lt-h">Latest</h2></div>' +
      '<div class="cat-grid">' + (pg.latest || []).map(function (c) { return cardHTML(c); }).join("") + "</div>" +
      "</div></section>";
    mount.appendChild(RENDER.newsletter());
    mount.appendChild(h(
      '<section class="section" aria-labelledby="tr-h"><div class="container">' +
      '<div class="section-head reveal"><h2 id="tr-h">Trending</h2></div>' +
      '<div class="band-3">' + (pg.trending || []).map(function (c) { return cardHTML(c); }).join("") + "</div>" +
      "</div></section>"
    ));
    mount.appendChild(clubBandEl());
  }

  function renderListPage(pg) {
    var mount = document.getElementById("page-mount");
    var SHOW = 6;
    var rows = (pg.stories || []).map(function (s, i) {
      var meta =
        '<div class="story-meta">' +
        (s.date ? "<span>" + esc(s.date) + "</span>" : "") +
        (s.author ? '<span class="sep">\u00b7</span><span>' + esc(s.author) + "</span>" : "") +
        "</div>";
      return (
        '<a class="story-row reveal" href="' + attr(s.href || "#") + '"' + (i >= SHOW ? " hidden" : "") + ">" +
        mediaHTML(s.image, "", i < 3) +
        '<div class="story-copy">' +
        "<h3>" + esc(s.title) + "</h3>" +
        (s.dek ? '<p class="dek">' + esc(s.dek) + "</p>" : "") +
        meta +
        "</div></a>"
      );
    }).join("");
    var hasMore = (pg.stories || []).length > SHOW;
    mount.innerHTML =
      '<section class="section page-title"><div class="container"><h1>' + esc(pg.title) + "</h1>" +
      (pg.sub ? '<p class="page-sub">' + esc(pg.sub) + "</p>" : "") + "</div></section>" +
      '<section class="section"><div class="container"><div class="story-list">' + rows + "</div>" +
      (hasMore ? '<div class="show-more-wrap"><button class="btn btn--pill show-more" type="button">Show More</button></div>' : "") +
      "</div></section>";
    mount.appendChild(RENDER.newsletter());
    if (pg.mosaic && pg.mosaic.length) mount.appendChild(portalGridEl(pg.mosaic));
    wireShowMore(mount, SHOW);
  }

  function wireShowMore(root, batch) {
    var btn = root.querySelector(".show-more");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var hidden = root.querySelectorAll(".story-row[hidden]");
      var n = 0;
      Array.prototype.forEach.call(hidden, function (r) {
        if (n < batch) { r.removeAttribute("hidden"); r.classList.add("in"); n++; }
      });
      wireImages(root);
      if (!root.querySelectorAll(".story-row[hidden]").length && btn.parentNode) {
        btn.parentNode.removeChild(btn);
      }
    });
  }

  /* ---------- article page (one template, story looked up by ?id=) ---------- */
  // Placeholder body: deterministic per title so each article reads differently
  // but stays stable across loads. Replace with real copy per story via a `body`
  // array in the JSON (strings = paragraphs; {image,caption} = inline figure).
  var BODY_POOL = [
    "The story starts, as these ones tend to, somewhere off the map \u2014 a room without a sign, a night that ran long, a group of people who never planned to be documented at all.",
    "What holds it together isn't polish. It's the opposite: the willingness to leave the rough edges in, to let the frame shake, to trust that the truest version of a thing is rarely the tidiest one.",
    "There is a scene here, though nobody involved would call it that. Scenes are named by outsiders. From the inside it just feels like the people you show up for, again and again, in the same handful of rooms.",
    "We spent enough time around it to stop being a novelty, which is when the good material tends to arrive \u2014 in the lulls, the in-between moments, the things said when the recorder was assumed to be off.",
    "None of it is built to last, and that's the point. It happens, it's witnessed, and then it's gone, folded back into the archive as a single entry and a handful of images.",
    "By the time you read this it may already have moved on, changed shape, or quietly dissolved. Consider these pages a rubbing taken off something in motion \u2014 proof it was here, nothing more.",
    "Ask anyone here how it began and you get six different answers, all of them true. That contradiction is the whole texture of the thing \u2014 a story told by everyone who lived it and owned by none of them.",
    "We keep coming back to the same question: what happens to a moment once it's been recorded? Some of the people in these pages would rather it hadn't been. We understand the impulse, and we photographed it anyway."
  ];

  function figureHTML(image, caption, href) {
    var media = mediaHTML(image, "media--wide", false);
    if (href) media = '<a class="body-media-link" href="' + attr(href) + '" target="_blank" rel="noopener noreferrer">' + media + "</a>";
    return '<figure class="body-figure">' + media +
      (caption ? '<figcaption>' + esc(caption) + "</figcaption>" : "") + "</figure>";
  }

  function galleryHTML(images, caption, columns, href) {
    var list = Array.isArray(images) ? images : [];
    var cols = Math.max(2, Math.min(3, Number(columns) || (list.length === 4 ? 2 : 3)));
    var grid = '<div class="body-gallery body-gallery--' + cols + '">' + list.map(function (image) {
      return mediaHTML(image, "body-gallery-media", false);
    }).join("") + "</div>";
    if (href) grid = '<a class="body-media-link" href="' + attr(href) + '" target="_blank" rel="noopener noreferrer">' + grid + "</a>";
    return '<figure class="body-gallery-wrap">' + grid +
      (caption ? '<figcaption>' + esc(caption) + "</figcaption>" : "") + "</figure>";
  }

  // Clickable YouTube block (same footprint as a body image). The video's
  // thumbnail is pulled in once a link is set; clicking opens the video.
  var YT_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  function youtubeId(url) {
    var m = String(url || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([A-Za-z0-9_-]{11})/);
    return m ? m[1] : "";
  }
  function youtubeHTML(url, caption) {
    var id = youtubeId(url);
    var thumb = id ? "https://img.youtube.com/vi/" + id + "/hqdefault.jpg" : "";
    var media =
      '<div class="media media--wide" data-loaded="false">' +
      (thumb ? '<img src="' + attr(thumb) + '" alt="' + attr(caption || "Watch on YouTube") + '" loading="eager" decoding="async">' : "") +
      '<span class="media-fallback" aria-hidden="true">WATCH</span>' +
      '<span class="yt-play">' + YT_PLAY + "</span>" +
      "</div>";
    return '<figure class="body-youtube"><a class="yt-embed" href="' + attr(url || "#") +
      '" target="_blank" rel="noopener" aria-label="' + attr(caption || "Watch on YouTube") + '">' +
      media + "</a>" +
      (caption ? '<figcaption>' + esc(caption) + "</figcaption>" : "") + "</figure>";
  }

  function videoEmbedHTML(video, caption) {
    var v = typeof video === "string" ? { url: video } : (video || {});
    var url = String(v.url || "");
    var provider = String(v.provider || "").toLowerCase();
    var src = "", ratio = "landscape", title = caption || "Embedded video";
    var id;
    if (provider === "file" || /\.(mp4|webm|ogg|mov)(?:[?#].*)?$/i.test(url)) {
      var poster = String(v.poster || "");
      return '<figure class="body-video body-video--file body-video--full">' +
        '<div class="body-video-file-frame"><video controls playsinline preload="metadata"' +
        (poster ? ' poster="' + attr(poster) + '"' : '') + '><source src="' + attr(url) + '"></video></div>' +
        (caption ? '<figcaption>' + esc(caption) + "</figcaption>" : "") + "</figure>";
    }
    if (provider === "youtube" || /youtu(?:\.be|be\.com)/i.test(url)) {
      id = youtubeId(url);
      if (id) src = "https://www.youtube-nocookie.com/embed/" + id + "?rel=0";
      provider = "youtube";
    } else if (provider === "tiktok" || /tiktok\.com/i.test(url)) {
      id = (url.match(/\/video\/(\d+)/) || [])[1];
      if (id) src = "https://www.tiktok.com/player/v1/" + id + "?autoplay=0&loop=0";
      provider = "tiktok"; ratio = "portrait";
    } else if (provider === "instagram" || /instagram\.com/i.test(url)) {
      var im = url.match(/instagram\.com\/(p|reels?)\/([A-Za-z0-9_-]+)/i);
      if (im) src = "https://www.instagram.com/" + (im[1].toLowerCase().indexOf("reel") === 0 ? "reel" : "p") + "/" + im[2] + "/embed/captioned/";
      provider = "instagram"; ratio = "portrait";
    } else if (provider === "vimeo" || /vimeo\.com\//i.test(url)) {
      id = (url.match(/vimeo\.com\/(?:video\/)?(\d+)/i) || [])[1];
      if (id) src = "https://player.vimeo.com/video/" + id;
      provider = "vimeo";
    } else if (provider === "spotify" || /open\.spotify\.com\//i.test(url)) {
      var sm = url.match(/open\.spotify\.com\/(track|album|playlist|episode|show)\/([A-Za-z0-9]+)/i);
      if (sm) src = "https://open.spotify.com/embed/" + sm[1] + "/" + sm[2];
      provider = "spotify"; ratio = "audio";
    } else if (provider === "soundcloud" || /soundcloud\.com\//i.test(url)) {
      if (url) src = "https://w.soundcloud.com/player/?url=" + encodeURIComponent(url) + "&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false";
      provider = "soundcloud"; ratio = "audio";
    } else if (provider === "archive" || /archive\.org\/details\//i.test(url)) {
      id = (url.match(/archive\.org\/details\/([A-Za-z0-9_.-]+)/i) || [])[1];
      if (id) src = "https://archive.org/embed/" + id;
      provider = "archive";
    }
    if (!src) {
      return '<p class="article-link"><a href="' + attr(url || "#") + '" target="_blank" rel="noopener noreferrer">Watch video</a></p>';
    }
    return '<figure class="body-video body-video--' + attr(provider || "embed") + ' body-video--' + ratio + '">' +
      '<div class="body-video-frame"><iframe src="' + attr(src) + '" title="' + attr(title) + '" loading="lazy" ' +
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>' +
      (caption ? '<figcaption>' + esc(caption) + "</figcaption>" : "") + "</figure>";
  }

  function bodyLinkHTML(link) {
    var l = typeof link === "string" ? { href: link, label: link } : (link || {});
    var label = String(l.label || l.href || "Read more");
    // Hide links whose visible text is just a bare URL (leftover media/video URLs
    // that were showing under embeds). Links with real anchor text still render.
    if (/^https?:\/\/\S+$/i.test(label.trim())) return "";
    return '<p class="article-link"><a href="' + attr(l.href || "#") + '" target="_blank" rel="noopener noreferrer">' +
      esc(label) + "</a></p>";
  }

  // Lightweight inline formatting for body paragraphs: **bold** and [text](url)
  // markdown links. Everything is escaped first, so no raw markup can slip through.
  function inlineFmt(s) {
    var out = esc(String(s == null ? "" : s));
    out = out.replace(/\[([^\]\u0000]+)\]\((https?:\/\/[^\s)\u0000]+)\)/g,
      function (m, txt, url) {
        return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + txt + "</a>";
      });
    out = out.replace(/\*\*([^*\u0000]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
    return out;
  }

  // Split a trailing attribution off a quote ("... quote" — Name) so the name can
  // sit smaller on its own line. Handles the dash inside or outside the closing
  // quote, em/en dashes, and leaves mid-sentence dashes untouched.
  function splitQuoteAttribution(raw) {
    var s = String(raw == null ? "" : raw).trim();
    var m = s.match(/^([\s\S]*\S)\s*(["\u201d\u2019']?)\s*[\u2014\u2013]\s*([A-Z\u201c"'\[][^\u2014\u2013?!\n]{1,46})(["\u201d']?)\s*$/);
    if (m) {
      var body = m[1];
      var name = m[3].trim();
      var tail = m[4] || "";
      // The name can greedily swallow the quote's own closing mark when the
      // attribution sits inside the quotation — move it back onto the body.
      var nm = name.match(/^([\s\S]*?)(["\u201d])\s*$/);
      if (nm) { name = nm[1].trim(); tail = nm[2] + tail; }
      if (tail) body += tail;        // closing quote belonged to the quotation, not the name
      else if (m[2]) body += m[2];   // closing quote sat before the dash (attribution was outside)
      if (/[A-Za-z]/.test(name)) return { quote: body.trim(), by: name };
    }
    return { quote: s, by: "" };
  }

  function quoteHTML(raw, explicitBy) {
    var q, by;
    if (explicitBy) { q = String(raw == null ? "" : raw).trim(); by = String(explicitBy).trim(); }
    else { var r = splitQuoteAttribution(raw); q = r.quote; by = r.by; }
    return '<figure class="body-quote">' +
      '<blockquote class="body-quote-text">' + esc(q) + "</blockquote>" +
      (by ? '<figcaption class="body-quote-by">' + esc(by) + "</figcaption>" : "") +
      "</figure>";
  }

  function articleBody(story) {
    var parts;
    if (story.body && story.body.length) {
      parts = story.body;
    } else {
      var seed = 0, t = story.title || "";
      for (var i = 0; i < t.length; i++) seed = (seed + t.charCodeAt(i)) % 997;
      var n = BODY_POOL.length, pick = function (k) { return BODY_POOL[(seed + k) % n]; };
      var inline = { image: { src: "assets/images/ph-" + (18 + (seed % 6)) + ".svg", alt: story.title, focal: "50% 45%" },
                     caption: (story.eyebrow && story.eyebrow.category ? story.eyebrow.category + " \u2014 " : "") + "from the ARCHVE files" };
      // Second image on the page is the hero (1) then this inline figure (2);
      // a YouTube block breaks the body right after it.
      var yt = { youtube: "https://youtu.be/BAuf-1F50PU?si=Zqsz4xF31t7GWcWX", caption: "Watch on YouTube" };
      parts = [pick(0), pick(2), inline, yt, pick(4), pick(6), pick(1)];
    }
    var firstCopy = true;
    return parts.map(function (p) {
      if (typeof p === "string") {
        // Media and link URLs belong in structured blocks, never visible article copy.
        if (/^https?:\/\/\S+$/i.test(p.trim())) return "";
        var cls = firstCopy ? ' class="article-copy article-lede"' : ' class="article-copy"';
        firstCopy = false;
        return "<p" + cls + ">" + inlineFmt(p) + "</p>";
      }
      if (p && p.youtube) return youtubeHTML(p.youtube, p.caption);
      if (p && p.video) return videoEmbedHTML(p.video, p.caption);
      if (p && p.gallery) return galleryHTML(p.gallery, p.caption, p.columns, p.href);
      if (p && p.fullImage) {
        var full = figureHTML(p.fullImage, p.caption, p.href);
        return full.replace('class="body-figure"', 'class="body-figure body-figure--full"');
      }
      if (p && p.image) return figureHTML(p.image, p.caption, p.href);
      if (p && p.heading) return '<h2 class="body-heading">' + esc(p.heading) + "</h2>";
      if (p && p.subheading) return '<h3 class="body-subheading">' + esc(p.subheading) + "</h3>";
      if (p && p.divider) return '<hr class="body-divider">';
      if (p && p.spacer) return '<div class="body-spacer body-spacer--' + attr(p.spacer === true ? "medium" : p.spacer) + '" aria-hidden="true"></div>';
      if (p && p.relatedArticle) {
        var rel = state.articles && catalogLookup(state.articles, p.relatedArticle);
        if (!rel) return "";
        return '<aside class="body-related"><span>Related</span><a href="' + attr(articleHref(rel)) + '">' + esc(rel.title) + '</a></aside>';
      }
      if (p && p.quote) return quoteHTML(p.quote, p.by || p.name || p.attribution || p.cite);
      if (p && p.credit) return '<p class="body-credit">' + esc(p.credit) + "</p>";
      if (p && p.link) return bodyLinkHTML(p.link);
      return "";
    }).join("");
  }

  function flattenStories(home, pages) {
    var map = {}, order = [];
    function visit(o) {
      if (o && typeof o === "object") {
        if (Array.isArray(o)) { o.forEach(visit); return; }
        if (o.id && o.title) {
          if (!map[o.id]) { map[o.id] = o; order.push(o.id); }
          // The same story can appear as a body-less card on several pages and
          // as the full, written version on its own page. Always keep the one
          // that actually has a body so article pages show real text, not filler.
          else if (!(map[o.id].body && map[o.id].body.length) && (o.body && o.body.length)) { map[o.id] = o; }
        }
        Object.keys(o).forEach(function (k) { visit(o[k]); });
      }
    }
    if (home) visit(home);
    if (pages && pages.pages) visit(pages.pages);
    return { map: map, order: order };
  }

  function catHref(cat) {
    var c = (cat || "").toLowerCase();
    var known = {
      latest: "latest.html", music: "music.html", fashion: "fashion.html", beauty: "beauty.html",
      art: "art.html", "art & photography": "art.html", photography: "photography.html",
      film: "film.html", "film & tv": "film.html", culture: "culture.html", "life & culture": "culture.html"
    };
    return known[c] || "latest.html";
  }

  function categoryTopicHref(topic) {
    var c = String(topic || "").toLowerCase();
    var known = {
      latest: "latest.html", music: "music.html", fashion: "fashion.html", beauty: "beauty.html",
      art: "art.html", "art & photography": "art.html", photography: "photography.html",
      film: "film.html", "film & tv": "film.html", culture: "culture.html", "life & culture": "culture.html"
    };
    return known[c] || "";
  }

  // "Trending" featured-grid, mixed across the archive (like the reference)
  function trendingEl(store, story) {
    var pool = store.order.map(function (id) { return store.map[id]; })
      .filter(function (s) { return s.id !== story.id && s.image && s.image.src; });
    // spread across categories for variety
    var seen = {}, spread = [];
    pool.forEach(function (s) {
      var c = (s.eyebrow && s.eyebrow.category) || "_";
      seen[c] = (seen[c] || 0) + 1;
      if (seen[c] <= 2) spread.push(s);
    });
    var picks = (spread.length >= 6 ? spread : pool).slice(0, 6);
    if (!picks.length) return document.createDocumentFragment();
    var feature = picks[0], cards = picks.slice(1, 6);
    return h(
      '<section class="section" aria-labelledby="tr-h"><div class="container">' +
      '<div class="section-head reveal"><h2 id="tr-h">Trending</h2></div>' +
      '<div class="feature-grid">' +
      cardHTML(feature, { featured: true }) +
      cards.map(function (c) { return cardHTML(c); }).join("") +
      "</div></div></section>"
    );
  }

  function renderArticle(home, pages, articleDetails) {
    var mount = document.getElementById("page-mount");
    var id = new URLSearchParams(location.search).get("id");
    var store = flattenStories(home, pages);
    var story = id ? store.map[id] : null;
    if (story && articleDetails && articleDetails[story.id]) {
      story = Object.assign({}, story, articleDetails[story.id]);
    }
    if (!story) {
      document.title = "Not found \u2014 ARCHVE";
      mount.innerHTML =
        '<section class="section page-title"><div class="container">' +
        "<h1>Story not found</h1>" +
        '<p class="page-sub">That piece isn\u2019t in the archive (yet). It may have been renamed or not published.</p>' +
        '<p style="margin-top:20px"><a class="btn btn--pill" href="index.html">Back to the cover</a></p>' +
        "</div></section>";
      return;
    }
    var eb = story.eyebrow || {};
    var cat = eb.category || "ARCHVE";
    var backHref = catHref(cat);
    // every article shows a byline line (as in the reference); synthesise a stable
    // default when a plain card doesn't carry date/author of its own.
    var BYLINES = ["ARCHVE Staff", "The Editors", "M. Rivas", "J. Okonkwo", "S. Delacroix", "R. Vann", "A. Costa", "L. Mbeki", "D. Ferro", "N. Hal\u00e1sz"];
    var seed = 0, tt = story.title || "";
    for (var si = 0; si < tt.length; si++) seed = (seed + tt.charCodeAt(si)) % 997;
    var artDate = story.date || "August 2026";
    var artAuthor = story.author || BYLINES[seed % BYLINES.length];
    var crumb =
      '<p class="article-crumb"><a href="' + attr(backHref) + '">' + esc(cat) + "</a>" +
      (story.format ? ' <span class="crumb-sep">/</span> <span>' + esc(story.format) + "</span>" : "") +
      "</p>";
    var authorHTML = story.authorUrl
      ? '<a href="' + attr(story.authorUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(artAuthor) + "</a>"
      : esc(artAuthor);
    var cap =
      '<figcaption class="article-cap">' +
      '<span class="cap-date">' + esc(artDate) + "</span>" +
      '<span class="cap-by"><strong>Text</strong> ' + authorHTML + "</span>" +
      "</figcaption>";
    var topics = (story.topics && story.topics.length) ? story.topics : [cat];
    var topicsHTML =
      '<nav class="article-topics" aria-label="Topics"><span class="tt">More on these topics:</span>' +
      topics.map(function (t) {
        var href = categoryTopicHref(t);
        return href ? '<a href="' + attr(href) + '">' + esc(t) + "</a>" : '<span class="topic-label">' + esc(t) + "</span>";
      }).join("") +
      "</nav>";

    mount.innerHTML =
      '<div class="article-promo"><a href="' + attr(TALLY.newsletter.href) + '" data-tally-open="' + TALLY.newsletter.id + '">Sign Up For First Access To The Magazine &amp; Updates</a></div>' +
      '<article class="article article--editorial">' +
      '<div class="container container--narrow">' +
      '<header class="article-head">' + crumb +
      "<h1>" + esc(story.title) + "</h1>" +
      (story.dek ? '<p class="article-standfirst">' + esc(story.dek) + "</p>" : "") +
      "</header></div>" +
      '<div class="container container--wide"><figure class="article-hero">' +
      mediaHTML(story.image, "media--wide", true) + cap + "</figure></div>" +
      '<div class="container container--narrow"><div class="article-body">' + articleBody(story) + "</div>" +
      topicsHTML +
      "</div></article>";

    mount.appendChild(RENDER.newsletter());
    mount.appendChild(clubBandEl());
    mount.appendChild(trendingEl(store, story));
    document.title = story.title + " \u2014 ARCHVE";
  }

  /* ---------- smart sticky header (hide on scroll down, show on scroll up) ---------- */
  function wireSmartHeader() {
    var header = document.getElementById("site-header");
    if (!header) return;
    var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var lastY = window.pageYOffset || 0, ticking = false;
    function onScroll() {
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      header.classList.toggle("header--solid", y > 8);
      if (!reduce) {
        var menuOpen = document.getElementById("mobile-menu") && document.getElementById("mobile-menu").classList.contains("open");
        if (y > lastY && y > 160 && !menuOpen) header.classList.add("header--hidden");
        else header.classList.remove("header--hidden");
      }
      lastY = y; ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();
  }

  /* ---------- main render ---------- */
  function renderSections() {
    var host = document.getElementById("sections-mount");
    host.innerHTML = "";
    (state.home.sections || []).forEach(function (sec) {
      if (sec.hidden) return;
      var fn = RENDER[sec.type];
      if (!fn) { console.warn("Unknown section type:", sec.type); return; }
      host.appendChild(fn(sec));
    });
  }

  function renderAll() {
    renderHeader();
    renderHero();
    renderSections();
    renderFooter();
    wireImages(document);
    wireReveal();
    wireSmartHeader();
  }

  function loadError(mountId) {
    var m = document.getElementById(mountId);
    if (m) m.innerHTML =
      '<div class="container"><p style="padding:80px 0;color:var(--text-dim)">Content could not be loaded. If you are viewing this from your file system, run a local server (see README) so the JSON files can be fetched.</p></div>';
  }

  function bootHome() {
    loadData()
      .then(function (data) {
        state.site = data.site; state.home = data.home;
        // Homepage placements may reference the central catalog / opt-in feeds.
        // Curated hero + featured slots are preserved; only slots that declare
        // a reference or an auto feed change. Non-migrated homepages skip this.
        if (pageNeedsHydration(state.home)) {
          return loadArticles().then(function (cat) {
            state.home = hydratePageData(state.home, (cat && cat.articles) || {});
            renderAll();
          });
        }
        renderAll();
      })
      .catch(function (err) {
        console.error("ARCHVE failed to load content:", err);
        loadError("sections-mount");
      });
  }

  function bootPage(pageType, slug) {
    if (pageType === "article") { bootArticle(); return; }
    // Page content is inline, so paint it immediately. Header/footer data may
    // arrive a moment later, but it never blocks the editorial modules.
    var pg = readInline("page-data");
    function renderPageContent(page) {
      if (!page) { console.error("ARCHVE: no content for page", slug); loadError("page-mount"); return; }
      if (pageType === "list" || page.type === "list") renderListPage(page);
      else renderCategoryPage(page);
      document.title = page.title + " \u2014 ARCHVE";
      wireImages(document);
      wireReveal();
    }
    function renderChrome() {
      return loadSite().then(function (site) {
        state.site = site;
        renderHeader();
        renderFooter();
        wireSmartHeader();
      }).catch(function (err) {
        console.error("ARCHVE chrome failed to load:", err);
      });
    }

    if (pg) {
      // Reference-based pages hydrate placements from the central catalog first,
      // then hand the materialized legacy shape to the unchanged renderers. Pages
      // that still carry fully-inline cards paint immediately, exactly as before.
      if (pageNeedsHydration(pg)) {
        loadArticles()
          .then(function (data) {
            renderPageContent(hydratePageData(pg, (data && data.articles) || {}));
          })
          .catch(function (err) {
            console.error("ARCHVE: catalog hydration failed, rendering inline data:", err);
            renderPageContent(pg);
          });
        renderChrome();
        return;
      }
      renderPageContent(pg);
      renderChrome();
      return;
    }

    var pagesFallback = pg
      ? Promise.resolve(pg)
      : fetch("content/pages.json").then(function (r) { return r.json(); })
          .then(function (j) { return ((j && j.pages) || {})[slug]; });
    Promise.all([loadSite(), pagesFallback]).then(function (a) {
      state.site = a[0];
      pg = a[1];
      renderHeader();
      renderFooter();
      renderPageContent(pg);
      wireSmartHeader();
    }).catch(function (err) {
      console.error("ARCHVE failed to load content:", err);
      renderHeaderSafe();
      loadError("page-mount");
    });
  }

  // Permanent URL for a complete published article, else the legacy query route.
  // Complete published catalog stories prefer their permanent static URL;
  // incomplete/legacy records keep the backward-compatible ?id= route so that
  // removing an article from a feed never breaks an existing link.
  function articleHref(story) {
    if (!story) return "#";
    return (story.status === "published" && story.body && story.body.length)
      ? "articles/" + encodeURIComponent(story.slug || story.id) + "/"
      : ((story.migration && story.migration.legacyHref) || ("article.html?id=" + encodeURIComponent(story.id)));
  }

  // Article pages now read directly from the centralized article catalog.
  // This avoids fetching and parsing every category HTML file on each article view.
  function articleStoreFromCatalog(articleDetails) {
    var map = {}, order = [];
    Object.keys(articleDetails || {}).forEach(function (id) {
      var story = articleDetails[id];
      if (!story || !story.title) return;
      var card = Object.assign({}, story);
      card.href = articleHref(story);
      map[id] = card;
      order.push(id);
    });
    return { map: map, order: order };
  }

  /* =======================================================================
     CENTRAL CATALOG HYDRATION  —  page references → cards

     content/articles.json is the single source of truth for article headline,
     deck, image, author, date, slug, category, permanent URL and body. A
     homepage/category page's #page-data keeps LAYOUT/PLACEMENT only and may
     express any card as a lightweight reference that hydrates from the catalog:

         { "articleId": "the-slug" }                 // pull all fields
         { "articleId": "the-slug", "dek": "…" }     // + per-placement override

     A slot may also declare an automatic category feed so newly published
     articles appear without editing HTML:

         "latest": { "auto": { "category": "Music", "limit": 20 },
                     "autoFirst": true,
                     "curated": [ …literal or reference cards… ] }

     Literal card objects (no articleId) pass through UNCHANGED, so existing
     external/curated cards remain byte-for-byte identical. Hydration outputs the
     exact legacy page-data shape the render functions already consume, so no
     card / mosaic / hero / grid / list template is modified. Curated hero and
     Editor's Pick slots are kept separate from automatic feeds so a new article
     never silently replaces an intentional feature.
     ======================================================================= */

  // Turn a catalog record into the card object shape used by cardHTML/mosaicHTML.
  function catalogCardFromRecord(rec) {
    if (!rec) return null;
    var img = rec.thumbnailImage || rec.image || rec.heroImage || {};
    return {
      id: rec.id,
      articleId: rec.id,
      title: rec.title,
      dek: rec.dek || "",
      image: img,
      date: rec.date || "",
      author: rec.author || "",
      href: articleHref(rec),
      eyebrow: { category: (rec.eyebrow && rec.eyebrow.category) || rec.category || "" }
    };
  }

  // Look up a catalog record by id, then by slug.
  function catalogLookup(catalog, key) {
    if (!key || !catalog) return null;
    if (catalog[key]) return catalog[key];
    var ids = Object.keys(catalog);
    for (var i = 0; i < ids.length; i++) {
      if (catalog[ids[i]] && catalog[ids[i]].slug === key) return catalog[ids[i]];
    }
    return null;
  }

  // Resolve one placement entry. References hydrate from the catalog; literal
  // cards pass through. Returns null when a referenced article is missing so it
  // is simply skipped (the grid stays valid).
  function hydrateRef(entry, catalog) {
    if (!entry || typeof entry !== "object") return null;
    var key = entry.articleId || entry.ref || entry.article;
    if (!key) return entry; // literal card — unchanged
    var rec = catalogLookup(catalog, key);
    if (!rec) { try { console.warn("ARCHVE: no catalog article for reference", key); } catch (e) {} return null; }
    var card = catalogCardFromRecord(rec);
    // Per-placement overrides — layout-specific tweaks only when truly needed.
    ["title", "dek", "date", "author", "href"].forEach(function (k) {
      if (entry[k] != null) card[k] = entry[k];
    });
    if (entry.image) card.image = entry.image;
    if (entry.eyebrow) card.eyebrow = entry.eyebrow;
    return card;
  }

  // Lenient date parse for catalog dates like "August 26th, 2026",
  // "Aug 27, 2026" or "August 2026". Returns a timestamp or NaN.
  function parseArticleDate(s) {
    if (!s) return NaN;
    var cleaned = String(s).replace(/(\d+)(st|nd|rd|th)\b/gi, "$1");
    return Date.parse(cleaned);
  }

  // Does a record satisfy a feed spec? Supports:
  //   spec.category    — string; matches rec.category or rec.categories[]
  //   spec.categories  — array;  OR across the listed categories
  //   spec.placement   — "latest" | "home" | "featured"; rec.placement[x]===true
  //   spec.match       — "any" ORs the category and placement filters
  //                      (default ANDs whichever filters are provided)
  function recordMatchesFeed(rec, spec) {
    var cats = [].concat(rec.category || [], rec.categories || []);
    var hasCat = false, catOk = true;
    if (spec.category) { hasCat = true; catOk = cats.indexOf(spec.category) !== -1; }
    if (spec.categories && spec.categories.length) {
      hasCat = true;
      catOk = spec.categories.some(function (c) { return cats.indexOf(c) !== -1; });
    }
    var hasPlace = false, placeOk = true;
    if (spec.placement) { hasPlace = true; placeOk = !!(rec.placement && rec.placement[spec.placement]); }
    // Explicit homepage slot: an article only enters a home section when it has
    // both the intent flag and a chosen slot, so curated home features are never
    // silently replaced. ANDed regardless of match mode.
    if (spec.homeSection) {
      if (!(rec.placement && rec.placement.homeSection === spec.homeSection)) return false;
    }
    if (!hasCat && !hasPlace) return true;               // no filter → everything
    if (spec.match === "any") return (hasCat && catOk) || (hasPlace && placeOk);
    return (!hasCat || catOk) && (!hasPlace || placeOk);
  }

  // Published, real-body catalog articles matching a feed spec, newest first.
  // Only complete published articles are eligible, matching the publication rule.
  function autoFeedCards(spec, catalog, exclude) {
    spec = spec || {};
    var out = [];
    Object.keys(catalog || {}).forEach(function (id) {
      var rec = catalog[id];
      if (!rec || rec.status !== "published") return;
      if (!(rec.body && rec.body.length)) return;      // real editorial copy only
      if (exclude && exclude[id]) return;
      if (!recordMatchesFeed(rec, spec)) return;
      out.push(rec);
    });
    out.sort(function (a, b) {
      var da = parseArticleDate(a.date), db = parseArticleDate(b.date);
      if (isNaN(da) && isNaN(db)) return 0;
      if (isNaN(da)) return 1;
      if (isNaN(db)) return -1;
      return db - da;                                   // newest first
    });
    return out.map(catalogCardFromRecord);
  }

  // Resolve a slot that may be a plain array (literals/refs) OR an object
  // { items|curated, auto, limit, autoFirst }. Curated placements and the
  // automatic feed are merged, de-duplicated by article, and capped at limit.
  function resolveSlot(slot, catalog, exclude, defaultLimit) {
    if (slot == null) return [];
    var items, auto = null, limit = defaultLimit || 12, autoFirst = false, isArray = Array.isArray(slot);
    if (isArray) { items = slot; }
    else {
      items = slot.items || slot.curated || [];
      auto = slot.auto || null;
      if (slot.limit) limit = slot.limit;
      autoFirst = !!slot.autoFirst;
    }
    var curated = items.map(function (e) { return hydrateRef(e, catalog); }).filter(Boolean);
    if (!auto) return isArray ? curated : curated.slice(0, limit);
    if (auto.limit) limit = auto.limit;
    var used = Object.assign({}, exclude || {});
    curated.forEach(function (c) { if (c.articleId) used[c.articleId] = true; if (c.id) used[c.id] = true; });
    var feed = autoFeedCards(auto, catalog, used);
    var cards = autoFirst ? feed.concat(curated) : curated.concat(feed);
    var seen = {}, dedup = [];
    cards.forEach(function (c) {
      var key = c.articleId || c.id || ((c.href || "") + "|" + (c.title || ""));
      if (seen[key]) return; seen[key] = true; dedup.push(c);
    });
    return dedup.slice(0, limit);
  }

  // Should bootPage load the catalog before painting this page?
  function pageNeedsHydration(pg) {
    if (!pg) return false;
    if (pg.hydrate) return true;
    var found = false;
    (function scan(v) {
      if (found || !v || typeof v !== "object") return;
      if (Array.isArray(v)) { v.forEach(scan); return; }
      if (v.articleId || v.ref || v.auto) { found = true; return; }
      Object.keys(v).forEach(function (k) { scan(v[k]); });
    })(pg);
    return found;
  }

  // Ids used by curated hero/editor slots, so the automatic Latest feed does
  // not duplicate an article that is already featured above it.
  function curatedIds(pg) {
    var ids = {};
    function mark(c) { if (c && typeof c === "object") { var k = c.articleId || c.ref || c.id; if (k) ids[k] = true; } }
    if (pg.hero) { mark(pg.hero.feature); (pg.hero.cards || []).forEach(mark); }
    (pg.editorsPick && (pg.editorsPick.items || pg.editorsPick.curated || pg.editorsPick) || []).forEach(mark);
    return ids;
  }

  // Produce a legacy-shaped page object (hero.feature, hero.cards, hero.tiles,
  // editorsPick[], latest[], trending[], sections[]) from reference-based data,
  // so the existing render functions run completely unchanged.
  function hydratePageData(pg, catalog) {
    if (!pg) return pg;
    catalog = catalog || {};
    var out = Object.assign({}, pg);
    if (pg.hero) {
      if (pg.hero.articleId || pg.hero.ref || pg.hero.article) {
        out.hero = hydrateRef(pg.hero, catalog) || pg.hero;
      } else {
        var hero = Object.assign({}, pg.hero);
        if (hero.feature) hero.feature = hydrateRef(hero.feature, catalog) || hero.feature;
        if (hero.cards) hero.cards = hero.cards.map(function (e) { return hydrateRef(e, catalog); }).filter(Boolean);
        if (hero.tiles) hero.tiles = hero.tiles.map(function (e) {
          // tiles are image-only; a reference contributes its image + link
          var c = hydrateRef(e, catalog); if (!c) return null;
          return e.articleId ? { image: c.image, href: c.href } : c;
        }).filter(Boolean);
        out.hero = hero;
      }
    }
    if (pg.editorsPick != null) out.editorsPick = resolveSlot(pg.editorsPick, catalog, {}, 3);
    if (pg.trending != null) out.trending = resolveSlot(pg.trending, catalog, {}, 3);
    if (pg.latest != null) out.latest = resolveSlot(pg.latest, catalog, curatedIds(pg), 12);
    // List pages (Latest, The Index) auto-populate their story stream.
    if (pg.stories != null) out.stories = resolveSlot(pg.stories, catalog, {}, (pg.stories && pg.stories.limit) || 30);
    if (Array.isArray(pg.sections)) {
      out.sections = pg.sections.map(function (sec) {
        var s = Object.assign({}, sec);
        if (sec.featured) s.featured = hydrateRef(sec.featured, catalog) || sec.featured;
        if (sec.cards) s.cards = resolveSlot(sec.cards, catalog, {}, sec.limit || 12);
        if (sec.items) s.items = resolveSlot(sec.items, catalog, {}, sec.limit || 12);
        if (sec.covers) s.covers = resolveSlot(sec.covers, catalog, {}, sec.limit || 12);
        return s;
      });
    }
    return out;
  }

  function bootArticle() {
    Promise.all([loadSite(), loadArticles()]).then(function (a) {
      state.site = a[0];
      var articleDetails = (a[1] && a[1].articles) || {};
      state.articles = articleDetails;
      // renderArticle still expects home/pages shapes for its internal store.
      // Passing the catalog as one synthetic page keeps the renderer unchanged
      // while making content/articles.json the article-page source of truth.
      var catalogStore = articleStoreFromCatalog(articleDetails);
      var catalogStories = catalogStore.order.map(function (id) { return catalogStore.map[id]; });
      renderHeader();
      renderFooter();
      renderArticle({}, { pages: { catalog: { stories: catalogStories } } }, articleDetails);
      wireImages(document);
      wireReveal();
      wireSmartHeader();
    }).catch(function (err) {
      console.error("ARCHVE failed to load content:", err);
      renderHeaderSafe();
      loadError("page-mount");
    });
  }

  // Static article pages generated by the publication build already contain the
  // full crawlable article HTML. JavaScript only supplies the shared chrome and
  // below-article modules so SEO never depends on client-side rendering.
  function bootStaticArticle() {
    Promise.all([loadSite(), loadArticles()]).then(function (a) {
      state.site = a[0];
      var details = (a[1] && a[1].articles) || {};
      renderHeader();
      renderFooter();
      var after = document.getElementById("static-after-article");
      if (after) {
        after.appendChild(RENDER.newsletter());
        after.appendChild(clubBandEl());
        var dataEl = document.getElementById("static-article-data");
        var articleId = dataEl ? dataEl.getAttribute("data-id") : "";
        var story = articleId ? details[articleId] : null;
        if (story) {
          var tr = trendingEl(articleStoreFromCatalog(details), story);
          if (tr) after.appendChild(tr);
        }
      }
      wireImages(document);
      wireReveal();
      wireSmartHeader();
    }).catch(function (err) {
      console.error("ARCHVE static article chrome failed to load:", err);
      renderHeaderSafe();
    });
  }

  // If site.json loaded but pages failed, still try to show chrome.
  function renderHeaderSafe() { try { if (state.site) { renderHeader(); renderFooter(); } } catch (e) {} }

  /* =======================================================================
     G6 AGENCY — data-driven section (scoped under .g6-page)
     Renders every /g6 view from this page's inline #page-data, reusing the header,
     footer, image/reveal/sticky-header wiring and design tokens. No new router,
     no framework. All views mount into #g6-mount.
     ======================================================================= */
  var G6_ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="4" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></svg>';

  function isVideoSrc(s) { return /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(String(s || "")); }

  // Media wrapper reusing .media (lazy-load + fallback + scanline). Supports
  // image OR video. Videos autoplay muted/looped/inline with a poster + no controls.
  function g6Media(m, opts) {
    m = m || {}; opts = opts || {};
    if (!m.src && !m.poster) return "";
    var ratio = opts.ratioClass || "";
    var focal = m.focal ? "--focal:" + attr(m.focal) + ";" : "";
    var eager = !!opts.eager;
    var loading = eager ? 'loading="eager"' : 'loading="lazy"';
    var fetchp = eager ? 'fetchpriority="high"' : 'fetchpriority="low"';
    var wantVideo = (m.type === "video") || opts.forceVideo || isVideoSrc(m.src);
    var inner = "";
    if (wantVideo && m.src) {
      inner =
        '<video class="g6-video" autoplay muted loop playsinline preload="metadata" tabindex="-1"' +
        (m.poster ? ' poster="' + attr(m.poster) + '"' : "") + ">" +
        '<source src="' + attr(m.src) + '">' +
        "</video>";
    } else {
      var imgSrc = m.src || m.poster || "";
      if (imgSrc && !isVideoSrc(imgSrc)) {
        inner = '<img src="' + attr(imgSrc) + '" alt="' + attr(m.alt || "") + '" ' + loading + ' decoding="async" ' + fetchp + ">";
      }
    }
    var play = opts.play ? '<span class="g6-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>' : "";
    return (
      '<div class="media ' + ratio + '" data-loaded="false" style="' + focal + '">' +
      inner +
      '<span class="media-fallback" aria-hidden="true">' + esc((m.fallback || m.alt || "G6").toUpperCase()) + "</span>" +
      play +
      "</div>"
    );
  }

  function g6ProjectsIndex() {
    var g6 = state.g6 || {};
    var byId = {}, byService = {};
    (g6.projects || []).forEach(function (p) {
      if (p && p.id) byId[p.id] = p;
      if (p && p.service) { (byService[p.service] = byService[p.service] || []).push(p); }
    });
    Object.keys(byService).forEach(function (k) {
      byService[k].sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    });
    return { byId: byId, byService: byService, all: (g6.projects || []).slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); }) };
  }

  function g6ServiceById(id) {
    return ((state.g6 && state.g6.services) || []).filter(function (s) { return s.id === id; })[0] || null;
  }

  // A featured/work project links to its own route if provided, otherwise to the
  // filtered Work page (no fabricated per-project pages).
  function g6ProjectHref(p) {
    if (p.href && p.href !== "#") return p.href;
    return "g6-work.html?filter=" + encodeURIComponent(p.service || "all");
  }

  function g6MetaLine(p) {
    var bits = [];
    if (p.client) bits.push(esc(p.client));
    var svc = g6ServiceById(p.service);
    if (svc) bits.push(esc(svc.name));
    if (p.role) bits.push(esc(p.role));
    if (p.year) bits.push(esc(p.year));
    return bits.join(' <span class="sep">·</span> ');
  }

  /* ---------- shared building blocks ---------- */
  function g6LogoEl() {
    var meta = (state.g6 && state.g6.meta) || {};
    if (!meta.logo) return "";
    return (
      '<section class="g6-logo-band"><div class="container">' +
      '<img class="g6-logo" src="' + attr(meta.logo) + '" alt="' + attr(meta.logoAlt || "G6 Agency") + '" width="360" height="157">' +
      "</div></section>"
    );
  }

  function g6HeroEl() {
    var hero = (state.g6 && state.g6.hero) || {};
    var m = hero.media || {};
    var cta = hero.cta || {};
    return (
      '<section class="g6-hero reveal" aria-label="G6 Agency">' +
      '<div class="g6-hero-media">' + g6Media(m, { eager: true, ratioClass: "g6-media-fill" }) + "</div>" +
      '<div class="g6-hero-scrim" aria-hidden="true"></div>' +
      '<div class="container container--wide"><div class="g6-hero-content">' +
      (hero.tagline ? '<p class="g6-hero-tagline">' + esc(hero.tagline) + "</p>" : "") +
      (cta.label ? '<a class="btn btn--fill g6-hero-cta" href="' + attr(cta.href || "g6-contact.html") + '">' + esc(cta.label) + "</a>" : "") +
      "</div></div></section>"
    );
  }

  function g6IntroEl() {
    var t = (state.g6 && state.g6.intro) || "";
    if (!t) return "";
    return (
      '<section class="g6-intro reveal"><div class="container">' +
      '<hr class="g6-rule">' +
      '<p class="g6-intro-text">' + esc(t) + "</p>" +
      '<hr class="g6-rule">' +
      "</div></section>"
    );
  }

  function g6ServiceCard(s, i) {
    var mediaLeft = (i % 2 === 1);
    return (
      '<a class="g6-card reveal' + (mediaLeft ? " g6-card--media-left" : "") + '" href="' + attr(s.route || "#") + '" aria-label="' + attr(s.name) + '">' +
      '<div class="g6-card-media">' + g6Media(s.media || {}, { ratioClass: "g6-media-fill" }) + "</div>" +
      '<div class="g6-card-body">' +
      '<h3 class="g6-card-title">' + esc(s.name) + "</h3>" +
      (s.line ? '<p class="g6-card-line">' + esc(s.line) + "</p>" : "") +
      '<span class="g6-card-cta">Explore ' + G6_ARROW + "</span>" +
      "</div></a>"
    );
  }

  function g6ServicesEl(heading) {
    var svcs = (state.g6 && state.g6.services) || [];
    var cards = svcs.map(function (s, i) { return g6ServiceCard(s, i); }).join("");
    return (
      '<section class="g6-services" id="services">' +
      '<div class="container g6-container">' +
      (heading ? '<div class="section-head reveal"><h2>' + esc(heading) + "</h2></div>" : "") +
      '<div class="g6-card-stack">' + cards + "</div>" +
      "</div></section>"
    );
  }

  function g6FeaturedEl() {
    var g6 = state.g6 || {};
    var fw = g6.featured || {};
    if (fw.visible === false) return "";
    var idx = g6ProjectsIndex();
    var items = (fw.ids || []).map(function (id) { return idx.byId[id]; }).filter(Boolean);
    if (!items.length) items = idx.all.filter(function (p) { return p.featured; }).slice(0, 6);
    if (!items.length) return "";
    items = items.slice(0, 6);
    var SPAN = [3, 3, 2, 2, 2, 3];
    var cells = items.map(function (p, i) {
      var span = SPAN[i % SPAN.length];
      var isVid = (p.type === "video") || isVideoSrc((p.image || {}).src);
      var media = g6Media(isVid ? (p.poster || p.image || {}) : (p.image || {}), { ratioClass: "g6-media-fill", play: isVid });
      var meta = g6MetaLine(p);
      var href = g6ProjectHref(p);
      var docAttrs = /\.pdf(?:$|[?#])/i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '';
      return (
        '<a class="g6-feat-item reveal g6-span-' + span + " g6-ratio-" + esc(p.ratio || "landscape") + '" href="' + attr(href) + '"' + docAttrs + '>' +
        '<div class="g6-feat-media">' + media + "</div>" +
        ((p.title || meta) ? '<div class="g6-feat-cap">' +
        (p.title ? '<span class="g6-feat-title">' + esc(p.title) + "</span>" : "") +
        (meta ? '<span class="g6-feat-meta">' + meta + "</span>" : "") +
        "</div>" : "") + "</a>"
      );
    }).join("");
    return (
      '<section class="g6-featured" id="work">' +
      '<div class="container g6-container">' +
      '<div class="section-head reveal"><h2>' + esc(fw.title || "Featured Work") + "</h2>" +
      '<a class="g6-viewall" href="g6-work.html">View All Work ' + G6_ARROW + "</a></div>" +
      '<div class="g6-feature-grid">' + cells + "</div>" +
      "</div></section>"
    );
  }

  function g6ModelsTeaserEl() {
    var mt = (state.g6 && state.g6.modelsTeaser) || {};
    if (mt.visible === false) return "";
    var media = (mt.media || []).slice(0, 3).map(function (m) {
      return '<div class="g6-mt-cell reveal">' + g6Media(m, { ratioClass: "g6-media-fill" }) + "</div>";
    }).join("");
    return (
      '<section class="g6-models-teaser reveal" id="models">' +
      '<div class="container g6-container">' +
      '<div class="g6-mt-head">' +
      "<div>" +
      '<h2>' + esc(mt.title || "G6 Models") + "</h2>" +
      (mt.line ? '<p class="g6-mt-line">' + esc(mt.line) + "</p>" : "") +
      "</div>" +
      '<div class="g6-mt-cta">' +
      '<a class="btn btn--pill" href="g6-models.html">View Roster</a>' +
      '<a class="btn btn--fill" href="g6-apply.html">Apply</a>' +
      "</div></div>" +
      (media ? '<div class="g6-mt-strip">' + media + "</div>" : "") +
      "</div></section>"
    );
  }

  function g6ClientsEl() {
    var c = (state.g6 && state.g6.clients) || {};
    var hasLogos = (c.logos || []).length > 0;
    var hasTest = (c.testimonials || []).length > 0;
    if (c.visible === false || (!hasLogos && !hasTest)) return ""; // hidden until real content exists
    var logos = (c.logos || []).map(function (l) {
      var img = l.src ? '<img src="' + attr(l.src) + '" alt="' + attr(l.alt || l.name || "Client") + '" loading="eager" decoding="async">' : esc(l.name || "");
      return '<div class="g6-client-logo">' + img + "</div>";
    }).join("");
    var tests = (c.testimonials || []).map(function (t) {
      return '<figure class="g6-testimonial reveal"><blockquote>' + esc(t.quote || "") + "</blockquote>" +
        (t.attribution ? "<figcaption>" + esc(t.attribution) + "</figcaption>" : "") + "</figure>";
    }).join("");
    return (
      '<section class="g6-clients reveal" id="clients"><div class="container g6-container">' +
      '<div class="section-head reveal"><h2>' + esc(c.title || "Clients & Testimonials") + "</h2></div>" +
      (logos ? '<div class="g6-client-logos">' + logos + "</div>" : "") +
      (tests ? '<div class="g6-testimonials">' + tests + "</div>" : "") +
      "</div></section>"
    );
  }

  function g6ClosingEl() {
    var cc = (state.g6 && state.g6.closingCta) || {};
    if (cc.visible === false) return "";
    return (
      '<section class="g6-closing reveal"><a class="g6-closing-inner" href="' + attr(cc.href || "g6-contact.html") + '">' +
      '<div class="container g6-container">' +
      (cc.kicker ? '<p class="g6-closing-kicker">' + esc(cc.kicker) + "</p>" : "") +
      "<h2>" + esc(cc.title || "Start a Project") + "</h2>" +
      (cc.body ? "<p class=\"g6-closing-body\">" + esc(cc.body) + "</p>" : "") +
      '<span class="g6-closing-cta">' + esc(cc.label || cc.title || "Start a Project") + " " + G6_ARROW + "</span>" +
      "</div></a></section>"
    );
  }

  /* ---------- portfolio grid (12-col editorial rhythm) ---------- */
  function g6PortfolioGrid(projects, opts) {
    opts = opts || {};
    if (!projects.length) return "";
    var SPAN = opts.spans || [6, 6, 4, 4, 4, 8, 4, 6, 6, 12];
    var cells = projects.map(function (p, i) {
      var span = SPAN[i % SPAN.length];
      var isVid = (p.type === "video") || isVideoSrc((p.image || {}).src);
      var media = g6Media(isVid ? (p.poster || p.image || {}) : (p.image || {}), { ratioClass: "g6-media-fill", play: isVid });
      var meta = g6MetaLine(p);
      var href = g6ProjectHref(p);
      var docAttrs = /\.pdf(?:$|[?#])/i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '';
      return (
        '<a class="g6-pf-item reveal g6-col-' + span + " g6-ratio-" + esc(p.ratio || "landscape") +
        '" href="' + attr(href) + '"' + docAttrs + ' data-service="' + attr(p.service || "") + '" data-type="' + attr(p.type || "photo") + '">' +
        '<div class="g6-pf-media">' + media + "</div>" +
        ((p.title || meta) ? '<div class="g6-feat-cap">' +
        (p.title ? '<span class="g6-feat-title">' + esc(p.title) + "</span>" : "") +
        (meta ? '<span class="g6-feat-meta">' + meta + "</span>" : "") +
        "</div>" : "") + "</a>"
      );
    }).join("");
    return '<div class="g6-portfolio">' + cells + "</div>";
  }

  /* ---------- forms (contact + apply) ---------- */
  function g6SelectHTML(name, label, options, selected) {
    var opts = ['<option value="">Select…</option>'].concat((options || []).map(function (o) {
      return '<option value="' + attr(o) + '"' + (o === selected ? " selected" : "") + ">" + esc(o) + "</option>";
    })).join("");
    return (
      '<label class="g6-field"><span>' + esc(label) + "</span>" +
      '<select name="' + attr(name) + '">' + opts + "</select></label>"
    );
  }
  function g6InputHTML(name, label, type, required, ph) {
    return (
      '<label class="g6-field"><span>' + esc(label) + (required ? ' <em aria-hidden="true">*</em>' : "") + "</span>" +
      '<input type="' + (type || "text") + '" name="' + attr(name) + '"' + (required ? " required" : "") +
      (ph ? ' placeholder="' + attr(ph) + '"' : "") + "></label>"
    );
  }
  function g6TextareaHTML(name, label, required) {
    return (
      '<label class="g6-field g6-field--full"><span>' + esc(label) + (required ? ' <em aria-hidden="true">*</em>' : "") + "</span>" +
      '<textarea name="' + attr(name) + '" rows="5"' + (required ? " required" : "") + "></textarea></label>"
    );
  }

  function wireG6Form(form, email, subjectPrefix, noticeEl, fallbackEmail) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = {}, ok = true;
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name) return;
        if (el.required && !String(el.value || "").trim()) { ok = false; el.classList.add("g6-invalid"); }
        else el.classList.remove("g6-invalid");
        data[el.name] = el.value;
      });
      if (!ok) { var bad = form.querySelector(".g6-invalid"); if (bad) bad.focus(); return; }
      var primaryEmail = String(email || "").trim();
      var secondaryEmail = String(fallbackEmail || "contact@archvemag.com").trim();
      var destinationEmail = primaryEmail || secondaryEmail;
      if (!destinationEmail) { noticeEl.hidden = false; noticeEl.className = "g6-form-notice warn"; noticeEl.textContent = "This form does not have a destination inbox configured yet."; return; }
      var submit = form.querySelector('[type="submit"]');
      if (submit) { submit.disabled = true; submit.setAttribute("aria-busy", "true"); }
      noticeEl.hidden = false; noticeEl.className = "g6-form-notice"; noticeEl.textContent = "Sending inquiry…";
      var subject = subjectPrefix + (data.service ? " — " + data.service : "") + (data.name ? " — " + data.name : "");
      var payload = {};
      Object.keys(data).forEach(function (key) { if (String(data[key] || "").trim()) payload[key] = data[key]; });
      payload._subject = subject; payload._template = "table"; if (data.email) payload._replyto = data.email; payload._url = window.location.href;
      function sendTo(destination) {
        return fetch("https://formsubmit.co/ajax/" + encodeURIComponent(destination), {
          method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(payload)
        }).then(function (response) { if (!response.ok) throw new Error("Submission failed"); return response.json(); });
      }
      sendTo(destinationEmail)
      .catch(function (err) {
        if (secondaryEmail && secondaryEmail.toLowerCase() !== destinationEmail.toLowerCase()) return sendTo(secondaryEmail);
        throw err;
      })
      .then(function () { noticeEl.hidden = false; noticeEl.className = "g6-form-notice ok"; noticeEl.textContent = "Thank you — your inquiry has been sent to G6."; form.reset(); })
      .catch(function () { var directEmail = secondaryEmail || destinationEmail; noticeEl.hidden = false; noticeEl.className = "g6-form-notice warn"; noticeEl.innerHTML = "The automatic send could not be completed. You can email <a href=\"mailto:" + attr(directEmail) + "\">" + esc(directEmail) + "</a> directly."; })
      .finally(function () { if (submit) { submit.disabled = false; submit.removeAttribute("aria-busy"); } noticeEl.scrollIntoView({ behavior: "smooth", block: "nearest" }); });
    });
  }

  /* ---------- page: HOME ---------- */

  /* ---------- page: site search ---------- */
  function searchScore(article, query) {
    var q = String(query || "").trim().toLowerCase();
    if (!q) return 0;
    var terms = q.split(/\s+/).filter(Boolean);
    var title = String(article.title || "").toLowerCase();
    var dek = String(article.dek || "").toLowerCase();
    var tags = [].concat(article.tags || [], article.categories || [], article.category || []).join(" ").toLowerCase();
    var body = String(article.text || "").toLowerCase();
    var hay = title + " " + dek + " " + tags + " " + body;
    if (!terms.every(function (term) { return hay.indexOf(term) !== -1; })) return 0;
    var score = 1;
    if (title.indexOf(q) !== -1) score += 20;
    if (tags.indexOf(q) !== -1) score += 10;
    if (dek.indexOf(q) !== -1) score += 6;
    terms.forEach(function (term) {
      if (title.indexOf(term) !== -1) score += 5;
      if (tags.indexOf(term) !== -1) score += 3;
      if (dek.indexOf(term) !== -1) score += 2;
    });
    return score;
  }

  function renderSearchPage(index) {
    var mount = document.getElementById("page-mount");
    var q = new URLSearchParams(location.search).get("q") || "";
    var input = document.getElementById("hsearch-input") || document.getElementById("site-search");
    if (input) input.value = q;
    var all = (index && index.articles) || [];
    var results = q ? all.map(function (a) { return { article: a, score: searchScore(a, q) }; })
      .filter(function (x) { return x.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 60) : [];
    var cards = results.map(function (x) {
      var a = x.article;
      return cardHTML({
        title: a.title,
        dek: a.dek || "",
        image: a.image || {},
        href: a.url || "#",
        eyebrow: { category: a.category || "" }
      }, { showEyebrow: true });
    }).join("");
    mount.innerHTML =
      '<section class="section page-title"><div class="container"><h1>Search</h1>' +
      (q ? '<p class="page-sub">' + esc(results.length) + ' result' + (results.length === 1 ? '' : 's') + ' for “' + esc(q) + '”</p>' : '<p class="page-sub">Search the published ARCHVE archive from the header.</p>') +
      '</div></section>' +
      (q && results.length ? '<section class="section"><div class="container"><div class="cat-grid search-grid">' + cards + '</div></div></section>' : '') +
      (q && !results.length ? '<section class="section"><div class="container"><p class="page-sub">No published articles matched that search.</p></div></section>' : '');
    document.title = q ? 'Search: ' + q + ' — ARCHVE' : 'Search — ARCHVE';
    wireImages(mount);
    wireReveal();
    wireSmartHeader();
  }

  function bootSearch() {
    Promise.all([
      loadSite(),
      fetch("content/search-index.json").then(function (r) { if (!r.ok) throw new Error("Search index unavailable"); return r.json(); })
    ]).then(function (a) {
      state.site = a[0];
      renderHeader();
      renderFooter();
      renderSearchPage(a[1]);
    }).catch(function (err) {
      console.error("ARCHVE search failed:", err);
      renderHeaderSafe();
      loadError("page-mount");
    });
  }

  function renderG6Home() {
    var mount = document.getElementById("g6-mount");
    var vis = (state.g6 && state.g6.sections) || {};
    var html = g6LogoEl();
    if (vis.hero !== false) html += g6HeroEl();
    if (vis.intro !== false) html += g6IntroEl();
    if (vis.services !== false) html += g6ServicesEl("");
    if (vis.featured !== false) html += g6FeaturedEl();
    if (vis.models !== false) html += g6ModelsTeaserEl();
    if (vis.clients !== false) html += g6ClientsEl();
    if (vis.closing !== false) html += g6ClosingEl();
    mount.innerHTML = html;
    document.title = "G6 Agency \u2014 ARCHVE";
  }

  /* ---------- page: SERVICES parent ---------- */
  function renderG6Services() {
    var mount = document.getElementById("g6-mount");
    mount.innerHTML =
      '<section class="section page-title g6-page-title"><div class="container g6-container">' +
      "<h1>Services</h1>" +
      '<p class="page-sub">G6 is systems-driven: styling, casting, direction, shopping and production, each with a clear process from brief to delivery. Choose a service to see how it works.</p>' +
      "</div></section>" +
      g6ServicesEl("") +
      g6ClosingEl();
    document.title = "Services \u2014 G6 Agency";
  }

  /* ---------- page: individual SERVICE ---------- */
  function renderG6Service(id) {
    var mount = document.getElementById("g6-mount");
    var s = g6ServiceById(id);
    if (!s) {
      mount.innerHTML = '<section class="section page-title"><div class="container"><h1>Service not found</h1>' +
        '<p class="page-sub">That service isn\u2019t configured yet.</p>' +
        '<p style="margin-top:20px"><a class="btn btn--pill" href="g6-services.html">All services</a></p></div></section>';
      return;
    }
    var idx = g6ProjectsIndex();
    var projects = idx.byService[id] || [];
    var process = (s.process || []).map(function (p, i) {
      return '<li class="g6-step"><span class="g6-step-n">' + ("0" + (i + 1)).slice(-2) + "</span><span>" + esc(p) + "</span></li>";
    }).join("");
    var deliverables = (s.deliverables || []).map(function (d) { return "<li>" + esc(d) + "</li>"; }).join("");

    var extra = "";
    // Creative Direction: editable mood-board preview + graphic-design note.
    if (id === "creative-direction") {
      if (s.moodboard && (s.moodboard.src || s.moodboard.poster)) {
        extra += '<div class="g6-feature-media reveal"><div class="g6-feature-media-inner">' +
          g6Media(s.moodboard, { ratioClass: "media--wide" }) +
          '<figcaption class="g6-figcap">Mood-board preview — edit \"featureMedia\" in this page (see #page-data).</figcaption></div></div>';
      }
      extra += '<p class="g6-note reveal">Graphic design is delivered as part of Creative Direction.</p>';
    }
    // Model Casting: cross-link to G6 Models.
    if (id === "model-casting") {
      extra += '<p class="g6-note reveal">Casting draws on the <a href="g6-models.html">G6 Models roster</a> and open calls.</p>';
    }
    // Music/Video: render only if a real reel URL/media exists.
    if (id === "music-video-production") {
      if (s.reelUrl) extra += '<div class="g6-reel reveal">' + youtubeHTML(s.reelUrl, "Sample reel") + "</div>";
      else if (s.reelMedia && (s.reelMedia.src || s.reelMedia.poster)) extra += '<div class="g6-reel reveal">' + g6Media(s.reelMedia, { ratioClass: "media--wide" }) + "</div>";
    }

    var contactHref = "g6-contact.html?service=" + encodeURIComponent(s.name);
    mount.innerHTML =
      '<section class="section page-title g6-page-title"><div class="container g6-container">' +
      '<p class="g6-crumb"><a href="g6-services.html">Services</a> <span>/</span> ' + esc(s.name) + "</p>" +
      "<h1>" + esc(s.name) + "</h1>" +
      (s.overview ? '<p class="page-sub g6-overview">' + esc(s.overview) + "</p>" : "") +
      "</div></section>" +

      '<section class="section"><div class="container g6-container g6-service-grid">' +
      '<div class="g6-service-col reveal"><h2 class="g6-subhead">Process</h2><ol class="g6-steps">' + process + "</ol></div>" +
      '<div class="g6-service-col reveal"><h2 class="g6-subhead">Deliverables</h2><ul class="g6-deliverables">' + deliverables + "</ul>" +
      (s.pricingNote ? '<p class="g6-pricing">' + esc(s.pricingNote) + "</p>" : "") + "</div>" +
      "</div></section>" +

      // editorial media feature
      '<section class="section"><div class="container g6-container"><div class="g6-feature-media reveal"><div class="g6-feature-media-inner">' +
      g6Media(s.media || {}, { ratioClass: "media--wide" }) + "</div></div>" +
      extra + "</div></section>" +

      // filtered portfolio — omit the whole module when no media exists
      (projects.length ? '<section class="section"><div class="container g6-container">' +
      '<div class="section-head reveal"><h2>Selected ' + esc(s.name) + " Work</h2>" +
      '<a class="g6-viewall" href="g6-work.html?filter=' + encodeURIComponent(id) + '">View all ' + G6_ARROW + "</a></div>" +
      g6PortfolioGrid(projects) +
      "</div></section>" : "") +

      // service CTA
      '<section class="g6-closing reveal"><a class="g6-closing-inner" href="' + attr(contactHref) + '"><div class="container g6-container">' +
      '<p class="g6-closing-kicker">' + esc(s.name) + "</p>" +
      "<h2>" + esc(s.ctaLabel || "Start a Project") + "</h2>" +
      '<span class="g6-closing-cta">' + esc(s.ctaLabel || "Start a Project") + " " + G6_ARROW + "</span>" +
      "</div></a></section>";

    document.title = s.name + " \u2014 G6 Agency";
  }

  /* ---------- page: WORK (master grid + filters) ---------- */
  function renderG6Work() {
    var mount = document.getElementById("g6-mount");
    var idx = g6ProjectsIndex();
    var svcs = (state.g6 && state.g6.services) || [];
    var params = new URLSearchParams(location.search);
    var initFilter = params.get("filter") || "all";
    var initType = params.get("type") || "all";

    var filters = [{ id: "all", label: "All" }].concat(svcs.map(function (s) { return { id: s.id, label: s.name }; }));
    var typeFilters = [{ id: "all", label: "All media" }, { id: "photo", label: "Photo" }, { id: "video", label: "Video" }];

    var chips = filters.map(function (f) {
      return '<button type="button" class="g6-chip" data-filter="' + attr(f.id) + '"' + (f.id === initFilter ? ' aria-pressed="true"' : ' aria-pressed="false"') + ">" + esc(f.label) + "</button>";
    }).join("");
    var typeChips = typeFilters.map(function (f) {
      return '<button type="button" class="g6-chip g6-chip--type" data-type="' + attr(f.id) + '"' + (f.id === initType ? ' aria-pressed="true"' : ' aria-pressed="false"') + ">" + esc(f.label) + "</button>";
    }).join("");

    mount.innerHTML =
      '<section class="section page-title g6-page-title"><div class="container g6-container">' +
      "<h1>Work</h1>" +
      '<p class="page-sub">Selected work across styling, casting, direction, shopping and production.</p>' +
      '<div class="g6-filters" role="group" aria-label="Filter work by service">' + chips + "</div>" +
      '<div class="g6-filters g6-filters--type" role="group" aria-label="Filter work by media type">' + typeChips + "</div>" +
      "</div></section>" +
      '<section class="section"><div class="container g6-container">' + g6PortfolioGrid(idx.all) + '<p class="g6-empty" id="g6-noresults" hidden>No work matches those filters yet.</p></div></section>';

    // client-side filtering (no reload)
    var curFilter = initFilter, curType = initType;
    function apply() {
      var items = mount.querySelectorAll(".g6-pf-item");
      var shown = 0;
      Array.prototype.forEach.call(items, function (it) {
        var okS = curFilter === "all" || it.getAttribute("data-service") === curFilter;
        var okT = curType === "all" || it.getAttribute("data-type") === curType;
        var show = okS && okT;
        it.hidden = !show;
        if (show) shown++;
      });
      var nr = document.getElementById("g6-noresults");
      if (nr) nr.hidden = shown !== 0;
    }
    mount.querySelectorAll(".g6-chip[data-filter]").forEach(function (b) {
      b.addEventListener("click", function () {
        curFilter = b.getAttribute("data-filter");
        mount.querySelectorAll(".g6-chip[data-filter]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        apply();
      });
    });
    mount.querySelectorAll(".g6-chip[data-type]").forEach(function (b) {
      b.addEventListener("click", function () {
        curType = b.getAttribute("data-type");
        mount.querySelectorAll(".g6-chip[data-type]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        apply();
      });
    });
    apply();
    document.title = "Work \u2014 G6 Agency";
  }

  /* ---------- page: MODELS roster ---------- */
  function renderG6Models() {
    var mount = document.getElementById("g6-mount");
    var models = (state.g6 && state.g6.models) || {};
    var roster = models.roster || [];
    var cards;
    if (roster.length) {
      cards = '<div class="g6-roster">' + roster.map(function (m) {
        var stats = [];
        if (m.location) stats.push(esc(m.location));
        if (m.measurements) stats.push(esc(m.measurements));
        return (
          '<article class="g6-model reveal">' +
          '<div class="g6-model-media">' + g6Media(m.image || {}, { ratioClass: "media--cover" }) + "</div>" +
          ((m.name || stats.length || m.instagram) ? '<div class="g6-model-body">' +
          (m.name ? '<h3>' + esc(m.name) + "</h3>" : "") +
          (stats.length ? '<p class="g6-model-stats">' + stats.join(" · ") + "</p>" : "") +
          (m.instagram ? '<a class="g6-model-link" href="' + attr(m.instagram) + '" target="_blank" rel="noopener">Instagram</a>' : "") +
          "</div>" : "") + "</article>"
        );
      }).join("") + "</div>";
    } else { cards = ""; }
    mount.innerHTML =
      '<section class="section page-title g6-page-title"><div class="container g6-container">' +
      "<h1>G6 Models</h1>" +
      (models.intro ? '<p class="page-sub">' + esc(models.intro) + "</p>" : "") +
      '<p style="margin-top:18px"><a class="btn btn--fill" href="g6-apply.html">Apply to G6 Models</a></p>' +
      "</div></section>" +
      '<section class="section"><div class="container g6-container">' + cards + "</div></section>" +
      g6ClosingEl();
    document.title = "G6 Models \u2014 G6 Agency";
  }

  /* ---------- page: APPLY ---------- */
  function renderG6Apply() {
    var mount = document.getElementById("g6-mount");
    var apply = (state.g6 && state.g6.apply) || {};
    mount.innerHTML =
      '<section class="section page-title g6-page-title"><div class="container g6-container container--narrow-g6">' +
      "<h1>Apply to G6 Models</h1>" +
      (apply.intro ? '<p class="page-sub">' + esc(apply.intro) + "</p>" : "") +
      "</div></section>" +
      '<section class="section"><div class="container g6-container container--narrow-g6">' +
      '<form class="g6-form" novalidate>' +
      '<div class="g6-form-grid">' +
      g6InputHTML("name", "Full name", "text", true) +
      g6InputHTML("email", "Email", "email", true) +
      g6InputHTML("phone", "Phone", "tel", false) +
      g6InputHTML("location", "Location", "text", false) +
      g6InputHTML("instagram", "Instagram / portfolio link", "url", false) +
      g6InputHTML("measurements", "Height / measurements (optional)", "text", false) +
      g6TextareaHTML("experience", "Experience & any representation", false) +
      "</div>" +
      '<div class="g6-form-notice" id="g6-notice" hidden></div>' +
      '<button class="btn btn--fill g6-submit" type="submit">Submit application</button>' +
      '<p class="g6-form-fine">By submitting you agree to be contacted about representation. Everything you enter is your own information.</p>' +
      "</form></div></section>";
    wireG6Form(mount.querySelector(".g6-form"), apply.email || ((state.g6 && state.g6.contact && state.g6.contact.email) || ""), "Apply", mount.querySelector("#g6-notice"), apply.fallbackEmail || ((state.g6 && state.g6.contact && state.g6.contact.fallbackEmail) || "contact@archvemag.com"));
    document.title = "Apply \u2014 G6 Models";
  }

  /* ---------- page: CONTACT / inquiry ---------- */
  function renderG6Contact() {
    var mount = document.getElementById("g6-mount");
    var contact = (state.g6 && state.g6.contact) || {};
    var svcs = ((state.g6 && state.g6.services) || []).map(function (s) { return s.name; });
    var preselect = new URLSearchParams(location.search).get("service") || "";
    // normalise a preselect that arrived as an id
    if (preselect && svcs.indexOf(preselect) === -1) {
      var byId = g6ServiceById(preselect);
      if (byId) preselect = byId.name;
    }
    mount.innerHTML =
      '<section class="section page-title g6-page-title"><div class="container g6-container container--narrow-g6">' +
      "<h1>Start a Project</h1>" +
      (contact.intro ? '<p class="page-sub">' + esc(contact.intro) + "</p>" : "") +
      "</div></section>" +
      '<section class="section"><div class="container g6-container container--narrow-g6">' +
      '<form class="g6-form" novalidate>' +
      '<div class="g6-form-grid">' +
      g6InputHTML("name", "Name", "text", true) +
      g6InputHTML("email", "Email", "email", true) +
      g6InputHTML("company", "Company / artist", "text", false) +
      g6SelectHTML("service", "Service", svcs, preselect) +
      g6SelectHTML("budget", "Budget range", contact.budgets || [], "") +
      g6SelectHTML("timeline", "Desired timeline", contact.timelines || [], "") +
      g6TextareaHTML("description", "Project description", true) +
      "</div>" +
      '<div class="g6-form-notice" id="g6-notice" hidden></div>' +
      '<button class="btn btn--fill g6-submit" type="submit">Send inquiry</button>' +
      "</form></div></section>";
    wireG6Form(mount.querySelector(".g6-form"), contact.email || "", "Project inquiry", mount.querySelector("#g6-notice"), contact.fallbackEmail || "contact@archvemag.com");
    document.title = "Contact \u2014 G6 Agency";
  }

  function renderG6() {
    var view = (document.body.getAttribute("data-view")) || "home";
    if (view === "home") renderG6Home();
    else if (view === "services") renderG6Services();
    else if (view === "service") renderG6Service(document.body.getAttribute("data-service") || "");
    else if (view === "work") renderG6Work();
    else if (view === "models") renderG6Models();
    else if (view === "apply") renderG6Apply();
    else if (view === "contact") renderG6Contact();
    else renderG6Home();
    wireImages(document);
    wireReveal();
    wireSmartHeader();
  }

  function bootG6() {
    // G6 content is inline (#page-data); chrome is the shared site.json.
    var inlineG6 = readInline("page-data");
    var g6P = inlineG6
      ? Promise.resolve(inlineG6)
      : fetch("content/g6.json").then(function (r) { return r.json(); });
    Promise.all([loadSite(), g6P]).then(function (a) {
      state.site = a[0]; state.g6 = a[1];
      renderHeader();
      renderFooter();
      renderG6();
    }).catch(function (err) {
      console.error("G6 failed to load content:", err);
      renderHeaderSafe();
      loadError("g6-mount");
    });
  }


  function boot() {
    var page = (document.body && document.body.getAttribute("data-page")) || "home";
    if (page === "home") { bootHome(); return; }
    if (page === "g6") { bootG6(); return; }
    if (page === "search") { bootSearch(); return; }
    if (page === "static-article") { bootStaticArticle(); return; }
    var slug = (document.body.getAttribute("data-slug")) || "";
    bootPage(page, slug);
  }

  wireTallyTriggers();
  ensureTallyScript().catch(function () { /* direct-link fallback remains available */ });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
