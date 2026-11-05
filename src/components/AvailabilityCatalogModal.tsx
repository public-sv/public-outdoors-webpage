import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap, useGSAP } from '../animation/gsap'
import { prefersReducedMotion } from '../animation/motion'
import { AvailabilitySelectionIcon } from './AvailabilitySelectionIcon'
import {
  availableMediaCategories,
  type AvailabilityCatalog,
  type AvailabilityLocation,
  type AvailabilitySpace,
} from '../data/availability'

interface TransitionOrigin {
  x: number
  y: number
  width: number
  height: number
}

export interface AvailabilityCatalogModalContext {
  view: 'locations' | 'categories'
  itemId: string
  origin?: TransitionOrigin
}

interface AvailabilityCatalogModalProps {
  catalog: AvailabilityCatalog
  context: AvailabilityCatalogModalContext
  detailKey: string | null
  selectedKeys: Set<string>
  onClose: () => void
  onDetailChange: (next: string | null) => void
  onOpenSelection: () => void
  onSelectedKeysChange: (next: Set<string>) => void
}

interface CatalogEntry {
  location: AvailabilityLocation
  space: AvailabilitySpace
}

const formatPrice = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function entryKey(entry: CatalogEntry) {
  return `${entry.location.id}:${entry.space.id}`
}

function availabilityLabel(value: number) {
  return `${value} ${value === 1 ? 'disponible' : 'disponibles'}`
}

function availabilityTone(value: number) {
  if (value <= 0) return 'is-unavailable'
  if (value < 3) return 'is-low'
  return undefined
}

