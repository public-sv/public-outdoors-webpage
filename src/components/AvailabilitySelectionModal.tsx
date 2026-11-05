import { useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import butterflyAsset from '../assets/public-butterfly.svg'
import { gsap, useGSAP } from '../animation/gsap'
import { prefersReducedMotion } from '../animation/motion'
import type {
  AvailabilityCatalog,
  AvailabilityLocation,
  AvailabilitySpace,
} from '../data/availability'
import { assetUrl } from '../lib/assetUrl'
import { downloadQuotePdf } from '../lib/createQuotePdf'

const butterfly = assetUrl(butterflyAsset)

interface AvailabilitySelectionModalProps {
  catalog: AvailabilityCatalog
  selectedKeys: Set<string>
  customerName: string
  campaignIdea: string
  onClose: () => void
  onSelectedKeysChange: (next: Set<string>) => void
  onCustomerNameChange: (next: string) => void
  onCampaignIdeaChange: (next: string) => void
}

interface SelectionEntry {
  location: AvailabilityLocation
  space: AvailabilitySpace
}

const formatPrice = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function entryKey(entry: SelectionEntry) {
  return `${entry.location.id}:${entry.space.id}`
}

function spaceUrl(locationId: string, spaceId: string) {
  const url = new URL('/disponibilidad', window.location.origin)
  url.searchParams.set('catalog', 'location')
  url.searchParams.set('location', locationId)
  url.searchParams.set('space', spaceId)
  return url.toString()
}

export function AvailabilitySelectionModal({
  catalog,
  selectedKeys,
  customerName,
  campaignIdea,
  onClose,
  onSelectedKeysChange,
  onCustomerNameChange,
  onCampaignIdeaChange,
}: AvailabilitySelectionModalProps) {
  const closeButton = useRef<HTMLButtonElement>(null)
  const motion = useRef<HTMLDivElement>(null)
  const selectedEntries = useMemo(
    () => catalog.locations.flatMap((location) =>
      location.spaces
        .map((space) => ({ location, space }))
        .filter((entry) => selectedKeys.has(entryKey(entry))),
    ),
    [catalog.locations, selectedKeys],
  )

  const removeSelection = (entry: SelectionEntry) => {
    const next = new Set(selectedKeys)
    next.delete(entryKey(entry))
    onSelectedKeysChange(next)
  }

  const requestCopy = [
    customerName ? `Nombre: ${customerName}` : '',
    campaignIdea ? `Idea de campaña: ${campaignIdea}` : '',
    '',
    'Medios seleccionados:',
    ...selectedEntries.map(({ location, space }) =>
      `- ${space.name} · ${location.name} · ${formatPrice.format(space.price)} ${space.price_label}`),
  ].filter(Boolean).join('\n')

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus({ preventScroll: true })

    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeWithEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeWithEscape)
      previousFocus?.focus({ preventScroll: true })
    }
  }, [onClose])

  useGSAP((_, contextSafe) => {
    const element = motion.current
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!element || !finePointer.matches || prefersReducedMotion()) return

    const safe = contextSafe!
    const rotateX = gsap.quickTo(element, 'rotationX', {
      duration: .55,
      ease: 'power2.out',
    })
    const rotateY = gsap.quickTo(element, 'rotationY', {
      duration: .55,
      ease: 'power2.out',
    })
    const shiftX = gsap.quickTo(element, 'x', {
      duration: .6,
      ease: 'power2.out',
    })
    const shiftY = gsap.quickTo(element, 'y', {
      duration: .6,
      ease: 'power2.out',
    })
    let initialized = false

    const resetMotion = safe(() => {
      rotateX(0)
      rotateY(0)
      shiftX(0)
      shiftY(0)
    })

    const handlePointerMove = safe((event: PointerEvent) => {
      if (event.pointerType === 'touch') return

      if (!initialized) {
        initialized = true
        gsap.set(element, {
          transformPerspective: 1400,
          transformOrigin: 'center center',
          force3D: true,
        })
      }

      const horizontal = (event.clientX / window.innerWidth - .5) * 2
      const vertical = (event.clientY / window.innerHeight - .5) * 2

      rotateX(vertical * -2.25)
      rotateY(horizontal * 3.2)
      shiftX(horizontal * 2)
      shiftY(vertical * 1.25)
    })

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('blur', resetMotion)
    document.documentElement.addEventListener('pointerleave', resetMotion)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('blur', resetMotion)
      document.documentElement.removeEventListener('pointerleave', resetMotion)
      gsap.killTweensOf(element, ['rotationX', 'rotationY', 'x', 'y'])
    }
  }, { scope: motion })

  return createPortal(
    <div
      className="availability-selection availability-selection--contact-theme"
      role="dialog"
      aria-modal="true"
      aria-labelledby="availability-selection-title"
    >
      <button
        className="availability-selection__backdrop"
        type="button"
        aria-label="Cerrar mi selección"
        onClick={onClose}
      />
      <div className="availability-selection__motion" ref={motion}>
        <section className="availability-selection__panel">
          <button
            className="availability-selection__close"
            type="button"
            aria-label="Cerrar mi selección"
            onClick={onClose}
            ref={closeButton}
          >
            ×
          </button>
          <div className="availability-selection__brand" aria-label="PUBLIC">
            <img src={butterfly} alt="" />
            <strong>PUBLIC</strong>
          </div>
          <p>Tu próxima campaña</p>
          <h2 id="availability-selection-title">Hagámoslo<br />posible.</h2>
          <div className="availability-selection__items">
            {selectedEntries.length ? selectedEntries.map((entry) => (
              <div key={entryKey(entry)}>
                <span>
                  <strong>{entry.space.name}</strong>
                  <small>
                    {entry.location.name} · {formatPrice.format(entry.space.price)} / {entry.space.price_label}
                  </small>
                </span>
                <button type="button" onClick={() => removeSelection(entry)}>Quitar</button>
              </div>
            )) : (
              <p>Aún no has agregado medios. Cierra esta ventana y explora el catálogo.</p>
            )}
          </div>
          <label>
            Tu nombre
            <input
              name="name"
              autoComplete="name"
              value={customerName}
              onChange={(event) => onCustomerNameChange(event.target.value)}
              placeholder="Nombre y apellido"
            />
          </label>
          <label>
            Cuéntanos tu idea
            <textarea
              name="campaign-idea"
              autoComplete="off"
              value={campaignIdea}
              onChange={(event) => onCampaignIdeaChange(event.target.value)}
              placeholder="Marca, fechas o formatos de interés"
              rows={3}
            />
          </label>
          <div className="availability-selection__actions">
            <a
              className={selectedEntries.length ? undefined : 'is-disabled'}
              href={selectedEntries.length ? `mailto:marketing@publicsv.net?subject=${encodeURIComponent('Consulta de disponibilidad PUBLIC')}&body=${encodeURIComponent(requestCopy)}` : undefined}
              aria-disabled={!selectedEntries.length}
            >
              Enviar correo
            </a>
            <a
              className={selectedEntries.length ? undefined : 'is-disabled'}
              href={selectedEntries.length ? `https://wa.me/50378400641?text=${encodeURIComponent(requestCopy)}` : undefined}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!selectedEntries.length}
            >
              Escribir por WhatsApp
            </a>
            <button
              className={selectedEntries.length ? undefined : 'is-disabled'}
              type="button"
              disabled={!selectedEntries.length}
              onClick={() => downloadQuotePdf({
                customerName,
                campaignIdea,
                entries: selectedEntries.map(({ location, space }) => ({
                  locationName: location.name,
                  name: space.name,
                  price: space.price,
                  priceLabel: space.price_label,
                  url: spaceUrl(location.id, space.id),
                })),
              })}
            >
              Generar PDF
            </button>
          </div>
        </section>
      </div>
    </div>,
    document.body,
  )
}
