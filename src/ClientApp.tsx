'use client'

import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { refreshPageTone, setPageTone } from './animation/pageTone'
import { ImageLightboxProvider } from './components/ImageLightbox'
import { initializeIOSSafariWorkaround } from './platform/iosSafari'

export default function ClientApp() {
  useEffect(() => {
    initializeIOSSafariWorkaround()
    window.addEventListener('pageshow', refreshPageTone)

    const initialPath = window.location.pathname.replace(/^\/+|\/+$/g, '')
    setPageTone(
      ['indoor', 'outdoor', 'innovaciones', 'innovations'].includes(initialPath)
        ? '#0b0d0c'
        : initialPath === 'disponibilidad'
          ? '#07080b'
          : '#f7f5ef',
      true,
    )

    return () => window.removeEventListener('pageshow', refreshPageTone)
  }, [])

  return (
    <ImageLightboxProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ImageLightboxProvider>
  )
}
