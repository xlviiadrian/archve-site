
/* ============================================================
   ARCHVE — configuration
   ------------------------------------------------------------
   1) STRIPE — paste your Stripe Payment Links (no API keys
      needed). Create them at dashboard.stripe.com > Payment
      Links, then drop the https://buy.stripe.com/... URL in.
   2) TALLY — Submit / Pitch and Get on the List now open
      separate Tally popups configured below.
   Stripe buttons open your live Stripe checkout link.
   ============================================================ */

  // --- Stripe Payment Links (hosted checkout, no keys required) ---
  const STRIPE = {
    // SHOP — one payment link per product
    sticker_dropi:  "https://buy.stripe.com/28E4gz7EQ5BBceV6F4fjG00",
    sticker_houston:"https://buy.stripe.com/28E4gz7EQ5BBceV6F4fjG00",
    sticker_proof:  "https://buy.stripe.com/28E4gz7EQ5BBceV6F4fjG00",
    sticker_vol1:   "https://buy.stripe.com/28E4gz7EQ5BBceV6F4fjG00",
    shirt_archve:   "https://buy.stripe.com/28E4gz7EQ5BBceV6F4fjG00",

    // SUPPORT ARCHVE — connected to your live Stripe Payment Link.
    donate_10:      "https://buy.stripe.com/28E4gz7EQ5BBceV6F4fjG00",
    donate_25:      "https://buy.stripe.com/28E4gz7EQ5BBceV6F4fjG00",
    donate_50:      "https://buy.stripe.com/28E4gz7EQ5BBceV6F4fjG00",
    donate_custom:  "https://buy.stripe.com/28E4gz7EQ5BBceV6F4fjG00"
  };


/* ============================================================ */

  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');
  const isSet = v => v && !String(v).startsWith("REPLACE");
  const $ = s => document.querySelector(s);
  const flashEl = $("#flash");
  let flashT;
  function flash(html){
    flashEl.innerHTML = html;
    flashEl.classList.add("show");
    clearTimeout(flashT);
    flashT = setTimeout(()=>flashEl.classList.remove("show"), 4200);
  }
  function goStripe(key, label){
    const url = STRIPE[key];
    if(isSet(url)){ window.open(url, "_blank", "noopener"); }
    else { flash(`Stripe link not set for <b>${label}</b> &mdash; add it at <b>STRIPE.${key}</b> in the script.`); }
  }

  // --- Tally popups ---
  // Pitch / media submission form.
  const TALLY_PITCH_ID = "eqoRyO";
  const TALLY_LINK = `#tally-open=${TALLY_PITCH_ID}&tally-align-left=1&tally-overlay=1&tally-emoji-animation=none&tally-auto-close=0`;
  const TALLY_ATTR = `data-tally-open="${TALLY_PITCH_ID}" data-tally-align-left="1" data-tally-overlay="1" data-tally-emoji-animation="none" data-tally-auto-close="0"`;

  // Newsletter / get on the list form.
  const TALLY_LIST_ID = "kdrEPd";
  const TALLY_LIST_LINK = `#tally-open=${TALLY_LIST_ID}&tally-layout=modal&tally-overlay=1&tally-auto-close=0`;
  const TALLY_LIST_ATTR = `data-tally-open="${TALLY_LIST_ID}" data-tally-layout="modal" data-tally-overlay="1" data-tally-auto-close="0"`;

  document.getElementById("yr").textContent = new Date().getFullYear();

  const INK="#0C0C0B", PAPER="#E6E5E0", MUTE="#9b9a93";

  const REZO_STORY = {
    title:"Rezoworld’s Supreme × DJ Screw collab brings the S.U.C. to Spring 2026",
    cat:"Culture",
    channel:"ARCHVE",
    href:"supreme-dj-screw.html",
    thumb:"assets/images/editorial/rezothumbnail.jpg",
    dek:"Supreme, DJ Screw, and the Screwed Up Click meet inside a Spring 2026 drop rooted in Houston’s living archive."
  };
  const G6_FORM_LINK = "https://docs.google.com/forms/d/e/1FAIpQLSeC02ZKjiJwIJSuYlCjeggBHcpgk6Ec9dm6ggkbbaxkzjV35g/viewform";

