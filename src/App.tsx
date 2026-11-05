import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { useCallback, useState } from 'react'
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
  const [selectionOpen, setSelectionOpen] = useState(false)
  const openSelection = useCallback(() => setSelectionOpen(true), [])
  const closeSelection = useCallback(() => setSelectionOpen(false), [])
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
          onSelectedKeysChange={setSelectedKeys}
          onCustomerNameChange={setCustomerName}
          onCampaignIdeaChange={setCampaignIdea}
        />
      )}
    </>
  )
}

export default App
