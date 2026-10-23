import { usePageTone } from '../hooks/usePageTone'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { gsap, useGSAP } from '../animation/gsap'
import { prefersReducedMotion } from '../animation/motion'
import { isMobileExperience } from '../animation/mobile'
import facebookIconAsset from '../assets/facebook-streamline.svg'
import instagramIconAsset from '../assets/instagram-streamline.svg'
import linkedinIconAsset from '../assets/linkedin-streamline.svg'
import butterflyLogoAsset from '../assets/public-butterfly.svg'
import whatsappIconAsset from '../assets/whatsapp-streamline.svg'
import { assetUrl } from '../lib/assetUrl'
import { isSafari } from '../platform/iosSafari'

const facebookIcon = assetUrl(facebookIconAsset)
const instagramIcon = assetUrl(instagramIconAsset)
const linkedinIcon = assetUrl(linkedinIconAsset)
const butterflyLogo = assetUrl(butterflyLogoAsset)
const whatsappIcon = assetUrl(whatsappIconAsset)

type ContactCardProps = {
  onClose?: () => void
  mode?: 'modal' | 'scroll'
  motionActive?: boolean
}

type ShareState = 'idle' | 'exporting' | 'shared' | 'error'
type MotionAccessState = 'idle' | 'needs-permission' | 'active' | 'denied' | 'unavailable'

type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

const officeAddress =
  'Condominio Balam Quitze, segundo nivel, local 2-31, Paseo General Escalón, San Salvador, El Salvador'

const contactDetails = [
  {
    id: 'address',
    label: 'Oficina',
    display: (
      <>
        Condominio Balam Quitze, segundo nivel, local 2-31
        <br />
        Paseo General Escalón, San Salvador, El Salvador
      </>
    ),
    value: officeAddress,
    href: 'https://www.google.com/maps/search/?api=1&query=Condominio%20Balam%20Quitze%2C%20Paseo%20General%20Escal%C3%B3n%2C%20San%20Salvador%2C%20El%20Salvador',
    actionLabel: 'Abrir la oficina en Google Maps',
    external: true,
  },
  {
    id: 'phone',
    label: 'Teléfono',
    display: '+503 2264-5458',
    value: '+503 2264-5458',
    href: 'tel:+50322645458',
    actionLabel: 'Llamar al +503 2264-5458',
    external: false,
  },
  {
    id: 'email',
    label: 'Email',
    display: 'marketing@publicsv.net',
    value: 'marketing@publicsv.net',
    href: 'mailto:marketing@publicsv.net',
    actionLabel: 'Escribir a marketing@publicsv.net',
    external: false,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    display: (
      <>
        <span>Iris · +503 7840 0641</span>
        <span>Zayda · +503 7607 9725</span>
        <span>Rosemary · +503 7855 7192</span>
      </>
    ),
    value: 'Seleccionar contacto de WhatsApp',
    href: '',
    actionLabel: 'Elegir contacto de WhatsApp',
    external: false,
  },
]

function getOfficeMapTarget() {
  const encodedAddress = encodeURIComponent(officeAddress)
  const { maxTouchPoints, platform, userAgent } = navigator
  const isAndroid = /Android/i.test(userAgent)
  const isIOS =
    /iPad|iPhone|iPod/i.test(userAgent) ||
    (platform === 'MacIntel' && maxTouchPoints > 1)

  if (isAndroid) {
    return {
      href: `geo:0,0?q=${encodedAddress}`,
      external: false,
      actionLabel: 'Abrir la oficina con una aplicación de mapas',
    }
  }

  if (isIOS) {
    return {
      href: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
      external: true,
      actionLabel: 'Abrir la oficina en Google Maps',
    }
  }

  return {
    href: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
    external: true,
    actionLabel: 'Abrir la oficina en Google Maps',
  }
}

