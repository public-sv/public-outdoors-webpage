import { useCallback, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, useGSAP } from '../animation/gsap'
import { prefersReducedMotion } from '../animation/motion'
import {
  availableLocations,
  availableMediaCategories,
} from '../data/availability'
import { usePageTone } from '../hooks/usePageTone'

interface AvailabilityPageProps {
  onContact: () => void
}

type MediaType = 'fijo' | 'digital'
type ExplorerView = 'locations' | 'categories'

export function AvailabilityPage({ onContact }: AvailabilityPageProps) {
  usePageTone('#07080b', false)
  const page = useRef<HTMLElement>(null)
  const explorerStory = useRef<HTMLDivElement>(null)
  const explorerStage = useRef<HTMLElement>(null)
  const direction = useRef(1)
  const swipeStart = useRef<number | null>(null)
  const hasRenderedLocation = useRef(false)
  const activeIndexRef = useRef(0)
  const scrollTarget = useRef<number | null>(null)
  const lenis = useRef<Lenis | null>(null)
  const inventoryList = useRef<HTMLUListElement>(null)
  const explorerSwitcher = useRef<HTMLDivElement>(null)
  const locationButtons = useRef<Array<HTMLButtonElement | null>>([])
  const previousButtonTops = useRef<number[]>([])
  const transitioningTitles = useRef<{
    outgoing: HTMLElement | null
    incoming: HTMLElement | null
  } | null>(null)
  const [mediaType, setMediaType] = useState<MediaType>('fijo')
  const [explorerView, setExplorerView] = useState<ExplorerView>('locations')
  const [explorerMenuOpen, setExplorerMenuOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [showInventoryScrollCue, setShowInventoryScrollCue] = useState(false)
  const explorerItems =
    explorerView === 'locations' ? availableLocations : availableMediaCategories
  const activeLocation = availableLocations[activeIndex] ?? availableLocations[0]
  const activeCategory =
    availableMediaCategories[activeIndex] ?? availableMediaCategories[0]
  const activeImage =
    explorerView === 'locations' ? activeLocation.image : activeCategory.image
  const activeImageAlt =
    explorerView === 'locations'
      ? activeLocation.imageAlt
      : activeCategory.imageAlt
  const activeImageLabel =
    explorerView === 'locations' ? activeLocation.region : activeCategory.name
  const inventoryMedia =
    explorerView === 'locations'
      ? activeLocation.media.map((medium) => ({
          ...medium,
          locationId: activeLocation.id,
          locationName: activeLocation.name,
        }))
      : availableLocations.flatMap((location) =>
          location.media
            .filter((medium) => medium.category === activeCategory.id)
            .map((medium) => ({
              ...medium,
              locationId: location.id,
              locationName: location.name,
            })),
        )

  const selectMediaType = useCallback((nextType: MediaType) => {
    if (nextType === mediaType) return

    setMediaType(nextType)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        explorerStory.current?.scrollIntoView({
          behavior: 'auto',
          block: 'start',
        })
      })
    })
  }, [mediaType])

  const selectExplorerView = useCallback((nextView: ExplorerView) => {
    setExplorerMenuOpen(false)
    if (nextView === explorerView) return

    activeIndexRef.current = 0
    scrollTarget.current = null
    setActiveIndex(0)
    setExplorerView(nextView)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        explorerStory.current?.scrollIntoView({
          behavior: 'auto',
          block: 'start',
        })
      })
    })
  }, [explorerView])

  const activateExplorerItem = useCallback((nextIndex: number) => {
    const boundedIndex = Math.max(
      0,
      Math.min(explorerItems.length - 1, nextIndex),
    )

    if (boundedIndex === activeIndexRef.current) return

    if (!prefersReducedMotion()) {
      previousButtonTops.current = locationButtons.current.map(
        (button) => button?.getBoundingClientRect().top ?? 0,
      )
      transitioningTitles.current = {
        outgoing:
          locationButtons.current[activeIndexRef.current]?.querySelector(
            'strong',
          ) ?? null,
        incoming:
          locationButtons.current[boundedIndex]?.querySelector('strong') ?? null,
      }
    }

    direction.current = boundedIndex > activeIndexRef.current ? 1 : -1
    activeIndexRef.current = boundedIndex
    setActiveIndex(boundedIndex)
  }, [explorerItems.length])

  const goToExplorerItem = useCallback(
    (nextIndex: number) => {
      const boundedIndex = Math.max(
        0,
        Math.min(explorerItems.length - 1, nextIndex),
      )

      if (!window.matchMedia('(min-width: 1101px)').matches) {
        activateExplorerItem(boundedIndex)
        return
      }
      const story = explorerStory.current
      if (!story) return
      const stageHeight = explorerStage.current?.getBoundingClientRect().height
      const stepDistance = (stageHeight || window.innerHeight) * 0.85

      scrollTarget.current = boundedIndex
      activateExplorerItem(boundedIndex)
      const destination =
        story.getBoundingClientRect().top +
        window.scrollY +
        boundedIndex * stepDistance

      if (prefersReducedMotion() || !lenis.current) {
        window.scrollTo({ top: destination, behavior: 'auto' })
        scrollTarget.current = null
      } else {
        lenis.current.scrollTo(destination, {
          duration: 1.05,
          easing: (progress) => 1 - Math.pow(1 - progress, 4),
          lock: true,
          force: true,
          onComplete: () => {
            scrollTarget.current = null
          },
        })
      }
    },
    [activateExplorerItem, explorerItems.length],
  )

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })

    availableLocations.forEach((location) => {
      const image = new Image()
      image.src = location.image
    })

    availableMediaCategories.forEach((category) => {
      const image = new Image()
      image.src = category.image
    })
  }, [])

  useEffect(() => {
    if (!explorerMenuOpen) return

    const closeMenu = (event: PointerEvent) => {
      if (!explorerSwitcher.current?.contains(event.target as Node)) {
        setExplorerMenuOpen(false)
      }
    }
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExplorerMenuOpen(false)
    }

    window.addEventListener('pointerdown', closeMenu)
    window.addEventListener('keydown', closeWithEscape)
    return () => {
      window.removeEventListener('pointerdown', closeMenu)
      window.removeEventListener('keydown', closeWithEscape)
    }
  }, [explorerMenuOpen])

  useEffect(() => {
    const navigateWithKeyboard = (event: KeyboardEvent) => {
      if (mediaType !== 'fijo') return

      const target = event.target as HTMLElement | null
      if (
        target?.matches('input, textarea, select') ||
        target?.closest('.site-nav') ||
        target?.closest('.availability-explorer__switcher')
      ) {
        return
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault()
        goToExplorerItem(activeIndexRef.current - 1)
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault()
        goToExplorerItem(activeIndexRef.current + 1)
      }
    }

    window.addEventListener('keydown', navigateWithKeyboard)
    return () => window.removeEventListener('keydown', navigateWithKeyboard)
  }, [goToExplorerItem, mediaType])

  useEffect(() => {
    const list = inventoryList.current
    if (!list) return

    list.scrollTop = 0

    const updateScrollCue = () => {
      const hasMoreBelow =
        list.scrollHeight - list.scrollTop - list.clientHeight > 3
      setShowInventoryScrollCue(hasMoreBelow)
    }

    const frame = requestAnimationFrame(updateScrollCue)
    const resizeObserver = new ResizeObserver(updateScrollCue)
    resizeObserver.observe(list)
    list.addEventListener('scroll', updateScrollCue, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      list.removeEventListener('scroll', updateScrollCue)
    }
  }, [activeIndex, explorerView, mediaType])

  useGSAP(
    () => {
      if (prefersReducedMotion()) return

      const orbs = gsap.utils.toArray<HTMLElement>('.availability-page__orb')
      const paths = [
        [
          { xPercent: 22, yPercent: 18, scaleX: 1.12, scaleY: 0.92, rotation: 10, opacity: 0.2, duration: 15 },
          { xPercent: 46, yPercent: 4, scaleX: 0.9, scaleY: 1.16, rotation: -12, opacity: 0.14, duration: 17 },
          { xPercent: 16, yPercent: 38, scaleX: 1.08, scaleY: 0.96, rotation: 17, opacity: 0.19, duration: 16 },
          { xPercent: 0, yPercent: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 0.18, duration: 15 },
        ],
        [
          { xPercent: -18, yPercent: 32, scaleX: 0.94, scaleY: 1.13, rotation: -14, opacity: 0.2, duration: 18 },
          { xPercent: -38, yPercent: 8, scaleX: 1.14, scaleY: 0.9, rotation: 12, opacity: 0.13, duration: 16 },
          { xPercent: -12, yPercent: 48, scaleX: 0.92, scaleY: 1.1, rotation: -8, opacity: 0.18, duration: 19 },
          { xPercent: 0, yPercent: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 0.18, duration: 17 },
        ],
        [
          { xPercent: 24, yPercent: -28, scaleX: 1.16, scaleY: 0.9, rotation: 13, opacity: 0.19, duration: 17 },
          { xPercent: -22, yPercent: -44, scaleX: 0.91, scaleY: 1.14, rotation: -16, opacity: 0.13, duration: 19 },
          { xPercent: 14, yPercent: -14, scaleX: 1.08, scaleY: 0.96, rotation: 9, opacity: 0.17, duration: 16 },
          { xPercent: 0, yPercent: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 0.18, duration: 18 },
        ],
      ]

      const timelines = orbs.map((orb, index) => {
        const timeline = gsap.timeline({ repeat: -1 })

        gsap.set(orb, {
          force3D: true,
          transformOrigin: '50% 50%',
        })

        paths[index].forEach((point) => {
          timeline.to(orb, {
            ...point,
            ease: 'sine.inOut',
            force3D: true,
          })
        })

        return timeline
      })

      const syncWithPageVisibility = () => {
        timelines.forEach((timeline) => {
          if (document.hidden) {
            timeline.pause()
          } else {
            timeline.resume()
          }
        })
      }

      document.addEventListener('visibilitychange', syncWithPageVisibility)

      return () => {
        document.removeEventListener('visibilitychange', syncWithPageVisibility)
        timelines.forEach((timeline) => timeline.kill())
      }
    },
    { scope: page },
  )

  useGSAP(
    () => {
      const media = gsap.matchMedia()

      media.add('(min-width: 1101px)', () => {
        if (mediaType !== 'fijo') {
          requestAnimationFrame(() => ScrollTrigger.refresh())
          return
        }

        const smoothScroll = new Lenis({
          autoRaf: false,
          autoToggle: true,
          anchors: {
            duration: 1.05,
            easing: (progress) => 1 - Math.pow(1 - progress, 4),
          },
          duration: 1.08,
          easing: (progress) => Math.min(1, 1.001 - Math.pow(2, -10 * progress)),
          smoothWheel: true,
          syncTouch: false,
          wheelMultiplier: 0.72,
          overscroll: true,
          prevent: (node) =>
            Boolean(node.closest('.availability-explorer__media-list')),
        })
        lenis.current = smoothScroll

        const updateScrollTrigger = () => ScrollTrigger.update()
        const updateLenis = (time: number) => smoothScroll.raf(time * 1000)

        smoothScroll.on('scroll', updateScrollTrigger)
        gsap.ticker.add(updateLenis)
        gsap.ticker.lagSmoothing(0)

        const trigger = ScrollTrigger.create({
          trigger: explorerStory.current,
          pin: explorerStage.current,
          pinSpacing: true,
          invalidateOnRefresh: true,
          start: 'top top',
          end: () => {
            const stageHeight = explorerStage.current?.getBoundingClientRect().height
            return `+=${explorerItems.length * (stageHeight || window.innerHeight) * 0.85}`
          },
          onUpdate: (self) => {
            if (scrollTarget.current !== null) return

            const stageHeight = explorerStage.current?.getBoundingClientRect().height
            const stepDistance = (stageHeight || window.innerHeight) * 0.85
            const nextIndex = Math.min(
              explorerItems.length - 1,
              Math.max(0, Math.round((self.scroll() - self.start) / stepDistance)),
            )
            activateExplorerItem(nextIndex)
          },
        })

        requestAnimationFrame(() => ScrollTrigger.refresh())
        return () => {
          smoothScroll.off('scroll', updateScrollTrigger)
          gsap.ticker.remove(updateLenis)
          gsap.ticker.lagSmoothing(500, 33)
          smoothScroll.destroy()
          lenis.current = null
          trigger.kill()
        }
      })

      return () => media.revert()
    },
    {
      dependencies: [
        goToExplorerItem,
        mediaType,
        explorerView,
        explorerItems.length,
      ],
      scope: page,
      revertOnUpdate: true,
    },
  )

  useGSAP(
    () => {
      if (prefersReducedMotion()) return

      const timeline = gsap
        .timeline()
        .from(
          '.availability-page__title-line > span',
          {
            yPercent: 140,
            duration: 1,
            stagger: 0.1,
            ease: 'power4.out',
          },
          0,
        )
        .from(
          '.availability-page__intro-footer > *',
          {
            autoAlpha: 0,
            y: 18,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
          },
          0.44,
        )

      return () => timeline.kill()
    },
    { scope: page },
  )

  useGSAP(
    () => {
      if (!hasRenderedLocation.current) {
        hasRenderedLocation.current = true
        return
      }

      const buttons = locationButtons.current.filter(
        (button): button is HTMLButtonElement => Boolean(button),
      )
      const previousTops = previousButtonTops.current
      const titles = transitioningTitles.current
      previousButtonTops.current = []
      transitioningTitles.current = null

      if (prefersReducedMotion()) return

      const travel = direction.current
      const buttonTweens = buttons.flatMap((button, index) => {
        const previousTop = previousTops[index]
        if (previousTop === undefined) return []

        const offset = previousTop - button.getBoundingClientRect().top
        if (Math.abs(offset) < 0.5) return []

        return gsap.fromTo(
          button,
          { y: offset },
          {
            y: 0,
            duration: 0.42,
            ease: 'power3.out',
            overwrite: true,
            clearProps: 'transform',
          },
        )
      })

      const titleTimeline = gsap.timeline()

      if (titles?.outgoing) {
        titleTimeline.fromTo(
          titles.outgoing,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.2,
            ease: 'power1.out',
            clearProps: 'opacity,visibility',
          },
          0.08,
        )
      }

      if (titles?.incoming) {
        titleTimeline.fromTo(
          titles.incoming,
          { autoAlpha: 0, y: 7 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.34,
            ease: 'power3.out',
            clearProps: 'opacity,visibility,transform',
          },
          0,
        )
      }

      const timeline = gsap
        .timeline()
        .fromTo(
          '.availability-explorer__image',
          { autoAlpha: 0.7, scale: 1.012 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.52,
            ease: 'power2.out',
          },
        )
        .fromTo(
          '.availability-explorer__medium',
          { autoAlpha: 0, x: travel * 16 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.42,
            stagger: 0.035,
            ease: 'power2.out',
          },
          0.04,
        )

      return () => {
        buttonTweens.forEach((tween) => tween.kill())
        titleTimeline.kill()
        timeline.kill()
      }
    },
    {
      dependencies: [activeIndex, explorerView],
      scope: page,
      revertOnUpdate: true,
    },
  )

  return (
    <main className="availability-page" ref={page}>
      <div className="availability-page__orb availability-page__orb--red" aria-hidden="true" />
      <div className="availability-page__orb availability-page__orb--blue" aria-hidden="true" />
      <div className="availability-page__orb availability-page__orb--green" aria-hidden="true" />

      <div className="availability-page__shell">
        <header className="availability-page__intro">
          <h1 aria-label="El lugar de tu marca.">
            <span className="availability-page__title-line" aria-hidden="true">
              <span>El lugar</span>
            </span>
            <span className="availability-page__title-line" aria-hidden="true">
              <span>de tu marca.</span>
            </span>
          </h1>
          <div className="availability-page__intro-footer">
            <p className="availability-page__lede">
              <span>Espacios reales.</span>
              <span>Posibilidades extraordinarias.</span>
            </p>
            <a className="availability-page__explore" href="#explorar">
              <span>Explorar medios</span>
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </header>

        <div
          className={`availability-explorer__story availability-explorer__story--${mediaType}`}
          ref={explorerStory}
        >
          <section
            id="explorar"
            className={`availability-explorer availability-explorer--${mediaType}`}
            aria-label="Disponibilidad por tipo de medio"
            ref={explorerStage}
          >
          <div className="availability-explorer__tabs" role="tablist" aria-label="Tipo de medio">
            <button
              id="availability-tab-fijo"
              className={mediaType === 'fijo' ? 'is-active' : undefined}
              type="button"
              role="tab"
              aria-selected={mediaType === 'fijo'}
              aria-controls="availability-panel-fijo"
              onClick={() => selectMediaType('fijo')}
            >
              Fijo
            </button>
            <button
              id="availability-tab-digital"
              className={mediaType === 'digital' ? 'is-active' : undefined}
              type="button"
              role="tab"
              aria-selected={mediaType === 'digital'}
              aria-controls="availability-panel-digital"
              onClick={() => selectMediaType('digital')}
            >
              Digital
            </button>
          </div>

          {mediaType === 'fijo' ? (
          <div
            id="availability-panel-fijo"
            className="availability-explorer__fixed-panel"
            role="tabpanel"
            aria-labelledby="availability-tab-fijo"
          >
          <aside className="availability-explorer__locations">
            <div
              className={`availability-explorer__switcher${explorerMenuOpen ? ' is-open' : ''}`}
              ref={explorerSwitcher}
            >
              <button
                className="availability-explorer__switcher-trigger"
                type="button"
                aria-haspopup="menu"
                aria-expanded={explorerMenuOpen}
                aria-controls="availability-explorer-menu"
                onClick={() => setExplorerMenuOpen((open) => !open)}
              >
                <span>Explora</span>
                <span className="availability-explorer__switcher-chevron" aria-hidden="true" />
              </button>

              <div
                id="availability-explorer-menu"
                className="availability-explorer__switcher-menu"
                role="menu"
                aria-hidden={!explorerMenuOpen}
              >
                <button
                  className={explorerView === 'locations' ? 'is-active' : undefined}
                  type="button"
                  role="menuitemradio"
                  aria-checked={explorerView === 'locations'}
                  onClick={() => selectExplorerView('locations')}
                >
                  <span>Por ubicación</span>
                </button>
                <button
                  className={explorerView === 'categories' ? 'is-active' : undefined}
                  type="button"
                  role="menuitemradio"
                  aria-checked={explorerView === 'categories'}
                  onClick={() => selectExplorerView('categories')}
                >
                  <span>Por tipo de medio</span>
                </button>
              </div>
            </div>

            <div className="availability-explorer__location-list">
              {explorerItems.map((item, index) => (
                <button
                  className={`availability-explorer__location${
                    index === activeIndex ? ' is-active' : ''
                  }`}
                  type="button"
                  aria-current={index === activeIndex ? 'true' : undefined}
                  ref={(button) => {
                    locationButtons.current[index] = button
                  }}
                  onClick={() => goToExplorerItem(index)}
                  key={item.id}
                >
                  <strong>{item.name}</strong>
                </button>
              ))}
            </div>
            <p className="availability-explorer__hint">
              {explorerView === 'locations'
                ? 'Usa las flechas o elige una ubicación.'
                : 'Explora los medios por categoría.'}
            </p>
          </aside>

          <div className="availability-explorer__stage">
            <div
              className="availability-explorer__image-frame"
              onPointerDown={(event) => {
                swipeStart.current = event.clientX
              }}
              onPointerUp={(event) => {
                if (swipeStart.current === null) return
                const distance = event.clientX - swipeStart.current
                swipeStart.current = null
                if (Math.abs(distance) < 48) return
                goToExplorerItem(activeIndexRef.current + (distance < 0 ? 1 : -1))
              }}
            >
              <img
                className="availability-explorer__image"
                src={activeImage}
                alt={activeImageAlt}
              />
              <div className="availability-explorer__image-shade" aria-hidden="true" />
              <p className="availability-explorer__photo-label">
                Fotografía / PUBLIC
              </p>
              <p className="availability-explorer__image-index">
                {String(activeIndex + 1).padStart(2, '0')} — {activeImageLabel}
              </p>
            </div>

            <div className="availability-explorer__stage-actions">
              <button
                className="availability-explorer__contact"
                type="button"
                onClick={onContact}
              >
                Ver disponibilidad
                <span aria-hidden="true">↗</span>
              </button>

              <div className="availability-explorer__controls">
                <button
                  type="button"
                  aria-label={
                    explorerView === 'locations'
                      ? 'Ubicación anterior'
                      : 'Categoría anterior'
                  }
                  disabled={activeIndex === 0}
                  onClick={() => goToExplorerItem(activeIndex - 1)}
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label={
                    explorerView === 'locations'
                      ? 'Ubicación siguiente'
                      : 'Categoría siguiente'
                  }
                  disabled={activeIndex === explorerItems.length - 1}
                  onClick={() => goToExplorerItem(activeIndex + 1)}
                >
                  →
                </button>
              </div>
            </div>
          </div>

          <aside className="availability-explorer__inventory">
            <div className="availability-explorer__inventory-heading">
              <p className="availability-explorer__label">
                {explorerView === 'locations'
                  ? 'Medios disponibles'
                  : `Medios ${activeCategory.name}`}
              </p>
            </div>

            <ul className="availability-explorer__media-list" ref={inventoryList}>
              {inventoryMedia.map((medium) => (
                <li
                  className="availability-explorer__medium"
                  key={`${medium.locationId}-${medium.name}`}
                >
                  <span className="availability-explorer__status" aria-hidden="true" />
                  <div className="availability-explorer__medium-copy">
                    <p>{medium.name}</p>
                    {explorerView === 'categories' && (
                      <span>{medium.locationName}</span>
                    )}
                  </div>
                  <strong aria-label={`${medium.available} disponibles`}>
                    {medium.available}
                  </strong>
                </li>
              ))}
            </ul>

            {showInventoryScrollCue && (
              <button
                className="availability-explorer__scroll-cue"
                type="button"
                aria-label="Mostrar más medios disponibles"
                onClick={() => {
                  const list = inventoryList.current
                  if (!list) return
                  list.scrollBy({
                    top: list.clientHeight * 0.55,
                    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
                  })
                }}
              >
                <span aria-hidden="true">↓</span>
              </button>
            )}

          </aside>
          </div>
          ) : (
          <div
            id="availability-panel-digital"
            className="availability-explorer__digital"
            role="tabpanel"
            aria-labelledby="availability-tab-digital"
          >
            <h2>Tu marca, donde está tu audiencia.</h2>
            <p className="availability-explorer__digital-copy">
              Conecta con nuestro equipo de ventas para conocer formatos,
              audiencias y los reportes que harán crecer tu campaña.
            </p>
            <button
              className="availability-explorer__digital-contact"
              type="button"
              onClick={onContact}
            >
              Contactar a ventas
              <span aria-hidden="true">↗</span>
            </button>
          </div>
          )}
          </section>

        </div>
      </div>
    </main>
  )
}
