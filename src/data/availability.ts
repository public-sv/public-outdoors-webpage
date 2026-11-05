import indoorOne from '../assets/images/indoor-1.webp'
import indoorTwo from '../assets/images/indoor-2.webp'
import indoorThree from '../assets/images/indoor-3.webp'
import innovationsOne from '../assets/images/innovations-1.webp'
import outdoorDigitalCorridor from '../assets/images/outdoor-digital-corridor.webp'
import outdoorOne from '../assets/images/outdoor-1.webp'
import outdoorTwo from '../assets/images/outdoor-2.webp'
import outdoorThree from '../assets/images/outdoor-3.webp'
import { assetUrl } from '../lib/assetUrl'

export type AvailableMediaCategoryId = 'indoor' | 'outdoor' | 'innovations'

export interface AvailabilityImage {
  url: string
  alt: string
}

export interface AvailabilitySpace {
  id: string
  category: AvailableMediaCategoryId
  name: string
  description: string
  image: AvailabilityImage
  available: number
  price: number
  price_label: string
}

export interface AvailabilityLocation {
  id: string
  name: string
  city: string
  description: string
  cover_image: AvailabilityImage
  spaces: AvailabilitySpace[]
}

export interface AvailabilityCatalog {
  locations: AvailabilityLocation[]
}

export interface AvailableMediaCategory {
  id: AvailableMediaCategoryId
  name: string
  image: string
  imageAlt: string
}

const images = {
  indoorOne: assetUrl(indoorOne),
  indoorTwo: assetUrl(indoorTwo),
  indoorThree: assetUrl(indoorThree),
  innovations: assetUrl(innovationsOne),
  digital: assetUrl(outdoorDigitalCorridor),
  outdoorOne: assetUrl(outdoorOne),
  outdoorTwo: assetUrl(outdoorTwo),
  outdoorThree: assetUrl(outdoorThree),
}

