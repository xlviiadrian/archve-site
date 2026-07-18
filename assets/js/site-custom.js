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
    .util{display:none!important}
    .mast{position:sticky;top:0;z-index:60;display:grid!important;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;height:82px;background:#000!important;color:#fff!important;border:0!important;border-bottom:1px solid rgba(255,255,255,.22)!important}
    .mast:after{content:"";position:absolute;left:0;right:0;bottom:-4px;height:4px;background:var(--archve-purple)}
    .mast-top{display:contents!important}.brand{grid-column:2;grid-row:1;display:flex!important;align-items:center;justify-content:center;width:clamp(300px,32vw,600px)!important;height:64px!important;margin:0!important}.brand .tick{display:none!important}.brand img{display:block!important;width:100%!important;height:auto!important;max-height:60px!important;object-fit:contain;filter:brightness(0) invert(1)}
    .nav-row{grid-column:1;grid-row:1;display:flex!important;align-items:center;align-self:stretch;padding:0 18px 0 var(--gut);background:transparent!important;border:0!important}.nav-row .wrap{width:auto;max-width:none;margin:0;padding:0}.nav{display:flex;align-items:center!important;justify-content:flex-start!important;gap:clamp(12px,1.3vw,24px)!important}.nav a{padding:8px 0!important;border:0!important;color:#fff!important;font-family:var(--mono)!important;font-size:clamp(9px,.7vw,11px)!important;font-weight:900!important;letter-spacing:.055em!important;white-space:nowrap;text-transform:uppercase!important}
    .mast-cta{grid-column:3;grid-row:1;justify-self:end;display:flex!important;align-items:center;gap:10px;margin-right:var(--gut)}.search-btn{width:40px!important;height:40px!important;border:0!important;border-radius:50%!important;background:transparent!important;color:#fff!important}.joinbtn{display:inline-flex!important;align-items:center;justify-content:center;min-height:40px;padding:0 18px!important;border:1px solid var(--archve-purple)!important;background:var(--archve-purple)!important;color:#fff!important;font-family:var(--mono)!important;font-size:11px!important;font-weight:900!important;letter-spacing:.095em!important;text-transform:uppercase!important}.burger{border:1px solid #fff!important;background:transparent!important;color:#fff!important}
    .editors h2{text-transform:none!important;max-width:14ch;line-height:.9!important}
    .join{background:#000!important;color:#fff!important;padding:clamp(58px,6vw,92px) 0!important}.join .wrap,.support .wrap{width:100%;max-width:1540px!important;padding-left:clamp(22px,5vw,78px)!important;padding-right:clamp(22px,5vw,78px)!important}.join-card{padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important}.join-grid.join-random-image-layout{display:grid!important;grid-template-columns:minmax(300px,.82fr) minmax(360px,.98fr)!important;align-items:stretch!important;gap:clamp(30px,4vw,64px)!important}.join-left{display:flex!important;flex-direction:column;justify-content:space-between;align-items:flex-start}.join h2{max-width:9ch!important;margin:0 0 28px!important;color:#fff!important;font-family:var(--display)!important;font-size:clamp(32px,4.2vw,68px)!important;font-weight:400!important;line-height:.88!important;letter-spacing:-.05em!important;text-align:left!important;text-transform:uppercase!important}.join p{max-width:700px!important;margin:0!important;color:#fff!important;font-size:clamp(15px,1.35vw,21px)!important;line-height:1.45!important;text-align:left!important}.join-email-form{display:flex!important;justify-content:flex-start!important;margin:30px 0 0!important}.join-subscribe-btn{min-width:240px;height:56px;padding:0 30px;border:1px solid #fff!important;background:#fff!important;color:#000!important;font-family:var(--mono)!important;font-size:15px!important;font-weight:900!important;text-transform:uppercase!important;cursor:pointer}.join-random-image-wrap{display:flex!important;align-items:stretch!important}.join-random-image-frame{width:100%!important;height:100%!important;margin:0;overflow:hidden;background:#111}.join-random-image-frame img{width:100%;height:100%;display:block;object-fit:cover}
    .shop .sec-head .l{max-width:100%}.shop .sec-title{font-size:clamp(28px,3vw,48px)!important;line-height:.92!important}.shop .sec-head>.sub{display:none!important}#shopGrid .price{display:none!important}#shopGrid .card-foot{justify-content:flex-end!important}
    .support{background:#000!important;color:#fff!important;padding:clamp(52px,6vw,86px) 0!important}.support .sup-card{max-width:none!important;margin:0!important;padding:0!important;border:0!important;outline:0!important;background:transparent!important;box-shadow:none!important}.support .sup-grid{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(250px,.58fr)!important;align-items:center;gap:clamp(26px,4vw,56px)!important}.support .label{display:block!important;margin:0 0 14px!important;color:#fff!important;font-family:var(--mono)!important;font-size:13px!important;font-weight:900!important}.support h2{max-width:9ch;margin:0 0 18px!important;color:#fff!important;font-family:var(--display)!important;font-size:clamp(38px,4.45vw,74px)!important;line-height:.88!important;letter-spacing:-.055em!important;text-transform:uppercase!important}.support .lead-copy{max-width:620px!important;margin:0 0 24px!important;color:#fff!important;font-size:clamp(16px,1.35vw,24px)!important;line-height:1.42!important}.support .uses{list-style:none;max-width:620px;margin:0 0 28px!important;padding:0;border-top:1px solid rgba(255,255,255,.22)}.support .uses li{display:flex;gap:12px;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.22);color:#fff;font-family:var(--mono)!important;font-size:clamp(14px,1vw,18px)!important;font-weight:900!important}.support-cta{display:flex;align-items:center;justify-content:center;width:min(620px,100%);min-height:58px;border:0!important;background:#efefef!important;color:#000!important;font-family:var(--mono)!important;font-size:16px!important;font-weight:900!important;text-transform:uppercase!important;cursor:pointer}.support-art{display:flex;justify-content:flex-end}.support-art img{display:block;width:min(100%,460px);height:auto}
    @media(max-width:1180px){.mast{height:74px}.brand{width:clamp(220px,40vw,450px)!important;height:56px!important}.nav-row{display:none!important;position:fixed;top:74px;left:0;right:0;bottom:0;padding:26px var(--gut);background:#000!important}.nav-row.open{display:block!important}.nav{flex-direction:column;align-items:stretch!important}.nav a{width:100%;padding:17px 0!important;border-bottom:1px solid rgba(255,255,255,.22)!important;font-size:clamp(24px,6vw,44px)!important}.burger{display:inline-flex!important}.join-grid.join-random-image-layout,.support .sup-grid{grid-template-columns:1fr!important}.join-random-image-frame{height:auto!important;aspect-ratio:4/3}.support-art{justify-content:flex-start!important}}
    @media(max-width:640px){.brand{width:min(66vw,320px)!important}.joinbtn{display:none!important}.join h2{font-size:clamp(30px,10vw,48px)!important}.join p br{display:none}.join-random-image-frame{aspect-ratio:1/1}.support{padding:42px 0!important}.support h2{font-size:clamp(30px,10vw,52px)!important}}
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
