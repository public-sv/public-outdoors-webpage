import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import butterflyAsset from '../assets/public-butterfly.svg'
import { assetUrl } from '../lib/assetUrl'
import { usePageTone } from '../hooks/usePageTone'

export function NotFoundPage() {
  const butterfly = assetUrl(butterflyAsset)
  usePageTone('#f7f5ef', false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <main className="not-found-page">
      <section className="not-found-page__content" aria-labelledby="not-found-title">
        <img className="not-found-page__mark" src={butterfly} alt="" />
        <p className="not-found-page__eyebrow">Error 404</p>
        <h1 id="not-found-title">Página no encontrada</h1>
        <p className="not-found-page__copy">
          La página que buscas cambió de lugar o ya no está disponible.
        </p>
        <Link className="not-found-page__action" to="/">
          <span aria-hidden="true">←</span>
          Volver al inicio
        </Link>
      </section>
    </main>
  )
}
