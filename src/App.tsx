import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { PageMetadata } from './components/PageMetadata'
import { ContactCard } from './components/ContactCard'
import { AvailabilitySelectionAccess } from './components/AvailabilitySelectionAccess'
import { AvailabilitySelectionModal } from './components/AvailabilitySelectionModal'
import { SiteNavigation } from './components/SiteNavigation'
import type { AvailabilityCatalog } from './data/availability'
import { useAvailabilityCatalog } from './hooks/useAvailabilityCatalog'
import { useAvailabilitySelection } from './hooks/useAvailabilitySelection'
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
import { ScrollTrigger } from './animation/gsap'
import './App.css'

function HomePage() {
  const location = useLocation()
  const [contactOpen, setContactOpen] = useState(false)
  const [navigationRevealed, setNavigationRevealed] = useState(false)
  const [navigationDark, setNavigationDark] = useState(false)

  const handleMaskStateChange = useCallback((complete: boolean) => {
    setNavigationRevealed(complete)
  }, [])

  useEffect(() => {
    const targetId = location.hash.slice(1)
    const validTargets = new Set([
      'hero',
      'indoor-gallery',
      'outdoor-gallery',
      'innovaciones-gallery',
      'medios',
      'team',
      'history',
    ])
    if (!validTargets.has(targetId)) return

    let scrollFrame = 0
    const renderFrame = requestAnimationFrame(() => {
      window.dispatchEvent(new Event(
        targetId === 'hero'
          ? 'public:navigate-home'
          : 'public:navigate-to-media',
      ))

      scrollFrame = requestAnimationFrame(() => {
        const target = document.getElementById(targetId)
        if (!target) return

        ScrollTrigger.refresh()
        target.scrollIntoView({
          // The gallery overview sits after the pinned hero. Jumping directly
          // avoids interpolating through stale pin measurements during routing.
          behavior: targetId === 'medios'
            || window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth',
          block: 'start',
        })
        ScrollTrigger.update()
      })
    })

    return () => {
      cancelAnimationFrame(renderFrame)
      cancelAnimationFrame(scrollFrame)
    }
  }, [location.hash])

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
        reserveSelectionSpace
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

interface AvailabilityRouteProps {
  catalog: AvailabilityCatalog
  selectedKeys: Set<string>
  onOpenSelection: () => void
  onSelectedKeysChange: (next: Set<string>) => void
}

function AvailabilityRoute({
  catalog,
  selectedKeys,
  onOpenSelection,
  onSelectedKeysChange,
}: AvailabilityRouteProps) {
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <>
      <SiteNavigation
        revealed
        onContact={() => setContactOpen(true)}
        onMedia={() => undefined}
        reserveSelectionSpace
      />

      <AvailabilityPage
        catalog={catalog}
        onContact={() => setContactOpen(true)}
        onOpenSelection={onOpenSelection}
        selectedSpaceKeys={selectedKeys}
        onSelectedSpaceKeysChange={onSelectedKeysChange}
      />

      {contactOpen && <ContactCard onClose={() => setContactOpen(false)} />}
    </>
  )
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [selectionOpen, setSelectionOpen] = useState(false)
  const openSelection = useCallback(() => setSelectionOpen(true), [])
  const closeSelection = useCallback(() => setSelectionOpen(false), [])
  const exploreAvailabilityCatalog = useCallback(() => {
    setSelectionOpen(false)

    const scrollToCatalog = () => {
      document.getElementById('explorar')?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
        block: 'start',
      })
    }

    navigate('/disponibilidad#explorar', {
      replace: location.pathname === '/disponibilidad',
    })

    requestAnimationFrame(() => requestAnimationFrame(scrollToCatalog))
  }, [location.pathname, navigate])
  const catalog = useAvailabilityCatalog()
  const {
    selectedKeys,
    customerName,
    campaignIdea,
    setSelectedKeys,
    setCustomerName,
    setCampaignIdea,
  } = useAvailabilitySelection()
  const backgroundLocation =
    location.pathname === '/disponibilidad'
      ? undefined
      : location.state?.backgroundLocation

  return (
    <>
      <PageMetadata />
      <AvailabilitySelectionAccess
        selectionCount={selectedKeys.size}
        onOpen={openSelection}
        availabilityPage={location.pathname === '/disponibilidad'}
      />
      <Routes location={backgroundLocation ?? location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/indoor" element={<IndoorPage />} />
        <Route path="/outdoor" element={<OutdoorPage />} />
        <Route path="/innovaciones" element={<InnovationsPage />} />
        <Route path="/innovations" element={<Navigate to="/innovaciones" replace />} />
        <Route
          path="/disponibilidad"
          element={(
            <AvailabilityRoute
              catalog={catalog}
              selectedKeys={selectedKeys}
              onOpenSelection={openSelection}
              onSelectedKeysChange={setSelectedKeys}
            />
          )}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route path="/indoor" element={<IndoorPage modal />} />
          <Route path="/outdoor" element={<OutdoorPage modal />} />
          <Route path="/innovaciones" element={<InnovationsPage modal />} />
        </Routes>
      )}

      {selectionOpen && (
        <AvailabilitySelectionModal
          catalog={catalog}
          selectedKeys={selectedKeys}
          customerName={customerName}
          campaignIdea={campaignIdea}
          onClose={closeSelection}
          onExploreCatalog={exploreAvailabilityCatalog}
          onSelectedKeysChange={setSelectedKeys}
          onCustomerNameChange={setCustomerName}
          onCampaignIdeaChange={setCampaignIdea}
        />
      )}
    </>
  )
}

export default App
