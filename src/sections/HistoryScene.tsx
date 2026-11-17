import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../animation/gsap'
import { setPageTone } from '../animation/pageTone'
import { SectionAmbient } from '../components/SectionAmbient'
import { SiteFooter } from '../components/SiteFooter'

const historyMilestones = [
  {
    date: '1997',
    description:
      'Producción de rótulos y banners a demanda, adaptados a las necesidades de cada campaña.',
  },
  {
    date: '1999',
    description:
      'Sherwin-Williams se convierte en el primer cliente de PUBLIC, marcando el comienzo de una historia que no ha dejado de crecer.',
  },
  {
    date: '2001',
    description:
      'PUBLIC da el salto al mundo del deporte de la mano de Movistar, llevando la publicidad a nuevos espacios en estadios.',
  },
  {
    date: '2002',
    description:
      'Registro oficial de la empresa y gestión de todos los trámites necesarios para su creación y puesta en marcha.',
  },
  {
    date: '2003 – 2008',
    description:
      'Alianza con C.C. La Gran Vía para desarrollar espacios publicitarios y producción de medios en puntos clave en San Salvador.',
  },
  {
    date: '2012',
    description:
      'PUBLIC lanza su primera valla digital, dando un paso más hacia una publicidad exterior más dinámica, moderna y conectada.',
  },
  {
    date: '2017',
    description:
      'Lanzamiento de nuevos espacios publicitarios digitales en C.C. La Gran Vía y de la icónica Pantalla Triple, convirtiéndose en uno de los grandes referentes de PUBLIC.',
  },
  {
    date: '2018 – 2023',
    description:
      'PUBLIC crece y se hace un nombre en el mercado, consolidando una identidad propia y una presencia cada vez más reconocible.',
  },
  {
    date: '2024',
    description: 'Expansion a las Ramblas Santa Tecla'
  },
  {
    date: '2025',
    description: 'Expansion a las Ramblas Santa Ana'
  },
  {
    date: '2026',
    description: 'Expansion a las Ramblas San Miguel'
 }
]

