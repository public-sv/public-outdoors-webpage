import { useRef } from 'react'
import { gsap, useGSAP } from '../animation/gsap'
import { prefersReducedMotion } from '../animation/motion'
import { isMobileExperience } from '../animation/mobile'
import { setPageTone } from '../animation/pageTone'
import butterflyAsset from '../assets/public-butterfly.svg'
import { assetUrl } from '../lib/assetUrl'
import { AmbientField } from '../components/AmbientField'
import { BrandMask } from '../components/BrandMask'
import { isIOSSafari } from '../platform/iosSafari'

const butterfly = assetUrl(butterflyAsset)

type IntroSceneProps = {
  onMaskStateChange?: (complete: boolean) => void
  onNavigationToneChange?: (dark: boolean) => void
}

const PublicWordmark = () => (
  <svg
    className="brand-intro__wordmark"
    viewBox="53 15 114 22"
    role="img"
    aria-label="Public"
  >
    <path d="M164.245 36.2883C162.985 36.7353 161.614 36.9588 160.128 36.9588C157.754 36.9588 155.692 36.4743 153.937 35.5026C152.183 34.5323 150.842 33.2261 149.913 31.5854C148.985 29.9446 148.521 28.1439 148.521 26.1831C148.521 24.0277 148.985 22.1058 149.913 20.4161C150.842 18.7264 152.141 17.4115 153.813 16.47C155.485 15.5286 157.414 15.0571 159.602 15.0571C160.984 15.0571 162.264 15.2316 163.44 15.5819C164.617 15.9308 165.649 16.3677 166.536 16.8925L164.771 20.8832C163.14 19.7183 161.468 19.1358 159.757 19.1358C158.601 19.1358 157.518 19.4372 156.507 20.0384C155.496 20.641 154.691 21.4614 154.092 22.4994C153.493 23.5389 153.194 24.6895 153.194 25.951C153.194 27.3293 153.473 28.5389 154.029 29.577C154.587 30.6165 155.381 31.4268 156.413 32.0092C157.445 32.5917 158.652 32.8829 160.034 32.8829C161.148 32.8829 162.149 32.7128 163.037 32.374C163.925 32.0337 164.626 31.6315 165.143 31.1658L167 34.9518C166.422 35.3988 165.503 35.8457 164.245 36.2912V36.2883Z" />
    <path d="M143.045 15.0571V36.9588H138.939V15.0571H143.045Z" />
    <path d="M122.854 15.0571V32.7929H133.463V36.9588H118.406V15.0571H122.852H122.854Z" />
    <path d="M111.956 27.5105C112.605 28.3737 112.93 29.371 112.93 30.5008C112.93 32.7222 112.195 34.3544 110.725 35.3958C109.256 36.4373 107.422 36.9588 105.221 36.9588H97.873V15.0571H104.351C106.691 15.0571 108.531 15.5285 109.87 16.4713C111.21 17.414 111.879 18.7781 111.879 20.5635C111.879 21.655 111.649 22.6125 111.189 23.4345C110.728 24.2579 110.08 24.9179 109.239 25.4128C110.399 25.949 111.303 26.6473 111.953 27.5105H111.956ZM102.224 24.0134H104.863C105.664 24.0134 106.283 23.7703 106.724 23.2842C107.163 22.7981 107.383 22.1986 107.383 21.4841C107.383 20.7697 107.132 20.1893 106.633 19.8034C106.133 19.4159 105.444 19.223 104.564 19.223H102.224V24.0134ZM107.487 32.3304C108.117 31.9238 108.431 31.3139 108.431 30.5008C108.431 28.9541 107.192 28.1793 104.712 28.1793H102.222V32.9402H105.012C106.032 32.9402 106.856 32.7369 107.487 32.3304Z" />
    <path d="M77.6968 30.6885C78.1312 31.3165 78.7098 31.8265 79.4327 32.2185C80.1556 32.6119 80.9307 32.8072 81.758 32.8072C82.6467 32.8072 83.4632 32.6119 84.2076 32.2185C84.952 31.8265 85.5353 31.3165 85.9589 30.6885C86.3825 30.0604 86.5943 29.4032 86.5943 28.7169V15.0571H91.0285V28.8043C91.0285 30.3548 90.614 31.7537 89.7883 32.9996C88.961 34.2455 87.839 35.2174 86.4239 35.9139C85.0073 36.6105 83.4525 36.9588 81.758 36.9588C80.0635 36.9588 78.5118 36.6105 77.1074 35.9139C75.7015 35.2174 74.5903 34.2469 73.7738 32.9996C72.9572 31.7537 72.549 30.3548 72.549 28.8043V15.0571H77.0445V28.7154C77.0445 29.4032 77.2624 30.0604 77.6953 30.687L77.6968 30.6885Z" />
    <path d="M66.2404 17.0356C67.7091 18.3556 68.4426 20.1558 68.4426 22.4362C68.4426 23.7459 68.1893 24.9716 67.684 26.1118C67.1773 27.2535 66.3539 28.1904 65.2137 28.9241C64.0721 29.6577 62.6006 30.0245 60.7946 30.0245H57.6998V36.9588H53.3853V15.0571H60.0213C62.6993 15.0571 64.7718 15.7171 66.2404 17.0356ZM62.7287 25.2795C63.2251 24.9126 63.5816 24.481 63.7996 23.9845C64.0176 23.4896 64.1266 23.0123 64.1266 22.5556C64.1266 21.7822 63.8983 21.0338 63.4417 20.309C62.985 19.5857 62.1027 19.2233 60.7931 19.2233H57.6983V25.8304H60.7637C61.5768 25.8304 62.2323 25.6478 62.7272 25.2795H62.7287Z" />
  </svg>
)

