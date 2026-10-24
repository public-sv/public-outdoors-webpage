import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { useCallback, useState } from 'react'
import { PageMetadata } from './components/PageMetadata'
import { ContactCard } from './components/ContactCard'
import { SiteNavigation } from './components/SiteNavigation'
import { AvailabilityPage } from './views/AvailabilityPage'
import { IndoorPage } from './views/IndoorPage'
import { InnovationsPage } from './views/InnovationsPage'
import { NotFoundPage } from './views/NotFoundPage'
import { OutdoorPage } from './views/OutdoorPage'
import { GalleryScene } from './sections/GalleryScene'
import { HistoryScene } from './sections/HistoryScene'
import { ImpactScene } from './sections/ImpactScene'
import { IntroScene } from './sections/IntroScene'
import { PurposeScene } from './sections/PurposeScene'
import { TeamScene } from './sections/TeamScene'
import './App.css'

function HomePage() {
  const [contactOpen, setContactOpen] = useState(false)
  const [navigationRevealed, setNavigationRevealed] = useState(false)
  const [navigationDark, setNavigationDark] = useState(false)

  const handleMaskStateChange = useCallback((complete: boolean) => {
    setNavigationRevealed(complete)
  }, [])

  const scrollToMedia = (
    event: React.MouseEvent<HTMLAnchorElement>,
    collectionId: 'indoor' | 'outdoor' | 'innovaciones',
  ) => {
    const collection = document.getElementById(`${collectionId}-gallery`)

    if (!collection) return

    event.preventDefault()
    window.dispatchEvent(new Event('public:navigate-to-media'))
    window.requestAnimationFrame(() => {
      collection.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
        block: 'start',
      })
    })
  }

  return (
    <>
      <SiteNavigation
        revealed
        hideButterfly={!navigationRevealed}
        lightSurface={!navigationDark}
        onContact={() => setContactOpen(true)}
        onMedia={scrollToMedia}
      />

      <main id="hero">
        <IntroScene
          onMaskStateChange={handleMaskStateChange}
          onNavigationToneChange={setNavigationDark}
        />
        <GalleryScene />
        <ImpactScene />
        <PurposeScene />
        <TeamScene />
        <HistoryScene onContact={() => setContactOpen(true)} />
      </main>

      {contactOpen && <ContactCard onClose={() => setContactOpen(false)} />}
    </>
  )
}

function AvailabilityRoute() {
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <>
      <SiteNavigation
        revealed
        onContact={() => setContactOpen(true)}
        onMedia={() => undefined}
      />

      <AvailabilityPage onContact={() => setContactOpen(true)} />

      {contactOpen && <ContactCard onClose={() => setContactOpen(false)} />}
    </>
  )
}

function App() {
  const location = useLocation()
  const backgroundLocation =
    location.pathname === '/disponibilidad'
      ? undefined
      : location.state?.backgroundLocation

  return (
    <>
      <PageMetadata />
      <Routes location={backgroundLocation ?? location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/indoor" element={<IndoorPage />} />
        <Route path="/outdoor" element={<OutdoorPage />} />
        <Route path="/innovaciones" element={<InnovationsPage />} />
        <Route path="/innovations" element={<Navigate to="/innovaciones" replace />} />
        <Route path="/disponibilidad" element={<AvailabilityRoute />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route path="/indoor" element={<IndoorPage modal />} />
          <Route path="/outdoor" element={<OutdoorPage modal />} />
          <Route path="/innovaciones" element={<InnovationsPage modal />} />
        </Routes>
      )}
    </>
  )
}

export default App
