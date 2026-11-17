import type { Project } from '../data/projects'
import { LightboxImage } from './ImageLightbox'

interface ProjectCardProps {
  project: Project
  collectionId: string
  index: number
}

export function ProjectCard({ project, collectionId, index }: ProjectCardProps) {
  const className = `project-card ${collectionId}-card ${collectionId}-card--${['one', 'two', 'three'][index]}`

  return (
    <article className={className}>
      {project.image ? (
        <div className="card-visual card-visual--image">
          <LightboxImage
            src={project.image}
            previewSrc={project.thumbnail}
            alt={project.alt ?? project.title}
            caption={project.title}
            triggerClassName="image-lightbox-trigger--fill"
            loading="lazy"
            decoding="async"
          />
          <h3 className="image-card-title">{project.title}</h3>
        </div>
      ) : (
        <>
          <div className={`card-visual card-visual--${project.tone}`}>
            <span>{project.id}</span>
          </div>
          <h3>{project.title}</h3>
        </>
      )}
    </article>
  )
}