export function AvailabilityCatalogModal({
  catalog,
  context,
  detailKey,
  selectedKeys,
  onClose,
  onDetailChange,
  onOpenSelection,
  onSelectedKeysChange,
}: AvailabilityCatalogModalProps) {
  const panel = useRef<HTMLElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const selectionFlight = useRef<HTMLDivElement | null>(null)
  const shareFeedbackTimer = useRef<number | null>(null)
  const [shareCopied, setShareCopied] = useState(false)

  const category = availableMediaCategories.find(
    (item) => item.id === context.itemId,
  )
  const location = catalog.locations.find((item) => item.id === context.itemId)
  const entries = useMemo<CatalogEntry[]>(() => {
    if (context.view === 'locations') {
      const activeLocation = catalog.locations.find(
        (item) => item.id === context.itemId,
      )
      return activeLocation
        ? activeLocation.spaces.map((space) => ({ location: activeLocation, space }))
        : []
    }

    return catalog.locations.flatMap((catalogLocation) =>
      catalogLocation.spaces
        .filter((space) => space.category === context.itemId)
        .map((space) => ({ location: catalogLocation, space })),
    )
  }, [catalog.locations, context.itemId, context.view])
  const activeEntry = entries.find((entry) => entryKey(entry) === detailKey) ?? null
  const title = context.view === 'locations'
    ? location?.name ?? 'Disponibilidad'
    : `Medios ${category?.name ?? ''}`
  const description = context.view === 'locations'
    ? location?.description ?? ''
    : `Explora los espacios ${category?.name.toLocaleLowerCase('es') ?? ''} disponibles en nuestras ubicaciones.`

  const toggleSelection = (entry: CatalogEntry) => {
    const key = entryKey(entry)
    const next = new Set(selectedKeys)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onSelectedKeysChange(next)
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus({ preventScroll: true })

    return () => {
      document.body.style.overflow = previousOverflow
      previousFocus?.focus({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (document.querySelector('.availability-selection')) return
      if (detailKey) {
        onDetailChange(null)
        return
      }
      onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [detailKey, onClose, onDetailChange])

  useEffect(() => () => selectionFlight.current?.remove(), [])

  useEffect(() => () => {
    if (shareFeedbackTimer.current !== null) {
      window.clearTimeout(shareFeedbackTimer.current)
    }
  }, [])

  const { contextSafe } = useGSAP(
    () => {
      if (prefersReducedMotion() || !panel.current || !context.origin) return
      const bounds = panel.current.getBoundingClientRect()
      const originCenterX = context.origin.x + context.origin.width / 2
      const originCenterY = context.origin.y + context.origin.height / 2
      const panelCenterX = bounds.x + bounds.width / 2
      const panelCenterY = bounds.y + bounds.height / 2
      const backdrop = panel.current.parentElement?.querySelector<HTMLElement>(
        '.route-modal__backdrop',
      )
      const timeline = gsap.timeline({ defaults: { overwrite: 'auto' } })

      if (backdrop) {
        timeline.fromTo(
          backdrop,
          { autoAlpha: 0, backdropFilter: 'blur(0px)' },
          { autoAlpha: 1, backdropFilter: 'blur(14px)', duration: .5, ease: 'power2.out' },
          0,
        )
      }

      timeline.fromTo(
        panel.current,
        {
          x: originCenterX - panelCenterX,
          y: originCenterY - panelCenterY,
          scaleX: gsap.utils.clamp(.18, 1, context.origin.width / bounds.width),
          scaleY: gsap.utils.clamp(.18, 1, context.origin.height / bounds.height),
          borderRadius: '1rem',
          autoAlpha: .9,
        },
        {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          borderRadius: 'clamp(1rem, 2vw, 2rem)',
          autoAlpha: 1,
          duration: .78,
          ease: 'expo.inOut',
          clearProps: 'transform',
        },
        0,
      )

      return () => timeline.kill()
    },
    { dependencies: [context.itemId, context.origin, context.view] },
  )

  const addToSelection = (entry: CatalogEntry) => {
    contextSafe(() => {
      const source = document.querySelector<HTMLImageElement>(
        '.availability-space-detail figure img',
      )
      const target = panel.current?.querySelector<HTMLButtonElement>(
        '.availability-catalog-modal__selection-trigger',
      )

      toggleSelection(entry)
      onDetailChange(null)

      if (prefersReducedMotion() || !source || !target) {
        if (target) {
          gsap.fromTo(
            target,
            { scale: 1 },
            { scale: 1.08, duration: .18, yoyo: true, repeat: 1, clearProps: 'transform' },
          )
        }
        return
      }

      const sourceBounds = source.getBoundingClientRect()
      const targetBounds = target.getBoundingClientRect()
      const destinationX = targetBounds.x + targetBounds.width / 2
        - (sourceBounds.x + sourceBounds.width / 2)
      const destinationY = targetBounds.y + targetBounds.height / 2
        - (sourceBounds.y + sourceBounds.height / 2)
      const finalScale = Math.max(
        .035,
        Math.min(.16, targetBounds.width * .52 / sourceBounds.width),
      )
      const flight = document.createElement('div')
      const flightImage = document.createElement('img')

      flight.className = 'availability-selection-flight'
      flightImage.src = entry.space.image.url
      flightImage.alt = ''
      flight.append(flightImage)
      document.body.append(flight)
      selectionFlight.current?.remove()
      selectionFlight.current = flight

      gsap.set(flight, {
        x: 0,
        y: 0,
        left: sourceBounds.x,
        top: sourceBounds.y,
        width: sourceBounds.width,
        height: sourceBounds.height,
        transformOrigin: '50% 50%',
      })

      gsap.timeline({
        onComplete: () => {
          flight.remove()
          if (selectionFlight.current === flight) selectionFlight.current = null
          gsap.timeline()
            .to(target, {
              scale: 1.16,
              boxShadow: '0 0 0 .45rem rgb(56 212 48 / 18%)',
              duration: .16,
              ease: 'power2.out',
            })
            .to(target, {
              scale: 1,
              boxShadow: '0 0 0 0 rgb(56 212 48 / 0%)',
              duration: .5,
              ease: 'elastic.out(1, .45)',
              clearProps: 'transform,boxShadow',
            })
        },
        onInterrupt: () => {
          flight.remove()
          if (selectionFlight.current === flight) selectionFlight.current = null
        },
      })
        .to(flight, {
          x: destinationX * .48,
          y: destinationY * .5 - 72,
          scale: Math.max(finalScale * 3.6, .28),
          rotation: -5,
          duration: .42,
          ease: 'power2.out',
        })
        .to(flight, {
          x: destinationX,
          y: destinationY,
          scale: finalScale,
          rotation: 12,
          autoAlpha: .92,
          duration: .46,
          ease: 'power3.in',
        })
    })()
  }

  const shareActiveEntry = async () => {
    if (!activeEntry) return

    const shareUrl = new URL('/disponibilidad', window.location.origin)
    shareUrl.searchParams.set(
      'catalog',
      context.view === 'locations' ? 'location' : 'media-type',
    )
    if (context.view === 'categories') {
      shareUrl.searchParams.set('type', context.itemId)
    }
    shareUrl.searchParams.set('location', activeEntry.location.id)
    shareUrl.searchParams.set('space', activeEntry.space.id)

    const shareData = {
      title: `${activeEntry.space.name} | PUBLIC`,
      text: `${activeEntry.space.name} en ${activeEntry.location.name}\n${shareUrl.toString()}`,
      url: shareUrl.toString(),
    }

    // Keep a canonical copy on the clipboard before handing control to the
    // browser share sheet. Some desktop share targets otherwise copy the URL
    // of the underlying location instead of this individual space.
    try {
      await navigator.clipboard.writeText(shareData.url)
    } catch {
      const temporaryInput = document.createElement('textarea')
      temporaryInput.value = shareData.url
      temporaryInput.style.position = 'fixed'
      temporaryInput.style.opacity = '0'
      document.body.append(temporaryInput)
      temporaryInput.select()
      document.execCommand('copy')
      temporaryInput.remove()
    }

    setShareCopied(true)
    if (shareFeedbackTimer.current !== null) {
      window.clearTimeout(shareFeedbackTimer.current)
    }
    shareFeedbackTimer.current = window.setTimeout(() => {
      setShareCopied(false)
      shareFeedbackTimer.current = null
    }, 2200)

    const useNativeShare =
      typeof navigator.share === 'function' &&
      window.matchMedia('(pointer: coarse)').matches

    if (useNativeShare) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }
  }

  return (
    <div
      className="route-modal availability-catalog-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="availability-catalog-title"
    >
      <button
        className="route-modal__backdrop"
        type="button"
        aria-label="Cerrar disponibilidad"
        onClick={onClose}
      />
      <section
        className="route-modal__panel route-modal__panel--magic availability-catalog-modal__panel"
        ref={panel}
      >
        <header className="availability-catalog-modal__bar">
          <button
            className="availability-catalog-modal__close"
            type="button"
            onClick={onClose}
            ref={closeButton}
          >
            <span aria-hidden="true">←</span>
            Volver
          </button>
          <button
            className={`availability-catalog-modal__selection-trigger${selectedKeys.size ? ' has-items' : ''}`}
            type="button"
            aria-label={`Mi selección, ${selectedKeys.size} ${selectedKeys.size === 1 ? 'elemento' : 'elementos'}`}
            onClick={onOpenSelection}
          >
            <AvailabilitySelectionIcon hasItems={selectedKeys.size > 0} />
            {selectedKeys.size > 0 && (
              <span className="availability-catalog-modal__selection-count" aria-hidden="true">
                {selectedKeys.size}
              </span>
            )}
          </button>
        </header>

        <div className="availability-catalog-modal__content">
          <header className="availability-catalog-modal__hero">
            <h2 id="availability-catalog-title">{title}</h2>
            <p>{description}</p>
          </header>

          <div className="availability-catalog-modal__grid">
            {entries.map((entry) => {
              const key = entryKey(entry)
              return (
                <article className="availability-catalog-card" key={key}>
                  <button
                    className="availability-catalog-card__image"
                    type="button"
                    aria-label={`Ver ${entry.space.name}`}
                    onClick={() => onDetailChange(key)}
                  >
                    <img src={entry.space.image.url} alt={entry.space.image.alt} />
                  </button>
                  <h3>{entry.space.name}</h3>
                  <p>{entry.location.name}</p>
                  <div className="availability-catalog-card__meta">
                    <span><i className={availabilityTone(entry.space.available)} aria-hidden="true" />{availabilityLabel(entry.space.available)}</span>
                    <strong>{formatPrice.format(entry.space.price)} <small>/ {entry.space.price_label}</small></strong>
                  </div>
                  <button
                    className="availability-catalog-card__view"
                    type="button"
                    onClick={() => onDetailChange(key)}
                  >
                    Ver medio
                  </button>
                </article>
              )
            })}
          </div>

          <div className="availability-catalog-modal__catalog-heading">
            <p>Disponibilidad sujeta a confirmación. Precios y cantidades según inventario.</p>
          </div>
        </div>

        {activeEntry && createPortal(
          <div className="availability-space-detail" role="dialog" aria-modal="true" aria-labelledby="availability-space-title">
            <button className="availability-space-detail__backdrop" type="button" aria-label="Cerrar detalle" onClick={() => onDetailChange(null)} />
            <section className="availability-space-detail__panel">
              <button
                className="availability-space-detail__share"
                type="button"
                onClick={shareActiveEntry}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13" />
                </svg>
                {shareCopied ? 'Enlace copiado' : 'Compartir'}
              </button>
              <button className="availability-space-detail__close" type="button" aria-label="Cerrar detalle" onClick={() => onDetailChange(null)}>×</button>
              <figure>
                <img src={activeEntry.space.image.url} alt={activeEntry.space.image.alt} />
              </figure>
              <div className="availability-space-detail__copy">
                <h2 id="availability-space-title">{activeEntry.space.name}</h2>
                <p>{activeEntry.location.name}</p>
                <strong>{activeEntry.space.description}</strong>
                <div className="availability-space-detail__availability"><i className={availabilityTone(activeEntry.space.available)} aria-hidden="true" />{availabilityLabel(activeEntry.space.available)}</div>
                <div className="availability-space-detail__price">{formatPrice.format(activeEntry.space.price)} <small>/ {activeEntry.space.price_label}</small></div>
                <p className="availability-space-detail__note">USD · Tarifa mensual sin IVA.<br />Cantidades según inventario; confirmar disponibilidad.</p>
                <div className="availability-space-detail__actions">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedKeys.has(entryKey(activeEntry))) {
                        toggleSelection(activeEntry)
                        return
                      }
                      addToSelection(activeEntry)
                    }}
                  >
                    {selectedKeys.has(entryKey(activeEntry))
                      ? 'Quitar de mi selección −'
                      : activeEntry.space.available <= 0
                        ? 'Consultar disponibilidad'
                        : 'Añadir a mi selección +'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedKeys.has(entryKey(activeEntry))) toggleSelection(activeEntry)
                      onOpenSelection()
                    }}
                  >
                    {activeEntry.space.available <= 0
                      ? 'Consulta ahora'
                      : 'Solicita ahora'}
                  </button>
                </div>
              </div>
            </section>
          </div>
        , document.body)}

      </section>
    </div>
  )
}