export const fallbackAvailabilityCatalog: AvailabilityCatalog = {
  locations: [
    {
      id: 'santa-tecla',
      name: 'Las Ramblas Santa Tecla',
      city: 'Santa Tecla',
      description: 'Un lugar de encuentro. Un espacio para tu marca.',
      cover_image: { url: images.indoorOne, alt: 'Las Ramblas Santa Tecla' },
      spaces: [
        {
          id: 'poste-banderola', category: 'outdoor', name: 'Poste banderola',
          description: 'Tu marca acompaña cada recorrido.',
          image: { url: images.outdoorOne, alt: 'Poste banderola en Las Ramblas Santa Tecla' },
          available: 33, price: 250, price_label: 'por poste / mes',
        },
        {
          id: 'cilindro-fijo', category: 'indoor', name: 'Cilindro fijo',
          description: 'Presencia a cada paso.',
          image: { url: images.indoorOne, alt: 'Cilindro fijo en Las Ramblas Santa Tecla' },
          available: 24, price: 250, price_label: 'por cara / mes',
        },
        {
          id: 'columna-cilindrica', category: 'innovations', name: 'Columna cilíndrica',
          description: 'Un formato envolvente en el centro de la experiencia.',
          image: { url: images.innovations, alt: 'Columna cilíndrica en Las Ramblas Santa Tecla' },
          available: 20, price: 750, price_label: 'por 5 postes / mes',
        },
        {
          id: 'mupi-fijo-doble-cara', category: 'innovations', name: 'Mupi fijo doble cara',
          description: 'Visibilidad en ambas direcciones del recorrido.',
          image: { url: images.innovations, alt: 'Mupi fijo doble cara en Las Ramblas Santa Tecla' },
          available: 6, price: 325, price_label: 'por cara / mes',
        },
        {
          id: 'puerta-elevadores', category: 'innovations', name: 'Puerta de elevadores',
          description: 'Impacto en un punto de pausa inevitable.',
          image: { url: images.indoorThree, alt: 'Puerta de elevadores en Las Ramblas Santa Tecla' },
          available: 4, price: 450, price_label: 'por mes',
        },
        {
          id: 'torre-backlight-cuatro-caras', category: 'innovations', name: 'Torre Backlight 4 caras',
          description: 'Cuatro frentes de exposición iluminada.',
          image: { url: images.innovations, alt: 'Torre Backlight en Las Ramblas Santa Tecla' },
          available: 2, price: 650, price_label: 'por mes',
        },
        {
          id: 'tres-poster', category: 'innovations', name: '3 Póster',
          description: 'Una secuencia visual para contar más de tu marca.',
          image: { url: images.indoorTwo, alt: 'Tres póster en Las Ramblas Santa Tecla' },
          available: 1, price: 1500, price_label: 'por mes',
        },
        {
          id: 'mural-pared', category: 'innovations', name: 'Mural en pared',
          description: 'Gran formato integrado a la arquitectura.',
          image: { url: images.innovations, alt: 'Mural publicitario en Las Ramblas Santa Tecla' },
          available: 1, price: 1500, price_label: 'por mes',
        },
        {
          id: 'innovacion-dollarcity', category: 'innovations', name: 'Innovación frente a Dollarcity',
          description: 'Un punto especial frente a una zona de alto tránsito.',
          image: { url: images.innovations, alt: 'Innovación frente a Dollarcity en Las Ramblas Santa Tecla' },
          available: 1, price: 1500, price_label: 'por mes',
        },
        {
          id: 'innovacion-buffalo-wings', category: 'innovations', name: 'Innovación frente a Buffalo Wings',
          description: 'Una ejecución memorable en un punto de encuentro.',
          image: { url: images.innovations, alt: 'Innovación frente a Buffalo Wings en Las Ramblas Santa Tecla' },
          available: 1, price: 1500, price_label: 'por mes',
        },
        {
          id: 'innovacion-entrada', category: 'innovations', name: 'Innovación en la entrada',
          description: 'La primera impresión de cada visita.',
          image: { url: images.innovations, alt: 'Innovación en la entrada de Las Ramblas Santa Tecla' },
          available: 1, price: 1500, price_label: 'por mes',
        },
      ],
    },
    {
      id: 'santa-ana',
      name: 'Las Ramblas Santa Ana',
      city: 'Santa Ana',
      description: 'Una audiencia activa en el corazón de Santa Ana.',
      cover_image: { url: images.indoorTwo, alt: 'Las Ramblas Santa Ana' },
      spaces: [
        {
          id: 'poste-banderola', category: 'innovations', name: 'Poste banderola',
          description: 'Presencia repetida a lo largo del recorrido.',
          image: { url: images.indoorTwo, alt: 'Poste banderola en Las Ramblas Santa Ana' },
          available: 28, price: 225, price_label: 'por poste / mes',
        },
        {
          id: 'cilindro-fijo', category: 'indoor', name: 'Cilindro fijo',
          description: 'Cobertura envolvente en una zona de circulación.',
          image: { url: images.indoorTwo, alt: 'Cilindro fijo en Las Ramblas Santa Ana' },
          available: 15, price: 235, price_label: 'por cara / mes',
        },
        {
          id: 'backlight-muro', category: 'innovations', name: 'Backlight en muro',
          description: 'Iluminación que mantiene tu campaña visible.',
          image: { url: images.innovations, alt: 'Backlight en muro en Las Ramblas Santa Ana' },
          available: 6, price: 475, price_label: 'por cara / mes',
        },
        {
          id: 'backlight-pasillo', category: 'innovations', name: 'Backlight interno de pasillo',
          description: 'Comunicación luminosa dentro del recorrido comercial.',
          image: { url: images.indoorTwo, alt: 'Backlight de pasillo en Las Ramblas Santa Ana' },
          available: 2, price: 425, price_label: 'por cara / mes',
        },
        {
          id: 'backlight-pared-mediana', category: 'innovations', name: 'Backlight en pared mediana',
          description: 'Formato luminoso de lectura cercana.',
          image: { url: images.innovations, alt: 'Backlight mediano en Las Ramblas Santa Ana' },
          available: 2, price: 575, price_label: 'por mes',
        },
        {
          id: 'backlight-pared-grande', category: 'innovations', name: 'Backlight en pared grande',
          description: 'Una superficie amplia para campañas de alto impacto.',
          image: { url: images.innovations, alt: 'Backlight grande en Las Ramblas Santa Ana' },
          available: 1, price: 950, price_label: 'por mes',
        },
        {
          id: 'backlight-cubo-fachada', category: 'innovations', name: 'Backlight en cubo de fachada',
          description: 'Una presencia iluminada desde el exterior.',
          image: { url: images.outdoorThree, alt: 'Backlight de fachada en Las Ramblas Santa Ana' },
          available: 1, price: 1200, price_label: 'por mes',
        },
        {
          id: 'backlight-interior', category: 'innovations', name: 'Backlight interior',
          description: 'Tu mensaje siempre encendido dentro del centro comercial.',
          image: { url: images.indoorTwo, alt: 'Backlight interior en Las Ramblas Santa Ana' },
          available: 1, price: 525, price_label: 'por mes',
        },
      ],
    },
    {
      id: 'chiltiupan',
      name: 'Chiltiupán',
      city: 'Santa Tecla',
      description: 'Conecta con miles de recorridos en una vía estratégica.',
      cover_image: { url: images.outdoorThree, alt: 'Medios exteriores en Chiltiupán' },
      spaces: [
        {
          id: 'parrilla-pasarela', category: 'innovations', name: 'Parrilla Pasarela Chiltiupán',
          description: 'Una ejecución especial integrada a la pasarela.',
          image: { url: images.outdoorThree, alt: 'Parrilla en Pasarela Chiltiupán' },
          available: 1, price: 1850, price_label: 'por mes',
        },
        {
          id: 'pasarela-chiltiupan', category: 'outdoor', name: 'Pasarela Chiltiupán 12 × 2 m',
          description: 'Impacto transversal sobre una arteria de alto flujo.',
          image: { url: images.outdoorThree, alt: 'Pasarela publicitaria de Chiltiupán' },
          available: 1, price: 2500, price_label: 'por mes',
        },
        {
          id: 'valla-multiplaza', category: 'outdoor', name: 'Valla sentido Multiplaza 9 × 7 m',
          description: 'Gran formato en dirección a Multiplaza.',
          image: { url: images.outdoorTwo, alt: 'Valla sentido Multiplaza' },
          available: 1, price: 2200, price_label: 'por mes',
        },
        {
          id: 'valla-merliot', category: 'outdoor', name: 'Valla sentido Plaza Merliot 9 × 7 m',
          description: 'Gran formato en dirección a Plaza Merliot.',
          image: { url: images.outdoorTwo, alt: 'Valla sentido Plaza Merliot' },
          available: 1, price: 2200, price_label: 'por mes',
        },
      ],
    },
    {
      id: 'puerto-la-libertad',
      name: 'Puerto de La Libertad',
      city: 'La Libertad',
      description: 'Presencia de marca en el recorrido hacia la costa.',
      cover_image: { url: images.outdoorOne, alt: 'Medios exteriores en Puerto de La Libertad' },
      spaces: [
        {
          id: 'pasarela-sentido-puerto', category: 'outdoor', name: 'Pasarela sentido Puerto 24 × 2.15 m',
          description: 'Una bienvenida de gran formato hacia la costa.',
          image: { url: images.outdoorOne, alt: 'Pasarela sentido Puerto de La Libertad' },
          available: 1, price: 2800, price_label: 'por mes',
        },
        {
          id: 'pasarela-sentido-san-salvador', category: 'outdoor', name: 'Pasarela sentido San Salvador 23 × 2.15 m',
          description: 'Cobertura visible durante el regreso a la ciudad.',
          image: { url: images.outdoorOne, alt: 'Pasarela sentido San Salvador' },
          available: 1, price: 2800, price_label: 'por mes',
        },
        {
          id: 'valla-surf-city', category: 'outdoor', name: 'Valla Surf City',
          description: 'Tu marca dentro del corredor turístico más visible.',
          image: { url: images.outdoorOne, alt: 'Valla en Surf City' },
          available: 1, price: 2100, price_label: 'por mes',
        },
      ],
    },
    {
      id: 'panamericana',
      name: 'Panamericana',
      city: 'San Salvador',
      description: 'Alcance masivo en una de las vías más importantes del país.',
      cover_image: { url: images.outdoorTwo, alt: 'Medios exteriores en carretera Panamericana' },
      spaces: [
        {
          id: 'valla-cruce-multiplaza', category: 'outdoor', name: 'Valla cruce Multiplaza 9 × 7 m',
          description: 'Gran presencia en un cruce de alta circulación.',
          image: { url: images.outdoorTwo, alt: 'Valla en cruce Multiplaza' },
          available: 1, price: 2350, price_label: 'por mes',
        },
        {
          id: 'circuito-paradas-buses', category: 'outdoor', name: 'Circuito de 8 paradas de buses',
          description: 'Frecuencia y cobertura a lo largo del recorrido.',
          image: { url: images.outdoorOne, alt: 'Circuito de paradas de buses en Panamericana' },
          available: 1, price: 3200, price_label: 'por circuito / mes',
        },
      ],
    },
    {
      id: 'san-miguel',
      name: 'Las Ramblas San Miguel',
      city: 'San Miguel',
      description: 'Una conexión directa con las audiencias de oriente.',
      cover_image: { url: images.indoorThree, alt: 'Las Ramblas San Miguel' },
      spaces: [
        {
          id: 'poste-banderola', category: 'outdoor', name: 'Poste banderola · mínimo 3',
          description: 'Repetición de marca para dominar el recorrido.',
          image: { url: images.indoorThree, alt: 'Poste banderola en Las Ramblas San Miguel' },
          available: 23, price: 210, price_label: 'por poste / mes',
        },
      ],
    },
    {
      id: 'comalapa',
      name: 'Las Ramblas Comalapa',
      city: 'La Paz',
      description: 'Una escala monumental sobre el corredor al aeropuerto.',
      cover_image: { url: images.digital, alt: 'Corredor publicitario de Comalapa' },
      spaces: [
        {
          id: 'gigantografia-carretera', category: 'outdoor', name: 'Gigantografía carretera 100 × 2 m',
          description: 'Cien metros de presencia para una campaña imposible de ignorar.',
          image: { url: images.digital, alt: 'Gigantografía en carretera a Comalapa' },
          available: 5, price: 4500, price_label: 'por mes',
        },
      ],
    },
    {
      id: 'd-paso',
      name: 'D’Paso',
      city: 'San Salvador',
      description: 'Un punto urbano cotidiano para mantener tu marca presente.',
      cover_image: { url: images.innovations, alt: 'Espacio publicitario D’Paso' },
      spaces: [
        {
          id: 'poste-banderola', category: 'outdoor', name: 'Poste banderola',
          description: 'Una secuencia visible que acompaña el tránsito urbano.',
          image: { url: images.innovations, alt: 'Poste banderola en D’Paso' },
          available: 8, price: 190, price_label: 'por poste / mes',
        },
      ],
    },
  ],
}

