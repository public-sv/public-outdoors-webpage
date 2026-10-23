import { useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../animation/gsap'
import { isMobileExperience } from '../animation/mobile'
import { prefersReducedMotion } from '../animation/motion'
import { ContactCard } from '../components/ContactCard'
import { LightboxImage } from '../components/ImageLightbox'
import { projectCollections } from '../data/projects'
import outdoorDigitalCorridor from '../assets/images/outdoor-digital-corridor.webp'
import outdoorGranFormato from '../assets/images/outdoor-gran-formato.webp'
import { CollectionPage } from './CollectionPage'

interface OutdoorPageProps {
  modal?: boolean
}

type OutdoorFormat = 'gran-formato' | 'digital' | 'proximidad'

const outdoorCollection = projectCollections.find(({ id }) => id === 'outdoor')!
const [streetFurniture, billboard] = outdoorCollection.projects

const formats = {
  'gran-formato': {
    label: 'Gran formato',
    title: 'Presencia que domina el recorrido.',
    description:
      'Pasarelas y vallas fijas ubicadas en vías estratégicas para construir alcance, frecuencia y recordación.',
    products: ['Pasarelas fijas', 'Vallas fijas'],
    image: outdoorGranFormato,
    alt: 'Pasarelas publicitarias y vallas de gran formato sobre una vía de San Salvador',
  },
  digital: {
    label: 'Digital',
    title: 'Historias que avanzan con la ciudad.',
    description:
      'Pasarelas digitales y pantallas triples que combinan movimiento, secuencia y escala para multiplicar el impacto.',
    products: ['Pasarelas digitales', 'Pantallas digitales triples'],
    image: outdoorDigitalCorridor,
    alt: 'Corredor urbano con una red de pantallas digitales publicitarias',
  },
  proximidad: {
    label: 'Proximidad',
    title: 'Mensajes que acompañan el trayecto.',
    description:
      'Paradas de buses y banderolas que acercan tu marca a las personas en momentos cotidianos de espera y movilidad.',
    products: ['Paradas de buses', 'Banderolas'],
    image: streetFurniture.image!,
    alt: streetFurniture.alt ?? streetFurniture.title,
  },
} satisfies Record<
  OutdoorFormat,
  {
    label: string
    title: string
    description: string
    products: string[]
    image: string
    alt: string
  }
>

const coverageSteps = [
  {
    icon: 'location',
    title: 'Ubicación',
    description: 'Puntos estratégicos e intersecciones de alta circulación.',
  },
  {
    icon: 'format',
    title: 'Formato',
    description: 'El medio correcto para el objetivo y ritmo de tu campaña.',
  },
  {
    icon: 'exposure',
    title: 'Exposición',
    description: 'Presencia sostenida para que tu marca se vea y se recuerde.',
  },
] as const

function CoverageIcon({
  icon,
}: {
  icon: (typeof coverageSteps)[number]['icon']
}) {
  if (icon === 'location') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M38 20c0 10-14 23-14 23S10 30 10 20a14 14 0 1 1 28 0Z" />
        <circle cx="24" cy="20" r="4.5" />
      </svg>
    )
  }

  if (icon === 'format') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="7" y="9" width="34" height="30" rx="3" />
        <path d="M7 19h34M20 19v20" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M5 24s7-12 19-12 19 12 19 12-7 12-19 12S5 24 5 24Z" />
      <circle cx="24" cy="24" r="5" />
    </svg>
  )
}

