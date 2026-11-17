import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import 'lenis/dist/lenis.css'
import '../src/index.css'
import '../src/App.css'
import butterflyAsset from '../src/assets/public-butterfly.svg'
import { assetUrl } from '../src/lib/assetUrl'

const butterfly = assetUrl(butterflyAsset)

export const metadata: Metadata = {
  title: 'PUBLIC | Publicidad outdoor e indoor en El Salvador',
  description:
    'Conecta tu marca con PUBLIC. Publicidad outdoor, indoor y soluciones innovadoras en El Salvador.',
  icons: { icon: '/favicon.svg' },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f7f5ef',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <head>
        <link
          rel="preload"
          as="image"
          href={butterfly}
          type="image/svg+xml"
          fetchPriority="high"
        />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
