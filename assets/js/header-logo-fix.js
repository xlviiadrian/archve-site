(() => {
  function applyHeaderLogo(){
    const brand = document.querySelector('.mast .brand')
    if(!brand) return
    brand.innerHTML = '<img class="site-logo header-wordmark" src="assets/images/logos/ARCHVE_TOP_HEADER_LOGO.svg?v=1" alt="ARCHVE Magazine" data-logo-file="archbe.png">'
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded',applyHeaderLogo,{once:true})
    : applyHeaderLogo()
})()
