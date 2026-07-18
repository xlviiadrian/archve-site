(() => {
  const current = document.currentScript
  const base = current && current.src ? current.src.slice(0, current.src.lastIndexOf('/') + 1) : 'assets/js/'

  function load(src,onload){
    const script = document.createElement('script')
    script.src = src
    script.onload = onload
    script.onerror = () => console.error(`ARCHVE failed to load ${src}`)
    document.head.appendChild(script)
  }

  function loadSeries(sources,done){
    const next = () => {
      const src = sources.shift()
      if(!src){ done?.(); return }
      load(`${base}${src}`,next)
    }
    next()
  }

  load(`${base}site-core.js?v=1`,() => {
    load(`${base}shop-carousel.js?v=1`,() => {
      loadSeries([
        'signup-image-data-00.js?v=1',
        'signup-image-data-01.js?v=1',
        'support-image-data.js?v=1'
      ],() => {
        load(`${base}site-custom.js?v=4`,() => load(`${base}site-images.js?v=1`))
      })
    })
  })
})()