export const availableMediaCategories: AvailableMediaCategory[] = [
  { id: 'indoor', name: 'Indoor', image: images.indoorOne, imageAlt: 'Medio publicitario indoor dentro de un centro comercial PUBLIC' },
  { id: 'outdoor', name: 'Outdoor', image: images.outdoorOne, imageAlt: 'Medio publicitario outdoor junto a una vía urbana' },
  { id: 'innovations', name: 'Innovaciones', image: images.innovations, imageAlt: 'Instalación publicitaria especial desarrollada por PUBLIC' },
]

export function isAvailabilityCatalog(value: unknown): value is AvailabilityCatalog {
  if (!value || typeof value !== 'object') return false
  const locations = (value as { locations?: unknown }).locations
  if (!Array.isArray(locations) || locations.length === 0) return false

  return locations.every((location) => {
    if (!location || typeof location !== 'object') return false
    const item = location as Partial<AvailabilityLocation>
    if (
      typeof item.id !== 'string' ||
      typeof item.name !== 'string' ||
      typeof item.city !== 'string' ||
      typeof item.description !== 'string' ||
      !item.cover_image ||
      typeof item.cover_image.url !== 'string' ||
      typeof item.cover_image.alt !== 'string' ||
      !Array.isArray(item.spaces)
    ) return false

    return item.spaces.every((space) => Boolean(
      space &&
      typeof space.id === 'string' &&
      ['indoor', 'outdoor', 'innovations'].includes(space.category) &&
      typeof space.name === 'string' &&
      typeof space.description === 'string' &&
      space.image &&
      typeof space.image.url === 'string' &&
      typeof space.image.alt === 'string' &&
      typeof space.available === 'number' &&
      typeof space.price === 'number' &&
      typeof space.price_label === 'string',
    ))
  })
}
