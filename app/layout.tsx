import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import 'lenis/dist/lenis.css'
import '../src/index.css'
import '../src/App.css'

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
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
