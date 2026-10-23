import { useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../animation/gsap'
import { prefersReducedMotion } from '../animation/motion'
import { isMobileExperience } from '../animation/mobile'
import { setPageTone } from '../animation/pageTone'
import { clientLogoSections } from '../data/clientLogos'
import { isIOSSafari } from '../platform/iosSafari'

const metrics = [
  {
    value: '400,000',
    label: 'Impactos con el tráfico en nuestras ubicaciones premium',
  },
  {
    value: '600+',
    label: 'Clientes',
  },
  {
    value: '200+',
    label: 'Campañas exitosas',
  },
  {
    value: '24+',
    label: 'Años de experiencia',
  },
]

const CLIENT_LOGO_INITIAL_MIN_DELAY_MS = 300
const CLIENT_LOGO_INITIAL_MAX_DELAY_MS = 4000
const CLIENT_LOGO_MIN_DELAY_MS = 3000
const CLIENT_LOGO_MAX_DELAY_MS = 6000
const CLIENT_LOGOS_PER_ROW = clientLogoSections[0]?.slots ?? 0
const clientLogoPositions = Array.from(
  { length: CLIENT_LOGOS_PER_ROW },
  (_, slotIndex) =>
    clientLogoSections.map((_, sectionIndex) => ({ sectionIndex, slotIndex })),
).flat()

function ClientLogoGrid() {
  const list = useRef<HTMLDivElement>(null)
  const [activeLogos, setActiveLogos] = useState(() =>
    clientLogoSections.map((section) =>
      Array.from({ length: section.slots }, (_, index) => index),
    ),
  )

  useGSAP((_context, contextSafe) => {
    const rotatingPositions = clientLogoPositions.filter(
      ({ sectionIndex }) => {
        const section = clientLogoSections[sectionIndex]
        return section.logos.length > section.slots
      },
    )

    if (!list.current || rotatingPositions.length === 0) return

    let rotationActive = false
    const animations = new Set<gsap.core.Animation>()
    const reducedMotion = prefersReducedMotion()

    const changeLogo = contextSafe!(
      (position: (typeof rotatingPositions)[number]) => {
        setActiveLogos((current) => {
          const next = current.map((row) => [...row])
          const { sectionIndex, slotIndex } = position
          const section = clientLogoSections[sectionIndex]
          const visibleLogos = next[sectionIndex]
          const hiddenLogos = section.logos
            .map((_, index) => index)
            .filter((index) => !visibleLogos.includes(index))
          const replacement =
            hiddenLogos[Math.floor(Math.random() * hiddenLogos.length)]

          next[sectionIndex][slotIndex] = replacement
          return next
        })
      },
    )

    const stopRotation = () => {
      rotationActive = false
      animations.forEach((animation) => animation.kill())
      animations.clear()
    }

    const animatePosition = contextSafe!(
      (position: (typeof rotatingPositions)[number]) => {
        const positionId = `${position.sectionIndex}-${position.slotIndex}`
        const card = list.current?.querySelector<HTMLElement>(
          `[data-client-slot="${positionId}"]`,
        )
        const media = card?.querySelector<HTMLElement>('.client-logo__media')
        const page = card?.querySelector<HTMLElement>('.client-logo__page-turn')

        if (!card || !media || !page || reducedMotion) {
          changeLogo(position)
          if (rotationActive) schedulePosition(position)
          return
        }

        const direction = Math.random() > 0.5 ? 1 : -1
        const timeline = gsap.timeline({
          onComplete: () => {
            animations.delete(timeline)
            if (rotationActive) schedulePosition(position)
          },
        })
        animations.add(timeline)

        timeline
          .to(media, {
            autoAlpha: 0,
            duration: 0.22,
            ease: 'power2.in',
          })
          .fromTo(
            page,
            { autoAlpha: 0, scaleX: 0.08, xPercent: direction * 42 },
            {
              autoAlpha: 0.7,
              scaleX: 1,
              xPercent: 0,
              duration: 0.24,
              ease: 'power2.inOut',
            },
            0.02,
          )
          .call(() => changeLogo(position), [], 0.2)
          .set(media, { autoAlpha: 0 }, 0.2)
          .to(
            media,
            {
              autoAlpha: 1,
              duration: 0.38,
              ease: 'power2.out',
            },
            0.22,
          )
          .to(
            page,
            {
              autoAlpha: 0,
              scaleX: 1.12,
              xPercent: direction * -28,
              duration: 0.34,
              ease: 'power2.out',
            },
            0.2,
          )
          .set([media, page], { clearProps: 'transform,opacity,visibility' })
      },
    )

    const schedulePosition = contextSafe!(
      (
        position: (typeof rotatingPositions)[number],
        initial = false,
      ) => {
        const delay = gsap.utils.random(
          initial ? CLIENT_LOGO_INITIAL_MIN_DELAY_MS : CLIENT_LOGO_MIN_DELAY_MS,
          initial ? CLIENT_LOGO_INITIAL_MAX_DELAY_MS : CLIENT_LOGO_MAX_DELAY_MS,
          1,
        ) / 1000
        const delayedCall = gsap.delayedCall(delay, () => {
          animations.delete(delayedCall)
          if (!rotationActive) return
          animatePosition(position)
        })
        animations.add(delayedCall)
      },
    )

    const startRotation = contextSafe!(() => {
      if (rotationActive) return
      rotationActive = true
      rotatingPositions.forEach((position) => {
        schedulePosition(position, true)
      })
    })

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) startRotation()
        else stopRotation()
      },
      { rootMargin: '15% 0px' },
    )

    observer.observe(list.current)

    return () => {
      observer.disconnect()
      stopRotation()
    }
  }, { scope: list })

  return (
    <div
      className="clients-list"
      aria-label="Logotipos de nuestros clientes"
      ref={list}
    >
      {clientLogoPositions.map(({ sectionIndex, slotIndex }) => {
        const section = clientLogoSections[sectionIndex]
        const logo = section.logos[activeLogos[sectionIndex][slotIndex]]

        return (
          <figure
            className="client-logo"
            key={`${section.id}-${slotIndex + 1}`}
            data-client-slot={`${sectionIndex}-${slotIndex}`}
          >
            <span className="client-logo__media">
              <img
                src={logo.src}
                alt={logo.alt}
                loading="lazy"
                decoding="async"
                key={logo.file}
              />
            </span>
            <span className="client-logo__page-turn" aria-hidden="true" />
          </figure>
        )
      })}
    </div>
  )
}

