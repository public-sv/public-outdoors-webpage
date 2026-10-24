import { useCallback, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, useGSAP } from '../animation/gsap'
import { prefersReducedMotion } from '../animation/motion'
import { availableLocations } from '../data/availability'
import { usePageTone } from '../hooks/usePageTone'

interface AvailabilityPageProps {
  onContact: () => void
}

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
  const locationButtons = useRef<Array<HTMLButtonElement | null>>([])
  const previousButtonTops = useRef<number[]>([])
  const transitioningTitles = useRef<{
    outgoing: HTMLElement | null
    incoming: HTMLElement | null
  } | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [showInventoryScrollCue, setShowInventoryScrollCue] = useState(false)
  const activeLocation = availableLocations[activeIndex]

  const activateLocation = useCallback((nextIndex: number) => {
    const boundedIndex = Math.max(
      0,
      Math.min(availableLocations.length - 1, nextIndex),
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
  }, [])

  const goToLocation = useCallback(
    (nextIndex: number) => {
      const boundedIndex = Math.max(
        0,
        Math.min(availableLocations.length - 1, nextIndex),
      )

      if (!window.matchMedia('(min-width: 1101px)').matches) {
        activateLocation(boundedIndex)
        return
      }
      const story = explorerStory.current
      if (!story) return
      const stageHeight = explorerStage.current?.getBoundingClientRect().height
      const stepDistance = (stageHeight || window.innerHeight) * 0.85

      scrollTarget.current = boundedIndex
      activateLocation(boundedIndex)
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
    [activateLocation],
  )

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })

    availableLocations.forEach((location) => {
      const image = new Image()
      image.src = location.image
    })
  }, [])

  useEffect(() => {
    const navigateWithKeyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (
        target?.matches('input, textarea, select') ||
        target?.closest('.site-nav')
      ) {
        return
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault()
        goToLocation(activeIndexRef.current - 1)
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault()
        goToLocation(activeIndexRef.current + 1)
      }
    }

    window.addEventListener('keydown', navigateWithKeyboard)
    return () => window.removeEventListener('keydown', navigateWithKeyboard)
  }, [goToLocation])

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
  }, [activeIndex])

  useGSAP(
    () => {
      const media = gsap.matchMedia()

      media.add('(min-width: 1101px)', () => {
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
            return `+=${availableLocations.length * (stageHeight || window.innerHeight) * 0.85}`
          },
          onUpdate: (self) => {
            if (scrollTarget.current !== null) return

            const stageHeight = explorerStage.current?.getBoundingClientRect().height
            const stepDistance = (stageHeight || window.innerHeight) * 0.85
            const nextIndex = Math.min(
              availableLocations.length - 1,
              Math.max(0, Math.round((self.scroll() - self.start) / stepDistance)),
            )
            activateLocation(nextIndex)
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
    { dependencies: [goToLocation], scope: page, revertOnUpdate: true },
  )

  useGSAP(
    () => {
      if (prefersReducedMotion()) return

      const timeline = gsap
        .timeline()
        .from(
          '.availability-page__title-line > span',
          {
            yPercent: 112,
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
      dependencies: [activeIndex],
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
              <span>Explorar ubicaciones</span>
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </header>

        <div className="availability-explorer__story" ref={explorerStory}>
          <section
            id="explorar"
            className="availability-explorer"
            aria-label="Explorador de ubicaciones disponibles"
            ref={explorerStage}
          >
          <aside className="availability-explorer__locations">
            <p className="availability-explorer__label">Elige un lugar</p>
            <div className="availability-explorer__location-list">
              {availableLocations.map((location, index) => (
                <button
                  className={`availability-explorer__location${
                    index === activeIndex ? ' is-active' : ''
                  }`}
                  type="button"
                  aria-current={index === activeIndex ? 'true' : undefined}
                  ref={(button) => {
                    locationButtons.current[index] = button
                  }}
                  onClick={() => goToLocation(index)}
                  key={location.id}
                >
                  <strong>{location.name}</strong>
                </button>
              ))}
            </div>
            <p className="availability-explorer__hint">
              Usa las flechas o elige una ubicación.
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
                goToLocation(activeIndexRef.current + (distance < 0 ? 1 : -1))
              }}
            >
              <img
                className="availability-explorer__image"
                src={activeLocation.image}
                alt={activeLocation.imageAlt}
              />
              <div className="availability-explorer__image-shade" aria-hidden="true" />
              <p className="availability-explorer__photo-label">
                Fotografía / PUBLIC
              </p>
              <p className="availability-explorer__image-index">
                {String(activeIndex + 1).padStart(2, '0')} — {activeLocation.region}
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
                  aria-label="Ubicación anterior"
                  disabled={activeIndex === 0}
                  onClick={() => goToLocation(activeIndex - 1)}
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label="Ubicación siguiente"
                  disabled={activeIndex === availableLocations.length - 1}
                  onClick={() => goToLocation(activeIndex + 1)}
                >
                  →
                </button>
              </div>
            </div>
          </div>

          <aside className="availability-explorer__inventory">
            <div className="availability-explorer__inventory-heading">
              <p className="availability-explorer__label">Medios disponibles</p>
            </div>

            <ul className="availability-explorer__media-list" ref={inventoryList}>
              {activeLocation.media.map((medium) => (
                <li className="availability-explorer__medium" key={medium.name}>
                  <span className="availability-explorer__status" aria-hidden="true" />
                  <p>{medium.name}</p>
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
          </section>

        </div>
      </div>
    </main>
  )
}