export function OutdoorPage({ modal = false }: OutdoorPageProps) {
  const page = useRef<HTMLDivElement>(null)
  const strategySection = useRef<HTMLElement>(null)
  const formatsSection = useRef<HTMLElement>(null)
  const formatStage = useRef<HTMLDivElement>(null)
  const [activeFormat, setActiveFormat] =
    useState<OutdoorFormat>('gran-formato')
  const activeFormatRef = useRef<OutdoorFormat>('gran-formato')
  const [contactOpen, setContactOpen] = useState(false)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return

      const mobile = isMobileExperience()
      const modalScroller = modal
        ? page.current?.closest<HTMLElement>('.route-modal__panel')
        : undefined
      const title = page.current?.querySelector('.indoor-hero__title-inner')
      const statement = page.current?.querySelectorAll(
        '.indoor-hero__statement > *',
      )
      const heroMedia = page.current?.querySelector('.indoor-hero__media')
      const introduction = gsap.timeline({ defaults: { ease: 'power4.out' } })

      if (title) {
        introduction.from(title, {
          yPercent: 112,
          duration: mobile ? 0.68 : 0.9,
        })
      }

      if (statement?.length) {
        introduction.from(
          statement,
          {
            autoAlpha: 0,
            y: mobile ? 18 : 28,
            duration: mobile ? 0.5 : 0.65,
            stagger: 0.08,
          },
          0.2,
        )
      }

      if (heroMedia) {
        introduction.fromTo(
          heroMedia,
          {
            autoAlpha: 0,
            clipPath: mobile
              ? 'inset(10% 0% 0% 0% round 1.4rem)'
              : 'inset(18% 0% 0% 0% round 2.5rem)',
            scale: 1.035,
          },
          {
            autoAlpha: 1,
            clipPath: mobile
              ? 'inset(0% 0% 0% 0% round 1.4rem)'
              : 'inset(0% 0% 0% 0% round 2.5rem)',
            scale: 1,
            duration: mobile ? 0.72 : 1,
          },
          0.18,
        )
      }

      gsap.utils.toArray<HTMLElement>('.outdoor-reveal', page.current).forEach(
        (element) => {
          gsap.from(element, {
            autoAlpha: 0,
            y: mobile ? 28 : 52,
            duration: mobile ? 0.62 : 0.82,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: element,
              start: mobile ? 'top 90%' : 'top 84%',
              once: true,
              scroller: modalScroller,
            },
          })
        },
      )

      if (!mobile) {
        gsap.utils
          .toArray<HTMLElement>('[data-outdoor-parallax]', page.current)
          .forEach((element) => {
            const image = element.querySelector('img')
            if (!image) return

            gsap.fromTo(
              image,
              { yPercent: -3 },
              {
                yPercent: 3,
                ease: 'none',
                scrollTrigger: {
                  trigger: element,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 0.7,
                  scroller: modalScroller,
                },
              },
            )
          })
      }

      return () => introduction.kill()
    },
    { scope: page, dependencies: [modal] },
  )

  useGSAP(
    () => {
      const section = strategySection.current
      if (!section || prefersReducedMotion()) return

      const mobile = isMobileExperience()
      const modalScroller = modal
        ? page.current?.closest<HTMLElement>('.route-modal__panel')
        : undefined
      const eyebrow = section.querySelector('.indoor-strategy__eyebrow')
      const title = section.querySelector('.indoor-strategy__lead h2')
      const description = section.querySelector('.indoor-strategy__description')
      const steps = gsap.utils.toArray<HTMLElement>(
        '.indoor-strategy__step',
        section,
      )
      const stepDescriptions = steps.map((step) =>
        step.querySelector<HTMLElement>('.indoor-strategy__step-copy small')!,
      )

      const entrance = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: mobile ? 'top 88%' : 'top 76%',
          once: true,
          scroller: modalScroller,
        },
        defaults: { ease: 'power4.out' },
      })

      entrance
        .from(eyebrow, { autoAlpha: 0, y: 18, duration: 0.5 })
        .from(title, { autoAlpha: 0, y: mobile ? 32 : 54, duration: 0.8 }, 0.08)
        .from(description, { autoAlpha: 0, y: 28, duration: 0.65 }, 0.22)

      if (mobile) {
        steps.forEach((step) => step.removeAttribute('aria-current'))
        gsap.set(steps, { clearProps: 'opacity,visibility,transform' })
        gsap.set(stepDescriptions, {
          clearProps: 'opacity,visibility,height,paddingTop,transform',
        })
        return () => entrance.kill()
      }

      gsap.set(steps, { opacity: 0.42 })
      gsap.set(steps[0], { opacity: 1 })
      gsap.set(stepDescriptions, {
        autoAlpha: 0,
        height: 0,
        paddingTop: 0,
        y: 6,
      })
      gsap.set(stepDescriptions[0], {
        autoAlpha: 1,
        height: 'auto',
        paddingTop: '0.5rem',
        y: 0,
      })
      steps[0]?.setAttribute('aria-current', 'step')
      let activeIndex = 0
      let stepTransition: gsap.core.Timeline | undefined

      const showStep = (nextIndex: number, immediate = false) => {
        if (!immediate && nextIndex === activeIndex) return
        activeIndex = nextIndex
        stepTransition?.kill()

        steps.forEach((step, index) => {
          if (index === nextIndex) step.setAttribute('aria-current', 'step')
          else step.removeAttribute('aria-current')
        })

        if (immediate) {
          gsap.set(steps, { opacity: 0.42 })
          gsap.set(steps[nextIndex], { opacity: 1 })
          gsap.set(stepDescriptions, {
            autoAlpha: 0,
            height: 0,
            paddingTop: 0,
            y: 6,
          })
          gsap.set(stepDescriptions[nextIndex], {
            autoAlpha: 1,
            height: 'auto',
            paddingTop: '0.5rem',
            y: 0,
          })
          return
        }

        stepTransition = gsap.timeline({ defaults: { overwrite: true } })
        stepTransition
          .to(steps, { opacity: 0.42, duration: 0.18, ease: 'power2.out' }, 0)
          .to(
            stepDescriptions,
            {
              autoAlpha: 0,
              height: 0,
              paddingTop: 0,
              y: 6,
              duration: 0.22,
              ease: 'power2.inOut',
            },
            0,
          )
          .to(
            steps[nextIndex],
            { opacity: 1, duration: 0.22, ease: 'power2.out' },
            0.12,
          )
          .to(
            stepDescriptions[nextIndex],
            {
              autoAlpha: 1,
              height: 'auto',
              paddingTop: '0.5rem',
              y: 0,
              duration: 0.34,
              ease: 'power2.inOut',
            },
            0.1,
          )
      }

      showStep(0, true)
      const scrollSource: HTMLElement | Window = modalScroller ?? window
      let updateFrame = 0
      const updateActiveStep = () => {
        updateFrame = 0
        const viewportTop = modalScroller?.getBoundingClientRect().top ?? 0
        const viewportHeight = modalScroller?.clientHeight ?? window.innerHeight
        const rect = section.getBoundingClientRect()
        const travel = Math.max(section.offsetHeight - viewportHeight, 1)
        const progress = gsap.utils.clamp(
          0,
          1,
          (viewportTop - rect.top) / travel,
        )
        const nextIndex = progress < 1 / 3 ? 0 : progress < 2 / 3 ? 1 : 2
        showStep(nextIndex)
      }
      const queueStepUpdate = () => {
        if (updateFrame) return
        updateFrame = window.requestAnimationFrame(updateActiveStep)
      }

      scrollSource.addEventListener('scroll', queueStepUpdate, {
        passive: true,
      })
      updateActiveStep()

      return () => {
        scrollSource.removeEventListener('scroll', queueStepUpdate)
        if (updateFrame) window.cancelAnimationFrame(updateFrame)
        stepTransition?.kill()
        entrance.kill()
      }
    },
    { scope: strategySection, dependencies: [modal] },
  )

  useGSAP(
    () => {
      const section = formatsSection.current
      const pinnedStage = section?.querySelector<HTMLElement>(
        '.indoor-formats__sticky',
      )
      const modalScroller = page.current?.closest<HTMLElement>(
        '.route-modal__panel',
      )

      if (
        !modal ||
        !section ||
        !pinnedStage ||
        !modalScroller ||
        prefersReducedMotion()
      ) {
        return
      }

      const selectFormat = (format: OutdoorFormat) => {
        if (activeFormatRef.current === format) return
        activeFormatRef.current = format
        setActiveFormat(format)
      }

      const formatMedia = gsap.matchMedia()

      formatMedia.add('(min-width: 901px)', () => {
        const sectionStart = () => section.offsetTop
        const sectionEnd = () =>
          sectionStart() + section.offsetHeight - modalScroller.clientHeight

        const formatTrigger = ScrollTrigger.create({
          trigger: section,
          scroller: modalScroller,
          start: sectionStart,
          end: sectionEnd,
          invalidateOnRefresh: true,
          snap: {
            snapTo: [0, 0.5, 1],
            delay: 0.08,
            duration: { min: 0.25, max: 0.45 },
            ease: 'power2.inOut',
          },
          onEnter: () => selectFormat('gran-formato'),
          onEnterBack: () => selectFormat('proximidad'),
          onLeave: () => selectFormat('proximidad'),
          onLeaveBack: () => selectFormat('gran-formato'),
          onUpdate: ({ progress }) => {
            selectFormat(
              progress < 1 / 3
                ? 'gran-formato'
                : progress < 2 / 3
                  ? 'digital'
                  : 'proximidad',
            )
          },
        })

        const refreshCall = gsap.delayedCall(0, () => ScrollTrigger.refresh())

        return () => {
          refreshCall.kill()
          formatTrigger.kill()
        }
      })

      return () => formatMedia.revert()
    },
    { scope: formatsSection, dependencies: [modal] },
  )

  useGSAP(
    () => {
      if (prefersReducedMotion() || !formatStage.current) return

      const layers = gsap.utils.toArray<HTMLElement>(
        '[data-outdoor-format-layer]',
        formatStage.current,
      )
      const activeLayers = layers.filter(
        (layer) => layer.dataset.outdoorFormatLayer === activeFormat,
      )
      const inactiveLayers = layers.filter(
        (layer) => layer.dataset.outdoorFormatLayer !== activeFormat,
      )
      const transition = gsap.timeline({ defaults: { overwrite: 'auto' } })

      transition
        .to(
          inactiveLayers,
          { autoAlpha: 0, y: -8, duration: 0.28, ease: 'power2.out' },
          0,
        )
        .fromTo(
          activeLayers,
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.42, ease: 'power3.out' },
          0.06,
        )

      return () => transition.kill()
    },
    { scope: formatStage, dependencies: [activeFormat] },
  )

  return (
    <>
      <CollectionPage
        collectionId="outdoor"
        label={outdoorCollection.label}
        modal={modal}
      >
        <div className="indoor-page outdoor-page" ref={page}>
          <header className="indoor-hero outdoor-hero">
            <div className="indoor-hero__heading">
              <h1 aria-label={outdoorCollection.label}>
                <span className="indoor-hero__title-mask">
                  <span className="indoor-hero__title-inner">
                    {outdoorCollection.label}
                  </span>
                </span>
              </h1>

              <div className="indoor-hero__statement">
                <h2>
                  Tu marca,
                  <br />
                    presente en puntos clave del camino.
                </h2>
                <p>
                    Presencia de alto impacto en ubicaciones estratégicas que conectan con las personas durante sus recorridos.
                </p>
              </div>
            </div>

            <div className="indoor-hero__media" data-outdoor-parallax>
              <LightboxImage
                src={billboard.image!}
                alt={billboard.alt ?? billboard.title}
                caption="Outdoor · Presencia de marca"
                triggerClassName="image-lightbox-trigger--fill"
                loading="eager"
                decoding="async"
              />
            </div>
          </header>

          <section
            className="indoor-strategy outdoor-strategy"
            aria-labelledby="outdoor-strategy-title"
            ref={strategySection}
          >
            <div className="indoor-strategy__sticky">
              <div className="indoor-strategy__lead">
                <h2 id="outdoor-strategy-title">
                  No solo mostramos tu marca.
                </h2>
                <h2>
                  La ponemos en movimiento.
                </h2>
              </div>

              <div className="indoor-strategy__body">
                <p className="indoor-strategy__description">
                  Combinamos ubicación, formato y exposición para que cada
                  campaña conecte con la ciudad en el momento y lugar indicados.
                </p>

                <ol aria-label="Nuestra cobertura">
                  {coverageSteps.map((step) => (
                    <li className="indoor-strategy__step" key={step.title}>
                      <span className="indoor-strategy__icon">
                        <CoverageIcon icon={step.icon} />
                      </span>
                      <span className="indoor-strategy__step-copy">
                        <strong>{step.title}</strong>
                        <small>{step.description}</small>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          <section
            className="indoor-formats outdoor-formats"
            aria-labelledby="outdoor-formats-title"
            ref={formatsSection}
          >
            <div className="indoor-formats__sticky">
              <header className="indoor-formats__header outdoor-reveal">
                <div>
                  <h2 id="outdoor-formats-title">
                    Formatos que viven en la ciudad.
                  </h2>
                </div>
              </header>

              <div
                className="indoor-formats__stage"
                id="outdoor-format-panel"
                role="tabpanel"
                aria-labelledby={`outdoor-format-${activeFormat}`}
                ref={formatStage}
              >
                <div
                  className="indoor-formats__visual"
                  data-outdoor-parallax
                >
                  {(Object.keys(formats) as OutdoorFormat[]).map((format) => (
                    <div
                      className="indoor-formats__visual-layer"
                      data-outdoor-format-layer={format}
                      aria-hidden={activeFormat !== format}
                      key={format}
                    >
                      <LightboxImage
                        src={formats[format].image}
                        alt={formats[format].alt}
                        caption={`Outdoor · ${formats[format].label}`}
                        triggerClassName="image-lightbox-trigger--fill"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ))}
                </div>

                <div className="indoor-formats__copy">
                  <div
                    className="indoor-formats__tabs"
                    role="tablist"
                    aria-label="Formatos Outdoor"
                  >
                    {(Object.keys(formats) as OutdoorFormat[]).map((format) => (
                      <button
                        className={activeFormat === format ? 'is-active' : undefined}
                        id={`outdoor-format-${format}`}
                        key={format}
                        type="button"
                        role="tab"
                        aria-controls="outdoor-format-panel"
                        aria-selected={activeFormat === format}
                        onClick={() => {
                          activeFormatRef.current = format
                          setActiveFormat(format)
                        }}
                      >
                        {formats[format].label}
                      </button>
                    ))}
                  </div>

                  <div className="indoor-formats__copy-layers">
                    {(Object.keys(formats) as OutdoorFormat[]).map((format) => (
                      <div
                        className="indoor-formats__copy-layer"
                        data-outdoor-format-layer={format}
                        aria-hidden={activeFormat !== format}
                        key={format}
                      >
                        <h3>{formats[format].title}</h3>
                        <p>{formats[format].description}</p>
                        <ul aria-label={`Incluye ${formats[format].label}`}>
                          {formats[format].products.map((product) => (
                            <li key={product}>
                              <span aria-hidden="true" />
                              {product}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            className="indoor-cta outdoor-cta outdoor-reveal"
            aria-labelledby="outdoor-cta-title"
          >
            <div>
              <h2 id="outdoor-cta-title">
                Hagamos visible
                <br />
                tu próxima idea.
              </h2>
              <button type="button" onClick={() => setContactOpen(true)}>
                Contáctanos <span aria-hidden="true">↗</span>
              </button>
            </div>
          </section>
        </div>
      </CollectionPage>

      {contactOpen && <ContactCard onClose={() => setContactOpen(false)} />}
    </>
  )
}
