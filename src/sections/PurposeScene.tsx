import { useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../animation/gsap'
import { prefersReducedMotion } from '../animation/motion'
import { isMobileExperience } from '../animation/mobile'
import { setPageTone } from '../animation/pageTone'
import { AmbientField } from '../components/AmbientField'
import { ContactCard } from '../components/ContactCard'
import { isIOSSafari, isSafari } from '../platform/iosSafari'

const questionWords = ['¿No', 'viste', 'tu', 'marca?']
const statementWords = ['No', 'dejes', 'que', 'pase', 'de', 'nuevo.']
const actionWords = ['¡Anúnciate', 'con', 'nosotros!']

export function PurposeScene() {
  const [mobileStage, setMobileStage] = useState<
    'question' | 'statement' | 'contact'
  >('question')
  const section = useRef<HTMLElement>(null)
  const story = useRef<HTMLDivElement>(null)
  const ambient = useRef<HTMLDivElement>(null)
  const question = useRef<HTMLDivElement>(null)
  const statement = useRef<HTMLDivElement>(null)
  const action = useRef<HTMLDivElement>(null)
  const contact = useRef<HTMLDivElement>(null)
  const contactBackdrop = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!section.current) return

      const stages = [question.current, statement.current, action.current]
      const siteNavigation = document.querySelector<HTMLElement>(
        '.site-nav',
      )
      const contactContainer = contact.current
      const backdrop = contactBackdrop.current
      const storyContainer = story.current
      const contactMotion = contactContainer?.querySelector<HTMLElement>(
        '.contact-card__motion',
      )
      const questionWordElements = gsap.utils.toArray<HTMLElement>(
        '.purpose-stage__word > span',
        section.current,
      )
      const mobile = isMobileExperience()
      const iosSafari = isIOSSafari()
      const safari = isSafari()

      if (
        !contactContainer ||
        !backdrop ||
        !contactMotion ||
        !storyContainer
      ) return

      if (prefersReducedMotion()) {
        gsap.set(stages, {
          autoAlpha: 1,
          clearProps: 'transform,filter',
        })
        gsap.set(
          [
            '.purpose-stage__word > span',
            '.purpose-statement__word',
            '.purpose-action__word > span',
          ],
          { autoAlpha: 1, clearProps: 'transform,filter' },
        )
        gsap.set(ambient.current, { autoAlpha: 1, clearProps: 'transform' })
        gsap.set(contactContainer, {
          autoAlpha: mobile ? 1 : 0,
          pointerEvents: mobile ? 'auto' : 'none',
          clearProps: 'transform,filter',
        })
        gsap.set(backdrop, { autoAlpha: 0 })
        gsap.set(contactMotion, {
          autoAlpha: 1,
          clearProps: 'transform,filter,clipPath',
        })
        if (mobile) {
          gsap.set(question.current, { autoAlpha: 0 })
        }
        setPageTone('#03131c', true)
        return
      }

      if (mobile) {
        const sectionElement = section.current
        const mobileStages = ['question', 'statement', 'contact'] as const
        let activeStage = -1

        const selectStage = (progress: number) => {
          const nextStage = progress < 0.32 ? 0 : progress < 0.68 ? 1 : 2
          if (nextStage === activeStage) return

          activeStage = nextStage
          const stage = mobileStages[nextStage]
          sectionElement.dataset.mobileStage = stage
          setMobileStage(stage)
        }

        const stageTrigger = ScrollTrigger.create({
          id: 'purpose-mobile-stages',
          trigger: sectionElement,
          start: 'top top',
          end: 'bottom bottom',
          invalidateOnRefresh: true,
          onEnter: () => setPageTone('#07110f', true),
          onEnterBack: () => setPageTone('#07110f', true),
          onLeaveBack: () => setPageTone('#080b0a', true),
          onUpdate: ({ progress }) => selectStage(progress),
        })

        selectStage(stageTrigger.progress)

        return () => {
          stageTrigger.kill()
          sectionElement.dataset.mobileStage = 'question'
        }
      }

      gsap.set(statement.current, { autoAlpha: 0 })
      gsap.set(action.current, { autoAlpha: 0 })
      gsap.set(questionWordElements, { yPercent: 115, autoAlpha: 0 })
      gsap.set('.purpose-statement__word', { yPercent: 72, autoAlpha: 0 })
      gsap.set('.purpose-action__word--lead > span', {
        yPercent: 70,
        scale: 0.78,
        autoAlpha: 0,
      })
      gsap.set('.purpose-action__word--support > span', {
        xPercent: 28,
        autoAlpha: 0,
      })
      gsap.set(contactContainer, {
        autoAlpha: 1,
        pointerEvents: 'none',
      })
      gsap.set(backdrop, { autoAlpha: 0 })
      if (safari) {
        gsap.set(contactMotion, {
          autoAlpha: 0,
          clearProps: 'transform,clipPath',
        })
      } else {
        gsap.set(contactMotion, {
          autoAlpha: 0,
          xPercent: -12,
          yPercent: 0,
          rotationY: -48,
          scale: 0.96,
          clipPath: 'inset(0 82% 0 0 round 1.5rem)',
          transformOrigin: 'left center',
        })
      }
      gsap.set(ambient.current, {
        transformOrigin: '50% 50%',
        force3D: true,
      })
      gsap.set('.purpose-glow', {
        transformOrigin: '50% 50%',
        force3D: true,
      })

      const questionEntry = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: 'top bottom',
          end: 'top top',
          scrub: 0.55,
          invalidateOnRefresh: true,
        },
      })

      questionEntry
        .fromTo(
          question.current,
          { yPercent: -50 },
          { yPercent: 0, duration: 1, ease: 'none' },
          0,
        )
        .to(
          questionWordElements,
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.72,
            stagger: 0.06,
            ease: 'power3.out',
          },
          0.04,
        )

      const snapContactTransition = (
        progress: number,
        trigger?: ScrollTrigger,
      ) => {
        const contactTweens = timeline?.getTweensOf(contactMotion) ?? []
        const openingTween = contactTweens[0]
        const closingTween = contactTweens.at(-1)
        const timelineDuration = timeline?.duration() ?? 0

        if (!openingTween || !closingTween || timelineDuration === 0) {
          return progress
        }

        const openingStart = openingTween.startTime() / timelineDuration
        const openingEnd = openingTween.endTime() / timelineDuration
        const closingStart = closingTween.startTime() / timelineDuration
        const closingEnd = closingTween.endTime() / timelineDuration

        if (progress > openingStart && progress < openingEnd) {
          return (trigger?.direction ?? 1) < 0 ? openingStart : openingEnd
        }

        if (progress > closingStart && progress < closingEnd) {
          return (trigger?.direction ?? 1) < 0 ? closingStart : closingEnd
        }

        return progress
      }

      const timeline = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: '+=500%',
          pin: true,
          pinType: iosSafari ? 'transform' : 'fixed',
          scrub: 1.35,
          snap: {
            snapTo: snapContactTransition,
            delay: 0.28,
            duration: { min: 0.6, max: 1.2 },
            ease: 'power1.inOut',
            inertia: false,
          },
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter: () => setPageTone('#03131c', true),
          onEnterBack: () => setPageTone('#03131c', true),
          onLeaveBack: () => setPageTone('#080b0a', true),
        },
      })

      timeline
        // Camera position one — wide view of the static gradient field.
        .fromTo(
          ambient.current,
          { autoAlpha: 0, xPercent: -1.5, yPercent: -0.5, scale: 1.035 },
          {
            autoAlpha: 1,
            xPercent: 0,
            yPercent: 0,
            scale: 1,
            duration: 1.05,
            ease: 'sine.out',
          },
          0,
        )
        .to({}, { duration: 0.45 })
        .addLabel('questionToStatement')
        .to(question.current, {
          autoAlpha: 0,
          xPercent: -10,
          scale: 0.97,
          duration: 0.55,
          ease: 'sine.inOut',
        }, 'questionToStatement')
        // Camera position two — pan right and move slightly closer.
        .to(
          ambient.current,
          {
            xPercent: 2,
            yPercent: -1,
            scale: 1.045,
            duration: 1.05,
            ease: 'sine.inOut',
          },
          'questionToStatement',
        )
        .to(
          '.purpose-glow--blue-main',
          {
            xPercent: -14,
            yPercent: 9,
            scale: 1.04,
            duration: 1.05,
            ease: 'sine.inOut',
          },
          'questionToStatement',
        )
        .to(
          '.purpose-glow--green-main',
          {
            xPercent: 16,
            yPercent: -8,
            scale: 0.97,
            duration: 1.08,
            ease: 'sine.inOut',
          },
          'questionToStatement',
        )
        .to(
          '.purpose-glow--red-accent',
          {
            xPercent: -12,
            yPercent: -14,
            scale: 1.08,
            duration: 1.04,
            ease: 'sine.inOut',
          },
          'questionToStatement',
        )

        // Act two — begin before the question fully leaves so the viewport
        // always retains a visible message between stages.
        .set(
          statement.current,
          { autoAlpha: 1 },
          'questionToStatement+=0.26',
        )
        .fromTo(
          statement.current,
          { scale: 0.9, yPercent: 8 },
          {
            scale: 1,
            yPercent: 0,
            duration: 0.7,
            ease: 'expo.out',
          },
          'questionToStatement+=0.26',
        )
        .to(
          '.purpose-statement__word',
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.65,
            stagger: 0.055,
            ease: 'power4.out',
          },
          'questionToStatement+=0.26',
        )
        .to({}, { duration: 0.5 })
        .addLabel('statementToAction')
        .to(statement.current, {
          autoAlpha: 0,
          yPercent: -12,
          scale: 0.98,
          duration: 0.6,
          ease: 'sine.inOut',
        }, 'statementToAction')
        // Camera position three — pan across the same canvas and pull back.
        .to(
          ambient.current,
          {
            xPercent: -1.75,
            yPercent: 1,
            scale: 1.015,
            duration: 1.08,
            ease: 'sine.inOut',
          },
          'statementToAction',
        )
        .to(
          '.purpose-glow--blue-main',
          {
            xPercent: 12,
            yPercent: -7,
            scale: 0.98,
            duration: 1.08,
            ease: 'sine.inOut',
          },
          'statementToAction',
        )
        .to(
          '.purpose-glow--green-main',
          {
            xPercent: -12,
            yPercent: 10,
            scale: 1.05,
            duration: 1.1,
            ease: 'sine.inOut',
          },
          'statementToAction',
        )
        .to(
          '.purpose-glow--red-accent',
          {
            xPercent: 14,
            yPercent: 8,
            scale: 0.96,
            duration: 1.06,
            ease: 'sine.inOut',
          },
          'statementToAction',
        )

        // Act three — overlap the incoming call-to-action with the outgoing
        // statement instead of leaving an empty interval between them.
        .set(
          action.current,
          { autoAlpha: 1 },
          'statementToAction+=0.28',
        )
        .to(
          '.purpose-action__word--lead > span',
          {
            yPercent: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 0.72,
            ease: 'back.out(1.18)',
          },
          'statementToAction+=0.28',
        )
        .to(
          '.purpose-action__word--support > span',
          {
            xPercent: 0,
            autoAlpha: 1,
            duration: 0.62,
            stagger: 0.08,
            ease: 'power4.out',
          },
          '-=.42',
        )
        .to({}, { duration: 0.75 })
        .to(action.current, {
          autoAlpha: 0,
          yPercent: -10,
          scale: 1.06,
          filter: 'blur(12px)',
          duration: 0.6,
          ease: 'power3.inOut',
        })
        .set(contactContainer, { pointerEvents: 'auto' })
        .to(
          backdrop,
          {
            autoAlpha: 1,
            duration: 0.42,
            ease: 'power2.out',
          },
          '-=.24',
        )
        .to(
          siteNavigation,
          {
            autoAlpha: 0,
            y: -10,
            filter: 'blur(6px)',
            duration: 0.35,
            ease: 'power3.in',
          },
          '<',
        )
        .to(
          contactMotion,
          safari
            ? {
                autoAlpha: 1,
                duration: 0.42,
                ease: 'power2.out',
              }
            : {
                autoAlpha: 1,
                xPercent: 0,
                yPercent: 0,
                rotationY: 0,
                scale: 1,
                clipPath: 'inset(0 0% 0 0 round 1.5rem)',
                duration: 0.82,
                ease: 'power4.out',
              },
          '<',
        )
        .set(contactMotion, { clipPath: 'none' })
        .to({}, { duration: 0.9 })
        .to(
          contactMotion,
          safari
            ? {
                autoAlpha: 0,
                duration: 0.38,
                ease: 'power2.in',
              }
            : {
                xPercent: 16,
                yPercent: 0,
                rotationX: 0,
                rotationY: 62,
                scale: 0.91,
                clipPath: 'inset(0 0 0 100% round 1.5rem)',
                autoAlpha: 0,
                duration: 0.72,
                ease: 'power3.inOut',
                transformOrigin: 'right center',
              },
        )
        .set(contactContainer, { pointerEvents: 'none' })
        .to(
          backdrop,
          {
            autoAlpha: 0,
            duration: 0.38,
            ease: 'power2.in',
          },
          '-=.48',
        )
        .to(
          siteNavigation,
          {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.35,
            ease: 'power3.out',
          },
          '-=.12',
        )

      return () => {
        questionEntry.kill()
        timeline.kill()
      }
    },
    { scope: section },
  )

  return (
    <section
      className="purpose-section"
      ref={section}
      data-scene-id="purpose"
      data-mobile-stage="question"
    >
      <div className="purpose-viewport">
        <AmbientField variant="purpose" fieldRef={ambient} />

        <div className="purpose-story" ref={story}>
          <div className="purpose-stage purpose-question" ref={question}>
            <h2 aria-label="¿No viste tu marca?">
              {questionWords.map((word) => (
                <span className="purpose-stage__word" key={word}>
                  <span>{word}</span>
                </span>
              ))}
            </h2>
          </div>

          <div className="purpose-stage purpose-statement" ref={statement}>
            <h2 aria-label="No dejes que pase de nuevo.">
              {statementWords.map((word) => (
                <span className="purpose-statement__clip" key={word}>
                  <span className="purpose-statement__word">{word}</span>
                </span>
              ))}
            </h2>
          </div>
        </div>

        <div className="purpose-final">
          <div className="purpose-stage purpose-action" ref={action}>
            <h2 aria-label="¡Anúnciate con nosotros!">
              {actionWords.map((word, index) => (
                <span
                  className={`purpose-action__word ${
                    index === 0
                      ? 'purpose-action__word--lead'
                      : 'purpose-action__word--support'
                  }`}
                  key={word}
                >
                  <span>{word}</span>
                </span>
              ))}
            </h2>
          </div>

          <div className="purpose-contact" ref={contact}>
            <div
              className="purpose-contact__backdrop"
              ref={contactBackdrop}
              aria-hidden="true"
            />
            <ContactCard
              mode="scroll"
              motionActive={
                !isMobileExperience() || mobileStage === 'contact'
              }
            />
          </div>
        </div>
      </div>
    </section>
  )
}
