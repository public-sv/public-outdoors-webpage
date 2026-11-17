import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import butterflyAsset from '../assets/public-butterfly.svg'
import whatsappIconAsset from '../assets/whatsapp-streamline.svg'
import { gsap, useGSAP } from '../animation/gsap'
import { prefersReducedMotion } from '../animation/motion'
import type {
  AvailabilityCatalog,
  AvailabilityLocation,
  AvailabilitySpace,
} from '../data/availability'
import { assetUrl } from '../lib/assetUrl'
import type {
  QuoteCreationRequest,
  QuoteCreationResponse,
} from '../lib/quote'
import {
  getRandomZaydaFirst,
  WhatsAppContactChooser,
} from './WhatsAppContactChooser'

const butterfly = assetUrl(butterflyAsset)
const whatsappIcon = assetUrl(whatsappIconAsset)
const emailContacts = [
  { email: 'outdoors.agencias@publicsv.net', name: 'Zayda' },
  { email: 'ventasdigital@publicsv.net', name: 'Iris' },
] as const
const naturalList = new Intl.ListFormat('es', {
  style: 'long',
  type: 'conjunction',
})
let cachedQuoteRequest: {
  signature: string
  promise: Promise<QuoteCreationResponse>
} | null = null

interface AvailabilitySelectionModalProps {
  catalog: AvailabilityCatalog
  selectedKeys: Set<string>
  customerName: string
  customerEmail: string
  customerPhone: string
  campaignIdea: string
  quoteCatalogReady: boolean
  onClose: () => void
  onExploreCatalog: () => void
  onSelectedKeysChange: (next: Set<string>) => void
  onCustomerNameChange: (next: string) => void
  onCustomerEmailChange: (next: string) => void
  onCustomerPhoneChange: (next: string) => void
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

function emailRequestUrl(email: string, subject: string, requestCopy: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(requestCopy)}`
}

function isQuoteCreationResponse(value: unknown): value is QuoteCreationResponse {
  if (!value || typeof value !== 'object') return false
  const response = value as Record<string, unknown>
  return ['quoteId', 'pdfUrl', 'downloadUrl', 'expiresAt'].every(
    (field) => typeof response[field] === 'string' && Boolean(response[field]),
  )
}

export function AvailabilitySelectionModal({
  catalog,
  selectedKeys,
  customerName,
  customerEmail,
  customerPhone,
  campaignIdea,
  quoteCatalogReady,
  onClose,
  onExploreCatalog,
  onSelectedKeysChange,
  onCustomerNameChange,
  onCustomerEmailChange,
  onCustomerPhoneChange,
  onCampaignIdeaChange,
}: AvailabilitySelectionModalProps) {
  const closeButton = useRef<HTMLButtonElement>(null)
  const motion = useRef<HTMLDivElement>(null)
  const whatsappPanel = useRef<HTMLDivElement>(null)
  const [whatsappOpen, setWhatsappOpen] = useState(false)
  const [zaydaFirst, setZaydaFirst] = useState(false)
  const [quoteAction, setQuoteAction] = useState<'email' | 'whatsapp' | 'download' | null>(null)
  const [quoteError, setQuoteError] = useState('')
  const [activeQuote, setActiveQuote] = useState<QuoteCreationResponse | null>(null)
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

  const createContactMessage = (contactName: string, pdfUrl: string) => {
    const firstName = contactName.split(' ')[0]
    const senderName = customerName.trim()
    const idea = campaignIdea.trim()
    const selection = naturalList.format(
      selectedEntries.map(({ location, space }) => `${space.name} en ${location.name}`),
    )
    const selectionIntro = selectedEntries.length === 1
      ? `incluye el espacio ${selection}`
      : `incluye ${selectedEntries.length} espacios: ${selection}`

    return [
      `Hola, ${firstName}.`,
      senderName
        ? `Soy ${senderName}. Preparé una cotización para una próxima campaña con PUBLIC y me gustaría recibir tu asesoría.`
        : 'Preparé una cotización para una próxima campaña con PUBLIC y me gustaría recibir tu asesoría.',
      idea ? `La idea de campaña es: ${idea}` : '',
      `La cotización ${selectionIntro}.`,
      `Puedes revisarla aquí: ${pdfUrl}`,
      '¿Podrías ayudarme a confirmar la disponibilidad y orientarme con los siguientes pasos?',
      '¡Muchas gracias!',
    ].filter(Boolean).join('\n\n')
  }

  const createQuoteRequest = () => {
    const name = customerName.trim()
    const email = customerEmail.trim()
    const phone = customerPhone.trim()
    const idea = campaignIdea.trim()

    if (!quoteCatalogReady) {
      throw new Error('No pudimos validar el catálogo actual. Intenta nuevamente en unos minutos.')
    }
    if (!selectedEntries.length) throw new Error('Selecciona al menos un espacio.')
    if (!name) throw new Error('Ingresa tu nombre.')
    if (!email) throw new Error('Ingresa tu correo electrónico.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Ingresa un correo electrónico válido.')
    }
    if (!idea) throw new Error('Cuéntanos la idea de tu campaña.')

    return {
      customer: {
        name,
        email,
        ...(phone ? { phone } : {}),
      },
      campaign: { idea },
      selections: selectedEntries.map(({ location, space }) => ({
        locationId: location.id,
        spaceId: space.id,
      })),
    } satisfies QuoteCreationRequest
  }

  const getOrCreateQuote = async () => {
    const request = createQuoteRequest()
    const signature = JSON.stringify(request)
    if (cachedQuoteRequest?.signature === signature) {
      return cachedQuoteRequest.promise
    }

    const promise = fetch('/api/quotes', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }).then(async (response) => {
      const payload: unknown = await response.json().catch(() => null)
      if (!response.ok || !isQuoteCreationResponse(payload)) {
        const message = payload && typeof payload === 'object' && 'error' in payload
          && typeof payload.error === 'string'
          ? payload.error
          : 'No fue posible generar la cotización.'
        throw new Error(message)
      }
      return payload
    })

    cachedQuoteRequest = { signature, promise }
    try {
      return await promise
    } catch (error) {
      if (cachedQuoteRequest?.promise === promise) cachedQuoteRequest = null
      throw error
    }
  }

  const runQuoteAction = async (action: 'email' | 'whatsapp' | 'download') => {
    setQuoteError('')
    setQuoteAction(action)
    try {
      const quote = await getOrCreateQuote()
      setActiveQuote(quote)

      if (action === 'email') {
        const contact = emailContacts[Math.floor(Math.random() * emailContacts.length)]
        const subjectName = customerName.trim()
        window.location.href = emailRequestUrl(
          contact.email,
          `Cotización PUBLIC${subjectName ? ` - ${subjectName}` : ''}`,
          createContactMessage(contact.name, quote.pdfUrl),
        )
      } else if (action === 'whatsapp') {
        setZaydaFirst(getRandomZaydaFirst())
        setWhatsappOpen(true)
      } else {
        const download = document.createElement('a')
        download.href = quote.downloadUrl
        download.rel = 'noreferrer'
        document.body.append(download)
        download.click()
        download.remove()
      }
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : 'No fue posible generar la cotización.')
    } finally {
      setQuoteAction(null)
    }
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus({ preventScroll: true })

    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (whatsappOpen) setWhatsappOpen(false)
      else onClose()
    }
    window.addEventListener('keydown', closeWithEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeWithEscape)
      previousFocus?.focus({ preventScroll: true })
    }
  }, [onClose, whatsappOpen])

  useEffect(() => {
    if (!whatsappOpen) return
    whatsappPanel.current?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true })
  }, [whatsappOpen])

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
              <p>
                Aún no has agregado medios.{' '}
                <a
                  href="/disponibilidad#explorar"
                  onClick={(event) => {
                    event.preventDefault()
                    onExploreCatalog()
                  }}
                >
                 Explora nuestro catálogo.
                </a>
              </p>
            )}
          </div>
          <label>
            <span>
              Tu nombre <span className="availability-selection__required" aria-hidden="true">*</span>
            </span>
            <input
              name="name"
              autoComplete="name"
              required
              value={customerName}
              onChange={(event) => onCustomerNameChange(event.target.value)}
              placeholder="Nombre y apellido"
            />
          </label>
          <label>
            <span>
              Tu correo <span className="availability-selection__required" aria-hidden="true">*</span>
            </span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              value={customerEmail}
              onChange={(event) => onCustomerEmailChange(event.target.value)}
              placeholder="nombre@empresa.com"
            />
          </label>
          <label>
            <span>Tu teléfono <small>(opcional)</small></span>
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              value={customerPhone}
              onChange={(event) => onCustomerPhoneChange(event.target.value)}
              placeholder="+503 7000-0000"
            />
          </label>
          <label>
            <span>
              Cuéntanos tu idea <span className="availability-selection__required" aria-hidden="true">*</span>
            </span>
            <textarea
              name="campaign-idea"
              autoComplete="off"
              required
              value={campaignIdea}
              onChange={(event) => onCampaignIdeaChange(event.target.value)}
              placeholder="Marca, fechas o formatos de interés"
              rows={3}
            />
          </label>
          {quoteError && (
            <p className="availability-selection__quote-error" role="alert">
              {quoteError}
            </p>
          )}
          <div
            className="availability-selection__actions"
            aria-busy={Boolean(quoteAction)}
          >
            <button
              className={selectedEntries.length ? undefined : 'is-disabled'}
              type="button"
              disabled={!selectedEntries.length || Boolean(quoteAction)}
              onClick={() => void runQuoteAction('email')}
              aria-disabled={!selectedEntries.length || Boolean(quoteAction)}
              aria-label={quoteAction === 'email' ? 'Preparando correo' : 'Enviar correo'}
            >
              {quoteAction === 'email' ? (
                <span className="availability-selection__spinner" aria-hidden="true" />
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
                  <path d="m5 7 7 5 7-5" />
                </svg>
              )}
              <span className="availability-selection__action-label">
                {quoteAction === 'email' ? 'Preparando…' : 'Enviar correo'}
              </span>
            </button>
            <button
              className={selectedEntries.length ? undefined : 'is-disabled'}
              type="button"
              disabled={!selectedEntries.length || Boolean(quoteAction)}
              onClick={() => void runQuoteAction('whatsapp')}
              aria-disabled={!selectedEntries.length || Boolean(quoteAction)}
              aria-label={quoteAction === 'whatsapp' ? 'Preparando WhatsApp' : 'Escribir por WhatsApp'}
            >
              {quoteAction === 'whatsapp' ? (
                <span className="availability-selection__spinner" aria-hidden="true" />
              ) : (
                <img
                  className="availability-selection__whatsapp-icon"
                  src={whatsappIcon}
                  alt=""
                  aria-hidden="true"
                />
              )}
              <span className="availability-selection__action-label">
                {quoteAction === 'whatsapp' ? 'Preparando…' : 'Escribir por WhatsApp'}
              </span>
            </button>
            <button
              className={selectedEntries.length ? undefined : 'is-disabled'}
              type="button"
              disabled={!selectedEntries.length || Boolean(quoteAction)}
              aria-label={quoteAction === 'download' ? 'Preparando PDF' : 'Generar PDF'}
              onClick={() => void runQuoteAction('download')}
            >
              {quoteAction === 'download' ? (
                <span className="availability-selection__spinner" aria-hidden="true" />
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 3.5h8l4 4v13H6Z" />
                  <path d="M14 3.5v4h4M8.5 16.5h7M8.5 13h7" />
                </svg>
              )}
              <span className="availability-selection__action-label">
                {quoteAction === 'download' ? 'Preparando…' : 'Generar PDF'}
              </span>
            </button>
          </div>
        </section>
      </div>
      {whatsappOpen && activeQuote && (
        <WhatsAppContactChooser
          message={(contact) => createContactMessage(contact.name, activeQuote.pdfUrl)}
          onClose={() => setWhatsappOpen(false)}
          panelRef={whatsappPanel}
          titleId="availability-selection-whatsapp-title"
          viewportSheet
          zaydaFirst={zaydaFirst}
        />
      )}
    </div>,
    document.body,
  )
}
