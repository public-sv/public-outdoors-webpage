import pepsiImage from '../assets/images/innovations-showcase-pepsi.webp'
import starbucksSummerImage from '../assets/images/innovations-showcase-starbucks-summer.webp'
import cocaColaImage from '../assets/images/innovations-showcase-coca-cola.webp'
import liptonChairImage from '../assets/images/innovations-showcase-lipton-chair.webp'
import starbucksFrappuccinoImage from '../assets/images/innovations-showcase-starbucks-frappuccino.webp'
import liptonDisplayImage from '../assets/images/innovations-showcase-lipton-display.webp'
import starbucksElevatorsImage from '../assets/images/innovations-showcase-starbucks-elevators.webp'
import starbucksCupsImage from '../assets/images/innovations-showcase-starbucks-cups.webp'
import { assetUrl } from '../lib/assetUrl'

export const innovationShowcaseImages = [
  {
    src: assetUrl(starbucksSummerImage),
    alt: 'Cilindro digital de Starbucks con una instalación tridimensional de bebida helada',
  },
  {
    src: assetUrl(starbucksElevatorsImage),
    alt: 'Elevadores intervenidos con vasos de Starbucks',
  },
  {
    src: assetUrl(pepsiImage),
    alt: 'Cilindro publicitario de Pepsi con una instalación tridimensional de lata y burbujas',
  },
  {
    src: assetUrl(liptonChairImage),
    alt: 'Experiencia de marca Lipton con una silla frente a un fondo de playa',
  },
  {
    src: assetUrl(starbucksFrappuccinoImage),
    alt: 'Cilindro publicitario de Starbucks con exhibición tridimensional de Frappuccino',
  },
  {
    src: assetUrl(liptonDisplayImage),
    alt: 'Estructura publicitaria tridimensional de Lipton Té Verde',
  },
  {
    src: assetUrl(starbucksCupsImage),
    alt: 'Vasos gigantes de Starbucks suspendidos sobre una plaza comercial',
  },
  {
    src: assetUrl(cocaColaImage),
    alt: 'Cilindro publicitario de Coca-Cola en una plaza comercial',
  },
]