export function HistoryScene({ onContact }: { onContact: () => void }) {
  const section = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const root = section.current
      if (!root) return

      const items = gsap.utils.toArray<HTMLElement>('.history-timeline__item', root)
      const progress = root.querySelector<HTMLElement>('.history-timeline__progress-fill')
      const outroTitle = root.querySelector<HTMLElement>('.history-section__outro h2')
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const toneTrigger = ScrollTrigger.create({
        trigger: root,
        start: 'top 55%',
        end: 'bottom 45%',
        onEnter: () => setPageTone('#080b0a', true),
        onEnterBack: () => setPageTone('#080b0a', true),
        onLeaveBack: () => setPageTone('#f7f5ef', true),
        onRefresh: (self) => {
          if (self.progress > 0) setPageTone('#080b0a', true)
        },
      })

      if (reducedMotion) {
        gsap.set('.history-timeline__item-content', { opacity: 1 })
        gsap.set('.history-timeline__dot', { backgroundColor: '#f7f5ef' })
        gsap.set(progress, { clipPath: 'inset(0 0 0% 0)' })
        gsap.set(outroTitle, { opacity: 1 })
        return () => toneTrigger.kill()
      }

      if (progress) {
        gsap.fromTo(
          progress,
          { clipPath: 'inset(0 0 100% 0)' },
          {
            clipPath: 'inset(0 0 0% 0)',
            ease: 'none',
            scrollTrigger: {
              trigger: root.querySelector('.history-timeline__list'),
              start: 'top center',
              end: 'bottom center',
              scrub: 0.45,
              invalidateOnRefresh: true,
            },
          },
        )
      }

      const ambientOrbs = gsap.utils.toArray<HTMLElement>(
        '.section-ambient__orb',
        root,
      )

      const ambientPaths = [
        [
          { xPercent: 24, yPercent: 14, rotation: 8, scaleX: 1.12, scaleY: .94 },
          { xPercent: 42, yPercent: 32, rotation: 18, scaleX: .96, scaleY: 1.1 },
          { xPercent: 12, yPercent: 46, rotation: 4, scaleX: 1.16, scaleY: .92 },
          { xPercent: -20, yPercent: 25, rotation: -12, scaleX: 1.02, scaleY: 1.14 },
          { xPercent: 18, yPercent: 5, rotation: 9, scaleX: 1.12, scaleY: .96 },
        ],
        [
          { xPercent: -30, yPercent: 18, rotation: -10, scaleX: .94, scaleY: 1.12 },
          { xPercent: -48, yPercent: -8, rotation: -20, scaleX: 1.14, scaleY: .92 },
          { xPercent: -18, yPercent: -28, rotation: -5, scaleX: .98, scaleY: 1.16 },
          { xPercent: 12, yPercent: -4, rotation: 12, scaleX: 1.12, scaleY: .96 },
          { xPercent: -24, yPercent: 22, rotation: -8, scaleX: .96, scaleY: 1.1 },
        ],
        [
          { xPercent: 18, yPercent: -24, rotation: 7, scaleX: 1.1, scaleY: .95 },
          { xPercent: -14, yPercent: -38, rotation: -13, scaleX: .94, scaleY: 1.13 },
          { xPercent: -36, yPercent: -10, rotation: -19, scaleX: 1.14, scaleY: .92 },
          { xPercent: -6, yPercent: 18, rotation: 3, scaleX: .98, scaleY: 1.12 },
          { xPercent: 28, yPercent: -6, rotation: 15, scaleX: 1.12, scaleY: .96 },
        ],
      ]

      const ambientTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: root.querySelector('.history-timeline__list'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.75,
          invalidateOnRefresh: true,
        },
      })

      ambientPaths[0].forEach((_, step) => {
        ambientOrbs.forEach((orb, index) => {
          ambientTimeline.to(
            orb,
            {
              ...ambientPaths[index][step],
              duration: 1,
              ease: 'sine.inOut',
              force3D: true,
            },
            step,
          )
        })
      })

      items.forEach((item) => {
        const content = item.querySelectorAll<HTMLElement>(
          '.history-timeline__date, .history-timeline__body',
        )
        const dot = item.querySelector<HTMLElement>('.history-timeline__dot')

        const reveal = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: 'center 68%',
            end: 'center 50%',
            scrub: 0.35,
            invalidateOnRefresh: true,
          },
        })

        reveal
          .fromTo(content, { opacity: 0.55 }, { opacity: 1, duration: 1, ease: 'none' })
          .fromTo(
            dot,
            { backgroundColor: '#414141' },
            { backgroundColor: '#f7f5ef', duration: 1, ease: 'none' },
            '<',
          )
      })

      if (outroTitle) {
        gsap.fromTo(
          outroTitle,
          { opacity: 0.55 },
          {
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: root.querySelector('.history-section__outro'),
              start: 'top 80%',
              end: 'bottom bottom',
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          },
        )
      }

      // Recalculate after React commits the updated list and page layout settles.
      const refreshCall = gsap.delayedCall(0, () => ScrollTrigger.refresh())

      return () => {
        refreshCall.kill()
        toneTrigger.kill()
      }
    },
    { scope: section, dependencies: [historyMilestones], revertOnUpdate: true },
  )

  return (
    <section
      className="history-section"
      id="history"
      ref={section}
      aria-labelledby="history-title"
      data-scene-id="history"
    >
      <SectionAmbient variant="history" />

      <header className="history-section__intro">
        <h2 id="history-title">La historia de cómo llegamos hasta aquí.</h2>
        <p>
          Más de dos décadas transformando espacios en puntos de encuentro entre
          las marcas y las personas.
        </p>
      </header>

      <div className="history-timeline">
        <div className="history-timeline__list">
          <div className="history-timeline__progress" aria-hidden="true">
            <span className="history-timeline__progress-fill" />
          </div>

          {historyMilestones.map((milestone, index) => (
            <article
              className={`history-timeline__item${index % 2 === 1 ? ' history-timeline__item--reverse' : ''}`}
              key={milestone.date}
            >
              <div className="history-timeline__date history-timeline__item-content">
                {milestone.date}
              </div>

              <div className="history-timeline__centre" aria-hidden="true">
                <span className="history-timeline__dot" />
              </div>

              <div className="history-timeline__body history-timeline__item-content">
                <p>{milestone.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <footer className="history-section__outro">
        <h2>Hoy seguimos haciendo que tus ideas se vuelvan visibles.</h2>
      </footer>

      <SiteFooter onContact={onContact} />
    </section>
  )
}
