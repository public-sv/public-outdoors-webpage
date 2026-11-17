import indoorOne from '../assets/images/indoor-1.webp'
import indoorTwo from '../assets/images/indoor-2.webp'
import indoorThree from '../assets/images/indoor-3.webp'
import innovationsOne from '../assets/images/innovations-1.webp'
import outdoorOne from '../assets/images/outdoor-1.webp'
import outdoorTwo from '../assets/images/outdoor-2.webp'
import outdoorThree from '../assets/images/outdoor-3.webp'
import indoorOneThumbnail from '../assets/images/thumbnails/indoor-1.webp'
import indoorTwoThumbnail from '../assets/images/thumbnails/indoor-2.webp'
import indoorThreeThumbnail from '../assets/images/thumbnails/indoor-3.webp'
import innovationsOneThumbnail from '../assets/images/thumbnails/innovations-1.webp'
import outdoorOneThumbnail from '../assets/images/thumbnails/outdoor-1.webp'
import outdoorTwoThumbnail from '../assets/images/thumbnails/outdoor-2.webp'
import outdoorThreeThumbnail from '../assets/images/thumbnails/outdoor-3.webp'
import { assetUrl } from '../lib/assetUrl'

export type ProjectTone = 'red' | 'blue' | 'green'

export interface Project {
  id: string
  title: string
  image?: string
  thumbnail?: string
  alt?: string
  tone?: ProjectTone
}

export interface ProjectCollection {
  id: 'indoor' | 'outdoor' | 'innovaciones'
  label: string
  description: string
  projects: Project[]
}

export const projectCollections: ProjectCollection[] = [
  {
    id: 'outdoor',
    label: 'OUTDOOR',
    description:
      'Impacto de gran formato en puntos clave que acompañan a las personas durante sus recorridos.',
    projects: [
      {
        id: '04',
        title: 'Paradas de buses',
        image: assetUrl(outdoorOne),
        thumbnail: assetUrl(outdoorOneThumbnail),
        alt: 'Paradas de buses con publicidad de Coca-Cola en San Salvador',
      },
      {
        id: '05',
        title: 'Vallas fijas',
        image: assetUrl(outdoorTwo),
        thumbnail: assetUrl(outdoorTwoThumbnail),
        alt: 'Vallas publicitarias de gran formato junto a una vía de San Salvador',
      },
      {
        id: '06',
        title: 'Pantallas digitales',
        image: assetUrl(outdoorThree),
        thumbnail: assetUrl(outdoorThreeThumbnail),
        alt: 'Pantallas digitales y banderolas publicitarias junto a una vía urbana',
      },
    ],
  },
  {
    id: 'indoor',
    label: 'INDOOR',
    description:
      'Presencias estratégicas en espacios donde las personas esperan, compran y se conectan.',
    projects: [
      {
        id: '01',
        title: 'Pantallas LED Las Ramblas',
        image: assetUrl(indoorOne),
        thumbnail: assetUrl(indoorOneThumbnail),
        alt: 'Pantallas LED publicitarias digitales dentro de un centro comercial ',
      },
      {
        id: '02',
        title: 'Cilindros Digitales Las Ramblas',
        image: assetUrl(indoorTwo),
        thumbnail: assetUrl(indoorTwoThumbnail),
        alt: 'Cilindros publicitarios digitales en un centro comercial',
      },
      {
        id: '03',
        title: 'Cilindros Fijos Las Ramblas',
        image: assetUrl(indoorThree),
        thumbnail: assetUrl(indoorThreeThumbnail),
        alt: 'Cilindros publicitarios fijos en un centro comercial',
      },
    ],
  },
  {
    id: 'innovaciones',
    label: 'INNOVACIONES',
    description:
      'Experiencias fuera de lo común que transforman ideas audaces en conexiones memorables.',
    projects: [
      {
        id: '07',
        title: 'Innovaciones Las Ramblas',
        image: assetUrl(innovationsOne),
        thumbnail: assetUrl(innovationsOneThumbnail),
        alt: 'Instalación publicitaria innovadora de Wendys'
      },
    ],
  },
]
