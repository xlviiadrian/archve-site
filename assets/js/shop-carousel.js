(() => {
  const shopGrid = document.querySelector('#shopGrid')
  if(!shopGrid) return

  const notifyHref = '#tally-open=kdrEPd&tally-layout=modal&tally-overlay=1&tally-auto-close=0'
  const notifyAttrs = "data-tally-open='kdrEPd' data-tally-layout='modal' data-tally-overlay='1' data-tally-auto-close='0'"
  const shared = {
    packaging:'assets/images/products/carousel/shared-02.webp?v=1',
    hand:'assets/images/products/carousel/shared-04.webp?v=1',
    wordmark:'assets/images/products/carousel/shared-05.webp?v=1',
    bagFront:'assets/images/products/carousel/shared-06.webp?v=1',
    bagBack:'assets/images/products/carousel/shared-07.webp?v=1'
  }
  const products = [
    {
      id:'archve_man_icon_keychain',
      name:'ARCHVE MAN ICON KEYCHAIN SET',
      desc:'Includes the ARCHVE Man Icon and ARCHVE MAGAZINE keychains, packaged in a custom mylar bag.',
      price:'Price at checkout',
      shopifyUrl:'',
      images:[
        'assets/images/products/carousel/man-01.webp?v=1',
        shared.packaging,
        'assets/images/products/carousel/man-03.webp?v=1',
        shared.hand,
        shared.wordmark,
        shared.bagFront,
        shared.bagBack
      ]
    },
    {
      id:'archve_woman_icon_keychain',
      name:'ARCHVE WOMAN ICON KEYCHAIN SET',
      desc:'Includes the ARCHVE Woman Icon and ARCHVE MAGAZINE keychains, packaged in a custom mylar bag.',
      price:'Price at checkout',
      shopifyUrl:'',
      images:[
        'assets/images/products/carousel/woman-01.webp?v=1',
        shared.packaging,
        'assets/images/products/carousel/woman-03.webp?v=1',
        shared.hand,
        shared.wordmark,
        shared.bagFront,
        shared.bagBack
      ]
    }
  ]

  function escapeHtml(value){
    return String(value || '')
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll("'",'&#39;')
      .replaceAll('"','&quot;')
  }

  function carouselMarkup(product){
    const slides = product.images.map((src,index) => (
      `<div class='product-carousel__slide${index === 0 ? ' is-active' : ''}' data-slide aria-hidden='${index === 0 ? 'false' : 'true'}'>` +
        `<img src='${src}' alt='${escapeHtml(product.name)} — photo ${index + 1}' ${index === 0 ? "loading='eager'" : "loading='lazy'"} decoding='async'>` +
      `</div>`
    )).join('')
    const dots = product.images.map((_,index) => (
      `<button class='product-carousel__dot${index === 0 ? ' is-active' : ''}' type='button' data-dot='${index}' aria-label='Show photo ${index + 1}' aria-current='${index === 0 ? 'true' : 'false'}'></button>`
    )).join('')
    return `<div class='thumb product-carousel' data-carousel tabindex='0' aria-label='${escapeHtml(product.name)} product photos'>` +
      `<div class='product-carousel__slides'>${slides}</div>` +
      `<button class='product-carousel__arrow product-carousel__arrow--prev' type='button' data-prev aria-label='Previous photo'>←</button>` +
      `<button class='product-carousel__arrow product-carousel__arrow--next' type='button' data-next aria-label='Next photo'>→</button>` +
      `<div class='product-carousel__dots' aria-label='Choose product photo'>${dots}</div>` +
    `</div>`
  }

  shopGrid.innerHTML = products.map(product => {
    const live = /^https:\/\//.test(product.shopifyUrl)
    const button = live
      ? `<a class='btn btn-ink' href='${product.shopifyUrl}' target='_blank' rel='noopener'>Buy now</a>`
      : `<a class='btn btn-ink' href='${notifyHref}' ${notifyAttrs}>Notify me</a>`
    return `<article class='card'>${carouselMarkup(product)}<div class='card-body'>` +
      `<span class='card-name'>${escapeHtml(product.name)}</span>` +
      `<span class='card-desc'>${escapeHtml(product.desc)}</span>` +
      `<div class='card-foot'><span class='price'>${escapeHtml(product.price)}</span>${button}</div>` +
    `</div></article>`
  }).join('')

  const style = document.createElement('style')
  style.textContent = `
    .card .thumb.product-carousel{
      position:relative;
      padding:0;
      background:#fff;
      overflow:hidden;
      isolation:isolate;
      touch-action:pan-y;
      user-select:none;
    }
    .product-carousel__slides,
    .product-carousel__slide{
      position:absolute;
      inset:0;
    }
    .product-carousel__slide{
      opacity:0;
      visibility:hidden;
      transition:opacity .28s ease;
      background:#fff;
    }
    .product-carousel__slide.is-active{
      opacity:1;
      visibility:visible;
      z-index:1;
    }
    .product-carousel__slide img{
      width:100%;
      height:100%;
      max-width:none;
      object-fit:cover;
      object-position:center;
      display:block;
    }
    .product-carousel__arrow{
      position:absolute;
      top:50%;
      z-index:4;
      width:42px;
      height:42px;
      transform:translateY(-50%);
      border:2px solid #000;
      border-radius:0;
      background:#fff;
      color:#000;
      font:900 20px/1 Arial,sans-serif;
      display:grid;
      place-items:center;
      cursor:pointer;
      transition:background .15s ease,color .15s ease,transform .15s ease;
    }
    .product-carousel__arrow:hover,
    .product-carousel__arrow:focus-visible{
      background:#000;
      color:#fff;
    }
    .product-carousel__arrow:active{transform:translateY(-50%) scale(.94)}
    .product-carousel__arrow--prev{left:14px}
    .product-carousel__arrow--next{right:14px}
    .product-carousel__dots{
      position:absolute;
      z-index:4;
      left:50%;
      bottom:14px;
      transform:translateX(-50%);
      display:flex;
      align-items:center;
      gap:7px;
      padding:8px 10px;
      border:1px solid #000;
      background:rgba(255,255,255,.92);
    }
    .product-carousel__dot{
      width:8px;
      height:8px;
      padding:0;
      border:1px solid #000;
      border-radius:50%;
      background:#fff;
      cursor:pointer;
    }
    .product-carousel__dot.is-active{background:#000}
    .product-carousel:focus-visible{
      outline:3px solid #fff;
      outline-offset:3px;
      box-shadow:0 0 0 6px #000;
    }
    @media(max-width:760px){
      .product-carousel__arrow{width:38px;height:38px}
      .product-carousel__arrow--prev{left:10px}
      .product-carousel__arrow--next{right:10px}
      .product-carousel__dots{bottom:10px}
    }
    @media(prefers-reduced-motion:reduce){
      .product-carousel__slide{transition:none}
    }
  `
  document.head.appendChild(style)

  shopGrid.querySelectorAll('[data-carousel]').forEach(carousel => {
    const slides = Array.from(carousel.querySelectorAll('[data-slide]'))
    const dots = Array.from(carousel.querySelectorAll('[data-dot]'))
    let current = 0
    let touchStartX = null

    function show(next){
      current = (next + slides.length) % slides.length
      slides.forEach((slide,index) => {
        const active = index === current
        slide.classList.toggle('is-active',active)
        slide.setAttribute('aria-hidden',String(!active))
      })
      dots.forEach((dot,index) => {
        const active = index === current
        dot.classList.toggle('is-active',active)
        dot.setAttribute('aria-current',String(active))
      })
    }

    carousel.querySelector('[data-prev]').addEventListener('click',event => {
      event.stopPropagation()
      show(current - 1)
    })
    carousel.querySelector('[data-next]').addEventListener('click',event => {
      event.stopPropagation()
      show(current + 1)
    })
    dots.forEach(dot => dot.addEventListener('click',event => {
      event.stopPropagation()
      show(Number(dot.dataset.dot))
    }))
    carousel.addEventListener('keydown',event => {
      if(event.key === 'ArrowLeft'){
        event.preventDefault()
        show(current - 1)
      }
      if(event.key === 'ArrowRight'){
        event.preventDefault()
        show(current + 1)
      }
    })
    carousel.addEventListener('touchstart',event => {
      touchStartX = event.changedTouches[0].clientX
    },{passive:true})
    carousel.addEventListener('touchend',event => {
      if(touchStartX === null) return
      const distance = event.changedTouches[0].clientX - touchStartX
      touchStartX = null
      if(Math.abs(distance) < 45) return
      show(current + (distance < 0 ? 1 : -1))
    },{passive:true})
  })

  if(window.Tally && typeof window.Tally.loadEmbeds === 'function') window.Tally.loadEmbeds()
})()