/* ---- editable image asset helpers ----
   Replace the files in /assets/images/ or update the img paths in the arrays below.
   If an image is missing, the original generated SVG art stays visible as a fallback.
*/
function safeAlt(t){ return String(t||"").replace(/"/g,"&quot;"); }
function assetWithFallback(src, alt, fallbackMarkup){
  const fallback = String(fallbackMarkup).replace("<svg ", '<svg class="fallback-svg" ');
  return `<img class="asset-img" src="${src}" alt="${safeAlt(alt)}" loading="lazy" onerror="this.style.display='none'">${fallback}`;
}
function coverAsset(src, alt, kind){ return assetWithFallback(src, alt, cover(kind)); }
function productAsset(src, alt, fallbackMarkup){ return assetWithFallback(src, alt, fallbackMarkup); }

  /* ---- mobile nav ---- */
  const burger = $("#burger"), nav = $("#nav");
  burger.addEventListener("click", ()=>{
    const open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
    burger.textContent = open ? "Close" : "Menu";
    document.body.style.overflow = open ? "hidden" : "";
  });
  nav.querySelectorAll("[data-close]").forEach(a=>a.addEventListener("click",()=>{
    nav.classList.remove("open"); burger.setAttribute("aria-expanded","false"); burger.textContent="Menu"; document.body.style.overflow="";
  }));

  /* ---- ticker ---- */
  const tickerItems = ["ARCHVE magazine","Houston music, style, and culture","Open call for stories",
    "Reader-funded, advertiser-free","Issue 001 in production","Subscribe for first access"];
  const tline = tickerItems.map(t=>`<span>${t}</span><span class="dot">/</span>`).join("");
  $("#ticker").innerHTML = tline + tline;

  /* ---- generated editorial covers (branded, on-theme, no stock photos) ---- */
  function cover(kind){
    const ticks = c => `<g stroke="${c}" stroke-width="3">
      <path d="M14 14h26M14 14v26" fill="none"/><path d="M586 14h-26M586 14v26" fill="none"/>
      <path d="M14 324h26M14 324v-26" fill="none"/><path d="M586 324h-26M586 324v-26" fill="none"/></g>`;
    const A = {
      lead:[`<rect width="600" height="338" fill="${INK}"/>
        <text x="300" y="216" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="240" fill="#191918">001</text>
        <text x="300" y="190" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="120" fill="${PAPER}" letter-spacing="-4">ARCH<tspan fill="${MUTE}">·</tspan>VE</text>
        <text x="300" y="236" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="15" fill="${MUTE}" letter-spacing="2">A raw cultural Houston</text>`, PAPER],
      noise:[`<rect width="600" height="338" fill="${INK}"/>
        <g fill="${PAPER}">${Array.from({length:34},(_,i)=>{const h=[28,60,110,52,140,80,170,46,120,200,90,150,64,210,120,70,180,40,100,160,76,220,110,58,140,96,182,50,130,200,84,150,66,108][i%34];return `<rect x="${24+i*16}" y="${300-h}" width="9" height="${h}"/>`}).join("")}</g>
        <text x="300" y="60" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="58" fill="${PAPER}">Noise</text>
        <text x="300" y="318" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="12" fill="${MUTE}" letter-spacing="2">Freq · Hou · 001</text>`, PAPER],
      threads:[`<rect width="600" height="338" fill="${PAPER}"/>
        <g stroke="${INK}" stroke-width="1.4" opacity=".5">${Array.from({length:9},(_,i)=>`<line x1="${60+i*60}" y1="20" x2="${60+i*60}" y2="318"/>`).join("")}${Array.from({length:5},(_,i)=>`<line x1="20" y1="${50+i*60}" x2="580" y2="${50+i*60}"/>`).join("")}</g>
        <path d="M40 300 Q300 120 560 300" stroke="${INK}" stroke-width="3" fill="none" stroke-dasharray="2 10"/>
        <text x="300" y="200" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="120" fill="${INK}">Cut</text>
        <text x="300" y="232" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="13" fill="${INK}" letter-spacing="2">Pattern 001</text>`, INK],
      frame:[`<rect width="600" height="338" fill="${INK}"/>
        <rect x="60" y="40" width="480" height="258" fill="none" stroke="${PAPER}" stroke-width="2"/>
        <g fill="${PAPER}" opacity=".14">${Array.from({length:88},(_,i)=>`<circle cx="${72+(i%22)*22}" cy="${56+Math.floor(i/22)*60}" r="6"/>`).join("")}</g>
        <text x="300" y="195" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="78" fill="${PAPER}">Frame</text>
        <text x="300" y="226" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="13" fill="${PAPER}" letter-spacing="2">Exp · 001 / Night Shift</text>`, PAPER],
      red:[`<rect width="600" height="338" fill="${PAPER}"/>
        <text x="300" y="150" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="120" fill="${INK}">Hou</text>
        <text x="300" y="210" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="18" fill="${INK}" letter-spacing="4">29.76°N / 95.37°W</text>
        <text x="300" y="262" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="40" fill="${MUTE}">ARCHVE</text>`, INK],
      mono:[`<rect width="600" height="338" fill="${INK}"/>
        <circle cx="300" cy="169" r="118" fill="none" stroke="${PAPER}" stroke-width="3"/>
        <circle cx="300" cy="169" r="78" fill="none" stroke="${PAPER}" stroke-width="1" opacity=".4"/>
        <text x="300" y="158" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="70" fill="${PAPER}">Open</text>
        <text x="300" y="200" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="38" fill="${MUTE}">Call</text>`, PAPER]
    };
    const [art,tickCol] = A[kind]||A.lead;
    return `<svg viewBox="0 0 600 338" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${art}${ticks(tickCol)}</svg>`;
  }
  // lead cover injected into hero
  document.querySelector('[data-cover="lead"]').insertAdjacentHTML("afterbegin", coverAsset("assets/images/editorial/hero-cover.png", "ARCHVE Issue 001 cover image", "lead"));

  /* ---- secondary feature cards ----
     Randomly filled from tabs/cards across the site on every page load.
     The final selected items are stored in `features` so the search overlay can index them.
  */
  let features = [];

  /* ---- section rows (editorial previews) ---- */
  const rows = {
    noise:[
      {cat:"Music Video",art:"noise",img:"https://i.ytimg.com/vi/1zfrMs4jm9Q/maxresdefault.jpg",no:"MV-101",head:"SippinWesson - NEW 55",dek:"Official music video.",href:"https://www.youtube.com/watch?v=1zfrMs4jm9Q&list=RD1zfrMs4jm9Q&start_radio=1"},
      {cat:"Music Video",art:"noise",img:"https://i.ytimg.com/vi/w__kDsMI9Dw/maxresdefault.jpg",no:"MV-102",head:"Rome is No Fun - Familiar (Official Music Video)",dek:"Official music video.",href:"https://www.youtube.com/watch?v=w__kDsMI9Dw&list=RDw__kDsMI9Dw&start_radio=1"},
      {cat:"Music Video",art:"noise",img:"https://i.ytimg.com/vi/FF2z9p3kDrI/maxresdefault.jpg",no:"MV-103",head:"SOLOW /w @destin_laurel",dek:"Video feature.",href:"https://www.youtube.com/watch?v=FF2z9p3kDrI"},
      {cat:"Music Video",art:"noise",img:"https://i.ytimg.com/vi/cvupW6d5nBA/maxresdefault.jpg",no:"MV-104",head:"The Szns - Big Body",dek:"Official music video.",href:"https://www.youtube.com/watch?v=cvupW6d5nBA&list=RDcvupW6d5nBA&start_radio=1"},
      {cat:"Music Video",art:"noise",img:"https://i.ytimg.com/vi/WceFD9vakgo/maxresdefault.jpg",no:"MV-105",head:"KEVIN ABSTRACT - H-TOWN",dek:"Official music video.",href:"https://www.youtube.com/watch?v=WceFD9vakgo"}
    ],
    threads:[
      {cat:"Fashion",art:"threads",img:"assets/images/editorial/g6modelapplicationform.jpg",no:"AR-201",head:"G6 Model Release & Registration Form",dek:"Please complete this form to submit your model information for G6. This information will be used for registration, identification, scheduling, and communication related to upcoming shoots, projects, or production opportunities. Please make sure all details are accurate and match your official identification documents.",href:G6_FORM_LINK},
      {cat:"Culture",art:"frame",img:REZO_STORY.thumb,no:"AR-202",head:REZO_STORY.title,dek:REZO_STORY.dek,href:REZO_STORY.href}
    ],
  };
  Object.entries(rows).forEach(([key,items])=>{
    const el = document.querySelector(`[data-row="${key}"]`);
    if(!el) return;
    el.innerHTML = items.map(it=>{
      const href = it.href || TALLY_LINK;
      const attrs = it.href ? 'target="_blank" rel="noopener"' : TALLY_ATTR;
      const byline = it.href ? 'Open form' : 'In Issue 001 · Preview';
      return `
      <a class="acard reveal" href="${href}" ${attrs}>
        <div class="cover">${coverAsset(it.img, it.head, it.art)}<span class="frameno">Ref·${it.no}</span></div>
        <span class="kick">${it.cat}</span>
        <h3>${it.head}</h3>
        <p class="adek">${it.dek}</p>
        <p class="byline">${byline}</p>
      </a>`;
    }).join("");
  });

  /* ---- VIDEO section ----
     Paste a YouTube link OR a bare video ID into `youtube` for each item.
     Accepts: https://youtu.be/ID, https://www.youtube.com/watch?v=ID,
     https://www.youtube.com/shorts/ID, or just the ID itself.
     Leave `youtube` empty ("") to show a placeholder tile.
  */
  const videos = [
    {cat:"Screwtape",   title:"DJ Screw — Fat Pat Freestyle (I Wanna Be Free) · Wineberry Over Gold", channel:"DJ Screw", youtube:"https://www.youtube.com/watch?v=gBvPJEwFw3U"},
    {cat:"Short",       title:"@playerunderpressure_", channel:"@playerunderpressure_", youtube:"https://youtube.com/shorts/oKHiiqsDVBY?si=U_JkKqq0bRV63pKD", thumb:"assets/images/editorial/playerunderpressure-thumbnail.jpg"},
    {cat:"Short",       title:'"Remember When I Was A Have Not" @hunnidmillso', channel:"@playerunderpressure_", youtube:"https://youtube.com/shorts/7pbR9KsFXx8"},
    {cat:"Music Video", title:"NEW 55", channel:"SippinWesson", youtube:"https://www.youtube.com/watch?v=1zfrMs4jm9Q"},
    {cat:"Release",     title:'"CHEPÉ" — Out Now', channel:"SippinWesson", list:"OLAK5uy_kvYAt2Izi9pzL4eCxz5f79u3kE3x1m-DA", thumb:"assets/images/editorial/chepe-sippinwesson-thumbnail.jpg"},
    {cat:"Collab",      title:"Faded Decade x Houston Texans Collab (Extended)", channel:"Faded Decade", youtube:"https://www.youtube.com/watch?v=oPMQp8sBjIM"},
    {cat:"Session",     title:"Good Summer Session", channel:"Faded Decade", youtube:"https://www.youtube.com/watch?v=A-yTmI7GjfY"},
    {cat:"BTS",         title:"BTS for WNGOAFP", channel:"Always November", youtube:"https://www.youtube.com/watch?v=KFQe0u-SinQ"},
    {cat:"Music Video", title:"We're Not Going On A F***ing Picnic", channel:"Always November", youtube:"https://www.youtube.com/watch?v=xhe-IE8uTPw"},
    {cat:"Music Video", title:"Faded Boy", channel:"Always November", youtube:"https://www.youtube.com/watch?v=fqXBL7YXVUo"},
    {cat:"Music Video", title:"Familiar", channel:"Rome Is No Fun", youtube:"https://www.youtube.com/watch?v=w__kDsMI9Dw"},
    {cat:"BTS",         title:'BTS of "Gin & Juice"', channel:"DRODi feat. Le$", youtube:"https://www.youtube.com/watch?v=UI1r1KcCg-8"},
    {cat:"BTS",         title:'Unreleased "Accessories" (feat. Peso Peso)', channel:"That Mexican OT", youtube:"https://www.youtube.com/watch?v=H1Gr4bi4ebM"},
    {cat:"BTS",         title:'BTS of "Guidance" (feat. Sauce Walka & Hogg Booma)', channel:"That Mexican OT", youtube:"https://www.youtube.com/watch?v=d7Prselxm08"},
    {cat:"BTS",         title:"New Video BTS (feat. That Mexican OT & MG Lil Bubba)", channel:"Bravo The Bag Chaser", youtube:"https://www.youtube.com/watch?v=IHgE65N8xng"},
    {cat:"BTS",         title:'BTS "Trill Gon Last" (feat. Paul Wall)', channel:"OC Chris", youtube:"https://www.youtube.com/watch?v=PbvE27noh-o"},
    {cat:"Clip",        title:"NOT", channel:"ARCHVE", youtube:"https://www.youtube.com/watch?v=gBVjc5X8DKM"},
    {cat:"Clip",        title:"NOT", channel:"ARCHVE", youtube:"https://www.youtube.com/watch?v=dBYCOQ-fNqo"},
    {cat:"BTS",         title:"Warren Lotus x Houston Texans BTS", channel:"ARCHVE", youtube:"https://www.youtube.com/watch?v=18s02NEC84k"},
    {cat:"Throwback",   title:"Bun B Interviews DJ Screw at the Original Screw Shop", channel:"S.U.C.", youtube:"https://www.youtube.com/watch?v=Al26am6FEwY"},
    {cat:"Throwback",   title:"DJ Screw & The S.U.C. Explain Their History", channel:"S.U.C.", youtube:"https://www.youtube.com/watch?v=zTE9kQVfFEk"},
    {cat:"Throwback",   title:"DJ Screw, Big Hawk & Al-D @ Screw's House", channel:"S.U.C.", youtube:"https://www.youtube.com/watch?v=J5OBbEbEIfE", thumb:"assets/images/editorial/dj-screw-big-hawk-al-d-thumbnail.jpg"},
    {cat:"Interview",   title:"On Trae Fight, Texas Over California, Life After Lean & More", channel:"Z-Ro", youtube:"https://www.youtube.com/watch?v=TdcZGoo8Ds8"},
    {cat:"Interview",   title:"Lil' Flip & Z-Ro — Houston vs Atlanta & More", channel:"Drink Champs", youtube:"https://www.youtube.com/watch?v=dF-pThGF6_8"},
    {cat:"Music Video", title:"I Can't Leave Drank Alone", channel:"Z-Ro & Lil O", youtube:"https://youtu.be/b2Nu8RVhpwY?si=FrOLD5PkJlBqGh8f", thumb:"assets/images/editorial/zro-i-cant-leave-drank-alone-thumbnail.jpg"},
    {cat:"Interview",   title:"Pimp C Interview (Exclusive) with Bun B", channel:"UGK", youtube:"https://www.youtube.com/watch?v=4Lt-Bx-41sU"},
    {cat:"Throwback",   title:'On the Set of "Int\'l Players Anthem" (feat. OutKast, Juicy J & More)', channel:"UGK", youtube:"https://www.youtube.com/watch?v=ULfWfV9LtpA"}
  ];
  function ytId(input){
    if(!input) return "";
    const s = String(input).trim();
    if(/^[\w-]{11}$/.test(s)) return s; // already a bare ID
    const m = s.match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/)([\w-]{11})/);
    return m ? m[1] : "";
  }
  // Fisher–Yates: return a freshly shuffled copy (runs on every page load)
  function shuffled(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]]; }
    return a;
  }
  function videoThumb(v){
    const id = ytId(v.youtube);
    return v.thumb || (id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : "");
  }
  function videoHref(v){
    if(v.youtube) return v.youtube;
    if(v.list) return `https://www.youtube.com/playlist?list=${v.list}`;
    return "#noise";
  }
  // Labeled rows. Each row pulls every video whose `cat` is in `cats`.
  // Row titles link to their section; repoint hrefs to real category pages when they exist.
  const VIDEO_ROWS = [
    {label:"Music Videos",            href:"#noise", cats:["Music Video"]},
    {label:"Behind The Scenes",       href:"#noise", cats:["BTS"]},
    {label:"Interviews",              href:"#noise", cats:["Interview"]},
    {label:"Screwtapes & Throwbacks", href:"#noise", cats:["Screwtape","Throwback"]},
    {label:"Shorts & Clips",          href:"#noise", cats:["Short","Clip"]},
    {label:"Sessions & Releases",     href:"#noise", cats:["Session","Release","Collab"]}
  ];
  function videoCardHTML(v){
    const id   = ytId(v.youtube);
    const list = v.list || "";
    // Strip YouTube's own thumbnail for the tile; maxres when available, hq as fallback.
    const thumb = videoThumb(v);
    const embed = id
      ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
      : list ? `https://www.youtube-nocookie.com/embed/videoseries?list=${list}&autoplay=1&rel=0` : "";
    const face = embed
      ? `<button class="video-embed video-facade" data-embed="${embed}" data-title="${safeAlt(v.title)}" aria-label="Play ${safeAlt(v.title)}">
           ${thumb
             ? `<img class="video-thumb" src="${thumb}" alt="${safeAlt(v.title)}" loading="lazy" decoding="async" ${v.thumb ? '' : `onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${id}/hqdefault.jpg'"`}>`
             : `<span class="video-thumb thumb-missing" aria-hidden="true"><b>${safeAlt(v.channel)}</b></span>`}
           <span class="play-btn" aria-hidden="true"></span>
         </button>`
      : `<div class="video-embed video-empty"><span class="play-glyph" aria-hidden="true">▶</span><span class="video-hint">Paste a YouTube link in <b>site.js → videos[]</b></span></div>`;
    return `<article class="vcard reveal">
      ${face}
      <span class="kick">${v.cat}</span>
      <h3>${v.title}</h3>
      <p class="byline">${v.channel} · Video</p>
    </article>`;
  }
  function hrefAttrs(href){
    if(!href) return TALLY_ATTR;
    return /^https?:\/\//i.test(href) ? 'target="_blank" rel="noopener"' : '';
  }
  function featureCardHTML(f){
    const href = f.href || TALLY_LINK;
    const attrs = f.href ? hrefAttrs(f.href) : TALLY_ATTR;
    const byline = f.byline || (f.channel ? `${safeAlt(f.channel)} · Video` : "ARCHVE · Selected");
    return `
      <a class="acard reveal" href="${href}" ${attrs}>
        <div class="cover">${coverAsset(f.img, f.head, f.art || "mono")}<span class="frameno">${f.no || ""}</span></div>
        <span class="kick">${f.cat || "ARCHVE"}</span>
        <h3>${f.head}</h3>
        <p class="adek">${f.dek || ""}</p>
        <p class="byline">${byline}</p>
      </a>`;
  }
  function renderRandomFeatureTabs(){
    const el = document.getElementById("features");
    if(!el) return;

    const rowCards = Object.values(rows || {}).flat().map(it => ({
      cat: it.cat,
      art: it.art,
      img: it.img,
      no: it.no ? `Ref·${it.no}` : "",
      head: it.head,
      dek: it.dek,
      href: it.href,
      byline: it.href ? (/^https?:\/\//i.test(it.href) ? "Open link" : "Read story") : "In Issue 001 · Preview"
    }));

    const videoCards = (videos || []).map(v => ({
      cat: v.cat,
      art: "noise",
      img: videoThumb(v) || "assets/images/editorial/feature-music.png",
      no: "Video",
      head: v.title,
      dek: `${v.channel} · ${v.cat}`,
      href: videoHref(v),
      channel: v.channel,
      byline: `${v.channel} · Video`
    }));

    const editorialCards = [
      {
        cat: REZO_STORY.cat,
        art: "frame",
        img: REZO_STORY.thumb,
        no: "Story",
        head: REZO_STORY.title,
        dek: REZO_STORY.dek,
        href: REZO_STORY.href,
        byline: "Read story"
      }
    ];

    const pool = [...rowCards, ...videoCards, ...editorialCards]
      .filter(card => card.head && card.img);

    features = shuffled(pool).slice(0, 3);
    el.innerHTML = features.map(featureCardHTML).join("");
  }
  renderRandomFeatureTabs();

  const latestFeed = $("#latestFeed");
  if(latestFeed){
    const latestCats = ["Music Video","Session","Release","Collab","Short","Clip","Screwtape","Throwback","BTS","Interview"];
    const mediaPool = shuffled(videos.filter(v => latestCats.includes(v.cat))).slice(0,6);
    const latestItems = [{...REZO_STORY, isStory:true}, ...mediaPool];
    latestFeed.innerHTML = latestItems.map(v => {
      const href = v.isStory ? v.href : videoHref(v);
      const thumb = v.thumb || videoThumb(v);
      const id = ytId(v.youtube || "");
      const img = thumb
        ? `<img src="${thumb}" alt="${safeAlt(v.title)}" loading="lazy" decoding="async" ${v.thumb || v.isStory ? '' : `onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${id}/hqdefault.jpg'"`}>`
        : `<span class="fallback"><b>${safeAlt(v.channel || "ARCHVE")}</b></span>`;
      return `<a class="ditem ditem-media" href="${href}" ${v.isStory ? '' : 'target="_blank" rel="noopener"'}>
          <div class="dthumb">${img}</div>
          <div class="dmeta">
            <div class="row"><span class="cat">${safeAlt(v.cat)}</span><span class="status">${safeAlt(v.channel || "ARCHVE")}</span></div>
            <h3>${v.title}</h3>
          </div>
        </a>`;
    }).join("");
  }

  const videoRows = $("#videoRows");
  if(videoRows){
    // Build each populated row with its items shuffled, then shuffle the row order too.
    const built = VIDEO_ROWS
      .map(r => ({label:r.label, href:r.href, items: shuffled(videos.filter(v => r.cats.includes(v.cat)))}))
      .filter(r => r.items.length);
    videoRows.innerHTML = shuffled(built).map(r => `
      <div class="sec-head sub-head">
        <div class="l"><a class="sec-title" href="${r.href}">${r.label}</a></div>
        <a class="seeall" href="${TALLY_LINK}" ${TALLY_ATTR}>See All →</a>
      </div>
      <div class="video-grid">
        ${r.items.map(videoCardHTML).join("")}
      </div>`).join("");
    // Click any tile → swap the stripped thumbnail for the live embed (event delegation).
    videoRows.addEventListener("click", e=>{
      const btn = e.target.closest(".video-facade");
      if(!btn) return;
      const src = btn.getAttribute("data-embed");
      if(!src) return;
      const live = document.createElement("div");
      live.className = "video-embed";
      live.innerHTML = `<iframe src="${src}" title="${btn.getAttribute("data-title")||""}" loading="lazy" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
      btn.replaceWith(live);
    });
  }

  /* ---- scroll reveal ---- */
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }});
  },{threshold:.14});
  document.querySelectorAll(".reveal").forEach(el=>io.observe(el));

  /* ---- SHOP products ---- */
  function stickerArt(kind){
    const f = {
      dropi:`<rect width="100%" height="100%" fill="${INK}"/>
        <text x="50%" y="54%" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="150" fill="${PAPER}" letter-spacing="-6">ARCH<tspan fill="${MUTE}">·</tspan>VE</text>
        <rect x="40%" y="63%" width="20%" height="3" fill="${PAPER}"/>`,
      houston:`<rect width="100%" height="100%" fill="${PAPER}"/>
        <text x="50%" y="40%" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="74" fill="${INK}">HOUSTON</text>
        <text x="50%" y="58%" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="20" fill="${INK}">29.76°N / 95.37°W</text>
        <text x="50%" y="74%" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="40" fill="${MUTE}">ARCHVE</text>`,
      proof:`<rect width="100%" height="100%" fill="${PAPER}"/>
        <rect x="14" y="14" width="272" height="272" fill="none" stroke="${INK}" stroke-width="2"/>
        <text x="50%" y="46%" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="58" fill="${INK}">NOT FOR</text>
        <text x="50%" y="62%" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="58" fill="${INK}">RESALE</text>
        <text x="50%" y="80%" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="16" fill="${INK}" letter-spacing="2">Proof · 001</text>`,
      vol1:`<rect width="100%" height="100%" fill="${INK}"/>
        <circle cx="150" cy="150" r="96" fill="none" stroke="${PAPER}" stroke-width="3"/>
        <text x="50%" y="44%" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="88" fill="${PAPER}">001</text>
        <text x="50%" y="60%" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="17" fill="${MUTE}" letter-spacing="2">Volume</text>
        <text x="50%" y="84%" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="13" fill="${PAPER}" letter-spacing="2">ARCHVE Est. Hou</text>`
    };
    return `<svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${f[kind]}</svg>`;
  }
  function shirtArt(){
    return `<svg viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${INK}"/>
      <g font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif">
        <text x="50" y="120" font-size="120" fill="${PAPER}" letter-spacing="-4">ARCH<tspan fill="${MUTE}">·</tspan>VE</text>
        <rect x="50" y="150" width="500" height="2" fill="${PAPER}"/>
        <text x="50" y="195" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="22" fill="#9b9a93" letter-spacing="2">A raw cultural Houston</text>
        <text x="50" y="225" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="22" fill="#9b9a93" letter-spacing="2">visual experience</text>
      </g>
      <text x="50" y="270" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="15" fill="${PAPER}" letter-spacing="2">Tee · Black · 100% cotton</text>
    </svg>`;
  }
  function bundleArt(){
    return `<svg viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${PAPER}"/>
      <rect x="14" y="14" width="572" height="272" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="6 8"/>
      <text x="50%" y="42%" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="58" fill="${INK}">Issue 001</text>
      <text x="50%" y="58%" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="58" fill="${INK}">Bundle</text>
      <text x="50%" y="76%" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, FranklinGothic, Arial Narrow, Arial, sans-serif" font-size="16" fill="${INK}" letter-spacing="2">Magazine + stickers + tee</text>
    </svg>`;
  }
  function comingSoonArt(){
    return `<svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="600" fill="${INK}"/>
      <rect x="28" y="28" width="544" height="544" fill="none" stroke="${PAPER}" stroke-width="6"/>
      <text x="300" y="280" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, Arial Narrow, Arial, sans-serif" font-size="86" fill="${PAPER}" letter-spacing="-4">COMING</text>
      <text x="300" y="370" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, Arial Narrow, Arial, sans-serif" font-size="86" fill="${PAPER}" letter-spacing="-4">SOON</text>
      <text x="300" y="438" text-anchor="middle" font-family="Franklin Gothic Regular, Franklin Gothic, Arial, sans-serif" font-size="16" fill="${MUTE}" letter-spacing="4">ARCHVE SHOP</text>
    </svg>`;
  }
  const products = Array.from({length:6}, (_,i)=>({
    id:`coming_soon_${i+1}`,
    name:"Coming soon",
    desc:"Coming soon",
    price:"Soon",
    img:"assets/images/products/coming-soon.svg",
    art:comingSoonArt(),
    no:`SHOP.${String(i+1).padStart(2,"0")}`,
    soon:true,
    wide:i>=4
  }));
  const grid = $("#shopGrid");
  grid.innerHTML = products.map(p=>`
    <article class="card${p.wide?" wide":""}${p.soon?" soon":""}">
      <div class="thumb" data-img>
        <span class="frameno">${p.no}</span>
        ${p.soon?'<span class="sold">Coming soon</span>':''}
        ${productAsset(p.img, p.name, p.art)}
      </div>
      <div class="card-body">
        <span class="card-name">${p.name}</span>
        <span class="card-desc">${p.desc}</span>
        <div class="card-foot">
          <span class="price">${p.price}</span>
          ${p.soon
            ? `<a class="btn btn-ink" href="${TALLY_LIST_LINK}" ${TALLY_LIST_ATTR}>Notify me</a>`
            : `<button class="btn btn-ink" data-buy="${p.id}" data-label="${p.name}">Buy now</button>`}
        </div>
      </div>
      ${p.soon?'':`<div class="replace-hint">Replace product image in assets/images/products</div>`}
    </article>`).join("");
  grid.querySelectorAll("[data-buy]").forEach(b=>b.addEventListener("click",()=>goStripe(b.dataset.buy,b.dataset.label)));

  /* ---- donation ---- */
  let amount = 25;
  const donateAmt = $("#donateAmt"), customAmt = $("#customAmt");
  function setAmt(v){ amount = v; donateAmt.textContent = "$"+v; }
  $("#amounts").addEventListener("click", e=>{
    const b = e.target.closest(".amt"); if(!b) return;
    document.querySelectorAll(".amt").forEach(x=>x.classList.remove("sel"));
    b.classList.add("sel"); customAmt.value=""; setAmt(parseInt(b.dataset.amt,10));
  });
  customAmt.addEventListener("input", ()=>{
    const v = parseInt(customAmt.value,10);
    if(v>0){ document.querySelectorAll(".amt").forEach(x=>x.classList.remove("sel")); setAmt(v); }
  });
  $("#donateBtn").addEventListener("click", ()=>{
    let key = amount===10?"donate_10":amount===25?"donate_25":amount===50?"donate_50":"donate_custom";
    goStripe(key, "Donation ($"+amount+")");
  });

  /* ---- Tally popups ----
     Submit / Pitch buttons open form eqoRyO.
     Get on the List / Subscribe / Newsletter / Notify me buttons open form kdrEPd.
     The Tally embed script is loaded in index.html inside <head>.
  */

  /* ============================================================
     SEARCH OVERLAY
     ------------------------------------------------------------
     Opens from the magnifier button in the masthead. Provides a
     live text search across editorial + video previews plus the
     browse-by-category list. Categories that map to an on-page
     section jump straight to it; the rest run a text filter.
     ============================================================ */
  (function(){
    const overlay = $("#searchOverlay");
    const input   = $("#searchInput");
    const results = $("#searchResults");
    const catCols = $("#catCols");
    const openBtn = document.querySelector(".search-btn");
    if(!overlay || !input || !openBtn) return;

    // map a category/section name to an on-page anchor
    const SECTION_BY_CAT = {
      "music":"#noise",
      "fashion":"#threads", "fashion & streetwear":"#threads",
      "culture":"#top",
      "video":"#noise", "documentary":"#noise",
      "shop":"#shop"
    };

    // ---- build a searchable index from existing site data ----
    const index = [];
    (features||[]).forEach(f=>index.push({title:f.head, cat:f.cat, dek:f.dek, target:SECTION_BY_CAT[(f.cat||"").toLowerCase()]||"#top"}));
    const rowTargets = {noise:"#noise", threads:"#threads"};
    Object.entries(rows||{}).forEach(([k,items])=>items.forEach(it=>index.push({title:it.head, cat:it.cat, dek:it.dek, target:rowTargets[k]||"#top"})));
    (videos||[]).forEach(v=>index.push({title:v.title, cat:v.cat, dek:"Video · "+v.channel, target:"#noise"}));
    (products||[]).forEach(p=>index.push({title:p.name, cat:"Shop", dek:p.desc, target:"#shop"}));

    // ---- categories shown in the browse list (from reference + ARCHVE sections) ----
    const CATEGORIES = [
      "Arts & Culture","Documentary","Drugs","Fashion & Streetwear","Food",
      "Health","Music","News","NSFW",
      "Shop","Sports","Technology","Travel","Video"
    ];
    catCols.innerHTML = CATEGORIES.map(c=>{
      const go = SECTION_BY_CAT[c.toLowerCase()] || "";
      return `<button class="cat-link" data-cat="${safeAlt(c)}"${go?` data-go="${go}"`:""}>${c}</button>`;
    }).join("");

    function openOverlay(){
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden","false");
      document.body.style.overflow="hidden";
      setTimeout(()=>input.focus(), 60);
    }
    function closeOverlay(){
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden","true");
      document.body.style.overflow="";
    }
    function jumpTo(target){
      closeOverlay();
      const el = target && document.querySelector(target);
      if(el) setTimeout(()=>el.scrollIntoView({behavior:"smooth", block:"start"}), 120);
    }

    function render(q){
      const query = (q||"").trim().toLowerCase();
      if(!query){ results.innerHTML=""; results.classList.remove("show"); return; }
      const hits = index.filter(it=>(
        (it.title||"").toLowerCase().includes(query) ||
        (it.cat||"").toLowerCase().includes(query) ||
        (it.dek||"").toLowerCase().includes(query)
      )).slice(0,8);
      results.classList.add("show");
      if(!hits.length){
        results.innerHTML = `<div class="search-empty">No results for “${safeAlt(q)}” yet — that coverage is coming in a future issue. <a href="${TALLY_LINK}" ${TALLY_ATTR}>Pitch us this story →</a></div>`;
        return;
      }
      results.innerHTML = hits.map(h=>`
        <button class="search-result" data-go="${h.target}">
          <span class="sr-cat">${h.cat||"ARCHVE"}</span>
          <span class="sr-title">${h.title}</span>
          ${h.dek?`<span class="sr-dek">${h.dek}</span>`:""}
        </button>`).join("");
      results.querySelectorAll(".search-result").forEach(b=>b.addEventListener("click",()=>jumpTo(b.dataset.go)));
    }

    // open / close wiring
    openBtn.addEventListener("click", openOverlay);
    overlay.querySelectorAll("[data-search-close]").forEach(el=>el.addEventListener("click", closeOverlay));
    document.addEventListener("keydown", e=>{ if(e.key==="Escape" && overlay.classList.contains("open")) closeOverlay(); });

    // live search
    input.addEventListener("input", ()=>render(input.value));

    // category interaction
    catCols.addEventListener("click", e=>{
      const b = e.target.closest(".cat-link"); if(!b) return;
      if(b.dataset.go){ jumpTo(b.dataset.go); return; }
      input.value = b.dataset.cat;
      render(input.value);
      input.focus();
    });
  })();
