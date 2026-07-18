(() => {
  const SIGNUP_IMAGES = [
    'assets/images/editorial/signup-select/signup-01.png?v=7',
    'assets/images/editorial/signup-select/signup-02.png?v=7',
    'assets/images/editorial/signup-select/signup-03.png?v=7',
    'assets/images/editorial/signup-select/signup-04.png?v=7',
    'assets/images/editorial/signup-select/signup-05.png?v=7'
  ]
  const PRODUCT_URLS = {
    'ARCHVE MAN ICON KEYCHAIN SET':'https://shop.archvemag.com/products/archve-man-icon-keychain-set',
    'ARCHVE WOMAN ICON KEYCHAIN SET':'https://shop.archvemag.com/products/archve-woman-icon-keychain-set'
  }
  const STRIPE_SUPPORT = 'https://buy.stripe.com/28E4gz7EQ5BBceV6F4fjG00'

  const style = document.createElement('style')
  style.id = 'archve-zip-layout-fix'
  style.textContent = `
    :root{--archve-purple:#9c2f8b}
    .util{display:block!important;background:#000!important;color:#fff!important;border-bottom:1px solid rgba(255,255,255,.14)!important}
    .mast{position:sticky!important;top:0!important;z-index:60!important;display:grid!important;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)!important;align-items:center!important;min-height:84px!important;background:#000!important;color:#fff!important;border-bottom:1px solid rgba(255,255,255,.18)!important}
    .mast:after{content:"";position:absolute;left:0;right:0;bottom:-3px;height:3px;background:var(--archve-purple)}
    .mast-top{display:contents!important}
    .brand{grid-column:2!important;grid-row:1!important;display:flex!important;align-items:center!important;justify-content:center!important;width:clamp(330px,36vw,700px)!important;min-width:0!important;min-height:62px!important;margin:0!important;position:relative!important;overflow:hidden!important}
    .brand .tick,.brand:before,.brand:after{display:none!important;content:none!important}
    .brand img,.brand .site-logo,.brand .header-wordmark{display:block!important;visibility:visible!important;opacity:1!important;width:100%!important;height:auto!important;max-height:68px!important;object-fit:contain!important;filter:none!important}
    .nav-row{grid-column:1!important;grid-row:1!important;display:flex!important;align-items:center!important;align-self:stretch!important;min-width:0!important;padding:0 18px 0 var(--gut)!important;background:transparent!important;border:0!important}
    .nav-row .wrap{width:auto!important;max-width:none!important;margin:0!important;padding:0!important}
    .nav{display:flex!important;align-items:center!important;gap:clamp(12px,1.35vw,24px)!important}
    .nav a{padding:8px 0!important;margin:0!important;border:0!important;color:#fff!important;font-family:var(--mono)!important;font-size:clamp(9px,.72vw,12px)!important;font-weight:900!important;letter-spacing:.055em!important;white-space:nowrap!important;text-transform:uppercase!important}
    .nav a:after{display:none!important}
    .mast-cta{grid-column:3!important;grid-row:1!important;justify-self:end!important;display:flex!important;align-items:center!important;min-width:0!important;flex-shrink:0!important;gap:12px!important;margin-right:var(--gut)!important}
    .search-btn{border:0!important;background:transparent!important;color:#fff!important;flex-shrink:0!important}
    .joinbtn{background:var(--archve-purple)!important;border-color:var(--archve-purple)!important;color:#fff!important}
    .burger{flex-shrink:0!important;white-space:nowrap!important}
    .mobile-shop-btn{display:none}
    .search-shop-btn{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;width:100%!important;max-width:560px!important;height:52px!important;margin:-14px 0 30px!important;border:1px solid #fff!important;background:#fff!important;color:#000!important;font-family:var(--mono)!important;font-size:13px!important;font-weight:900!important;letter-spacing:.08em!important;text-transform:uppercase!important;text-decoration:none!important;cursor:pointer!important;transition:.15s!important}
    .search-shop-btn:hover{background:transparent!important;color:#fff!important}
    .strip{background:#000!important;color:#fff!important;border-bottom:1px solid rgba(255,255,255,.14)!important}
    .join{background:#000!important;color:#fff!important;padding:clamp(58px,6vw,92px) 0!important}
    .join .wrap,.support .wrap{width:100%!important;max-width:var(--maxw)!important;padding-left:var(--gut)!important;padding-right:var(--gut)!important}
    .join-card,.support .sup-card{padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;outline:0!important}
    .join-grid.join-random-image-layout{display:grid!important;grid-template-columns:minmax(300px,.82fr) minmax(360px,.98fr)!important;align-items:start!important;gap:clamp(30px,4vw,64px)!important}
    .join-left{display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:space-between!important;min-height:100%!important}
    .join h2{max-width:9ch!important;margin:0 0 28px!important;color:#fff!important;font-family:var(--display)!important;font-size:clamp(32px,4.2vw,68px)!important;line-height:.88!important;letter-spacing:-.05em!important;text-align:left!important;text-transform:uppercase!important}
    .join p{max-width:700px!important;margin:0!important;color:#fff!important;font-size:clamp(15px,1.35vw,21px)!important;line-height:1.45!important;text-align:left!important}
    .join-email-form{display:flex!important;justify-content:flex-start!important;margin:30px 0 0!important}
    .join-subscribe-btn{min-width:240px!important;height:56px!important;padding:0 30px!important;border:1px solid #fff!important;background:#fff!important;color:#000!important;font-family:var(--mono)!important;font-size:15px!important;font-weight:900!important;text-transform:uppercase!important;cursor:pointer!important}
    .join-random-image-frame{width:100%!important;margin:0!important;overflow:hidden!important;background:#111!important;aspect-ratio:4/5!important}
    .join-random-image-frame img{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;image-rendering:auto!important;filter:none!important}
    .support{background:#000!important;color:#fff!important;padding:clamp(52px,6vw,86px) 0!important}
    .support .sup-grid{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(260px,.58fr)!important;align-items:center!important;gap:clamp(26px,4vw,56px)!important}
    .support h2{max-width:9ch!important;margin:0 0 18px!important;color:#fff!important;font-family:var(--display)!important;font-size:clamp(38px,4.45vw,74px)!important;line-height:.88!important;letter-spacing:-.055em!important;text-transform:uppercase!important}
    .support .lead-copy{max-width:620px!important;color:#fff!important;font-size:clamp(16px,1.35vw,24px)!important;line-height:1.42!important}
    .support .uses{list-style:none!important;max-width:620px!important;margin:24px 0 28px!important;padding:0!important;border-top:1px solid rgba(255,255,255,.22)!important}
    .support .uses li{display:flex!important;gap:12px!important;padding:16px 0!important;border-bottom:1px solid rgba(255,255,255,.22)!important;color:#fff!important;font-family:var(--mono)!important;font-size:clamp(14px,1vw,18px)!important;font-weight:900!important}
    .support-cta{display:flex!important;align-items:center!important;justify-content:center!important;width:min(620px,100%)!important;min-height:58px!important;border:0!important;background:#efefef!important;color:#000!important;font-family:var(--mono)!important;font-size:16px!important;font-weight:900!important;text-transform:uppercase!important;cursor:pointer!important}
    .support-art{display:flex!important;justify-content:flex-end!important;align-items:center!important}
    .support-art img{display:block!important;width:min(100%,520px)!important;height:auto!important;filter:none!important}
    @media(max-width:1180px){
      .mast{min-height:74px!important}
      .brand{width:clamp(200px,42vw,500px)!important;max-width:56vw!important}
      .nav-row{display:none!important}
      .nav-row.open{display:block!important;position:fixed!important;inset:0!important;top:0!important;background:#000!important;z-index:150!important;padding:100px 24px 28px!important;overflow-y:auto!important}
      .nav-row.open .wrap{width:100%!important;max-width:none!important;padding:0!important;margin:0!important}
      .nav-row.open .nav{display:flex!important;flex-direction:column!important;gap:0!important;align-items:flex-start!important}
      .nav-row.open .nav a{width:100%!important;padding:18px 0!important;font-size:18px!important;border-bottom:1px solid rgba(255,255,255,.14)!important}
      .burger{display:inline-flex!important;position:relative!important;z-index:160!important}
      .join-grid.join-random-image-layout,.support .sup-grid{grid-template-columns:1fr!important}
      .support-art{justify-content:flex-start!important}
    }
    @media(max-width:640px){
      .util{display:none!important}
      .brand{width:min(70vw,330px)!important;max-width:50vw!important}
      .mast-cta{gap:8px!important;margin-right:14px!important}
      .burger{padding:8px 10px!important;font-size:10.5px!important}
      .joinbtn{display:none!important}
      .mobile-shop-btn{display:inline-flex!important;align-items:center!important;justify-content:center!important;height:32px!important;padding:0 12px!important;border:1px solid rgba(255,255,255,.4)!important;background:transparent!important;color:#fff!important;font-family:var(--mono)!important;font-size:10.5px!important;font-weight:900!important;letter-spacing:.06em!important;text-transform:uppercase!important;white-space:nowrap!important;flex-shrink:0!important}
      .join h2{font-size:clamp(30px,10vw,48px)!important}
    }
    @media(max-width:380px){
      .brand{max-width:42vw!important}
      .mast-cta{gap:6px!important;margin-right:10px!important}
      .mobile-shop-btn{padding:0 9px!important;font-size:9.5px!important}
      .burger{padding:7px 8px!important;font-size:10px!important}
    }
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
    const brand = document.querySelector('.mast .brand')
    if(brand){
      brand.innerHTML = '<img class="site-logo header-wordmark" src="assets/images/logos/archbe.png?v=6" alt="ARCHVE Magazine">'
    }

    const editorHeading = document.querySelector('.editors h2')
    if(editorHeading) editorHeading.textContent = 'A Raw Cultural Houston Visual Experience'

    const join = document.querySelector('.join#join')
    if(join){
      join.innerHTML = `<div class="wrap"><div class="join-card reveal in"><div class="join-grid join-random-image-layout"><div class="join-left"><div><h2>Sign Up For First Access<br>To The Magazine<br>&amp; Updates</h2><p>Be first to know when our first Issue drops, get pre-order access before anyone else,<br>and pull up to launch events. No spam — just the magazine.</p></div><div class="wait-form wait-form-tally join-email-form"><button class="join-subscribe-btn" type="button" data-tally-open="kdrEPd" data-tally-layout="modal" data-tally-overlay="1" data-tally-auto-close="0">Subscribe</button></div></div><div class="join-random-image-wrap"><figure class="join-random-image-frame"><img id="joinRandomImage" alt="ARCHVE editorial feature"></figure></div></div></div></div>`
      const image = join.querySelector('#joinRandomImage')
      image.src = SIGNUP_IMAGES[Math.floor(Math.random() * SIGNUP_IMAGES.length)]
    }

    const shopHeading = document.querySelector('.shop#shop .sec-head')
    if(shopHeading) shopHeading.innerHTML = '<div class="l"><a class="sec-title" href="#shop">Buy a keychain, help fund the first issue.</a></div>'

    const support = document.querySelector('.support#support')
    if(support){
      support.innerHTML = `<div class="wrap"><div class="sup-card reveal in"><div class="sup-grid"><div class="support-copy"><span class="label">Support ARCHVE</span><h2>Fund The Next Issue.</h2><p class="lead-copy">Help fund ARCHVE’s independent storytelling, including team file storage, photography, interviews, and print production.</p><ul class="uses"><li><span>→</span><span>Printing &amp; paper stock</span></li><li><span>→</span><span>Photography &amp; film</span></li><li><span>→</span><span>Interviews, writing &amp; reporting</span></li><li><span>→</span><span>Shipping &amp; production</span></li><li><span>→</span><span>Paying contributors fairly</span></li></ul><button class="support-cta" id="donateBtn">Support ARCHVE</button></div><div class="support-art"><img src="assets/images/editorial/letsholdhands.svg?v=6" alt="Two ARCHVE figures holding hands"></div></div></div></div>`
      support.querySelector('#donateBtn')?.addEventListener('click',() => window.open(STRIPE_SUPPORT,'_blank','noopener'))
    }

    wireProducts()
    const grid = document.getElementById('shopGrid')
    if(grid) new MutationObserver(wireProducts).observe(grid,{childList:true,subtree:true})
    window.Tally?.loadEmbeds?.()
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded',apply,{once:true}) : apply()
})()