const whatsappContacts = [
  { name: 'Iris Quinteros', number: '+503 7840 0641', whatsapp: '50378400641' },
  { name: 'Zayda Reyes', number: '+503 7607 9725', whatsapp: '50376079725' },
  { name: 'Rosemary Daboub', number: '+503 7855 7192', whatsapp: '50378557192' },
]

const socialLinks = [
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/publicoutdoors/' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/company/publicoutdoors/' },
  { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/publicoutdoors1/' },
]

const socialIconAssets: Record<string, string> = {
  facebook: facebookIcon,
  instagram: instagramIcon,
  linkedin: linkedinIcon,
}

function SocialIcon({ id }: { id: string }) {
  return (
    <img src={socialIconAssets[id]} alt="" aria-hidden="true" />
  )
}

function ContactDetailIcon({ id }: { id: string }) {
  if (id === 'address') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" />
        <circle cx="12" cy="10" r="2.1" />
      </svg>
    )
  }

  if (id === 'phone') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.1 3.7 4.5 5c-.7.4-1 1.2-.8 2 1.6 6.4 6.6 11.4 13 13 .8.2 1.6-.1 2-.8l1.3-2.6-4.2-2-1.3 2a13.2 13.2 0 0 1-7.1-7.1l2-1.3-2.3-4.5Z" />
      </svg>
    )
  }

  if (id === 'email') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
        <path d="m5 7 7 5 7-5" />
      </svg>
    )
  }

  if (id === 'whatsapp') {
    return (
      <img src={whatsappIcon} alt="" aria-hidden="true" />
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.8 12h16.4M12 3.5c2.2 2.3 3.3 5.1 3.3 8.5S14.2 18.2 12 20.5M12 3.5C9.8 5.8 8.7 8.6 8.7 12s1.1 6.2 3.3 8.5" />
    </svg>
  )
}

