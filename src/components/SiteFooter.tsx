import butterflyLogoAsset from '../assets/public-butterfly.svg'
import { Link, useLocation } from 'react-router-dom'
import { assetUrl } from '../lib/assetUrl'

const butterflyLogo = assetUrl(butterflyLogoAsset)

export function SiteFooter({ onContact }: { onContact: () => void }) {
  const location = useLocation()
  const homePrefix = location.pathname === '/' ? '' : '/'

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__identity">
          <img src={butterflyLogo} alt="" width="24" height="27" />
          <span>© {new Date().getFullYear()} Public</span>
          <span className="site-footer__location">El Salvador</span>
        </div>
        <nav className="site-footer__links" aria-label="Enlaces del pie de página">
          <a
            href={`${homePrefix}#hero`}
            onClick={() => window.dispatchEvent(new Event('public:navigate-home'))}
          >
            Inicio
          </a>
          <a
            href={`${homePrefix}#indoor-gallery`}
            onClick={() => window.dispatchEvent(new Event('public:navigate-to-media'))}
          >
            Medios
          </a>
          <a href={`${homePrefix}#team`}>Equipo</a>
          <a href={`${homePrefix}#history`}>Historia</a>
          <Link to="/disponibilidad">Disponibilidad</Link>
          <button type="button" onClick={onContact} aria-haspopup="dialog">
            Contacto
          </button>
        </nav>
      </div>
    </footer>
  )
}
