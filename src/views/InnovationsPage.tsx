import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CollectionPage } from './CollectionPage'
import { ContactCard } from '../components/ContactCard'
import { LightboxImage } from '../components/ImageLightbox'
import { projectCollections } from '../data/projects'
import { innovationShowcaseImages } from '../data/innovationShowcase'
import { prefersReducedMotion } from '../animation/motion'
import { gsap, useGSAP } from '../animation/gsap'

interface InnovationsPageProps {
  modal?: boolean
}

const innovationsCollection = projectCollections.find(
  ({ id }) => id === 'innovaciones',
)!

const ideaRecommendations = [
  'un mupi en una experiencia interactiva para presentar un producto',
  'una valla digital en una campaña que cambie según la hora del día',
  'una parada de bus en un espacio de marca con sombra y carga para el celular',
]

export function InnovationsPage({ modal = false }: InnovationsPageProps) {
  const [idea, setIdea] = useState('')
  const [contactOpen, setContactOpen] = useState(false)
  const [ideaError, setIdeaError] = useState(false)
  const [recommendationIndex, setRecommendationIndex] = useState(0)
  const [recommendationText, setRecommendationText] = useState('')
  const [ideaFocused, setIdeaFocused] = useState(false)
  const ideaForm = useRef<HTMLFormElement>(null)
  const showcaseStrip = useRef<HTMLElement>(null)
  const recommendationTimeline = useRef<gsap.core.Timeline | null>(null)
  const project = innovationsCollection.projects[0]

  useGSAP(
    (_, contextSafe) => {
      const recommendation = ideaRecommendations[recommendationIndex]

      if (idea || prefersReducedMotion()) {
        setRecommendationText(recommendation)
        return
      }

      const typewriter = { characters: 0 }
      const renderRecommendation = contextSafe!(() => {
        setRecommendationText(
          recommendation.slice(0, Math.round(typewriter.characters)),
        )
      })
      const showNextRecommendation = contextSafe!(() => {
        setRecommendationIndex(
          (current) => (current + 1) % ideaRecommendations.length,
        )
      })

      setRecommendationText('')
      recommendationTimeline.current = gsap
        .timeline({ onComplete: showNextRecommendation })
        .to(typewriter, {
          characters: recommendation.length,
          duration: Math.min(3.2, Math.max(1.8, recommendation.length * 0.035)),
          ease: 'none',
          onUpdate: renderRecommendation,
          snap: { characters: 1 },
        })
        .to({}, { duration: 7 })

      return () => {
        recommendationTimeline.current = null
      }
    },
    {
      scope: ideaForm,
      dependencies: [idea, recommendationIndex],
      revertOnUpdate: true,
    },
  )

  useEffect(() => {
    recommendationTimeline.current?.paused(ideaFocused)
  }, [ideaFocused])

  useEffect(() => {
    if (window.location.hash !== '#imagina-tu-marca') return

    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById('imagina-tu-marca')
      if (!target) return

      const behavior = prefersReducedMotion() ? 'auto' : 'smooth'

      if (modal) {
        const panel = target.closest<HTMLElement>('.route-modal__panel')
        if (!panel) return

        let targetTop = 0
        let current: HTMLElement | null = target

        while (current && current !== panel) {
          targetTop += current.offsetTop
          current = current.offsetParent as HTMLElement | null
        }

        panel.scrollTo({
          top: Math.max(0, targetTop - 24),
          behavior,
        })
        return
      }

      target.scrollIntoView({ behavior, block: 'start' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [modal])

  useGSAP(
    (_, contextSafe) => {
      const strip = showcaseStrip.current
      const track = strip?.querySelector<HTMLElement>(
        '.innovations-showcase-strip__track',
      )
      if (!strip || !track || prefersReducedMotion()) return

      const loop = gsap.fromTo(
        track,
        { xPercent: -50 },
        {
          xPercent: 0,
          duration: 34,
          ease: 'none',
          repeat: -1,
          force3D: true,
        },
      )
      const playback = { rate: 1 }
      let keyboardInteraction = false
      const easeToStop = contextSafe!(() => {
        gsap.to(playback, {
          rate: 0,
          duration: 0.7,
          ease: 'power2.out',
          overwrite: true,
          onUpdate: () => loop.timeScale(playback.rate),
        })
      })
      const easeToMotion = contextSafe!(() => {
        loop.play()
        gsap.to(playback, {
          rate: 1,
          duration: 0.9,
          ease: 'power2.inOut',
          overwrite: true,
          onUpdate: () => loop.timeScale(playback.rate),
        })
      })
      const markKeyboardInteraction = () => {
        keyboardInteraction = true
      }
      const markPointerInteraction = () => {
        keyboardInteraction = false
      }
      const pauseForKeyboardFocus = () => {
        if (keyboardInteraction) easeToStop()
      }
      const resumeAfterFocus = (event: FocusEvent) => {
        if (!strip.contains(event.relatedTarget as Node | null)) easeToMotion()
      }
      const visibilityObserver = new IntersectionObserver(([entry]) => {
        loop.paused(!entry.isIntersecting)
      })

      document.addEventListener('keydown', markKeyboardInteraction, true)
      document.addEventListener('pointerdown', markPointerInteraction, true)
      strip.addEventListener('pointerenter', easeToStop)
      strip.addEventListener('pointerleave', easeToMotion)
      strip.addEventListener('focusin', pauseForKeyboardFocus)
      strip.addEventListener('focusout', resumeAfterFocus)
      visibilityObserver.observe(strip)
      return () => {
        visibilityObserver.disconnect()
        document.removeEventListener('keydown', markKeyboardInteraction, true)
        document.removeEventListener('pointerdown', markPointerInteraction, true)
        strip.removeEventListener('pointerenter', easeToStop)
        strip.removeEventListener('pointerleave', easeToMotion)
        strip.removeEventListener('focusin', pauseForKeyboardFocus)
        strip.removeEventListener('focusout', resumeAfterFocus)
      }
    },
    { scope: showcaseStrip },
  )

  const prepareIdeaEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = idea.trim()

    if (!message) {
      setIdeaError(true)
      return
    }

    const subject = encodeURIComponent('Nueva idea para innovar con Public')
    const body = encodeURIComponent(
      `Hola Public,\n\nTengo una idea que me gustaría explorar con ustedes:\n\n${message}\n\nMe gustaría conversar sobre cómo podríamos hacerla realidad.`,
    )

    window.location.href = `mailto:marketing@publicsv.net?subject=${subject}&body=${body}`
  }

  return (
    <>
      <CollectionPage
        collectionId="innovaciones"
        label={innovationsCollection.label}
        modal={modal}
      >
        <div className="innovations-page">
          <header className="collection-page__header innovations-hero">
            <div className="collection-page__intro innovations-hero__intro">
              <h1 aria-label={innovationsCollection.label}>
                <span className="collection-page__title-line">
                  <span>{innovationsCollection.label}</span>
                </span>
              </h1>
              <p>
                Tecnología, creatividad y producción para ideas que todavía no
                tienen formato.
              </p>
            </div>

            <div className="innovations-hero__statement">
              <h2>
                Si todavía no existe,
                <br />
                lo creamos juntos.
              </h2>
              <p>
                Trae una intuición, un reto o una idea imposible. Nosotros
                ponemos el espacio, la experiencia y la manera de hacerla
                visible.
              </p>
            </div>
          </header>

          <section
            className="collection-page__project innovations-proof"
            aria-labelledby="innovaciones-proof-title"
          >
            <div className="innovations-proof__media">
              <LightboxImage
                src={project.image!}
                alt={project.alt ?? project.title}
                caption="Innovaciones · Una idea hecha visible"
                triggerClassName="image-lightbox-trigger--fill"
                loading="eager"
                decoding="async"
              />
            </div>

            <div
              className="innovations-showcase-strip__intro"
              id="imagina-tu-marca"
            >
              <p>Ideas que ya hicimos realidad</p>
              <h2 id="innovaciones-showcase-title">
                Imagina tu marca aquí.
              </h2>
            </div>

            <section
              className="innovations-showcase-strip"
              aria-labelledby="innovaciones-showcase-title"
              ref={showcaseStrip}
            >
              <div className="innovations-showcase-strip__track">
                {[0, 1].map((groupIndex) => (
                  <div
                    className="innovations-showcase-strip__group"
                    aria-hidden={groupIndex === 1 || undefined}
                    key={groupIndex}
                  >
                    {innovationShowcaseImages.map((image, index) => (
                      <figure
                        className={`innovations-showcase-strip__tile is-tile-${index + 1}`}
                        key={image.src}
                      >
                        <LightboxImage
                          src={image.src}
                          alt={groupIndex === 0 ? image.alt : ''}
                          caption="Innovaciones · Imagina tu marca aquí"
                          triggerAriaHidden={groupIndex === 1 || undefined}
                          triggerClassName="innovations-showcase-strip__expand"
                          triggerTabIndex={groupIndex === 1 ? -1 : undefined}
                          loading="eager"
                          decoding="async"
                        />
                      </figure>
                    ))}
                  </div>
                ))}
              </div>
            </section>

            <div className="innovations-proof__caption">
              <div className="innovations-proof__message">
                <h2 id="innovaciones-proof-title">
                  Cada innovación empieza con una conversación.
                </h2>
                <p>
                  Cuéntanos qué quieres transformar, activar o hacer visible.
                  Puede ser una idea apenas empezando o un reto que todavía no
                  tiene solución.
                </p>
              </div>
            </div>
          </section>

          <section
            className="innovations-invite"
            aria-label="Comparte tu idea"
          >
            <form
              ref={ideaForm}
              className="innovations-idea"
              onSubmit={prepareIdeaEmail}
              onFocusCapture={() => setIdeaFocused(true)}
              onBlurCapture={() => setIdeaFocused(false)}
            >
              <div className="innovations-idea__label-row">
                <label htmlFor="innovacion-idea">Quiero convertir…</label>
              </div>
              <textarea
                id="innovacion-idea"
                name="idea"
                rows={2}
                value={idea}
                placeholder={recommendationText}
                aria-describedby={ideaError ? 'innovacion-idea-error' : undefined}
                aria-invalid={ideaError || undefined}
                onChange={(event) => {
                  setIdea(event.target.value)
                  if (ideaError) setIdeaError(false)
                }}
              />
              {ideaError && (
                <p className="innovations-idea__error" id="innovacion-idea-error">
                  Escribe tu idea en una frase para preparar el correo.
                </p>
              )}

              <div className="innovations-idea__actions">
                <button className="innovations-idea__submit" type="submit">
                  Preparar correo <span aria-hidden="true">↗</span>
                </button>
                <button
                  className="innovations-idea__contact"
                  type="button"
                  onClick={() => setContactOpen(true)}
                >
                  Ver formas de contacto
                </button>
              </div>
            </form>
          </section>
        </div>
      </CollectionPage>

      {contactOpen && <ContactCard onClose={() => setContactOpen(false)} />}
    </>
  )
}
