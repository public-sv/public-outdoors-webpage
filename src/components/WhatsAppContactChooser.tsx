import type { Ref } from 'react'

export const whatsappContacts = [
  { name: 'Iris Quinteros', number: '+503 7840 0641', whatsapp: '50378400641' },
  { name: 'Zayda Reyes', number: '+503 7607 9725', whatsapp: '50376079725' },
  { name: 'Rosemary Daboub', number: '+503 7855 7192', whatsapp: '50378557192' },
]

export function getRandomZaydaFirst() {
  return Math.random() < .5
}

type WhatsAppContact = (typeof whatsappContacts)[number]

interface WhatsAppContactChooserProps {
  message?: string | ((contact: WhatsAppContact) => string)
  onClose: () => void
  panelRef?: Ref<HTMLDivElement>
  titleId: string
  viewportSheet?: boolean
  zaydaFirst: boolean
}

export function WhatsAppContactChooser({
  message,
  onClose,
  panelRef,
  titleId,
  viewportSheet = false,
  zaydaFirst,
}: WhatsAppContactChooserProps) {
  const [iris, zayda, rosemary] = whatsappContacts
  const orderedContacts = zaydaFirst
    ? [zayda, iris, rosemary]
    : [iris, zayda, rosemary]

  return (
    <div
      className={`contact-card__whatsapp-panel${viewportSheet ? ' is-viewport-sheet' : ''}`}
      ref={panelRef}
      data-export-exclude="true"
      onClick={onClose}
    >
      <div
        className="contact-card__whatsapp-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="contact-card__whatsapp-header">
          <div>
            <span>WhatsApp</span>
            <strong id={titleId}>¿Con quién deseas hablar?</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar contactos de WhatsApp"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <div className="contact-card__whatsapp-list">
          {orderedContacts.map((contact) => {
            const contactMessage = typeof message === 'function'
              ? message(contact)
              : message
            const query = contactMessage
              ? `?text=${encodeURIComponent(contactMessage)}`
              : ''

            return (
              <a
                href={`https://wa.me/${contact.whatsapp}${query}`}
                target="_blank"
                rel="noreferrer"
                onClick={onClose}
                key={contact.whatsapp}
                aria-label={`Abrir WhatsApp con ${contact.name}, ${contact.number}`}
              >
                <span className="contact-card__whatsapp-avatar" aria-hidden="true">
                  {contact.name.charAt(0)}
                </span>
                <span>
                  <strong>{contact.name}</strong>
                  <small>{contact.number}</small>
                </span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 12h8M13 8l4 4-4 4" />
                </svg>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
