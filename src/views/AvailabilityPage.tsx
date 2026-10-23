import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import butterflyAsset from '../assets/public-butterfly.svg'
import { gsap, ScrollTrigger, useGSAP } from '../animation/gsap'
import { prefersReducedMotion } from '../animation/motion'
import { usePageTone } from '../hooks/usePageTone'
import { assetUrl } from '../lib/assetUrl'

const butterfly = assetUrl(butterflyAsset)

interface AvailabilityPageProps {
  modal?: boolean
}

export function AvailabilityPage({ modal = false }: AvailabilityPageProps) {
  usePageTone('#07080b', modal)
  const page = useRef<HTMLElement>(null)
  const modalPanel = useRef<HTMLDivElement>(null)
  const mark = useRef<HTMLImageElement>(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (modal) return

    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [modal])

  useEffect(() => {
    if (!modal) return

    const previousOverflow = document.body.style.overflow
    const backgroundScrollY = location.state?.backgroundScrollY as
      | number
      | undefined
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') navigate(-1)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)

      if (typeof backgroundScrollY === 'number') {
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: backgroundScrollY, behavior: 'instant' })
          window.dispatchEvent(new Event('public:restore-gallery-rails'))

          window.requestAnimationFrame(() => {
            ScrollTrigger.refresh()
            window.scrollTo({ top: backgroundScrollY, behavior: 'instant' })
            ScrollTrigger.update()
          })
        })
      }
    }
  }, [location.state, modal, navigate])

  useGSAP(
    () => {
      if (prefersReducedMotion()) return

      const timeline = gsap
        .timeline()
        .from('.availability-page__back', {
          autoAlpha: 0,
          y: -12,
          duration: 0.45,
          ease: 'power3.out',
        })
        .from(
          mark.current,
          {
            autoAlpha: 0,
            scale: 0.65,
            rotation: -16,
            duration: 0.8,
            ease: 'back.out(2.3)',
          },
          0.08,
        )
        .from(
          '.availability-page__eyebrow, .availability-page__copy',
          {
            autoAlpha: 0,
            y: 18,
            duration: 0.55,
            stagger: 0.1,
            ease: 'power3.out',
          },
          0.2,
        )
        .from(
          '.availability-page__title > span',
          {
            yPercent: 115,
            duration: 0.85,
            ease: 'power4.out',
          },
          0.24,
        )
        .from(
          '.availability-page__footer',
          {
            autoAlpha: 0,
            duration: 0.5,
            ease: 'power2.out',
          },
          0.55,
        )

      const idle = gsap
        .timeline({ repeat: -1, repeatDelay: 3.6, delay: 2 })
        .to(mark.current, {
          rotation: -6,
          scaleX: 0.92,
          scaleY: 1.06,
          duration: 0.22,
          ease: 'sine.inOut',
        })
        .to(mark.current, {
          rotation: 7,
          scaleX: 1.06,
          scaleY: 0.95,
          duration: 0.26,
          ease: 'sine.inOut',
        })
        .to(mark.current, {
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          duration: 0.42,
          ease: 'elastic.out(1, .5)',
        })

      return () => {
        timeline.kill()
        idle.kill()
      }
    },
    { scope: page },
  )

  const Root = modal ? 'section' : 'main'
  const pageContent = (
    <Root className="availability-page" ref={page}>
      <div className="availability-page__glow" aria-hidden="true" />

      <section className="availability-page__content">
        <img
          className="availability-page__mark"
          ref={mark}
          src={butterfly}
          alt=""
        />
        <p className="availability-page__eyebrow">
          <span aria-hidden="true" />
          Próximamente
        </p>
        <h1 className="availability-page__title">
          <span>Disponibilidad</span>
        </h1>
        <p className="availability-page__copy">
          Estamos preparando una nueva forma de descubrir nuestros espacios.
        </p>
        <button
          className="availability-page__back"
          type="button"
          onClick={() => {
            if (modal || location.state?.backgroundLocation) {
              navigate(-1)
              return
            }

            navigate('/')
          }}
        >
          <span aria-hidden="true">←</span>
          Volver
        </button>
      </section>
    </Root>
  )

  if (!modal) return pageContent

  return (
    <div
      className="route-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Disponibilidad"
    >
      <button
        className="route-modal__backdrop"
        type="button"
        aria-label="Cerrar"
        onClick={() => navigate(-1)}
      />
      <div className="route-modal__panel availability-route-modal__panel" ref={modalPanel}>
        {pageContent}
      </div>
    </div>
  )
}
