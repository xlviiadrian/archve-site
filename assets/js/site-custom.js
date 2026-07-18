(() => {
  const JOIN_IMAGES = [
    'assets/images/editorial/hero-covers/hero-cover-01.jpg',
    'assets/images/editorial/hero-covers/hero-cover-03.jpg',
    'assets/images/editorial/hero-covers/hero-cover-05.jpg',
    'assets/images/editorial/hero-covers/hero-cover-07.jpg',
    'assets/images/editorial/hero-covers/hero-cover-09.jpg'
  ]
  const PRODUCT_URLS = {
    'ARCHVE MAN ICON KEYCHAIN SET':'https://archvemag.com/products/archve-man-icon-keychain-set',
    'ARCHVE WOMAN ICON KEYCHAIN SET':'https://archvemag.com/products/archve-woman-icon-keychain-set'
  }
  const STRIPE_SUPPORT = 'https://buy.stripe.com/28E4gz7EQ5BBceV6F4fjG00'

  const style = document.createElement('style')
  style.id = 'archve-approved-homepage'
  style.textContent = `
    :root{--archve-purple:#9c2f8b}
    .util{display:block!important;background:#000!important;color:rgba(255,255,255,.86)!important;border-bottom:1px solid rgba(255,255,255,.14)!important;font-family:var(--mono)!important;font-size:10px!important;font-weight:800!important;letter-spacing:.055em!important;text-transform:uppercase!important}
    .util-in{display:flex!important;justify-content:space-between!important;align-items:center!important;min-height:22px!important;gap:16px!important}
    .util .l,.util .r a{color:rgba(255,255,255,.86)!important}
    .util .l span{color:rgba(255,255,255,.42)!important}
    .util .r{display:flex!important;align-items:center!important;gap:18px!important}
    .mast{position:sticky;top:0;z-index:60;display:grid!important;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;min-height:84px;background:#000!important;color:#fff!important;border:0!important;border-bottom:1px solid rgba(255,255,255,.18)!important}
    .mast:after{content:'';position:absolute;left:0;right:0;bottom:-3px;height:3px;background:var(--archve-purple)}
    .mast-top{display:contents!important}
    .brand{grid-column:2;grid-row:1;display:flex!important;align-items:center;justify-content:center;min-height:58px!important;margin:0!important}
    .brand .tick{display:none!important}
    .brand img{display:none!important}
    .brand::before{content:'ARCHVE MAGAZINE™';display:block;color:#dce0df;font-family:var(--display)!important;font-size:clamp(34px,4vw,70px)!important;line-height:.86!important;letter-spacing:-.04em!important;text-transform:uppercase!important}
    .brand::after{content:'A Raw Cultural Houston Visual Experience';display:block;position:absolute;transform:translateY(34px);color:#b8bbb9;font-size:clamp(12px,1vw,20px)!important;font-style:italic;letter-spacing:.01em;white-space:nowrap}
    .nav-row{grid-column:1;grid-row:1;display:flex!important;align-items:center;align-self:stretch;padding:0 18px 0 var(--gut);background:transparent!important;border:0!important}
    .nav-row .wrap{width:auto;max-width:none;margin:0;padding:0}.nav{display:flex;align-items:center!important;justify-content:flex-start!important;gap:clamp(12px,1.35vw,24px)!important}
    .nav a{padding:8px 0!important;margin:0!important;border:0!important;color:#fff!important;font-family:var(--mono)!important;font-size:clamp(9px,.72vw,12px)!important;font-weight:900!important;letter-spacing:.055em!important;white-space:nowrap;text-transform:uppercase!important}.nav a::after{display:none!important}
    .mast-cta{grid-column:3;grid-row:1;justify-self:end;display:flex!important;align-items:center;gap:12px;margin-right:var(--gut)}
    .search-btn{width:38px!important;height:38px!important;border:0!important;border-radius:50%!important;background:transparent!important;color:#fff!important}
    .joinbtn{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:42px!important;padding:0 20px!important;border:1px solid var(--archve-purple)!important;background:var(--archve-purple)!important;color:#fff!important;font-family:var(--mono)!important;font-size:11px!important;font-weight:900!important;letter-spacing:.095em!important;text-transform:uppercase!important}
    .burger{border:1px solid rgba(255,255,255,.18)!important;background:transparent!important;color:#fff!important}
    .strip{background:#000!important;color:#fff!important;overflow:hidden;border-top:1px solid rgba(255,255,255,.08)!important;border-bottom:1px solid rgba(255,255,255,.14)!important}
    .ticker{display:inline-flex!important;white-space:nowrap!important;font-family:var(--mono)!important;font-size:11px!important;font-weight:900!important;letter-spacing:.02em!important;padding:10px 0!important;animation:scroll 34s linear infinite!important}
    .ticker span{padding:0 16px!important}.ticker .dot{opacity:.55!important}
    .editors h2{text-transform:none!important;max-width:14ch;line-height:.9!important}
    .join{background:#000!important;color:#fff!important;padding:clamp(58px,6vw,92px) 0!important}
    .join .wrap,.support .wrap{width:100%;max-width:1540px!important;padding-left:clamp(22px,5vw,78px)!important;padding-right:clamp(22px,5vw,78px)!important}
    .join-card{padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important}
    .join-grid.join-random-image-layout{display:grid!important;grid-template-columns:minmax(300px,.82fr) minmax(360px,.98fr)!important;align-items:start!important;gap:clamp(30px,4vw,64px)!important}
    .join-left{display:flex!important;flex-direction:column!important;justify-content:space-between!important;align-items:flex-start!important;min-height:100%!important}
    .join h2{max-width:9ch!important;margin:0 0 28px!important;color:#fff!important;font-family:var(--display)!important;font-size:clamp(32px,4.2vw,68px)!important;font-weight:400!important;line-height:.88!important;letter-spacing:-.05em!important;text-align:left!important;text-transform:uppercase!important}
    .join p{max-width:700px!important;margin:0!important;color:#fff!important;font-size:clamp(15px,1.35vw,21px)!important;line-height:1.45!important;text-align:left!important}
    .join-email-form{display:flex!important;justify-content:flex-start!important;margin:30px 0 0!important}
    .join-subscribe-btn{min-width:240px;height:56px;padding:0 30px;border:1px solid #fff!important;background:#fff!important;color:#000!important;font-family:var(--mono)!important;font-size:15px!important;font-weight:900!important;text-transform:uppercase!important;cursor:pointer}
    .join-random-image-wrap{display:flex!important;align-items:stretch!important}.join-random-image-frame{width:100%!important;margin:0!important;overflow:hidden!important;background:#111!important;aspect-ratio:4/5!important}.join-random-image-frame img{width:100%!important;height:100%!important;display:block!important;object-fit:cover!important}
    .shop .sec-head .l{max-width:100%}.shop .sec-title{font-size:clamp(28px,3vw,48px)!important;line-height:.92!important}.shop .sec-head>.sub{display:none!important}#shopGrid .price{display:none!important}#shopGrid .card-foot{justify-content:flex-end!important}
    .support{background:#000!important;color:#fff!important;padding:clamp(52px,6vw,86px) 0!important}.support .sup-card{max-width:none!important;margin:0!important;padding:0!important;border:0!important;outline:0!important;background:transparent!important;box-shadow:none!important}.support .sup-grid{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(260px,.58fr)!important;align-items:center!important;gap:clamp(26px,4vw,56px)!important}.support .label{display:block!important;margin:0 0 14px!important;color:#fff!important;font-family:var(--mono)!important;font-size:13px!important;font-weight:900!important}.support h2{max-width:9ch;margin:0 0 18px!important;color:#fff!important;font-family:var(--display)!important;font-size:clamp(38px,4.45vw,74px)!important;line-height:.88!important;letter-spacing:-.055em!important;text-transform:uppercase!important}.support .lead-copy{max-width:620px!important;margin:0 0 24px!important;color:#fff!important;font-size:clamp(16px,1.35vw,24px)!important;line-height:1.42!important}.support .uses{list-style:none!important;max-width:620px!important;margin:0 0 28px!important;padding:0!important;border-top:1px solid rgba(255,255,255,.22)!important}.support .uses li{display:flex!important;gap:12px!important;padding:16px 0!important;border-bottom:1px solid rgba(255,255,255,.22)!important;color:#fff!important;font-family:var(--mono)!important;font-size:clamp(14px,1vw,18px)!important;font-weight:900!important}.support-cta{display:flex!important;align-items:center!important;justify-content:center!important;width:min(620px,100%)!important;min-height:58px!important;border:0!important;background:#efefef!important;color:#000!important;font-family:var(--mono)!important;font-size:16px!important;font-weight:900!important;text-transform:uppercase!important;cursor:pointer!important}.support-art{display:flex!important;justify-content:flex-end!important}.support-art img{display:block!important;width:min(100%,460px)!important;height:auto!important}
    @media(max-width:1180px){.util-in{min-height:24px!important;flex-wrap:wrap!important;justify-content:center!important;padding-top:4px!important;padding-bottom:4px!important}.mast{min-height:74px!important}.brand::before{font-size:clamp(26px,6vw,44px)!important}.brand::after{transform:translateY(24px);font-size:clamp(10px,1.6vw,14px)!important}.nav-row{display:none!important;position:fixed!important;top:74px!important;left:0!important;right:0!important;bottom:0!important;padding:26px var(--gut)!important;background:#000!important}.nav-row.open{display:block!important}.nav{flex-direction:column!important;align-items:stretch!important}.nav a{width:100%!important;padding:17px 0!important;border-bottom:1px solid rgba(255,255,255,.22)!important;font-size:clamp(24px,6vw,44px)!important}.burger{display:inline-flex!important}.join-grid.join-random-image-layout,.support .sup-grid{grid-template-columns:1fr!important}.join-random-image-frame{aspect-ratio:4/5!important}.support-art{justify-content:flex-start!important}}
    @media(max-width:640px){.util{display:none!important}.joinbtn{display:none!important}.join h2{font-size:clamp(30px,10vw,48px)!important}.join p br{display:none!important}.support{padding:42px 0!important}.support h2{font-size:clamp(30px,10vw,52px)!important}}
  `
  document.head.appendChild(style)

  function wireProducts(){
    document.querySelectorAll('#shopGrid .card').forEach(card => {
      card.querySelector('.price')?.remove()
      const name = card.querySelector('.card-name')?.textContent.trim()
      const button = card.querySelector('.card-foot .btn')
      if(!button || !PRODUCT_URLS[name]) return
      button.textContent = 'BUY NOW'
      button.href = PRODUCT_URLS[name]
      button.target = '_blank'
      button.rel = 'noopener'
      ;['data-tally-open','data-tally-layout','data-tally-overlay','data-tally-auto-close'].forEach(attr => button.removeAttribute(attr))
    })
  }

  function apply(){
    const editorHeading = document.querySelector('.editors h2')
    if(editorHeading) editorHeading.textContent = 'A Raw Cultural Houston Visual Experience'

    const join = document.querySelector('.join#join')
    if(join){
      join.innerHTML = `<div class="wrap"><div class="join-card reveal in"><div class="join-grid join-random-image-layout"><div class="join-left"><div><h2>Sign Up For First Access<br>To The Magazine<br>&amp; Updates</h2><p>Be first to know when our first Issue drops, get pre-order access before anyone else,<br>and pull up to launch events. No spam — just the magazine.</p></div><div class="wait-form wait-form-tally join-email-form"><button class="join-subscribe-btn" type="button" data-tally-open="kdrEPd" data-tally-layout="modal" data-tally-overlay="1" data-tally-auto-close="0">Subscribe</button></div></div><div class="join-random-image-wrap"><figure class="join-random-image-frame"><img id="joinRandomImage" alt="ARCHVE editorial feature"></figure></div></div></div></div>`
      const image = join.querySelector('#joinRandomImage')
      image.src = `${JOIN_IMAGES[Math.floor(Math.random() * JOIN_IMAGES.length)]}?v=4`
    }

    const shopHeading = document.querySelector('.shop#shop .sec-head')
    if(shopHeading) shopHeading.innerHTML = '<div class="l"><a class="sec-title" href="#shop">Buy a keychain, help fund the first issue.</a></div>'

    const support = document.querySelector('.support#support')
    if(support){
      support.innerHTML = `<div class="wrap"><div class="sup-card reveal in"><div class="sup-grid"><div class="support-copy"><span class="label">Support ARCHVE</span><h2>Fund The Next Issue.</h2><p class="lead-copy">Help fund ARCHVE’s independent storytelling, including team file storage, photography, interviews, and print production.</p><ul class="uses"><li><span>→</span><span>Printing &amp; paper stock</span></li><li><span>→</span><span>Photography &amp; film</span></li><li><span>→</span><span>Interviews, writing &amp; reporting</span></li><li><span>→</span><span>Shipping &amp; production</span></li><li><span>→</span><span>Paying contributors fairly</span></li></ul><button class="support-cta" id="donateBtn">Support ARCHVE</button></div><div class="support-art"><img src="assets/images/editorial/letsholdhands.svg" alt="Two ARCHVE figures holding hands"></div></div></div></div>`
      support.querySelector('#donateBtn')?.addEventListener('click',() => window.open(STRIPE_SUPPORT,'_blank','noopener'))
    }

    wireProducts()
    const grid = document.getElementById('shopGrid')
    if(grid) new MutationObserver(wireProducts).observe(grid,{childList:true,subtree:true})
    window.Tally?.loadEmbeds?.()
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded',apply,{once:true}) : apply()
})()
