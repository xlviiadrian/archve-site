(() => {
  function applyHeaderLogo(){
    const brand = document.querySelector('.mast .brand')
    if(!brand) return
    brand.innerHTML = '<img class="site-logo header-wordmark" src="assets/images/logos/archbe.png?v=1" alt="ARCHVE Magazine">'
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded',applyHeaderLogo,{once:true})
    : applyHeaderLogo()
})()