export function IntroScene({
  onMaskStateChange,
  onNavigationToneChange,
}: IntroSceneProps) {
  const section = useRef<HTMLElement>(null)
  const mark = useRef<SVGGElement>(null)
  const colorMark = useRef<SVGGElement>(null)
  const markPerspective = useRef<SVGGElement>(null)
  const colorMarkPerspective = useRef<SVGGElement>(null)
  const markPress = useRef<SVGGElement>(null)
  const colorMarkPress = useRef<SVGGElement>(null)
  const markPulse = useRef<SVGGElement>(null)
  const colorMarkPulse = useRef<SVGGElement>(null)
  const mobileReveal = useRef<SVGCircleElement>(null)
  const mobileMask = useRef<HTMLDivElement>(null)
  const mobileWipe = useRef<HTMLDivElement>(null)
  const mobileLogoInteraction = useRef<HTMLDivElement>(null)
  const mobileLogo = useRef<HTMLImageElement>(null)
  const veil = useRef<SVGSVGElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const brandCopy = useRef<HTMLDivElement>(null)
  const copy = useRef<HTMLDivElement>(null)
  const sloganGlow = useRef<HTMLDivElement>(null)
  const ambient = useRef<HTMLDivElement>(null)
  const reducedPrelude = useRef<HTMLDivElement>(null)
  const scrollCue = useRef<HTMLDivElement>(null)
  const logoButton = useRef<HTMLButtonElement>(null)

  useGSAP(
    (_context, contextSafe) => {
      const mobile = isMobileExperience()
      let maskComplete = false
      let navigationDark = false
      const updateMaskState = (complete: boolean) => {
        if (maskComplete === complete) return
        maskComplete = complete
        onMaskStateChange?.(complete)
      }
      const updateNavigationTone = (dark: boolean) => {
        if (navigationDark === dark) return
        navigationDark = dark
        onNavigationToneChange?.(dark)
      }
      onMaskStateChange?.(false)
      onNavigationToneChange?.(false)

      if (prefersReducedMotion()) {
        gsap.set(veil.current, { autoAlpha: 0 })
        gsap.set(mobileMask.current, { autoAlpha: 0 })
        gsap.set(content.current, { autoAlpha: 1, clearProps: 'transform' })
        gsap.set(ambient.current, { autoAlpha: 1, clearProps: 'transform' })
        gsap.set([brandCopy.current, copy.current], {
          autoAlpha: 1,
          clearProps: 'transform,filter',
        })
        gsap.set('.slogan-line > span', { clearProps: 'transform' })
        gsap.set(sloganGlow.current, { autoAlpha: 0 })

        const prelude = reducedPrelude.current
        const syncPreludeState = (showingPrelude: boolean) => {
          updateMaskState(!showingPrelude)
          updateNavigationTone(!showingPrelude)
          setPageTone(showingPrelude ? '#f7f5ef' : '#07080b', true)
        }

        syncPreludeState(true)

        if (!prelude) return

        const preludeObserver = new IntersectionObserver(
          ([entry]) => {
            syncPreludeState(entry.isIntersecting)
          },
          { threshold: [0, 1] },
        )

        preludeObserver.observe(prelude)

        return () => preludeObserver.disconnect()
      }

      const finePointer = window.matchMedia('(pointer: fine)').matches
      const press = { x: 0, y: 0, rotation: 0, scale: 1, scaleX: 1 }
      const pulse = { scale: 1 }
      const renderMobileLogoMotion = () => {
        if (!mobileLogoInteraction.current) return
        const scale = press.scale * pulse.scale
        mobileLogoInteraction.current.style.transform =
          `translate(-50%, -50%) translate3d(${press.x}px, ${press.y}px, 0) ` +
          `rotate(${press.rotation}deg) scale(${scale}) scaleX(${press.scaleX})`
      }
      const renderPulse = () => {
        const transform = `scale(${pulse.scale})`
        markPulse.current?.setAttribute('transform', transform)
        colorMarkPulse.current?.setAttribute('transform', transform)
        if (mobile) renderMobileLogoMotion()
      }
      let pulseActive = true
      const pulseTimeline = gsap.timeline({ repeat: -1, delay: 0.8 })
        .to(pulse, {
          scale: 1.055,
          duration: 0.46,
          ease: 'sine.inOut',
          onUpdate: renderPulse,
        })
        .to(pulse, {
          scale: 0.992,
          duration: 0.52,
          ease: 'sine.inOut',
          onUpdate: renderPulse,
        })
        .to(pulse, {
          scale: 1,
          duration: 0.34,
          ease: 'power2.out',
          onUpdate: renderPulse,
        })
        .to({}, { duration: 1.35 })
        .to(pulse, {
          scale: 1.11,
          duration: 0.84,
          ease: 'sine.inOut',
          onUpdate: renderPulse,
        })
        .to(pulse, {
          scale: 0.978,
          duration: 0.74,
          ease: 'sine.inOut',
          onUpdate: renderPulse,
        })
        .to(pulse, {
          scale: 1,
          duration: 0.5,
          ease: 'power2.out',
          onUpdate: renderPulse,
        })
        .to({}, { duration: 2.15 })
        .to(pulse, {
          scale: 1.085,
          duration: 0.26,
          ease: 'power2.out',
          onUpdate: renderPulse,
        })
        .to(pulse, {
          scale: 0.982,
          duration: 0.22,
          ease: 'sine.inOut',
          onUpdate: renderPulse,
        })
        .to(pulse, {
          scale: 1.072,
          duration: 0.24,
          ease: 'power2.out',
          onUpdate: renderPulse,
        })
        .to(pulse, {
          scale: 0.99,
          duration: 0.24,
          ease: 'sine.inOut',
          onUpdate: renderPulse,
        })
        .to(pulse, {
          scale: 1,
          duration: 0.32,
          ease: 'power2.out',
          onUpdate: renderPulse,
        })
        .to({}, { duration: 1.7 })

      const setPulseActive = (active: boolean) => {
        if (active === pulseActive) return
        pulseActive = active

        if (active) {
          pulseTimeline.restart(true)
          return
        }

        pulseTimeline.pause(0)
        pulse.scale = 1
        renderPulse()
      }

      const pressTimeline = gsap.timeline({ paused: true })
      let logoButtonActive = true
      let logoPressLocked = false
      let logoPresses = 0
      let logoJumpStreak = 0
      let logoPressResetTimer: number | undefined
      let logoJumpStreakResetTimer: number | undefined

      const renderPress = () => {
        if (mobile) {
          renderMobileLogoMotion()
          return
        }

        const scaleX = press.scale * press.scaleX
        const transform =
          `translate(${press.x} ${press.y}) rotate(${press.rotation}) ` +
          `scale(${scaleX} ${press.scale})`
        markPress.current?.setAttribute('transform', transform)
        colorMarkPress.current?.setAttribute('transform', transform)
      }

      const syncLogoButtonInteractivity = () => {
        if (!logoButton.current) return
        const interactive = logoButtonActive && !logoPressLocked
        logoButton.current.disabled = !interactive
        logoButton.current.style.pointerEvents = interactive ? 'auto' : 'none'
      }

      const setLogoPressLocked = (locked: boolean) => {
        logoPressLocked = locked
        syncLogoButtonInteractivity()
      }

      const runLogoPress = () => {
        if (!logoButtonActive || logoPressLocked) return

        window.clearTimeout(logoPressResetTimer)
        window.clearTimeout(logoJumpStreakResetTimer)
        logoPresses += 1
        const isTriplePress = logoPresses === 3
        const isEasterEgg = isTriplePress && logoJumpStreak === 2

        if (isTriplePress) {
          logoPresses = 0
          logoJumpStreak = isEasterEgg ? 0 : logoJumpStreak + 1

          if (!isEasterEgg) {
            logoJumpStreakResetTimer = window.setTimeout(() => {
              logoJumpStreak = 0
            }, 5000)
          }
        } else {
          logoPressResetTimer = window.setTimeout(() => {
            logoPresses = 0
            logoJumpStreak = 0
            window.clearTimeout(logoJumpStreakResetTimer)
          }, 900)
        }

        pressTimeline.pause().clear()

        if (isEasterEgg) {
          const exitX = window.innerWidth * 0.38
          const exitY = window.innerHeight * 0.68
          setLogoPressLocked(true)
          pressTimeline
            .to(press, {
              x: -4,
              y: 3.6,
              rotation: -9,
              scale: 0.72,
              duration: 0.1,
              ease: 'power3.in',
              onUpdate: renderPress,
            })
            .to(press, {
              x: exitX,
              y: -exitY,
              rotation: 720,
              scale: 0.62,
              duration: 0.58,
              ease: 'power4.in',
              onUpdate: renderPress,
            })
            .to(press, {
              x: exitX * 0.18,
              y: -exitY * 0.32,
              rotation: 900,
              scale: 0.96,
              scaleX: -1,
              duration: 0.34,
              ease: 'power2.inOut',
              onUpdate: renderPress,
            })
            .to(press, {
              x: -exitX * 0.04,
              y: -18,
              rotation: 1080,
              scale: 1.02,
              scaleX: 1,
              duration: 0.36,
              ease: 'power2.out',
              onUpdate: renderPress,
            })
            .to(press, {
              x: 0,
              y: 0,
              rotation: 1080,
              scale: 1,
              duration: 0.28,
              ease: 'power3.out',
              onUpdate: renderPress,
              onComplete: () => {
                press.rotation = 0
                press.scaleX = 1
                renderPress()
                setLogoPressLocked(false)
              },
            })
            .restart()
          return
        }

        if (isTriplePress) {
          setLogoPressLocked(true)
          pressTimeline
            .to(press, {
              y: 2.4,
              rotation: -5,
              scale: 0.84,
              duration: 0.08,
              ease: 'power2.in',
              onUpdate: renderPress,
            })
            .to(press, {
              y: -18,
              rotation: 180,
              scale: 1.1,
              duration: 0.25,
              ease: 'power3.out',
              onUpdate: renderPress,
            })
            .to(press, {
              y: 0,
              rotation: 360,
              scale: 0.95,
              duration: 0.3,
              ease: 'power2.in',
              onUpdate: renderPress,
            })
            .to(press, {
              y: -1.2,
              scale: 1.06,
              duration: 0.1,
              ease: 'power2.out',
              onUpdate: renderPress,
            })
            .to(press, {
              y: 0,
              rotation: 360,
              scale: 1,
              duration: 0.18,
              ease: 'back.out(2.4)',
              onUpdate: renderPress,
              onComplete: () => {
                press.rotation = 0
                renderPress()
                setLogoPressLocked(false)
              },
            })
            .restart()
          return
        }

        pressTimeline
          .to(press, {
            y: 1.8,
            rotation: -2.4,
            scale: 0.88,
            duration: 0.1,
            ease: 'power2.in',
            onUpdate: renderPress,
          })
          .to(press, {
            y: -2.8,
            rotation: 2.8,
            scale: 1.16,
            duration: 0.22,
            ease: 'back.out(2.6)',
            onUpdate: renderPress,
          })
          .to(press, {
            y: 0.7,
            rotation: -1,
            scale: 0.97,
            duration: 0.16,
            ease: 'sine.inOut',
            onUpdate: renderPress,
          })
          .to(press, {
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 0.34,
            ease: 'elastic.out(1, 0.5)',
            onUpdate: renderPress,
          })
          .restart()
      }
      const handleLogoPress = contextSafe
        ? contextSafe(runLogoPress)
        : runLogoPress

      const setLogoButtonActive = (active: boolean) => {
        if (active === logoButtonActive) return
        logoButtonActive = active
        syncLogoButtonInteractivity()

        if (active) return
        window.clearTimeout(logoPressResetTimer)
        window.clearTimeout(logoJumpStreakResetTimer)
        logoPresses = 0
        logoJumpStreak = 0
        pressTimeline.pause(0).clear()
        press.x = 0
        press.y = 0
        press.rotation = 0
        press.scale = 1
        press.scaleX = 1
        logoPressLocked = false
        renderPress()
        syncLogoButtonInteractivity()
      }

      if (mobile || finePointer) {
        logoButton.current?.addEventListener('click', handleLogoPress)
      }

      if (mobile) {
        const sloganLines = gsap.utils.toArray<HTMLElement>(
          '.slogan-line > span',
        )
        let darkToneActive = false
        gsap.set(veil.current, { autoAlpha: 0 })
        gsap.set(mobileMask.current, { autoAlpha: 1 })
        gsap.set(mobileWipe.current, {
          autoAlpha: 0,
          scale: 0,
          transformOrigin: '50% 50%',
          force3D: true,
        })
        gsap.set(mobileLogo.current, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          transformOrigin: '50% 50%',
          force3D: true,
        })
        gsap.set(content.current, { autoAlpha: 1 })
        gsap.set(ambient.current, {
          autoAlpha: 1,
          xPercent: -18,
          yPercent: 14,
          rotation: 0,
          scale: 1.28,
          transformOrigin: '50% 50%',
          force3D: true,
        })
        gsap.set(brandCopy.current, { autoAlpha: 0, y: 24, scale: 0.92 })
        gsap.set(copy.current, { autoAlpha: 0, y: 24 })
        gsap.set(sloganLines, { yPercent: 34 })
        gsap.set(sloganGlow.current, { autoAlpha: 0, scale: 0.84 })
        const mobileTimeline = gsap.timeline({
          scrollTrigger: {
            id: 'intro-scene-mobile',
            trigger: section.current,
            start: 'top top',
            end: '+=225%',
            pin: true,
            pinType: 'fixed',
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const duration = mobileTimeline.duration()
              const timelineTime = self.progress * duration
              const maskStart = mobileTimeline.labels.maskStart ?? 0
              const maskComplete = mobileTimeline.labels.maskComplete ?? 0
              const maskMidpoint = maskStart + (maskComplete - maskStart) / 2
              const atStart = self.progress <= 0.001
              setPulseActive(atStart)
              setLogoButtonActive(atStart)
              updateMaskState(
                duration > 0 && timelineTime >= maskComplete,
              )
              updateNavigationTone(
                duration > 0 && timelineTime >= maskMidpoint,
              )
              const shouldUseDarkTone = timelineTime > maskStart + 0.01
              if (shouldUseDarkTone === darkToneActive) return
              darkToneActive = shouldUseDarkTone
              setPageTone(shouldUseDarkTone ? '#07080b' : '#f7f5ef')
            },
          },
        })

        mobileTimeline
          .addLabel('maskStart', 0)
          .set(mobileWipe.current, { autoAlpha: 1 }, 'maskStart')
          .to(
            mobileWipe.current,
            {
              scale: 1.7,
              duration: 0.28,
              ease: 'power3.inOut',
              force3D: true,
            },
            'maskStart',
          )
          .to(
            mobileLogo.current,
            {
              x: 0,
              y: -120,
              rotation: 0,
              scale: 5.5,
              autoAlpha: 0,
              duration: 0.2,
              ease: 'power3.in',
              force3D: true,
            },
            'maskStart',
          )
          .to(
            mobileMask.current,
            {
              autoAlpha: 0,
              duration: 0.08,
              ease: 'power2.inOut',
            },
            'maskStart+=0.28',
          )
          .to(
            scrollCue.current,
            { autoAlpha: 0, y: -8, duration: 0.14, ease: 'power2.out' },
            'maskStart+=0.12',
          )
          .to(
            content.current,
            { autoAlpha: 1, duration: 0.24, ease: 'power2.out' },
            'maskStart+=0.16',
          )
          .to(
            brandCopy.current,
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.24, ease: 'power3.out' },
            'maskStart+=0.22',
          )
          .addLabel('maskComplete', 'maskStart+=0.28')
          .to({}, { duration: 0.32 })
          .addLabel('sloganTransition')
          .to(brandCopy.current, {
            autoAlpha: 0,
            yPercent: -16,
            scale: 1.04,
            duration: 0.2,
            ease: 'power2.inOut',
          })
          .to(
            ambient.current,
            {
              xPercent: 15,
              yPercent: -12,
              rotation: 0,
              scale: 1.12,
              duration: 0.65,
              ease: 'power3.inOut',
              force3D: true,
            },
            'sloganTransition-=0.325',
          )
          .to(
            sloganGlow.current,
            { autoAlpha: 0.72, scale: 1, duration: 0.28, ease: 'power2.out' },
            'sloganTransition+=0.06',
          )
          .to(
            copy.current,
            { autoAlpha: 1, y: 0, duration: 0.24, ease: 'power3.out' },
            'sloganTransition+=0.24',
          )
          .to(
            sloganLines,
            { yPercent: 0, duration: 0.24, stagger: 0.025, ease: 'power3.out' },
            'sloganTransition+=0.24',
          )
          .to({}, { duration: 0.34 })
          .to(copy.current, {
            autoAlpha: 0,
            yPercent: -16,
            scale: 1.035,
            duration: 0.2,
            ease: 'power2.inOut',
          })
          .to(
            sloganGlow.current,
            { autoAlpha: 0, scale: 1.18, duration: 0.2, ease: 'power2.inOut' },
            '<',
          )
          .to(
            ambient.current,
            { autoAlpha: 0, scale: 1.1, duration: 0.22, ease: 'power2.inOut' },
            '<',
          )

        return () => {
          pulseTimeline.kill()
          pressTimeline.kill()
          logoButton.current?.removeEventListener('click', handleLogoPress)
          window.clearTimeout(logoPressResetTimer)
          window.clearTimeout(logoJumpStreakResetTimer)
          mobileTimeline.kill()
        }
      }

      const perspective = { x: 0, y: 0 }
      let perspectiveTargetX = 0
      let perspectiveTargetY = 0
      let perspectiveActive = true
      let logoCenterX = window.innerWidth / 2
      let logoCenterY = window.innerHeight / 2
      const measureLogoCenter = () => {
        const bounds = colorMark.current?.getBoundingClientRect()
        if (!bounds) return
        logoCenterX = bounds.left + bounds.width / 2
        logoCenterY = bounds.top + bounds.height / 2
      }

      const renderPerspective = () => {
        const x = perspective.x
        const y = perspective.y
        const transform = [
          `translate(${x * 0.8} ${y * 0.55})`,
          `rotate(${x * 1.8})`,
          `skewX(${-y * 2.4})`,
          `skewY(${x * 3.2})`,
          `scale(${1 - Math.abs(x) * 0.025} ${1 - Math.abs(y) * 0.02})`,
        ].join(' ')
        markPerspective.current?.setAttribute('transform', transform)
        colorMarkPerspective.current?.setAttribute('transform', transform)
      }

      const updatePerspective = () => {
        if (!perspectiveActive) return

        const deltaX = perspectiveTargetX - perspective.x
        const deltaY = perspectiveTargetY - perspective.y
        if (Math.abs(deltaX) < 0.0001 && Math.abs(deltaY) < 0.0001) return

        const smoothing = 1 - Math.pow(0.84, gsap.ticker.deltaRatio(60))
        perspective.x += deltaX * smoothing
        perspective.y += deltaY * smoothing
        renderPerspective()
      }

      const resetPerspectiveTarget = () => {
        perspectiveTargetX = 0
        perspectiveTargetY = 0
      }

      const handlePointerMove = (event: PointerEvent) => {
        if (!perspectiveActive) return
        const horizontalRange = Math.max(280, window.innerWidth * 0.36)
        const verticalRange = Math.max(220, window.innerHeight * 0.38)
        perspectiveTargetX = gsap.utils.clamp(
          -1,
          1,
          (event.clientX - logoCenterX) / horizontalRange,
        )
        perspectiveTargetY = gsap.utils.clamp(
          -1,
          1,
          (event.clientY - logoCenterY) / verticalRange,
        )
      }

      const setPerspectiveActive = (active: boolean) => {
        if (!finePointer || active === perspectiveActive) return
        perspectiveActive = active
        resetPerspectiveTarget()

        if (active) {
          measureLogoCenter()
          return
        }

        perspective.x = 0
        perspective.y = 0
        renderPerspective()
      }

      if (finePointer) {
        measureLogoCenter()
        gsap.ticker.add(updatePerspective)
        window.addEventListener('pointermove', handlePointerMove, { passive: true })
        window.addEventListener('resize', measureLogoCenter, { passive: true })
        document.documentElement.addEventListener('mouseleave', resetPerspectiveTarget)
      }

      let lockedProgress: number | null = null
      let inputReady = true
      let stopAcknowledged = false
      let quietTimer: number | undefined
      const iosSafari = isIOSSafari()

      const markInputQuiet = () => {
        window.clearTimeout(quietTimer)
        quietTimer = window.setTimeout(() => {
          inputReady = true
        }, 650)
      }

      const stopMomentum = (event: WheelEvent) => {
        if (lockedProgress !== null && !inputReady) {
          event.preventDefault()
          markInputQuiet()
          return
        }

        if (lockedProgress !== null && inputReady) lockedProgress = null
      }

      const startTouchGesture = () => {
        if (lockedProgress !== null && inputReady) lockedProgress = null
      }

      const stopTouchMomentum = (event: TouchEvent) => {
        if (lockedProgress !== null) event.preventDefault()
      }

      const endTouchGesture = () => {
        if (lockedProgress !== null) inputReady = true
      }

      const releaseIntroForNavigation = () => {
        window.clearTimeout(quietTimer)
        lockedProgress = null
        stopAcknowledged = true
        inputReady = true
      }

      window.addEventListener('wheel', stopMomentum, { passive: false })
      window.addEventListener('touchstart', startTouchGesture, { passive: true })
      window.addEventListener('touchmove', stopTouchMomentum, { passive: false })
      window.addEventListener('touchend', endTouchGesture, { passive: true })
      window.addEventListener(
        'public:navigate-to-media',
        releaseIntroForNavigation,
      )
      window.addEventListener('public:navigate-home', releaseIntroForNavigation)

      const timeline = gsap.timeline({
        scrollTrigger: {
          id: 'intro-scene',
          trigger: section.current,
          start: 'top top',
          end: '+=290%',
          pin: true,
          pinType: iosSafari ? 'transform' : 'fixed',
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setPulseActive(self.progress <= 0.001)
            setPerspectiveActive(self.progress <= 0.001)
            setLogoButtonActive(self.progress <= 0.001)
            const duration = timeline.duration()
            const complete = duration > 0 && self.progress >= 1.02 / duration
            updateMaskState(complete)
            updateNavigationTone(complete)
            const stop = timeline.labels.outside / timeline.duration()
            // Keep Safari's browser edges cream only while the opening mask is
            // completely untouched. As soon as its animation starts, blend the
            // browser chrome into the dark experience behind the mask.
            setPageTone(self.progress <= 0.001 ? '#f7f5ef' : '#07080b')

            if (self.direction < 0) {
              if (self.progress < stop - 0.002) stopAcknowledged = false
              lockedProgress = null
              inputReady = true
              return
            }

            if (lockedProgress !== null) {
              self.scroll(self.start + lockedProgress * (self.end - self.start))
              return
            }

            if (!stopAcknowledged && self.progress >= stop) {
              lockedProgress = stop
              stopAcknowledged = true
              inputReady = false
              self.scroll(self.start + stop * (self.end - self.start))
              markInputQuiet()
            }
          },
        },
      })

      const flight = { x: 0, y: 0, rotation: 0, scale: 3.2 }
      const sloganLines = gsap.utils.toArray<HTMLElement>('.slogan-line > span')
      const renderMark = () => {
        const transform = `translate(${flight.x} ${flight.y}) rotate(${flight.rotation}) scale(${flight.scale})`
        mark.current?.setAttribute('transform', transform)
        colorMark.current?.setAttribute('transform', transform)
      }

      renderMark()
      gsap.set(content.current, { autoAlpha: 0, scale: 1.04 })
      gsap.set(ambient.current, {
        autoAlpha: 1,
        xPercent: -18,
        yPercent: 14,
        rotation: -7,
        scale: 1.28,
        transformOrigin: '50% 50%',
        force3D: true,
      })
      gsap.set(brandCopy.current, {
        autoAlpha: 0,
        y: 34,
        scale: 0.88,
      })
      gsap.set(copy.current, {
        autoAlpha: 0,
        y: 34,
        scale: 0.86,
      })
      gsap.set(sloganLines, { yPercent: 42 })
      gsap.set(sloganGlow.current, { autoAlpha: 0, scale: 0.72 })
      timeline
        .to(flight, {
          x: -3,
          y: -16,
          rotation: -3,
          scale: 3.8,
          duration: 0.16,
          ease: 'sine.inOut',
          onUpdate: renderMark,
        })
        .to(flight, {
          x: 4,
          y: -45,
          rotation: 3,
          scale: 5.2,
          duration: 0.16,
          ease: 'sine.inOut',
          onUpdate: renderMark,
        })
        .to(flight, {
          x: -3,
          y: -92,
          rotation: -2,
          scale: 8,
          duration: 0.16,
          ease: 'sine.inOut',
          onUpdate: renderMark,
        })
        .to(flight, {
          x: 0,
          y: -260,
          rotation: 0,
          scale: 58,
          duration: 0.52,
          ease: 'power3.in',
          onUpdate: renderMark,
        })
        .to(colorMark.current, { autoAlpha: 0, duration: 0.18, ease: 'power2.out' }, 0.62)
        .to(veil.current, { autoAlpha: 0, duration: 0.08 }, 0.94)
        .to(scrollCue.current, { autoAlpha: 0, y: -12, duration: 0.12 }, 0.78)
        .to(content.current, { autoAlpha: 1, scale: 1, duration: 0.2, ease: 'power2.out' }, 0.8)
        .to(
          brandCopy.current,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.38,
            ease: 'power3.out',
          },
          0.82,
        )
        .addLabel('outside', 1.08)
        .to({}, { duration: 0.16 })
        .addLabel('sloganTransition')
        .to(
          brandCopy.current,
          {
            autoAlpha: 0,
            yPercent: -22,
            scale: 1.08,
            duration: 0.34,
            ease: 'power3.inOut',
          },
        )
        .to(
          ambient.current,
          {
            xPercent: 15,
            yPercent: -12,
            rotation: 5,
            scale: 1.12,
            duration: 0.65,
            ease: 'power3.inOut',
            force3D: true,
          },
          'sloganTransition-=0.145',
        )
        .to(
          sloganGlow.current,
          {
            autoAlpha: 0.82,
            scale: 1,
            duration: 0.44,
            ease: 'power3.out',
          },
          'sloganTransition+=0.08',
        )
        .to(
          copy.current,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.38,
            ease: 'power3.out',
          },
          'sloganTransition+=0.38',
        )
        .to(
          sloganLines,
          {
            yPercent: 0,
            duration: 0.36,
            stagger: 0.045,
            ease: 'power4.out',
          },
          'sloganTransition+=0.38',
        )
        .to({}, { duration: 0.5 })
        .to(
          copy.current,
          {
            autoAlpha: 0,
            yPercent: -24,
            scale: 1.1,
            duration: 0.46,
            ease: 'power3.inOut',
          },
        )
        .to(
          sloganGlow.current,
          {
            autoAlpha: 0,
            scale: 1.38,
            duration: 0.46,
            ease: 'power3.inOut',
          },
          '<',
        )
        .to(
          ambient.current,
          {
            autoAlpha: 0,
            scale: 1.14,
            duration: 0.5,
            ease: 'power3.inOut',
          },
          '<',
        )

      return () => {
        pulseTimeline.kill()
        pressTimeline.kill()
        gsap.ticker.remove(updatePerspective)
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('resize', measureLogoCenter)
        document.documentElement.removeEventListener(
          'mouseleave',
          resetPerspectiveTarget,
        )
        logoButton.current?.removeEventListener('click', handleLogoPress)
        window.clearTimeout(logoPressResetTimer)
        window.clearTimeout(logoJumpStreakResetTimer)
        window.clearTimeout(quietTimer)
        window.removeEventListener('wheel', stopMomentum)
        window.removeEventListener('touchstart', startTouchGesture)
        window.removeEventListener('touchmove', stopTouchMomentum)
        window.removeEventListener('touchend', endTouchGesture)
        window.removeEventListener(
          'public:navigate-to-media',
          releaseIntroForNavigation,
        )
        window.removeEventListener(
          'public:navigate-home',
          releaseIntroForNavigation,
        )
        timeline.kill()
      }
    },
    {
      dependencies: [onMaskStateChange, onNavigationToneChange],
      scope: section,
    },
  )

  return (
    <section
      className="intro"
      ref={section}
      aria-label="Public Outdoors introduction"
    >
      <div className="reduced-intro-prelude" ref={reducedPrelude}>
        <img src={butterfly} alt="Public" />
      </div>

      <div className="reveal-content" ref={content}>
        <AmbientField variant="intro" fieldRef={ambient} />
        <div className="slogan-glow" ref={sloganGlow} aria-hidden="true" />
        <div
          className="scene-copy scene-copy--brand"
          ref={brandCopy}
          aria-hidden="true"
        >
          <div className="brand-intro-lockup">
            <span className="brand-intro__phrase">
              <span className="brand-intro__punctuation">¡</span>
              <span className="brand-intro__prefix">Somos</span>
            </span>
            <PublicWordmark />
            <span className="brand-intro__punctuation brand-intro__punctuation--closing">!</span>
          </div>
        </div>
        <div className="scene-copy scene-copy--intro" ref={copy}>
          <h1>
            <span className="slogan-line">
              <span>Creamos espacios únicos</span>
            </span>
            <span className="slogan-line">
              <span>para elevar tu marca</span>
            </span>
          </h1>
        </div>
      </div>

      <BrandMask
        veilRef={veil}
        markRef={mark}
        colorMarkRef={colorMark}
        markPerspectiveRef={markPerspective}
        colorMarkPerspectiveRef={colorMarkPerspective}
        markPressRef={markPress}
        colorMarkPressRef={colorMarkPress}
        markPulseRef={markPulse}
        colorMarkPulseRef={colorMarkPulse}
        mobileRevealRef={mobileReveal}
      />

      <div className="intro-mobile-mask" ref={mobileMask} aria-hidden="true">
        <div className="intro-mobile-mask__wipe" ref={mobileWipe} />
        <div
          className="intro-mobile-mask__logo-interaction"
          ref={mobileLogoInteraction}
        >
          <img
            className="intro-mobile-mask__logo"
            ref={mobileLogo}
            src={butterfly}
            alt=""
          />
        </div>
      </div>

      <button
        className="logo-play-button"
        ref={logoButton}
        type="button"
        aria-label="Animar mariposa"
      />

      <div className="scroll-cue" ref={scrollCue} aria-hidden="true">
        <span>Desliza para explorar</span>
        <i />
      </div>
    </section>
  )
}
