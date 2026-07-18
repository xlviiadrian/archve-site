(() => {
  const SIGNUP_IMAGE_COUNT = 5

  function base64Blob(value,type){
    const bytes = Uint8Array.from(atob(value),character => character.charCodeAt(0))
    return new Blob([bytes],{type})
  }

  function replaceSupportImage(){
    const image = document.querySelector('#archveSupportImage') || document.querySelector('.support-art img')
    if(!image || !window.ARCHVE_SUPPORT_IMAGE_B64) return
    const url = URL.createObjectURL(base64Blob(window.ARCHVE_SUPPORT_IMAGE_B64,'image/avif'))
    image.src = url
    image.alt = 'Two ARCHVE figures holding hands'
    image.addEventListener('load',() => URL.revokeObjectURL(url),{once:true})
  }

  function replaceSignupImage(){
    const image = document.querySelector('#joinRandomImage')
    if(!image || !window.ARCHVE_SIGNUP_IMAGE_B64) return
    image.removeAttribute('src')
    const sourceUrl = URL.createObjectURL(base64Blob(window.ARCHVE_SIGNUP_IMAGE_B64,'image/avif'))
    const source = new Image()
    source.onload = () => {
      const frameHeight = Math.round(source.naturalHeight / SIGNUP_IMAGE_COUNT)
      const selected = Math.floor(Math.random() * SIGNUP_IMAGE_COUNT)
      const canvas = document.createElement('canvas')
      canvas.width = source.naturalWidth
      canvas.height = frameHeight
      const context = canvas.getContext('2d')
      context.drawImage(source,0,selected * frameHeight,source.naturalWidth,frameHeight,0,0,canvas.width,canvas.height)
      URL.revokeObjectURL(sourceUrl)
      canvas.toBlob(blob => {
        if(!blob) return
        const croppedUrl = URL.createObjectURL(blob)
        image.src = croppedUrl
        image.alt = `ARCHVE signup editorial ${selected + 1}`
        image.addEventListener('load',() => URL.revokeObjectURL(croppedUrl),{once:true})
      },'image/webp',.9)
    }
    source.src = sourceUrl
  }

  function apply(){
    replaceSignupImage()
    replaceSupportImage()
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded',apply,{once:true})
    : apply()
})()
