'use client'

import dynamic from 'next/dynamic'

const ClientApp = dynamic(() => import('../src/ClientApp'), {
  ssr: false,
  loading: () => <div className="app-loading" aria-label="Cargando PUBLIC" />,
})

export function SiteShell() {
  return <ClientApp />
}
