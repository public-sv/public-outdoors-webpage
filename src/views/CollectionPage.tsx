import { usePageTone } from '../hooks/usePageTone'
import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { gsap, ScrollTrigger, useGSAP } from '../animation/gsap'
import { prefersReducedMotion } from '../animation/motion'
import { isMobileExperience } from '../animation/mobile'

interface CollectionPageProps {
  children: ReactNode
  collectionId: 'indoor' | 'outdoor' | 'innovaciones'
  label: string
  modal?: boolean
}

export function CollectionPage({
  children,
  collectionId,
  label,
  modal = false,
}: CollectionPageProps) {
  usePageTone('#0b0d0c', modal)
  const page = useRef<HTMLElement>(null)
  const modalPanel = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (modal) return
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [collectionId, modal])

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

      const mobile = isMobileExperience()

      const backButton = page.current?.querySelector('.collection-page__back')
      const titleLines = page.current?.querySelectorAll(
        '.collection-page__title-line > span',
      )
      const introCopy = page.current?.querySelector('.collection-page__intro p')
      const projects = page.current?.querySelectorAll('.collection-page__project')
      const timeline = gsap.timeline()

      if (backButton) {
        timeline.from(backButton, {
          y: mobile ? -8 : -12,
          autoAlpha: 0,
          duration: 0.45,
          ease: 'power3.out',
        })
      }

      if (titleLines?.length) {
        timeline.from(
          titleLines,
          {
            yPercent: 110,
            duration: mobile ? 0.55 : 0.75,
            stagger: mobile ? 0.05 : 0.08,
            ease: 'power4.out',
          },
          0.06,
        )
      }

      if (introCopy) {
        timeline.from(
          introCopy,
          {
            y: mobile ? 12 : 20,
            autoAlpha: 0,
            duration: mobile ? 0.4 : 0.55,
            ease: 'power3.out',
          },
          0.24,
        )
      }

      if (projects?.length) {
        timeline.from(
          projects,
          {
            y: mobile ? 28 : 48,
            autoAlpha: 0,
            scale: mobile ? 1 : 0.97,
            duration: mobile ? 0.5 : 0.72,
            stagger: mobile ? 0.06 : 0.1,
            ease: 'power4.out',
          },
          0.34,
        )
      }

      return () => timeline.kill()
    },
    { scope: page, dependencies: [collectionId] },
  )

  useGSAP(
    () => {
      if (!modal || prefersReducedMotion() || !modalPanel.current) return

      const origin = location.state?.transitionOrigin as
        | { x: number; y: number; width: number; height: number }
        | undefined

      if (!origin) return

      const panel = modalPanel.current
      const panelBounds = panel.getBoundingClientRect()
      const backdrop = panel.parentElement?.querySelector<HTMLElement>(
        '.route-modal__backdrop',
      )
      const originCenterX = origin.x + origin.width / 2
      const originCenterY = origin.y + origin.height / 2
      const panelCenterX = panelBounds.x + panelBounds.width / 2
      const panelCenterY = panelBounds.y + panelBounds.height / 2
      const timeline = gsap.timeline({ defaults: { overwrite: 'auto' } })

      if (backdrop) {
        timeline.fromTo(
          backdrop,
          { autoAlpha: 0, backdropFilter: 'blur(0px)' },
          {
            autoAlpha: 1,
            backdropFilter: 'blur(14px)',
            duration: 0.5,
            ease: 'power2.out',
          },
          0,
        )
      }

      timeline.fromTo(
        panel,
        {
          x: originCenterX - panelCenterX,
          y: originCenterY - panelCenterY,
          scaleX: gsap.utils.clamp(0.18, 1, origin.width / panelBounds.width),
          scaleY: gsap.utils.clamp(0.18, 1, origin.height / panelBounds.height),
          borderRadius: '1rem',
          autoAlpha: 0.88,
        },
        {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          borderRadius: 'clamp(1rem, 2vw, 2rem)',
          autoAlpha: 1,
          duration: 0.78,
          ease: 'expo.inOut',
          clearProps: 'transform',
        },
        0,
      )

      return () => timeline.kill()
    },
    { dependencies: [collectionId, modal] },
  )

  const Root = modal ? 'section' : 'main'

  const pageContent = (
    <Root
      className={`collection-page collection-page--${collectionId}`}
      ref={page}
    >
      <button
        className="collection-page__back"
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

      {children}
    </Root>
  )

  if (!modal) return pageContent

  return (
    <div
      className="route-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`Proyectos ${label}`}
    >
      <button
        className="route-modal__backdrop"
        type="button"
        aria-label="Cerrar"
        onClick={() => navigate(-1)}
      />
      <div
        className={`route-modal__panel${
          location.state?.transitionOrigin ? ' route-modal__panel--magic' : ''
        }`}
        ref={modalPanel}
      >
        {pageContent}
      </div>
    </div>
  )
}
