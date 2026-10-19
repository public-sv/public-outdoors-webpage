import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { gsap, useGSAP } from '../animation/gsap'
import { prefersReducedMotion } from '../animation/motion'
import { isMobileExperience } from '../animation/mobile'
import { setPageTone } from '../animation/pageTone'
import { ProjectCard } from '../components/ProjectCard'
import {
  projectCollections,
  type ProjectCollection,
} from '../data/projects'

type AmbientRuntime = {
  xTo: ReturnType<typeof gsap.quickTo>
  yTo: ReturnType<typeof gsap.quickTo>
  consumed: boolean
}

const ambientRuntimes = new WeakMap<HTMLElement, AmbientRuntime>()

export function GalleryScene() {
  const section = useRef<HTMLElement>(null)
  const galleryAmbient = useRef<HTMLDivElement>(null)
  const carouselRefs = useRef<
    Partial<Record<ProjectCollection['id'], HTMLDivElement>>
  >({})
  const [activeSlides, setActiveSlides] = useState<
    Record<ProjectCollection['id'], number>
  >({
    indoor: 0,
    outdoor: 0,
    innovaciones: 0,
  })
  const [railRevision, setRailRevision] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const restoreRails = () => setRailRevision((revision) => revision + 1)

    window.addEventListener('public:restore-gallery-rails', restoreRails)
    return () => {
      window.removeEventListener('public:restore-gallery-rails', restoreRails)
    }
  }, [])

  const { contextSafe } = useGSAP(
    (_context, contextSafe) => {
      if (prefersReducedMotion()) return

      const mobile = isMobileExperience()
      let removePointerTracker: (() => void) | undefined
      let removeSignalInteractions: (() => void) | undefined
      const heading = section.current?.querySelector<HTMLElement>('.grid-heading')
      const headingLines = heading
        ? gsap.utils.toArray<HTMLElement>('.grid-heading__line > span', heading)
        : []
      const headingBottom = heading?.querySelector<HTMLElement>('.grid-heading__bottom')
      const headingSignal = heading?.querySelector<HTMLElement>('.grid-heading__signal')
      const headingSignals = heading
        ? gsap.utils.toArray<HTMLAnchorElement>('.grid-heading__signal a', heading)
        : []
      const collections = gsap.utils.toArray<HTMLElement>('.project-collection')

      if (heading && headingBottom && headingSignal) {
        gsap.set(headingSignal, { autoAlpha: 1 })
        gsap.set(headingSignals, { y: 0, scale: 0.8, autoAlpha: 0.28 })

        const signalTimeline = gsap.timeline({
          paused: true,
          repeat: -1,
          repeatDelay: 1.2,
        })
        const signalPattern = [
          { index: 1, start: 0.4, scale: 1.1, alpha: 0.84, rise: 1.2, fade: 1.5 },
          { index: 2, start: 2.2, scale: 1.17, alpha: 0.92, rise: 1.35, fade: 1.65 },
          { index: 0, start: 2.85, scale: 1.06, alpha: 0.72, rise: 1, fade: 1.35 },
          { index: 0, start: 5.8, scale: 1.15, alpha: 0.9, rise: 1.3, fade: 1.55 },
          { index: 1, start: 6.5, scale: 1.06, alpha: 0.74, rise: 1.05, fade: 1.4 },
          { index: 2, start: 9.05, scale: 1.12, alpha: 0.86, rise: 1.25, fade: 1.6 },
          { index: 1, start: 9.65, scale: 1.14, alpha: 0.9, rise: 1.15, fade: 1.5 },
          { index: 0, start: 10.45, scale: 1.08, alpha: 0.78, rise: 0.95, fade: 1.35 },
        ]

        signalPattern.forEach(({ index, start, scale, alpha, rise, fade }) => {
          const dot = headingSignals[index]
          if (!dot) return

          signalTimeline
            .to(dot, {
              scale,
              autoAlpha: alpha,
              duration: rise,
              ease: 'power2.out',
            }, start)
            .to(dot, {
              scale: 0.8,
              autoAlpha: 0.28,
              duration: fade,
              ease: 'sine.inOut',
            }, start + rise)
        })

        let signalsShouldPlay = false
        let activeSignal: HTMLAnchorElement | null = null

        const pauseSignals = () => {
          signalsShouldPlay = false
          activeSignal = null
          signalTimeline.pause()
        }
        const resumeSignals = () => {
          signalsShouldPlay = true
          if (!activeSignal) {
            signalTimeline.play()
          }
        }
        const activateSignal = contextSafe!((dot: HTMLAnchorElement) => {
          activeSignal = dot
          signalTimeline.pause()
          gsap.to(dot, {
            scale: 1.22,
            autoAlpha: 1,
            duration: 0.55,
            ease: 'power2.out',
            overwrite: 'auto',
          })
          gsap.to(headingSignals.filter((signal) => signal !== dot), {
            scale: 0.76,
            autoAlpha: 0.16,
            duration: 0.65,
            ease: 'power2.out',
            overwrite: 'auto',
          })
        })
        const releaseSignal = contextSafe!((dot: HTMLAnchorElement) => {
          if (activeSignal !== dot) return
          activeSignal = null
          gsap.to(headingSignals, {
            scale: 0.8,
            autoAlpha: 0.28,
            duration: 0.85,
            ease: 'sine.inOut',
            overwrite: 'auto',
            onComplete: () => {
              if (signalsShouldPlay && !activeSignal) {
                signalTimeline.play()
              }
            },
          })
        })

        const signalInteractions = headingSignals.map((dot) => {
          const onPointerEnter = (event: PointerEvent) => {
            if (event.pointerType !== 'touch') activateSignal(dot)
          }
          const onPointerLeave = (event: PointerEvent) => {
            if (event.pointerType !== 'touch' && document.activeElement !== dot) {
              releaseSignal(dot)
            }
          }
          const onFocus = () => activateSignal(dot)
          const onBlur = () => releaseSignal(dot)

          dot.addEventListener('pointerenter', onPointerEnter)
          dot.addEventListener('pointerleave', onPointerLeave)
          dot.addEventListener('focus', onFocus)
          dot.addEventListener('blur', onBlur)

          return { dot, onPointerEnter, onPointerLeave, onFocus, onBlur }
        })

        removeSignalInteractions = () => {
          signalInteractions.forEach((interaction) => {
            interaction.dot.removeEventListener(
              'pointerenter',
              interaction.onPointerEnter,
            )
            interaction.dot.removeEventListener(
              'pointerleave',
              interaction.onPointerLeave,
            )
            interaction.dot.removeEventListener('focus', interaction.onFocus)
            interaction.dot.removeEventListener('blur', interaction.onBlur)
          })
        }

        gsap
          .timeline({
            scrollTrigger: {
              trigger: heading,
              start: 'top 92%',
              end: 'bottom 68%',
              toggleActions: mobile
                ? 'play none none none'
                : 'play reverse play reverse',
              once: mobile,
              onEnter: () => {
                setPageTone('#171717', true)
                resumeSignals()
              },
              onEnterBack: () => {
                setPageTone('#171717', true)
                resumeSignals()
              },
              onLeave: pauseSignals,
              onLeaveBack: () => {
                setPageTone('#07080b', true)
                pauseSignals()
              },
            },
          })
          .from(headingLines, {
            yPercent: 110,
            rotation: 1.5,
            duration: 0.68,
            stagger: 0.08,
            ease: 'power4.out',
          })
          .from(headingBottom, {
            y: 14,
            autoAlpha: 0,
            duration: 0.4,
            ease: 'power3.out',
          }, 0.22)
          .from(headingSignal, {
            y: 18,
            scale: 0.94,
            duration: 0.46,
            ease: 'power3.out',
          }, 0.16)

        const [outdoorSignal, indoorSignal, innovacionesSignal] = headingSignals
        const ambient = galleryAmbient.current
        const ambientOrb = ambient?.querySelector<HTMLElement>(
          '.gallery-ambient__orb',
        )
        const canHandOffToCursor = Boolean(
          !mobile &&
          ambient &&
          ambientOrb &&
          window.matchMedia('(hover: hover) and (pointer: fine)').matches,
        )

        if (indoorSignal && outdoorSignal && innovacionesSignal) {
          if (canHandOffToCursor && ambient && ambientOrb) {
            const pointerPosition = {
              x: window.innerWidth * 0.52,
              y: window.innerHeight * 0.7,
            }
            const trackPointer = (event: PointerEvent) => {
              if (event.pointerType === 'touch') return
              pointerPosition.x = event.clientX
              pointerPosition.y = event.clientY
            }
            window.addEventListener('pointermove', trackPointer, { passive: true })
            removePointerTracker = () => {
              window.removeEventListener('pointermove', trackPointer)
            }

            const cursorX = () => pointerPosition.x
            const cursorY = () => pointerPosition.y
            const cursorScale = () =>
              ambientOrb.offsetWidth / outdoorSignal.offsetWidth

            const outdoorTravelX = () => {
              const bounds = outdoorSignal.getBoundingClientRect()
              return cursorX() - (bounds.left + bounds.width / 2)
            }
            const outdoorTravelY = () => {
              const bounds = outdoorSignal.getBoundingClientRect()
              const documentCenter =
                bounds.top + window.scrollY + bounds.height / 2
              const endScroll =
                handoffTimeline.scrollTrigger?.end ??
                window.scrollY + window.innerHeight * 0.52

              return cursorY() - (documentCenter - endScroll)
            }

            const handoffTimeline = gsap.timeline({
              scrollTrigger: {
                trigger: heading,
                start: 'bottom 68%',
                end: 'bottom 16%',
                scrub: 0.65,
                invalidateOnRefresh: true,
                onEnter: () => {
                  pauseSignals()
                  handoffTimeline.invalidate()
                },
                onEnterBack: pauseSignals,
                onLeaveBack: resumeSignals,
              },
            })

            handoffTimeline
              .set(ambientOrb, {
                x: cursorX,
                y: cursorY,
                xPercent: -50,
                yPercent: -50,
                scaleX: 1,
                scaleY: 1,
                color: '#ff0109',
              }, 0)
              .fromTo(indoorSignal, {
                x: 0,
                y: 0,
                scale: 0.8,
                autoAlpha: 0.28,
              }, {
                x: () => -window.innerWidth * 0.18,
                y: () => window.innerHeight * 0.34,
                scale: 0.28,
                autoAlpha: 0,
                duration: 0.68,
                ease: 'power3.in',
                immediateRender: false,
              }, 0.04)
              .fromTo(innovacionesSignal, {
                x: 0,
                y: 0,
                scale: 0.8,
                autoAlpha: 0.28,
              }, {
                x: () => window.innerWidth * 0.18,
                y: () => window.innerHeight * 0.4,
                scale: 0.24,
                autoAlpha: 0,
                duration: 0.72,
                ease: 'power3.in',
                immediateRender: false,
              }, 0.08)
              .fromTo(outdoorSignal, {
                x: 0,
                y: 0,
                scale: 0.8,
                autoAlpha: 0.28,
              }, {
                x: outdoorTravelX,
                y: outdoorTravelY,
                scale: cursorScale,
                autoAlpha: 0,
                duration: 0.82,
                ease: 'power2.inOut',
                immediateRender: false,
              }, 0)
              .fromTo(ambient, {
                autoAlpha: 0,
              }, {
                autoAlpha: 1,
                duration: 0.56,
                ease: 'power2.inOut',
                immediateRender: false,
              }, 0.2)
              .to(headingSignal, {
                autoAlpha: 0,
                duration: 0.18,
                ease: 'power2.out',
              }, 0.74)
          } else {
            const touchExitTimeline = gsap.timeline({
              scrollTrigger: {
                trigger: heading,
                start: 'bottom 76%',
                end: 'bottom 42%',
                scrub: 0.45,
                invalidateOnRefresh: true,
                onEnter: pauseSignals,
                onEnterBack: pauseSignals,
                onLeaveBack: resumeSignals,
              },
            })

            if (mobile) {
              touchExitTimeline.to(headingBottom, {
                y: 10,
                autoAlpha: 0,
                duration: 0.34,
                ease: 'power2.out',
              }, 0)
            }

            touchExitTimeline
              .fromTo(outdoorSignal, {
                x: 0,
                y: 0,
                scale: 0.8,
                autoAlpha: 0.28,
              }, {
                x: () => -window.innerWidth * 0.08,
                y: () => window.innerHeight * 0.22,
                scale: 0.38,
                autoAlpha: 0,
                duration: 0.72,
                ease: 'power3.in',
                immediateRender: false,
              }, 0)
              .fromTo(indoorSignal, {
                x: 0,
                y: 0,
                scale: 0.8,
                autoAlpha: 0.28,
              }, {
                y: () => window.innerHeight * 0.27,
                scale: 0.32,
                autoAlpha: 0,
                duration: 0.7,
                ease: 'power3.in',
                immediateRender: false,
              }, 0.04)
              .fromTo(innovacionesSignal, {
                x: 0,
                y: 0,
                scale: 0.8,
                autoAlpha: 0.28,
              }, {
                x: () => window.innerWidth * 0.08,
                y: () => window.innerHeight * 0.31,
                scale: 0.28,
                autoAlpha: 0,
                duration: 0.72,
                ease: 'power3.in',
                immediateRender: false,
              }, 0.08)
              .to(headingSignal, {
                autoAlpha: 0,
                duration: 0.2,
                ease: 'power2.out',
              }, 0.72)
          }
        }
      }

      collections.forEach((collection) => {
        const label = collection.querySelector<HTMLElement>('[data-collection-label]')
        const title = label?.querySelector<HTMLElement>('.collection-heading__title')
        const details = label?.querySelector<HTMLElement>('.collection-heading__details')
        const actions = label?.querySelector<HTMLElement>(
          '.collection-heading__actions',
        )
        const carousel = collection.querySelector<HTMLElement>(
          '.collection-carousel',
        )
        const pagination = collection.querySelector<HTMLElement>(
          '.collection-carousel__pagination',
        )
        const collectionId = collection.dataset.sceneId
        const isInnovations = collectionId === 'innovaciones'
        const horizontalDirection = collectionId === 'indoor'
          ? -1
          : collectionId === 'outdoor'
            ? 1
            : 0

        if (!label || !title || !details || !actions || !carousel) return

        // The collection reveal adds noticeable scroll jank on mobile. Keep the
        // gallery content immediately visible there and avoid creating the
        // associated timelines and ScrollTriggers altogether.
        if (mobile) return

        const revealTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: collection,
              start: 'top 76%',
              end: 'top 28%',
              toggleActions: 'play none none reverse',
            },
          })
          .from(label, {
            x: () => horizontalDirection * Math.min(120, window.innerWidth * 0.12),
            y: isInnovations ? 32 : 0,
            scale: isInnovations ? 0.97 : 1,
            autoAlpha: 0,
            duration: 0.72,
            ease: 'power3.out',
          })
          .from(title, {
            yPercent: 80,
            autoAlpha: 0,
            duration: 0.58,
            ease: 'power4.out',
          }, 0.08)
          .from(details, {
            y: 12,
            autoAlpha: 0,
            duration: 0.36,
            ease: 'power3.out',
          }, 0.24)
          .from(actions, {
            y: 8,
            autoAlpha: 0,
            duration: 0.3,
            ease: 'power3.out',
          }, 0.34)
          .from(carousel, {
            x: () => horizontalDirection * Math.min(90, window.innerWidth * 0.085),
            y: isInnovations ? 42 : 0,
            scale: isInnovations ? 0.965 : 1,
            autoAlpha: 0,
            duration: 0.78,
            ease: 'power3.out',
          }, 0.16)

        if (pagination) {
          revealTimeline.from(pagination, {
            y: 8,
            autoAlpha: 0,
            duration: 0.32,
            ease: 'power2.out',
          }, 0.5)
        }
      })

      return () => {
        removePointerTracker?.()
        removeSignalInteractions?.()
      }
    },
    { scope: section },
  )

  useGSAP(
    () => {
      const railMedia = gsap.matchMedia()

      railMedia.add(
        '(min-width: 901px) and (prefers-reduced-motion: no-preference)',
        () => {
          const railCollections = gsap.utils.toArray<HTMLElement>(
            '.collection--indoor, .collection--outdoor',
          )

          railCollections.forEach((collection) => {
            const stage = collection.querySelector<HTMLElement>(
              '.project-collection__stage',
            )
            const carousel = collection.querySelector<HTMLElement>(
              '.collection-carousel',
            )
            const track = carousel?.querySelector<HTMLElement>(
              '.collection-carousel__track',
            )
            const cards = track
              ? gsap.utils.toArray<HTMLElement>('.project-card', track)
              : []

            if (!stage || !carousel || !track || cards.length < 2) return

            const cardEntryY = () => carousel.clientHeight * 0.92

            gsap.set(track, { y: 0 })
            gsap.set(cards, {
              y: (index) => index === 0 ? 0 : cardEntryY(),
              zIndex: (index) => index + 1,
              force3D: true,
            })

            const railTimeline = gsap.timeline({
              scrollTrigger: {
                id: `collection-rail-${collection.dataset.sceneId}`,
                trigger: collection,
                start: 'top top',
                end: () =>
                  `+=${(cards.length - 1) * window.innerHeight * 0.82 + window.innerHeight * 0.5}`,
                pin: stage,
                scrub: 0.65,
                anticipatePin: 1,
                refreshPriority: 0,
                invalidateOnRefresh: true,
              },
            })

            cards.slice(1).forEach((card, index) => {
              railTimeline.to(card, {
                y: 0,
                duration: 1,
                ease: 'none',
                force3D: true,
              }, index)
            })

            railTimeline.to({}, { duration: 0.45 })
          })
        },
      )

      return () => railMedia.revert()
    },
    {
      dependencies: [railRevision],
      scope: section,
      revertOnUpdate: true,
    },
  )

  useGSAP(
    () => {
      const ambient = galleryAmbient.current
      if (
        !ambient ||
        isMobileExperience() ||
        prefersReducedMotion() ||
        !window.matchMedia('(hover: hover) and (pointer: fine)').matches
      ) {
        return
      }

      const collections = gsap.utils.toArray<HTMLElement>('.project-collection')
      const orb = ambient.querySelector<HTMLElement>('.gallery-ambient__orb')
      const orbLight = ambient.querySelector<HTMLElement>(
        '.gallery-ambient__orb-light',
      )
      if (!orb || !orbLight) return

      const titleLights = new Map<
        HTMLElement,
        {
          title: HTMLElement
          xTo: ReturnType<typeof gsap.quickTo>
          yTo: ReturnType<typeof gsap.quickTo>
          opacityTo: ReturnType<typeof gsap.quickTo>
        }
      >()

      collections.forEach((collection) => {
        const title = collection.querySelector<HTMLElement>(
          '.collection-heading__title',
        )
        if (!title) return

        gsap.set(title, {
          '--title-light-x': '0px',
          '--title-light-y': '0px',
          '--title-light-opacity': 0,
        })
        titleLights.set(collection, {
          title,
          xTo: gsap.quickTo(title, '--title-light-x', {
            duration: 0.58,
            ease: 'power3.out',
          }),
          yTo: gsap.quickTo(title, '--title-light-y', {
            duration: 0.58,
            ease: 'power3.out',
          }),
          opacityTo: gsap.quickTo(title, '--title-light-opacity', {
            duration: 0.48,
            ease: 'power2.out',
          }),
        })
      })

      const sizeMatrix = [
        [0.88, 0.95, 0.87],
        [0.96, 1.08, 0.95],
        [0.89, 1, 0.9],
      ]
      let collectionScale = 1

      const matrixScaleAt = (clientX: number, clientY: number) => {
        const matrixX = gsap.utils.clamp(0, 2, (clientX / window.innerWidth) * 2)
        const matrixY = gsap.utils.clamp(0, 2, (clientY / window.innerHeight) * 2)
        const x0 = Math.floor(matrixX)
        const y0 = Math.floor(matrixY)
        const x1 = Math.min(2, x0 + 1)
        const y1 = Math.min(2, y0 + 1)
        const xMix = matrixX - x0
        const yMix = matrixY - y0
        const top = gsap.utils.interpolate(sizeMatrix[y0][x0], sizeMatrix[y0][x1], xMix)
        const bottom = gsap.utils.interpolate(
          sizeMatrix[y1][x0],
          sizeMatrix[y1][x1],
          xMix,
        )

        return gsap.utils.interpolate(top, bottom, yMix) * collectionScale
      }

      const xTo = gsap.quickTo(orb, 'x', {
        duration: 0.68,
        ease: 'power3.out',
      })
      const yTo = gsap.quickTo(orb, 'y', {
        duration: 0.68,
        ease: 'power3.out',
      })
      const scaleXTo = gsap.quickTo(orb, 'scaleX', {
        duration: 0.88,
        ease: 'power3.out',
      })
      const scaleYTo = gsap.quickTo(orb, 'scaleY', {
        duration: 0.88,
        ease: 'power3.out',
      })
      const runtime: AmbientRuntime = { xTo, yTo, consumed: false }
      ambientRuntimes.set(ambient, runtime)

      const moveAmbient = (event: PointerEvent) => {
        if (event.pointerType === 'touch') return
        if (!runtime.consumed) {
          xTo(event.clientX)
          yTo(event.clientY)
          const scale = matrixScaleAt(event.clientX, event.clientY)
          scaleXTo(scale)
          scaleYTo(scale)
        }

        const collection = event.currentTarget as HTMLElement
        const titleLight = titleLights.get(collection)
        if (!titleLight) return

        const bounds = titleLight.title.getBoundingClientRect()
        const localX = gsap.utils.clamp(0, bounds.width, event.clientX - bounds.left)
        const localY = gsap.utils.clamp(0, bounds.height, event.clientY - bounds.top)
        const distanceX = Math.max(
          bounds.left - event.clientX,
          0,
          event.clientX - bounds.right,
        )
        const distanceY = Math.max(
          bounds.top - event.clientY,
          0,
          event.clientY - bounds.bottom,
        )
        const distance = Math.hypot(distanceX, distanceY)
        const proximity = 1 - gsap.utils.clamp(0, 1, distance / (window.innerHeight * 0.72))

        titleLight.xTo(localX)
        titleLight.yTo(localY)
        titleLight.opacityTo(0.06 + proximity * 0.28)
      }

      const showAmbient = (event: PointerEvent) => {
        if (event.pointerType === 'touch') return
        const collection = event.currentTarget as HTMLElement
        const accent = getComputedStyle(collection)
          .getPropertyValue('--collection-accent')
          .trim()
        collectionScale = collection.classList.contains('collection--outdoor')
          ? 1.03
          : collection.classList.contains('collection--innovaciones')
            ? 0.97
            : 1
        const initialScale = matrixScaleAt(event.clientX, event.clientY)
        const titleLight = titleLights.get(collection)

        gsap.set(orb, {
          x: event.clientX,
          y: event.clientY,
          xPercent: -50,
          yPercent: -50,
          scaleX: initialScale * 0.9,
          scaleY: initialScale * 0.9,
        })
        gsap.to(ambient, {
          autoAlpha: 1,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: true,
        })
        gsap.to(orb, {
          color: accent || '#ff0109',
          duration: 0.68,
          ease: 'power3.out',
          overwrite: 'auto',
        })
        if (!runtime.consumed) {
          gsap.to(orbLight, {
            scale: 1,
            opacity: 0.6,
            duration: 0.35,
            ease: 'power2.out',
            overwrite: true,
          })
        }
        scaleXTo(initialScale)
        scaleYTo(initialScale)
        if (titleLight) {
          const bounds = titleLight.title.getBoundingClientRect()
          titleLight.xTo(
            gsap.utils.clamp(0, bounds.width, event.clientX - bounds.left),
          )
          titleLight.yTo(
            gsap.utils.clamp(0, bounds.height, event.clientY - bounds.top),
          )
          titleLight.opacityTo(0.12)
        }
      }

      const hideAmbient = (event: PointerEvent) => {
        gsap.to(ambient, {
          autoAlpha: 0,
          duration: 0.45,
          ease: 'power2.out',
          overwrite: true,
        })
        titleLights.get(event.currentTarget as HTMLElement)?.opacityTo(0)
      }

      collections.forEach((collection) => {
        collection.addEventListener('pointerenter', showAmbient)
        collection.addEventListener('pointermove', moveAmbient, { passive: true })
        collection.addEventListener('pointerleave', hideAmbient)
      })

      return () => {
        ambientRuntimes.delete(ambient)
        collections.forEach((collection) => {
          collection.removeEventListener('pointerenter', showAmbient)
          collection.removeEventListener('pointermove', moveAmbient)
          collection.removeEventListener('pointerleave', hideAmbient)
        })
        gsap.killTweensOf([
          ambient,
          orb,
          orbLight,
          ...Array.from(titleLights.values(), ({ title }) => title),
        ])
      }
    },
    { scope: section },
  )

  const animateCtaFluid = contextSafe((
    button: HTMLElement,
    originX: number,
    originY: number,
    fill: boolean,
  ) => {
    const fluid = button.querySelector<HTMLElement>(
      '.collection-heading__fluid',
    )
    const waves = fluid
      ? gsap.utils.toArray<HTMLElement>('.collection-heading__fluid-wave', fluid)
      : []
    const ambient = button
      .closest<HTMLElement>('.project-grid-section')
      ?.querySelector<HTMLElement>('.gallery-ambient')
    const orbLight = ambient?.querySelector<HTMLElement>(
      '.gallery-ambient__orb-light',
    )
    const runtime = ambient ? ambientRuntimes.get(ambient) : undefined

    if (!fluid) return

    const origin = `${originX}% ${originY}%`
    const bounds = button.getBoundingClientRect()
    const consumeX = bounds.left + bounds.width * (originX / 100)
    const consumeY = bounds.top + bounds.height * (originY / 100)
    gsap.killTweensOf([fluid, ...waves, ...(orbLight ? [orbLight] : [])])

    if (orbLight && runtime) {
      runtime.xTo(consumeX)
      runtime.yTo(consumeY)
      runtime.consumed = fill
    }

    if (prefersReducedMotion()) {
      gsap.set(fluid, {
        clipPath: `circle(${fill ? 160 : 0}% at ${origin})`,
      })
      gsap.set(waves, { opacity: 0 })
      if (orbLight && runtime) {
        gsap.set(orbLight, {
          scale: fill ? 0.12 : 1,
          opacity: fill ? 0.04 : 0.6,
        })
      }
      return
    }

    gsap.set(waves, {
      left: `${originX}%`,
      top: `${originY}%`,
      xPercent: -50,
      yPercent: -50,
    })

    if (fill) {
      gsap.set(fluid, { clipPath: `circle(0% at ${origin})` })
      gsap.set(waves, {
        opacity: 0.26,
        scale: (index) => 0.16 + index * 0.05,
        rotation: (index) => -28 + index * 31,
      })

      const timeline = gsap.timeline()

      timeline
        .to(fluid, {
          clipPath: `circle(160% at ${origin})`,
          duration: 0.68,
          ease: 'power3.inOut',
        })
        .to(waves, {
          scale: (index) => 2.1 + index * 0.34,
          rotation: (index) => 42 + index * 47,
          duration: 0.64,
          stagger: 0.045,
          ease: 'power2.out',
        }, 0)
        .to(waves, {
          opacity: 0,
          duration: 0.2,
          stagger: 0.025,
          ease: 'power1.out',
        }, 0.43)

      if (orbLight && runtime) {
        timeline.to(orbLight, {
          scale: 0.12,
          opacity: 0.04,
          duration: 0.68,
          ease: 'power3.inOut',
        }, 0)
      }
      return
    }

    gsap.set(fluid, { clipPath: `circle(160% at ${origin})` })
    gsap.set(waves, {
      opacity: 0.2,
      scale: (index) => 1.75 + index * 0.22,
      rotation: (index) => 18 + index * 38,
    })

    const timeline = gsap.timeline()

    timeline
      .to(waves, {
        scale: (index) => 0.12 + index * 0.04,
        rotation: (index) => -34 - index * 27,
        opacity: 0,
        duration: 0.48,
        stagger: 0.025,
        ease: 'power3.in',
      })
      .to(fluid, {
        clipPath: `circle(0% at ${origin})`,
        duration: 0.5,
        ease: 'power3.inOut',
      }, 0)

    if (orbLight && runtime) {
      timeline.to(orbLight, {
        scale: 1,
        opacity: 0.6,
        duration: 0.5,
        ease: 'power3.inOut',
      }, 0)
    }
  })

  const getCtaEdgeOrigin = (
    event: React.PointerEvent<HTMLElement>,
  ) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const relativeX = gsap.utils.clamp(0, 1, (event.clientX - bounds.left) / bounds.width)
    const relativeY = gsap.utils.clamp(0, 1, (event.clientY - bounds.top) / bounds.height)
    const normalizedX = relativeX * 2 - 1
    const normalizedY = relativeY * 2 - 1

    if (Math.abs(normalizedX) > Math.abs(normalizedY)) {
      return {
        x: normalizedX > 0 ? 100 : 0,
        y: relativeY * 100,
      }
    }

    return {
      x: relativeX * 100,
      y: normalizedY > 0 ? 100 : 0,
    }
  }

  const handleCtaPointerEnter = (
    event: React.PointerEvent<HTMLElement>,
  ) => {
    if (event.pointerType === 'touch') return
    const origin = getCtaEdgeOrigin(event)
    animateCtaFluid(event.currentTarget, origin.x, origin.y, true)
  }

  const handleCtaPointerLeave = (
    event: React.PointerEvent<HTMLElement>,
  ) => {
    if (event.pointerType === 'touch') return
    const origin = getCtaEdgeOrigin(event)
    animateCtaFluid(event.currentTarget, origin.x, origin.y, false)
  }

  const handleCtaFocus = (event: React.FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.matches(':focus-visible')) return
    animateCtaFluid(event.currentTarget, 50, 50, true)
  }

  const handleCtaBlur = (event: React.FocusEvent<HTMLElement>) => {
    animateCtaFluid(event.currentTarget, 50, 50, false)
  }

  const openCollection = (
    event: React.MouseEvent<HTMLAnchorElement>,
    collectionId: string,
  ) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    const source = event.currentTarget.closest<HTMLElement>(
      '.collection-heading__cta',
    )
    const sourceBounds = source?.getBoundingClientRect()

    navigate(`/${collectionId}`, {
      state: {
        backgroundLocation: location,
        backgroundScrollY: window.scrollY,
        transitionOrigin: sourceBounds
          ? {
              x: sourceBounds.x,
              y: sourceBounds.y,
              width: sourceBounds.width,
              height: sourceBounds.height,
            }
          : undefined,
      },
    })
  }

  const openAvailability = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    const sourceBounds = event.currentTarget.getBoundingClientRect()

    navigate('/disponibilidad', {
      state: {
        backgroundLocation: location,
        backgroundScrollY: window.scrollY,
        transitionOrigin: {
          x: sourceBounds.x,
          y: sourceBounds.y,
          width: sourceBounds.width,
          height: sourceBounds.height,
        },
      },
    })
  }

  const openInnovationShowcase = (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    const sourceBounds = event.currentTarget.getBoundingClientRect()

    navigate('/innovaciones#imagina-tu-marca', {
      state: {
        backgroundLocation: location,
        backgroundScrollY: window.scrollY,
        transitionOrigin: {
          x: sourceBounds.x,
          y: sourceBounds.y,
          width: sourceBounds.width,
          height: sourceBounds.height,
        },
      },
    })
  }

  const renderHeadingActions = (
    collection: (typeof projectCollections)[number],
  ) => {
    return (
      <div className="collection-heading__actions">
        <Link
          className="collection-heading__cta"
          to={`/${collection.id}`}
          state={{ backgroundLocation: location }}
          onClick={(event) => openCollection(event, collection.id)}
          onPointerEnter={handleCtaPointerEnter}
          onPointerLeave={handleCtaPointerLeave}
          onFocus={handleCtaFocus}
          onBlur={handleCtaBlur}
          aria-label={`Ver más proyectos ${collection.label}`}
        >
          <span className="collection-heading__fluid" aria-hidden="true">
            <i className="collection-heading__fluid-wave" />
            <i className="collection-heading__fluid-wave" />
            <i className="collection-heading__fluid-wave" />
          </span>
          <strong>Ver más</strong>
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <path d="M10 32h42M36 16l16 16-16 16" />
          </svg>
        </Link>

        {collection.id === 'innovaciones' ? (
          <Link
            className="collection-heading__availability"
            to="/innovaciones#imagina-tu-marca"
            onClick={openInnovationShowcase}
            onPointerEnter={handleCtaPointerEnter}
            onPointerLeave={handleCtaPointerLeave}
            onFocus={handleCtaFocus}
            onBlur={handleCtaBlur}
          >
            <span className="collection-heading__fluid" aria-hidden="true">
              <i className="collection-heading__fluid-wave" />
              <i className="collection-heading__fluid-wave" />
              <i className="collection-heading__fluid-wave" />
            </span>
            <span className="collection-heading__availability-label">
              Imagina tu marca aquí
            </span>
          </Link>
        ) : (
          <Link
            className="collection-heading__availability"
            to="/disponibilidad"
            onClick={openAvailability}
            onPointerEnter={handleCtaPointerEnter}
            onPointerLeave={handleCtaPointerLeave}
            onFocus={handleCtaFocus}
            onBlur={handleCtaBlur}
            aria-label={`Ver disponibilidad de medios ${collection.label}`}
          >
            <span className="collection-heading__fluid" aria-hidden="true">
              <i className="collection-heading__fluid-wave" />
              <i className="collection-heading__fluid-wave" />
              <i className="collection-heading__fluid-wave" />
            </span>
            <span className="collection-heading__availability-label">
              Ver disponibilidad
            </span>
          </Link>
        )}
      </div>
    )
  }

  const updateActiveSlide = (
    collectionId: ProjectCollection['id'],
    carousel: HTMLDivElement,
  ) => {
    const cards = Array.from(
      carousel.querySelectorAll<HTMLElement>('.project-card'),
    )
    if (cards.length < 2) return

    const carouselCenter = carousel.scrollLeft + carousel.clientWidth / 2
    let closestIndex = 0
    let closestDistance = Number.POSITIVE_INFINITY

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2
      const distance = Math.abs(cardCenter - carouselCenter)

      if (distance < closestDistance) {
        closestIndex = index
        closestDistance = distance
      }
    })

    setActiveSlides((current) =>
      current[collectionId] === closestIndex
        ? current
        : { ...current, [collectionId]: closestIndex },
    )
  }

  const goToSlide = (
    collectionId: ProjectCollection['id'],
    slideIndex: number,
  ) => {
    const carousel = carouselRefs.current[collectionId]
    const card = carousel?.querySelectorAll<HTMLElement>('.project-card')[
      slideIndex
    ]
    if (!carousel || !card) return

    carousel.scrollTo({
      left: card.offsetLeft - (carousel.clientWidth - card.offsetWidth) / 2,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }

  const goToCollection = (
    event: MouseEvent<HTMLAnchorElement>,
    collectionId: ProjectCollection['id'],
  ) => {
    const collection = document.getElementById(`${collectionId}-gallery`)
    if (!collection) return

    event.preventDefault()
    window.dispatchEvent(new Event('public:navigate-to-media'))
    window.requestAnimationFrame(() => {
      collection.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start',
      })
    })
  }

  return (
    <section className="project-grid-section" ref={section}>
      <header className="grid-heading" data-scene-id="gallery-intro">
        <h2 aria-label="Donde las ideas se vuelven visibles.">
          <span className="grid-heading__line">
            <span>Donde tus ideas</span>
          </span>
          <span className="grid-heading__line grid-heading__line--soft">
            <span>se vuelven visibles.</span>
          </span>
        </h2>

        <nav className="grid-heading__signal" aria-label="Categorías de la galería">
          <a
            href="#outdoor-gallery"
            aria-label="Ir a la categoría Outdoor"
            onClick={(event) => goToCollection(event, 'outdoor')}
          />
          <a
            href="#indoor-gallery"
            aria-label="Ir a la categoría Indoor"
            onClick={(event) => goToCollection(event, 'indoor')}
          />
          <a
            href="#innovaciones-gallery"
            aria-label="Ir a la categoría Innovaciones"
            onClick={(event) => goToCollection(event, 'innovaciones')}
          />
        </nav>

        <div className="grid-heading__bottom">
          <p>Outdoor · Indoor · Innovaciones</p>
          <span>Desliza y explora nuestros medios</span>
        </div>
      </header>

      <div className="project-collections">
        {projectCollections.map((collection) => (
          <section
            className={`project-collection collection--${collection.id}`}
            data-scene-id={collection.id}
            id={`${collection.id}-gallery`}
            key={collection.id}
          >
            <div className="project-collection__stage">
              <header className="collection-heading" data-collection-label>
                <div className="collection-heading__intro">
                  <div className="collection-heading__title-mask">
                    <h2
                      className="collection-heading__title"
                      data-title={collection.label}
                    >
                      {collection.label}
                    </h2>
                  </div>
                  <div className="collection-heading__details">
                    <p>{collection.description}</p>
                  </div>
                  {renderHeadingActions(collection)}
                </div>
              </header>

              <div
                className="collection-carousel"
                ref={(node) => {
                  carouselRefs.current[collection.id] = node ?? undefined
                }}
                onScroll={(event) =>
                  updateActiveSlide(collection.id, event.currentTarget)
                }
              >
                <div
                  className={`collection-carousel__track ${collection.id}-grid${
                    collection.projects.length === 1 ? ' is-single-project' : ''
                  }`}
                >
                  {collection.projects.map((project, index) => (
                    <ProjectCard
                      project={project}
                      collectionId={collection.id}
                      index={index}
                      key={project.id}
                    />
                  ))}
                </div>
              </div>

              {collection.projects.length > 1 && (
                <div
                  className="collection-carousel__pagination"
                  role="group"
                  aria-label={`Diapositivas de ${collection.label}`}
                >
                  {collection.projects.map((project, index) => (
                    <button
                      className={
                        activeSlides[collection.id] === index
                          ? 'is-active'
                          : undefined
                      }
                      type="button"
                      aria-label={`Ir a imagen ${index + 1} de ${collection.projects.length}`}
                      aria-current={
                        activeSlides[collection.id] === index
                          ? 'true'
                          : undefined
                      }
                      onClick={() => goToSlide(collection.id, index)}
                      key={project.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      <div className="gallery-ambient" ref={galleryAmbient} aria-hidden="true">
        <i className="gallery-ambient__orb">
          <i className="gallery-ambient__orb-light" />
        </i>
        <i className="gallery-ambient__glass" />
      </div>

    </section>
  )
}
