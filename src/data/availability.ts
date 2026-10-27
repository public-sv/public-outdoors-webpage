import indoorOne from '../assets/images/indoor-1.webp'
import indoorTwo from '../assets/images/indoor-2.webp'
import indoorThree from '../assets/images/indoor-3.webp'
import innovationsOne from '../assets/images/innovations-1.webp'
import outdoorDigitalCorridor from '../assets/images/outdoor-digital-corridor.webp'
import outdoorOne from '../assets/images/outdoor-1.webp'
import outdoorTwo from '../assets/images/outdoor-2.webp'
import outdoorThree from '../assets/images/outdoor-3.webp'
import { assetUrl } from '../lib/assetUrl'

export interface AvailableMedium {
  name: string
  available: number
  category: AvailableMediaCategoryId
}

export type AvailableMediaCategoryId = 'indoor' | 'outdoor' | 'innovations'

export interface AvailableMediaCategory {
  id: AvailableMediaCategoryId
  name: string
  image: string
  imageAlt: string
}

export interface AvailableLocation {
  id: string
  name: string
  shortName: string
  region: string
  image: string
  imageAlt: string
  media: AvailableMedium[]
}

export const availableLocations: AvailableLocation[] = [
  {
    id: 'santa-tecla',
    name: 'Las Ramblas Santa Tecla',
    shortName: 'Santa Tecla',
    region: 'La Libertad',
    image: assetUrl(indoorOne),
    imageAlt: 'Medio publicitario dentro de un centro comercial PUBLIC',
    media: [
      { name: 'Poste banderola (por poste)', available: 33, category: 'outdoor' },
      { name: 'Cilindro fijo (por cara)', available: 24, category: 'indoor' },
      { name: 'Columna cilíndrica', available: 20, category: 'innovations' },
      { name: 'Mupi fijo doble cara (por cara)', available: 6, category: 'innovations' },
      { name: 'Puerta de elevadores', available: 4, category: 'innovations' },
      { name: 'Torre Backlight 4 caras', available: 2, category: 'innovations' },
      { name: '3 Póster', available: 1, category: 'innovations' },
      { name: 'Mural en pared', available: 1, category: 'innovations' },
      { name: 'Innovación frente a Dollarcity', available: 1, category: 'innovations' },
      { name: 'Innovación frente a Buffalo Wings', available: 1, category: 'innovations' },
      { name: 'Innovación en la entrada', available: 1, category: 'innovations' },
    ],
  },
  {
    id: 'santa-ana',
    name: 'Las Ramblas Santa Ana',
    shortName: 'Santa Ana',
    region: 'Santa Ana',
    image: assetUrl(indoorTwo),
    imageAlt: 'Cilindros publicitarios digitales en un centro comercial PUBLIC',
    media: [
      { name: 'Poste banderola (por poste)', available: 28, category: 'innovations' },
      { name: 'Cilindro fijo (por cara)', available: 15, category: 'indoor' },
      { name: 'Backlight en muro (por cara)', available: 6, category: 'innovations' },
      { name: 'Backlight interno de pasillo (por cara)', available: 2, category: 'innovations' },
      { name: 'Backlight en pared mediana', available: 2, category: 'innovations' },
      { name: 'Backlight en pared grande', available: 1, category: 'innovations' },
      { name: 'Backlight en cubo de fachada', available: 1, category: 'innovations' },
      { name: 'Backlight interior', available: 1, category: 'innovations' },
    ],
  },
  {
    id: 'chiltiupan',
    name: 'Chiltiupán',
    shortName: 'Chiltiupán',
    region: 'La Libertad',
    image: assetUrl(outdoorThree),
    imageAlt: 'Medios publicitarios PUBLIC junto a una vía urbana',
    media: [
      { name: 'Parrilla Pasarela Chiltiupán', available: 1, category: 'innovations' },
      { name: 'Pasarela Chiltiupán 12 × 2 m', available: 1, category: 'outdoor' },
      { name: 'Valla sentido Multiplaza 9 × 7 m', available: 1, category: 'outdoor' },
      { name: 'Valla sentido Plaza Merliot 9 × 7 m', available: 1, category: 'outdoor' },
    ],
  },
  {
    id: 'puerto-la-libertad',
    name: 'Puerto de La Libertad',
    shortName: 'Puerto de La Libertad',
    region: 'La Libertad',
    image: assetUrl(outdoorOne),
    imageAlt: 'Parada de buses con publicidad exterior PUBLIC',
    media: [
      { name: 'Pasarela sentido Puerto 24 × 2.15 m', available: 1, category: 'outdoor' },
      { name: 'Pasarela sentido San Salvador 23 × 2.15 m', available: 1, category: 'outdoor' },
      { name: 'Valla Surf City', available: 1, category: 'outdoor' },
    ],
  },
  {
    id: 'panamericana',
    name: 'Panamericana',
    shortName: 'Panamericana',
    region: 'San Salvador',
    image: assetUrl(outdoorTwo),
    imageAlt: 'Valla publicitaria PUBLIC de gran formato junto a una vía',
    media: [
      { name: 'Valla cruce Multiplaza 9 × 7 m', available: 1, category: 'outdoor' },
      { name: 'Circuito de 8 paradas de buses', available: 1, category: 'outdoor' },
    ],
  },
  {
    id: 'san-miguel',
    name: 'Las Ramblas San Miguel',
    shortName: 'San Miguel',
    region: 'San Miguel',
    image: assetUrl(indoorThree),
    imageAlt: 'Cilindro publicitario fijo en un centro comercial PUBLIC',
    media: [{ name: 'Poste banderola · mínimo 3', available: 23, category: 'outdoor' }],
  },
  {
    id: 'comalapa',
    name: 'Las Ramblas Comalapa',
    shortName: 'Comalapa',
    region: 'La Paz',
    image: assetUrl(outdoorDigitalCorridor),
    imageAlt: 'Corredor de medios digitales exteriores PUBLIC',
    media: [{ name: 'Gigantografía carretera 100 × 2 m', available: 5, category: 'outdoor' }],
  },
  {
    id: 'd-paso',
    name: 'D’Paso',
    shortName: 'D’Paso',
    region: 'San Salvador',
    image: assetUrl(innovationsOne),
    imageAlt: 'Instalación publicitaria especial desarrollada por PUBLIC',
    media: [{ name: 'Poste banderola (por poste)', available: 8, category: 'outdoor' }],
  },
]

export const availableMediaCategories: AvailableMediaCategory[] = [
  {
    id: 'indoor',
    name: 'Indoor',
    image: assetUrl(indoorOne),
    imageAlt: 'Medio publicitario indoor dentro de un centro comercial PUBLIC',
  },
  {
    id: 'outdoor',
    name: 'Outdoor',
    image: assetUrl(outdoorOne),
    imageAlt: 'Medio publicitario outdoor junto a una vía urbana',
  },
  {
    id: 'innovations',
    name: 'Innovaciones',
    image: assetUrl(innovationsOne),
    imageAlt: 'Instalación publicitaria especial desarrollada por PUBLIC',
  },
]