export function ImpactScene() {
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const metricValues = useRef<Array<HTMLElement | null>>([])

  useGSAP(
    () => {
      if (!section.current || !track.current) return

      const mobile = isMobileExperience()
      const reducedMotion = prefersReducedMotion()
      const iosSafari = isIOSSafari()

      if (mobile) {
        const mobileMetrics = gsap.utils.toArray<HTMLElement>(
          '.impact-metric',
          section.current,
        )
        const clientsIntro = section.current.querySelector<HTMLElement>(
          '.clients-intro',
        )
        const clientLogos = gsap.utils.toArray<HTMLElement>(
          '.client-logo',
          section.current,
        )
        const clientsList = section.current.querySelector<HTMLElement>(
          '.clients-list',
        )
        const endMessage = section.current.querySelector<HTMLElement>(
          '.impact-track__end',
        )
        const mobileAnimations: gsap.core.Animation[] = []

        gsap.set(track.current, { clearProps: 'transform' })

        const toneTrigger = ScrollTrigger.create({
          trigger: section.current,
          start: 'top 78%',
          end: 'bottom top',
          onEnter: () => setPageTone('#080b0a', true),
          onEnterBack: () => setPageTone('#080b0a', true),
          onLeaveBack: () => setPageTone('#171717', true),
        })

        if (!reducedMotion) {
          mobileMetrics.forEach((metric) => {
            const value = metric.querySelector<HTMLElement>('strong > span')
            const label = metric.querySelector<HTMLElement>('p')
            if (!value || !label) return

            const timeline = gsap.timeline({
              scrollTrigger: {
                trigger: metric,
                start: 'top 88%',
                toggleActions: 'play none none none',
                once: true,
              },
            })

            timeline
              .from(metric, {
                autoAlpha: 0.12,
                y: 64,
                scale: 0.965,
                duration: 1,
                ease: 'power3.out',
              })
              .from(value, {
                autoAlpha: 0,
                yPercent: 24,
                scale: 0.92,
                duration: 0.82,
                ease: 'power3.out',
              }, 0.04)
              .from(label, {
                autoAlpha: 0,
                y: 22,
                duration: 0.64,
                ease: 'power2.out',
              }, 0.24)

            mobileAnimations.push(timeline)
          })

          if (clientsIntro) {
            const eyebrow = clientsIntro.querySelector<HTMLElement>('p')
            const title = clientsIntro.querySelector<HTMLElement>('strong')
            const timeline = gsap.timeline({
              scrollTrigger: {
                trigger: clientsIntro,
                start: 'top 86%',
                toggleActions: 'play none none none',
                once: true,
              },
            })

            timeline
              .from(clientsIntro, {
                autoAlpha: 0.18,
                y: 58,
                scale: 0.97,
                duration: 1,
                ease: 'power3.out',
              })
              .from(eyebrow, {
                autoAlpha: 0,
                y: 16,
                duration: 0.5,
                ease: 'power2.out',
              }, 0.08)
              .from(title, {
                autoAlpha: 0,
                yPercent: 18,
                duration: 0.76,
                ease: 'power3.out',
              }, 0.2)

            mobileAnimations.push(timeline)
          }

          if (clientsList && clientLogos.length) {
            mobileAnimations.push(gsap.from(clientLogos, {
              autoAlpha: 0,
              y: (index) => 42 + (index % 3) * 9,
              scale: 0.72,
              rotation: (index) => (index % 2 === 0 ? -11 : 11),
              duration: 0.58,
              stagger: {
                each: 0.025,
                from: 'edges',
              },
              ease: 'back.out(1.45)',
              scrollTrigger: {
                trigger: clientsList,
                start: 'top 88%',
                toggleActions: 'play none none none',
                once: true,
              },
            }))
          }

          if (endMessage) {
            mobileAnimations.push(gsap.from(endMessage, {
              autoAlpha: 0,
              y: 54,
              scale: 0.97,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: endMessage,
                start: 'top 86%',
                toggleActions: 'play none none none',
                once: true,
              },
            }))
          }
        }

        return () => {
          toneTrigger.kill()
          mobileAnimations.forEach((animation) => animation.kill())
        }
      }

      const counterAnimations = new Map<Element, gsap.core.Tween>()
      const playedCounters = new Set<Element>()

      const scrambleValue = (target: string, progress: number) => {
        if (progress > 0.7) return target

        return [...target]
          .map((character) =>
            /\d/.test(character) ? Math.floor(Math.random() * 10).toString() : character,
          )
          .join('')
      }

      const counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const value = entry.target as HTMLElement
            const target = value.dataset.target ?? value.textContent ?? ''
            if (!entry.isIntersecting || playedCounters.has(value)) return

            if (reducedMotion) {
              value.textContent = target
              gsap.set(value, { clearProps: 'all' })
              playedCounters.add(value)
              counterObserver.unobserve(value)
              return
            }

            playedCounters.add(value)
            counterObserver.unobserve(value)

            const animation = gsap.to(
              { progress: 0 },
              {
                progress: 1,
                duration: 0.72,
                ease: 'power3.out',
                onStart: () => {
                  gsap.to(value, {
                    autoAlpha: 1,
                    yPercent: 0,
                    filter: 'blur(0px)',
                    duration: 0.28,
                    ease: 'power2.out',
                  })
                },
                onUpdate() {
                  value.textContent = scrambleValue(target, this.progress())
                },
                onComplete: () => {
                  value.textContent = target
                  counterAnimations.delete(value)
                },
              },
            )

            counterAnimations.set(value, animation)
          })
        },
        { threshold: 0.01 },
      )

      metricValues.current.forEach((value) => {
        if (!value) return
        if (!reducedMotion) {
          gsap.set(value, {
            autoAlpha: 0,
            yPercent: 14,
            filter: 'blur(10px)',
          })
        }
        counterObserver.observe(value)
      })

      if (reducedMotion) {
        return () => {
          counterObserver.disconnect()
          counterAnimations.forEach((animation) => animation.kill())
        }
      }

      const distance = () =>
        Math.max(0, track.current!.scrollWidth - document.documentElement.clientWidth)
      const previewDistance = () =>
        Math.min(window.innerWidth * 0.1, 160)
      const scrollDistance = () =>
        Math.max(1, distance() - previewDistance())

      const entryPreview = gsap.fromTo(
        track.current,
        { x: 0 },
        {
          x: () => -previewDistance(),
          force3D: true,
          ease: 'none',
          scrollTrigger: {
            trigger: section.current,
            start: 'top 90%',
            end: 'top top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      )

      const horizontalScroll = gsap.fromTo(
        track.current,
        { x: () => -previewDistance() },
        {
          x: () => -distance(),
          force3D: true,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: section.current,
            start: 'top top',
            end: () => `+=${scrollDistance()}`,
            pin: true,
            pinType: iosSafari ? 'transform' : 'fixed',
            scrub: 0.55,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onEnter: () => setPageTone('#080b0a', true),
            onEnterBack: () => setPageTone('#080b0a', true),
            onLeaveBack: () => setPageTone('#03131c', true),
          },
        },
      )

      const desktopClientLogos = gsap.utils.toArray<HTMLElement>(
        '.client-logo',
        section.current,
      )
      const cardPulseAnimations = desktopClientLogos.map((logo, index) => {
        const image = logo.querySelector('.client-logo__media')
        const restingRotation = Number(gsap.getProperty(logo, 'rotation')) || 0
        const rotationNudge = index % 2 === 0 ? 0.65 : -0.65
        const timeline = gsap.timeline({ paused: true })

        timeline
          .to(logo, {
            y: 2,
            scaleX: 1.012,
            scaleY: 0.985,
            duration: 0.16,
            ease: 'power2.inOut',
          })
          .to(logo, {
            y: -6,
            scaleX: 1.03,
            scaleY: 1.04,
            rotation: restingRotation + rotationNudge,
            duration: 0.28,
            ease: 'power3.out',
          })
          .to(logo, {
            y: 0,
            scaleX: 1,
            scaleY: 1,
            rotation: restingRotation,
            duration: 0.44,
            ease: 'back.out(1.25)',
          })

        if (image) {
          timeline
            .to(image, {
              scale: 1.32,
              duration: 0.28,
              ease: 'sine.out',
            }, 0.1)
            .to(image, {
              scale: 1.28,
              duration: 0.42,
              ease: 'power2.out',
            }, 0.34)
        }

        return timeline
      })
      const cardCenterTriggers = desktopClientLogos.map((logo, index) => {
        const pulse = () => cardPulseAnimations[index].restart()

        return ScrollTrigger.create({
          trigger: logo,
          containerAnimation: horizontalScroll,
          start: 'center center',
          onEnter: pulse,
          onLeaveBack: pulse,
        })
      })

      return () => {
        entryPreview.kill()
        horizontalScroll.kill()
        cardCenterTriggers.forEach((trigger) => trigger.kill())
        cardPulseAnimations.forEach((animation) => animation.kill())
        counterObserver.disconnect()
        counterAnimations.forEach((animation) => animation.kill())
      }
    },
    { scope: section },
  )

  return (
    <section
      className="impact-section"
      ref={section}
      aria-label="Nuestro impacto y clientes"
      data-scene-id="impact"
    >
      <div className="impact-track" ref={track}>
        {metrics.map((metric, index) => (
          <article className="impact-metric" key={metric.value}>
            <strong aria-label={metric.value}>
              <span
                aria-hidden="true"
                data-target={index < 3 ? metric.value : undefined}
                ref={
                  index < 3
                    ? (element) => {
                        metricValues.current[index] = element
                      }
                    : undefined
                }
              >
                {metric.value}
              </span>
            </strong>
            <p>{metric.label}</p>
          </article>
        ))}
        <div className="clients-intro">
          <p>Marcas que confían en nosotros</p>
          <strong>Nuestros clientes</strong>
        </div>
        <ClientLogoGrid />
        <p className="impact-track__end" aria-hidden="true">
          Juntos llegamos más lejos.
        </p>
      </div>
    </section>
  )
}
