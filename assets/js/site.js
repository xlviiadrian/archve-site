(() => {
  const current = document.currentScript
  const base = current && current.src ? current.src.slice(0, current.src.lastIndexOf('/') + 1) : 'assets/js/'

  function load(src, onload){
    const script = document.createElement('script')
    script.src = src
    script.onload = onload
    script.onerror = () => console.error(`ARCHVE failed to load ${src}`)
    document.head.appendChild(script)
  }

  load(`${base}site-core.js?v=1`, () => load(`${base}shop-carousel.js?v=1`))
})()
