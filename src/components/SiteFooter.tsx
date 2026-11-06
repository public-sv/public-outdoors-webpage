import butterflyLogoAsset from '../assets/public-butterfly.svg'
import { Link } from 'react-router-dom'
import { assetUrl } from '../lib/assetUrl'

const butterflyLogo = assetUrl(butterflyLogoAsset)

export function SiteFooter({ onContact }: { onContact: () => void }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__identity">
          <img src={butterflyLogo} alt="" width="24" height="27" />
          <span>© {new Date().getFullYear()} Public</span>
          <span className="site-footer__location">El Salvador</span>
        </div>
        <nav className="site-footer__links" aria-label="Enlaces del pie de página">
          <Link to="/#hero">Inicio</Link>
          <Link to="/#medios">Medios</Link>
          <Link to="/#team">Equipo</Link>
          <Link to="/#history">Historia</Link>
          <Link to="/disponibilidad">Disponibilidad</Link>
          <button type="button" onClick={onContact} aria-haspopup="dialog">
            Contacto
          </button>
        </nav>
      </div>
    </footer>
  )
}
