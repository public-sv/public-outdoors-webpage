import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import butterfly from '../assets/public-butterfly.svg'
import { gsap, useGSAP } from '../animation/gsap'
import { prefersReducedMotion } from '../animation/motion'

type SiteNavigationProps = {
  revealed: boolean
  hideButterfly?: boolean
  lightSurface?: boolean
  temporarilyHidden?: boolean
  onContact: () => void
  onMedia: (
    event: React.MouseEvent<HTMLAnchorElement>,
    collectionId: 'indoor' | 'outdoor' | 'innovaciones',
  ) => void
}

const mediaLinks = [
  { id: 'outdoor', label: 'Outdoor' },
  { id: 'indoor', label: 'Indoor' },
  { id: 'innovaciones', label: 'Innovaciones' },
] as const

export function SiteNavigation({
  revealed,
  hideButterfly = false,
  lightSurface = false,
  temporarilyHidden = false,
  onContact,
  onMedia,
}: SiteNavigationProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const navigation = useRef<HTMLElement>(null)
  const butterflyButton = useRef<HTMLAnchorElement>(null)
  const butterflyImage = useRef<HTMLImageElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mediaOpen, setMediaOpen] = useState(false)
  const navigationId = useId().replace(/:/g, '')
  const menuId = `site-navigation-menu-${navigationId}`
  const mediaMenuId = `site-media-menu-${navigationId}`
  const [compact, setCompact] = useState(() =>
    window.matchMedia('(max-width: 900px)').matches,
  )
  const butterflyHidden = hideButterfly || compact

  useEffect(() => {
    const query = window.matchMedia('(max-width: 900px)')
    const syncBreakpoint = (event: MediaQueryListEvent) => setCompact(event.matches)
    query.addEventListener('change', syncBreakpoint)
    return () => query.removeEventListener('change', syncBreakpoint)
  }, [])

  useEffect(() => {
    if (!menuOpen && !mediaOpen) return

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!navigation.current?.contains(event.target as Node)) {
        setMenuOpen(false)
        setMediaOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        setMediaOpen(false)
      }
    }

    window.addEventListener('pointerdown', closeOnOutsidePress)
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      window.removeEventListener('pointerdown', closeOnOutsidePress)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen, mediaOpen])

  useGSAP(
    () => {
      const root = navigation.current
      const button = butterflyButton.current
      const image = butterflyImage.current
      if (!root || !button || !image) return

      if (!revealed) {
        gsap.set(root, { autoAlpha: 0, y: -14, pointerEvents: 'none' })
        return
      }

      const reducedMotion = prefersReducedMotion()
      const menuItems = gsap.utils.toArray<HTMLElement>('.site-nav__menu > *')

      if (reducedMotion) {
        gsap.set(root, { autoAlpha: 1, y: 0, pointerEvents: 'auto' })
        gsap.set(menuItems, { autoAlpha: 1, y: 0 })
        gsap.set(
          button,
          compact
            ? { autoAlpha: 1, clearProps: 'transform' }
            : { autoAlpha: 1, y: 0, scale: 1 },
        )
        return
      }

      const entrance = gsap
        .timeline()
        .set(root, { pointerEvents: 'none' })
        .fromTo(
          root,
          { autoAlpha: 0, y: -14 },
          { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out' },
        )

      if (compact && !butterflyHidden) {
        entrance
          .fromTo(
            button,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.4, ease: 'power2.out' },
            0.05,
          )
          .fromTo(
            image,
            { scale: 0.65, rotation: -18 },
            {
              scale: 1,
              rotation: 0,
              duration: 0.7,
              ease: 'back.out(2.4)',
            },
            0.05,
          )
      } else if (!compact) {
        entrance.fromTo(
          button,
          { autoAlpha: 0, scale: 0.65, rotation: -18 },
          {
            autoAlpha: 1,
            scale: 1,
            rotation: 0,
            duration: 0.7,
            ease: 'back.out(2.4)',
          },
          0.05,
        )
      }

      entrance.fromTo(
        menuItems,
        { autoAlpha: 0, y: -8 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.07,
          ease: 'power3.out',
        },
        0.18,
      )

      const idle = compact ? null : gsap
        .timeline({ repeat: -1, delay: 2.4, repeatDelay: 3.8 })
        .to(image, {
          rotation: -7,
          scaleX: 0.9,
          scaleY: 1.07,
          duration: 0.2,
          ease: 'power2.inOut',
        })
        .to(image, {
          rotation: 8,
          scaleX: 1.08,
          scaleY: 0.94,
          duration: 0.24,
          ease: 'power2.inOut',
        })
        .to(image, {
          rotation: -3,
          scaleX: 0.97,
          scaleY: 1.03,
          duration: 0.18,
          ease: 'sine.inOut',
        })
        .to(image, {
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          duration: 0.38,
          ease: 'elastic.out(1, 0.45)',
        })
        .to({}, { duration: 2.6 })
        .to(image, {
          y: -4,
          rotation: 5,
          duration: 0.28,
          ease: 'power2.out',
        })
        .to(image, {
          y: 1,
          rotation: -2,
          duration: 0.34,
          ease: 'sine.inOut',
        })
        .to(image, {
          y: 0,
          rotation: 0,
          duration: 0.42,
          ease: 'back.out(2)',
        })

      const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
      let xTo: ReturnType<typeof gsap.quickTo> | undefined
      let yTo: ReturnType<typeof gsap.quickTo> | undefined
      let rotateXTo: ReturnType<typeof gsap.quickTo> | undefined
      let rotateYTo: ReturnType<typeof gsap.quickTo> | undefined

      const trackPointer = (event: PointerEvent) => {
        const x = event.clientX / window.innerWidth - 0.5
        const y = event.clientY / window.innerHeight - 0.5
        xTo?.(gsap.utils.clamp(-5, 9, x * 12))
        yTo?.(gsap.utils.clamp(-4, 7, y * 10))
        rotateXTo?.(gsap.utils.clamp(-9, 9, y * -13))
        rotateYTo?.(gsap.utils.clamp(-12, 12, x * 17))
      }

      const settle = () => {
        xTo?.(0)
        yTo?.(0)
        rotateXTo?.(0)
        rotateYTo?.(0)
      }

      if (finePointer.matches) {
        xTo = gsap.quickTo(button, 'x', { duration: 0.75, ease: 'power3.out' })
        yTo = gsap.quickTo(button, 'y', { duration: 0.75, ease: 'power3.out' })
        rotateXTo = gsap.quickTo(button, 'rotationX', {
          duration: 0.55,
          ease: 'power3.out',
        })
        rotateYTo = gsap.quickTo(button, 'rotationY', {
          duration: 0.55,
          ease: 'power3.out',
        })
        window.addEventListener('pointermove', trackPointer, { passive: true })
        document.documentElement.addEventListener('mouseleave', settle)
      }

      return () => {
        entrance.kill()
        idle?.kill()
        window.removeEventListener('pointermove', trackPointer)
        document.documentElement.removeEventListener('mouseleave', settle)
        gsap.killTweensOf([button, image])
      }
    },
    {
      dependencies: [butterflyHidden, compact, revealed],
      scope: navigation,
      revertOnUpdate: true,
    },
  )

  return (
    <nav
      className={`site-nav${butterflyHidden ? ' site-nav--without-butterfly' : ''}${
        lightSurface ? ' site-nav--light-surface' : ''
      }${temporarilyHidden ? ' site-nav--temporarily-hidden' : ''}${
        revealed && compact && (menuOpen || butterflyHidden) ? ' is-open' : ''
      }${
        mediaOpen ? ' is-media-open' : ''
      }`}
      aria-label="Navegación principal"
      aria-hidden={!revealed || temporarilyHidden}
      ref={navigation}
    >
      <a
        className="site-nav__butterfly"
        ref={butterflyButton}
        href="#hero"
        role={compact ? 'button' : undefined}
        aria-label={
          compact
            ? revealed && menuOpen
              ? 'Cerrar menú'
              : 'Abrir menú'
            : 'Volver al inicio'
        }
        aria-expanded={compact ? revealed && menuOpen : undefined}
        aria-controls={compact ? menuId : undefined}
        tabIndex={revealed && !temporarilyHidden && !butterflyHidden ? 0 : -1}
        hidden={butterflyHidden}
        onClick={(event) => {
          if (compact) {
            event.preventDefault()
            if (menuOpen) setMediaOpen(false)
            setMenuOpen(!menuOpen)
            return
          }

          window.dispatchEvent(new Event('public:navigate-home'))
        }}
      >
        <img ref={butterflyImage} src={butterfly} alt="" />
        <span className="site-nav__butterfly-ring" aria-hidden="true" />
      </a>

      <div className="site-nav__menu" id={menuId}>
        <a
          className="site-nav__home"
          href="#hero"
          aria-label="Volver al inicio"
          tabIndex={revealed && !temporarilyHidden ? 0 : -1}
          onClick={() => {
            setMenuOpen(false)
            setMediaOpen(false)
            window.dispatchEvent(new Event('public:navigate-home'))
          }}
        >
          Inicio
        </a>
        <button
          type="button"
          tabIndex={revealed && !temporarilyHidden ? 0 : -1}
          onClick={() => {
            setMenuOpen(false)
            setMediaOpen(false)
            onContact()
          }}
        >
          Contáctanos
        </button>
        <div
          className="site-nav__media"
          onMouseEnter={() => {
            if (!compact) setMediaOpen(true)
          }}
          onMouseLeave={() => {
            if (!compact) setMediaOpen(false)
          }}
          onBlur={(event) => {
            if (
              !compact &&
              !event.currentTarget.contains(event.relatedTarget as Node)
            ) {
              setMediaOpen(false)
            }
          }}
        >
          <button
            type="button"
            aria-expanded={mediaOpen}
            aria-controls={mediaMenuId}
            tabIndex={revealed && !temporarilyHidden ? 0 : -1}
            onFocus={() => {
              if (!compact) setMediaOpen(true)
            }}
            onClick={() => {
              if (compact) {
                setMediaOpen((open) => !open)
                return
              }

              setMediaOpen(true)
            }}
          >
            Nuestros medios
            <span className="site-nav__media-chevron" aria-hidden="true" />
          </button>

          <div
            className="site-nav__media-menu"
            id={mediaMenuId}
            aria-hidden={!mediaOpen}
          >
            {mediaLinks.map(({ id, label }) => (
              <a
                href={`#${id}-gallery`}
                tabIndex={revealed && !temporarilyHidden && mediaOpen ? 0 : -1}
                onClick={(event) => {
                  setMenuOpen(false)
                  setMediaOpen(false)
                  onMedia(event, id)
                }}
                key={id}
              >
                <span aria-hidden="true" />
                {label}
              </a>
            ))}
          </div>
        </div>
        <Link
          to="/disponibilidad"
          tabIndex={revealed && !temporarilyHidden ? 0 : -1}
          onClick={(event) => {
            setMenuOpen(false)
            setMediaOpen(false)

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
          }}
        >
          Disponibilidad
        </Link>
      </div>
    </nav>
  )
}