export function ContactCard({
  onClose,
  mode = 'modal',
  motionActive = true,
}: ContactCardProps) {
  usePageTone('#090b0d', true, mode === 'modal')
  const overlay = useRef<HTMLDivElement>(null)
  const cardMotion = useRef<HTMLDivElement>(null)
  const cardStage = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const whatsappPanel = useRef<HTMLDivElement>(null)
  const closing = useRef(false)
  const tiltReady = useRef(false)
  const requestMotionAccess = useRef<() => void>(() => undefined)
  const shareTimer = useRef<number | undefined>(undefined)
  const [shareState, setShareState] = useState<ShareState>('idle')
  const [motionAccess, setMotionAccess] = useState<MotionAccessState>('idle')
  const [whatsappOpen, setWhatsappOpen] = useState(false)
  const useWhatsappSheet = whatsappOpen && window.matchMedia('(max-width: 829px)').matches

  useGSAP(
    () => {
      if (!overlay.current || !cardMotion.current) return
      if (mode === 'scroll') return

      if (prefersReducedMotion()) {
        gsap.set([overlay.current, cardMotion.current], {
          autoAlpha: 1,
          clearProps: 'transform,filter,clipPath',
        })
        tiltReady.current = true
        return
      }

      if (isMobileExperience()) {
        tiltReady.current = false
        const reveals = cardMotion.current.querySelectorAll<HTMLElement>(
          '.contact-card__reveal',
        )
        const timeline = gsap
          .timeline({
            onComplete: () => {
              tiltReady.current = true
            },
          })
          .set(overlay.current, { autoAlpha: 0 })
          .set(cardMotion.current, {
            autoAlpha: 0,
            yPercent: 42,
            rotationX: -14,
            rotationZ: -1.4,
            scale: 0.92,
            transformOrigin: 'center bottom',
            force3D: true,
          })
          .set(reveals, { autoAlpha: 0, y: 12 })
          .to(overlay.current, {
            autoAlpha: 1,
            duration: 0.32,
            ease: 'power2.out',
          })
          .to(
            cardMotion.current,
            {
              autoAlpha: 1,
              yPercent: 0,
              rotationX: 0,
              rotationZ: 0,
              scale: 1,
              duration: 0.72,
              ease: 'back.out(1.18)',
            },
            0.04,
          )
          .to(
            reveals,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.34,
              stagger: 0.035,
              ease: 'power3.out',
            },
            0.22,
          )

        return () => timeline.kill()
      }

      if (isSafari()) {
        tiltReady.current = false
        const timeline = gsap
          .timeline({
            onComplete: () => {
              tiltReady.current = true
            },
          })
          .set(overlay.current, { autoAlpha: 0 })
          .set(cardMotion.current, {
            autoAlpha: 0,
            clearProps: 'transform,filter,clipPath',
          })
          .to(overlay.current, {
            autoAlpha: 1,
            duration: 0.32,
            ease: 'power2.out',
          })
          .to(
            cardMotion.current,
            {
              autoAlpha: 1,
              duration: 0.42,
              ease: 'power2.out',
            },
            0.04,
          )

        return () => timeline.kill()
      }

      gsap
        .timeline({
          onComplete: () => {
            tiltReady.current = true
          },
        })
        .set(overlay.current, { autoAlpha: 0 })
        .set(cardMotion.current, {
          autoAlpha: 0,
          xPercent: -12,
          rotationY: -48,
          scale: 0.96,
          clipPath: 'inset(0 82% 0 0 round 1.5rem)',
          transformOrigin: 'left center',
        })
        .to(overlay.current, {
          autoAlpha: 1,
          duration: 0.42,
          ease: 'power2.out',
        })
        .to(
          cardMotion.current,
          {
            autoAlpha: 1,
            xPercent: 0,
            rotationY: 0,
            scale: 1,
            clipPath: 'inset(0 0% 0 0 round 1.5rem)',
            duration: 0.82,
            ease: 'power4.out',
          },
          0.06,
        )
        .set(cardMotion.current, { clipPath: 'none' }, 0.88)
    },
    { scope: overlay },
  )

  useGSAP((_, contextSafe) => {
    const stage = cardStage.current
    const safe = contextSafe!
    const mobileExperience = isMobileExperience()
    const desktopSafari = !mobileExperience && isSafari()
    const deferEmbeddedTilt = mode === 'scroll' && mobileExperience

    if (!motionActive) {
      tiltReady.current = false
      return
    }

    if (!stage || prefersReducedMotion()) {
      setMotionAccess('unavailable')
      return
    }

    if (mobileExperience) {
      tiltReady.current = false
      setMotionAccess('unavailable')
      requestMotionAccess.current = () => undefined
      gsap.set(stage, { clearProps: 'transform' })
      return
    }

    if (mode === 'scroll') tiltReady.current = !deferEmbeddedTilt

    gsap.set(stage, {
      transformPerspective: 1050,
      transformOrigin: 'center center',
    })

    const rotateX = gsap.quickTo(stage, 'rotationX', {
      duration: 0.36,
      ease: 'power2.out',
    })
    const rotateY = gsap.quickTo(stage, 'rotationY', {
      duration: 0.36,
      ease: 'power2.out',
    })
    const shiftX = gsap.quickTo(stage, 'x', {
      duration: 0.4,
      ease: 'power2.out',
    })
    const shiftY = gsap.quickTo(stage, 'y', {
      duration: 0.4,
      ease: 'power2.out',
    })

    const resetTilt = safe(() => {
      if (!tiltReady.current || closing.current) return
      rotateX(0)
      rotateY(0)
      shiftX(0)
      shiftY(0)
    })

    let safariInteractionLocked = false
    let safariReleaseTimer: number | undefined

    const isInteractiveTarget = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest('a, button'))

    const lockSafariTiltForInteraction = safe((event: PointerEvent) => {
      if (!desktopSafari || !isInteractiveTarget(event.target)) return

      safariInteractionLocked = true
      window.clearTimeout(safariReleaseTimer)
      rotateX(0)
      rotateY(0)
      shiftX(0)
      shiftY(0)
    })

    const releaseSafariTiltAfterInteraction = safe(() => {
      if (!desktopSafari || !safariInteractionLocked) return

      window.clearTimeout(safariReleaseTimer)
      safariReleaseTimer = window.setTimeout(() => {
        safariInteractionLocked = false
        resetTilt()
      }, 80)
    })

    if (mobileExperience) {
      if (
        !window.isSecureContext ||
        typeof window.DeviceOrientationEvent === 'undefined'
      ) {
        setMotionAccess('unavailable')
        return
      }

      let initialBeta: number | null = null
      let initialGamma: number | null = null
      let calibrationBetaTotal = 0
      let calibrationGammaTotal = 0
      let calibrationSamples = 0
      const requiredCalibrationSamples = 12
      let listening = false
      let permissionRequested = false
      let tiltSuspended = false
      let resumeTimer: number | undefined
      let visibilityObserver: IntersectionObserver | undefined

      const resetCalibration = safe(() => {
        initialBeta = null
        initialGamma = null
        calibrationBetaTotal = 0
        calibrationGammaTotal = 0
        calibrationSamples = 0
        resetTilt()
      })

      const handleOrientation = safe((event: DeviceOrientationEvent) => {
        if (
          !tiltReady.current ||
          closing.current ||
          tiltSuspended ||
          event.beta === null ||
          event.gamma === null
        ) return

        if (calibrationSamples < requiredCalibrationSamples) {
          calibrationBetaTotal += event.beta
          calibrationGammaTotal += event.gamma
          calibrationSamples += 1

          if (calibrationSamples === requiredCalibrationSamples) {
            initialBeta = calibrationBetaTotal / requiredCalibrationSamples
            initialGamma = calibrationGammaTotal / requiredCalibrationSamples
            resetTilt()
          }
          return
        }

        if (initialBeta === null || initialGamma === null) return

        const beta = event.beta - initialBeta
        const gamma = event.gamma - initialGamma
        const legacyAngle = typeof window.orientation === 'number'
          ? window.orientation
          : 0
        const angle = screen.orientation?.angle ?? legacyAngle

        let horizontal = gamma
        let vertical = beta

        if (angle === 90) {
          horizontal = beta
          vertical = -gamma
        } else if (angle === 180) {
          horizontal = -gamma
          vertical = -beta
        } else if (angle === 270) {
          horizontal = -beta
          vertical = gamma
        }

        const removeNeutralDrift = (value: number) => {
          const deadZone = 1.35
          if (Math.abs(value) <= deadZone) return 0
          return value - Math.sign(value) * deadZone
        }
        const centeredHorizontal = removeNeutralDrift(horizontal)
        const centeredVertical = removeNeutralDrift(vertical)
        const tiltX = gsap.utils.clamp(-6, 6, (centeredVertical / 16) * -6)
        const tiltY = gsap.utils.clamp(-8, 8, (centeredHorizontal / 16) * 8)

        rotateX(tiltX)
        rotateY(tiltY)
        shiftX(gsap.utils.clamp(-3, 3, centeredHorizontal * 0.18))
        shiftY(gsap.utils.clamp(-2, 2, centeredVertical * 0.12))
      })

      const startListening = () => {
        if (listening) return
        listening = true
        setMotionAccess('active')
        window.addEventListener('deviceorientation', handleOrientation, {
          passive: true,
        })
      }

      const orientationEvent = window.DeviceOrientationEvent as
        DeviceOrientationEventWithPermission

      if (deferEmbeddedTilt) {
        visibilityObserver = new IntersectionObserver(
          ([entry]) => {
            const cardIsSettled = entry.intersectionRatio >= 0.82
            if (cardIsSettled) {
              tiltReady.current = true
              return
            }

            rotateX(0)
            rotateY(0)
            shiftX(0)
            shiftY(0)
            tiltReady.current = false
          },
          { threshold: [0, 0.82, 1] },
        )
        visibilityObserver.observe(stage)
      }

      const requestOrientationAccess = safe(async () => {
        if (permissionRequested) return
        permissionRequested = true

        try {
          const permission = await orientationEvent.requestPermission?.()
          if (permission === 'granted') {
            startListening()
          } else {
            setMotionAccess('denied')
          }
        } catch {
          setMotionAccess('denied')
        }
      })

      if (orientationEvent.requestPermission) {
        requestMotionAccess.current = requestOrientationAccess
        setMotionAccess('needs-permission')
      } else {
        startListening()
      }

      const suspendTiltForInteraction = safe(() => {
        tiltSuspended = true
        window.clearTimeout(resumeTimer)
        gsap.getTweensOf(stage).forEach((tween) => tween.pause())
      })

      const resumeTiltAfterInteraction = safe(() => {
        window.clearTimeout(resumeTimer)
        resumeTimer = window.setTimeout(() => {
          gsap.getTweensOf(stage).forEach((tween) => tween.play())
          resetCalibration()
          tiltSuspended = false
        }, 180)
      })

      screen.orientation?.addEventListener('change', resetCalibration)
      window.addEventListener('blur', resetCalibration)
      stage.addEventListener('pointerdown', suspendTiltForInteraction, true)
      window.addEventListener('pointerup', resumeTiltAfterInteraction, true)
      window.addEventListener('pointercancel', resumeTiltAfterInteraction, true)

      return () => {
        window.clearTimeout(resumeTimer)
        visibilityObserver?.disconnect()
        requestMotionAccess.current = () => undefined
        window.removeEventListener('deviceorientation', handleOrientation)
        screen.orientation?.removeEventListener('change', resetCalibration)
        window.removeEventListener('blur', resetCalibration)
        stage.removeEventListener('pointerdown', suspendTiltForInteraction, true)
        window.removeEventListener('pointerup', resumeTiltAfterInteraction, true)
        window.removeEventListener('pointercancel', resumeTiltAfterInteraction, true)
        gsap.killTweensOf(stage, ['rotationX', 'rotationY', 'x', 'y'])
        tiltReady.current = false
      }
    }

    const handlePointerMove = safe((event: PointerEvent) => {
      if (desktopSafari && isInteractiveTarget(event.target)) {
        lockSafariTiltForInteraction(event)
        return
      }

      if (
        event.pointerType === 'touch' ||
        safariInteractionLocked ||
        !tiltReady.current ||
        closing.current
      ) return

      const horizontal = (event.clientX / window.innerWidth - 0.5) * 2
      const vertical = (event.clientY / window.innerHeight - 0.5) * 2

      rotateX(vertical * -4)
      rotateY(horizontal * 5.5)
    })

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('blur', resetTilt)
    document.documentElement.addEventListener('pointerleave', resetTilt)
    if (desktopSafari) {
      stage.addEventListener('pointerover', lockSafariTiltForInteraction, true)
      stage.addEventListener('pointerout', releaseSafariTiltAfterInteraction, true)
      stage.addEventListener('pointerdown', lockSafariTiltForInteraction, true)
      window.addEventListener('pointerup', releaseSafariTiltAfterInteraction, true)
      window.addEventListener('pointercancel', releaseSafariTiltAfterInteraction, true)
    }

    return () => {
      window.clearTimeout(safariReleaseTimer)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('blur', resetTilt)
      document.documentElement.removeEventListener('pointerleave', resetTilt)
      if (desktopSafari) {
        stage.removeEventListener('pointerover', lockSafariTiltForInteraction, true)
        stage.removeEventListener('pointerout', releaseSafariTiltAfterInteraction, true)
        stage.removeEventListener('pointerdown', lockSafariTiltForInteraction, true)
        window.removeEventListener('pointerup', releaseSafariTiltAfterInteraction, true)
        window.removeEventListener('pointercancel', releaseSafariTiltAfterInteraction, true)
      }
      gsap.killTweensOf(stage, ['rotationX', 'rotationY', 'x', 'y'])
      tiltReady.current = false
    }
  }, {
    scope: cardMotion,
    dependencies: [mode, motionActive],
    revertOnUpdate: true,
  })

  const requestClose = useCallback(() => {
    if (
      mode !== 'modal' ||
      !onClose ||
      closing.current ||
      !overlay.current ||
      !cardMotion.current
    ) return
    closing.current = true
    tiltReady.current = false

    if (prefersReducedMotion()) {
      onClose()
      return
    }

    if (isMobileExperience()) {
      gsap
        .timeline({ onComplete: onClose })
        .to(cardMotion.current, {
          autoAlpha: 0,
          y: -14,
          scale: 0.985,
          duration: 0.28,
          ease: 'power2.in',
        })
        .to(
          overlay.current,
          {
            autoAlpha: 0,
            duration: 0.24,
            ease: 'power2.in',
          },
          0.06,
        )
      return
    }

    if (isSafari()) {
      gsap
        .timeline({ onComplete: onClose })
        .to(cardMotion.current, {
          autoAlpha: 0,
          duration: 0.28,
          ease: 'power2.in',
        })
        .to(
          overlay.current,
          {
            autoAlpha: 0,
            duration: 0.24,
            ease: 'power2.in',
          },
          0.04,
        )
      return
    }

    gsap
      .timeline({ onComplete: onClose })
      .to(cardMotion.current, {
        xPercent: 16,
        rotationX: 0,
        rotationY: 62,
        scale: 0.91,
        clipPath: 'inset(0 0 0 100% round 1.5rem)',
        autoAlpha: 0,
        duration: 0.62,
        ease: 'power3.inOut',
        transformOrigin: 'right center',
      })
      .to(
        overlay.current,
        {
          autoAlpha: 0,
          duration: 0.32,
          ease: 'power2.in',
        },
        0.24,
      )
  }, [mode, onClose])

  const goToCollection = (
    event: MouseEvent<HTMLAnchorElement>,
    collectionId: 'indoor' | 'outdoor' | 'innovaciones',
  ) => {
    const collection = document.getElementById(`${collectionId}-gallery`)

    // On collection detail pages, let the link navigate back to the matching
    // section on the home page.
    if (!collection) return

    event.preventDefault()
    window.dispatchEvent(new Event('public:navigate-to-media'))
    window.requestAnimationFrame(() => {
      collection.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start',
      })
    })

    if (mode === 'modal') requestClose()
  }

  useEffect(() => {
    if (mode !== 'modal') return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    const appRoot = document.getElementById('root')
    const previousInert = appRoot?.inert ?? false
    const focusTimer = window.setTimeout(() => {
      closeButton.current?.focus({ preventScroll: true })
    }, prefersReducedMotion() ? 0 : 700)

    document.body.style.overflow = 'hidden'
    if (appRoot) appRoot.inert = true

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (whatsappPanel.current) setWhatsappOpen(false)
        else requestClose()
      }

      if (event.key === 'Tab' && overlay.current) {
        const focusRoot = whatsappPanel.current ?? overlay.current
        const focusable = Array.from(
          focusRoot.querySelectorAll<HTMLElement>('button, [href]'),
        ).filter((element) => !element.hasAttribute('disabled'))
        const first = focusable[0]
        const last = focusable.at(-1)

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.clearTimeout(focusTimer)
      window.clearTimeout(shareTimer.current)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (appRoot) appRoot.inert = previousInert
      previouslyFocused?.focus({ preventScroll: true })
    }
  }, [mode, requestClose])

  useEffect(() => {
    if (!whatsappOpen) return

    const firstContact = whatsappPanel.current?.querySelector<HTMLElement>('a')
    firstContact?.focus({ preventScroll: true })
  }, [whatsappOpen])

  useEffect(() => {
    if (!useWhatsappSheet || mode !== 'scroll') return

    const previousOverflow = document.body.style.overflow
    const handleSheetKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setWhatsappOpen(false)
        return
      }

      if (event.key !== 'Tab' || !whatsappPanel.current) return

      const focusable = Array.from(
        whatsappPanel.current.querySelectorAll<HTMLElement>('button, [href]'),
      )
      const first = focusable[0]
      const last = focusable.at(-1)

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleSheetKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleSheetKeyDown)
    }
  }, [mode, useWhatsappSheet])

  const handleShare = async () => {
    if (shareState === 'exporting') return

    setShareState('exporting')
    window.clearTimeout(shareTimer.current)

    try {
      const assetUrl = '/public-contacto.png'
      const response = await fetch(assetUrl)
      if (!response.ok) throw new Error('Could not load the contact card image')

      const blob = await response.blob()
      const file = new File([blob], 'public-contacto.png', {
        type: 'image/png',
      })

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'Public · Contacto',
          text: 'Hagamos visible tu próxima idea.',
          files: [file],
        })
      } else {
        const downloadUrl = URL.createObjectURL(blob)
        const download = document.createElement('a')
        download.href = downloadUrl
        download.download = file.name
        document.body.appendChild(download)
        download.click()
        download.remove()
        window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0)
      }

      setShareState('shared')
      shareTimer.current = window.setTimeout(
        () => setShareState('idle'),
        2200,
      )
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setShareState('idle')
        return
      }

      setShareState('error')
      shareTimer.current = window.setTimeout(
        () => setShareState('idle'),
        2200,
      )
    }
  }

  const shareLabel = {
    idle: 'Compartir',
    exporting: 'Preparando',
    shared: 'Listo',
    error: 'Reintentar',
  }[shareState]

  const titleId = mode === 'modal'
    ? 'contact-card-title'
    : 'purpose-contact-card-title'

  const whatsappChooser = whatsappOpen ? (
    <div
      className={`contact-card__whatsapp-panel${useWhatsappSheet ? ' is-viewport-sheet' : ''}`}
      ref={whatsappPanel}
      data-export-exclude="true"
      onClick={() => setWhatsappOpen(false)}
    >
      <div
        className="contact-card__whatsapp-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-card-whatsapp-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="contact-card__whatsapp-header">
          <div>
            <span>WhatsApp</span>
            <strong id="contact-card-whatsapp-title">¿Con quién deseas hablar?</strong>
          </div>
          <button
            type="button"
            onClick={() => setWhatsappOpen(false)}
            aria-label="Cerrar contactos de WhatsApp"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <div className="contact-card__whatsapp-list">
          {whatsappContacts.map((contact) => (
            <a
              href={`https://wa.me/${contact.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => setWhatsappOpen(false)}
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
          ))}
        </div>
      </div>
    </div>
  ) : null

  const cardContent = (
    <div
      className="contact-card__motion"
      ref={cardMotion}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="contact-card__stage" ref={cardStage}>
        <article
          className="contact-card"
          role={mode === 'modal' ? 'dialog' : 'region'}
          aria-modal={mode === 'modal' ? true : undefined}
          aria-labelledby={titleId}
        >
        <header className="contact-card__header contact-card__reveal">
          <p>Public · El Salvador</p>
          <div
            className="contact-card__actions"
            data-export-exclude="true"
          >
            <button
              className={`contact-card__share is-${shareState}`}
              type="button"
              onClick={handleShare}
              disabled={shareState === 'exporting'}
              aria-label={`${shareLabel} tarjeta de contacto`}
            >
              <span>{shareLabel}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13" />
              </svg>
            </button>
            {mode === 'modal' && (
              <button
                className="contact-card__close"
                type="button"
                ref={closeButton}
                onClick={requestClose}
                aria-label="Cerrar información de contacto"
              >
                <span>Cerrar</span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 5l14 14M19 5L5 19" />
                </svg>
              </button>
            )}
          </div>
        </header>

        <div className="contact-card__body">
          <div className="contact-card__statement contact-card__reveal">
            <img
              className="contact-card__mark"
              src={butterflyLogo}
              alt="Public"
            />
            <p>Hagamos visible tu próxima idea.</p>
            <h2 id={titleId}>
              <span>Hablemos</span>
              <span className="contact-card__title-dots" aria-hidden="true">
                <i className="contact-card__title-dot contact-card__title-dot--red" />
                <i className="contact-card__title-dot contact-card__title-dot--blue" />
                <i className="contact-card__title-dot contact-card__title-dot--green" />
              </span>
            </h2>
          </div>

          <div className="contact-card__details">
            {contactDetails.map((detail) => {
              const isWhatsapp = detail.id === 'whatsapp'
              const officeMapTarget = detail.id === 'address'
                ? getOfficeMapTarget()
                : null
              const detailContent = (
                <>
                  <span className="contact-card__datum-icon">
                    <ContactDetailIcon id={detail.id} />
                  </span>
                  <span className="contact-card__datum-content">
                    <span className="contact-card__datum-label">{detail.label}</span>
                    <strong>{detail.display}</strong>
                  </span>
                </>
              )

              if (isWhatsapp) return (
                <button
                  className="contact-card__datum contact-card__reveal is-whatsapp"
                  type="button"
                  key={detail.id}
                  onClick={() => setWhatsappOpen(true)}
                  aria-label={detail.actionLabel}
                  aria-haspopup="dialog"
                  aria-expanded={whatsappOpen}
                  title={`${detail.label}: ${detail.value}`}
                >
                  {detailContent}
                </button>
              )

              return (
                <a
                  className="contact-card__datum contact-card__reveal"
                  href={officeMapTarget?.href ?? detail.href}
                  target={(officeMapTarget?.external ?? detail.external) ? '_blank' : undefined}
                  rel={(officeMapTarget?.external ?? detail.external) ? 'noreferrer' : undefined}
                  aria-label={officeMapTarget?.actionLabel ?? detail.actionLabel}
                  title={`${detail.label}: ${detail.value}`}
                  key={detail.id}
                >
                  {detailContent}
                </a>
              )
            })}
          </div>
        </div>

        <footer className="contact-card__footer contact-card__reveal">
          <nav className="contact-card__services" aria-label="Categorías de medios">
            <a
              href="/#outdoor-gallery"
              onClick={(event) => goToCollection(event, 'outdoor')}
            >
              Outdoor
            </a>
            <a
              href="/#indoor-gallery"
              onClick={(event) => goToCollection(event, 'indoor')}
            >
              Indoor
            </a>
            <a
              href="/#innovaciones-gallery"
              onClick={(event) => goToCollection(event, 'innovaciones')}
            >
              Innovaciones
            </a>
          </nav>

          <nav className="contact-card__socials" aria-label="Redes sociales">
            <span>Síguenos</span>
            {socialLinks.map((social) => (
              <a
                href={social.href || undefined}
                target={"_blank"}
                aria-disabled={!social.href}
                aria-label={social.label}
                tabIndex={social.href ? undefined : -1}
                key={social.id}
              >
                <SocialIcon id={social.id} />
              </a>
            ))}
          </nav>
        </footer>

        {motionAccess === 'needs-permission' && (
          <button
            className="contact-card__motion-access"
            type="button"
            onClick={() => requestMotionAccess.current()}
            aria-label="Activar movimiento de la tarjeta"
            data-export-exclude="true"
          >
            <span>Activar movimiento</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="7.5" y="3" width="9" height="18" rx="2" />
              <path d="M4.5 8.5a8 8 0 0 0 0 7M19.5 8.5a8 8 0 0 1 0 7" />
            </svg>
          </button>
        )}

        {!useWhatsappSheet && whatsappChooser}

        </article>
      </div>
    </div>
  )

  if (mode === 'scroll') {
    return (
      <>
        <div className="contact-card-embed">{cardContent}</div>
        {useWhatsappSheet && createPortal(whatsappChooser, document.body)}
      </>
    )
  }

  return createPortal(
    <>
      <div
        className="contact-overlay"
        ref={overlay}
        role="presentation"
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) requestClose()
        }}
      >
        {cardContent}
      </div>
      {useWhatsappSheet && whatsappChooser}
    </>,
    document.body,
  )
}
