type ClientLogoConfig = {
  file: string
  alt: string
}

type ClientLogoGroup = {
  id: string
  slots: number
  logos: ClientLogoConfig[]
}

export type ClientLogo = ClientLogoConfig & {
  src: string
}

export type ClientLogoSection = {
  id: string
  slots: number
  logos: ClientLogo[]
}

// Para agregar un cliente:
// 1. Copia su SVG, PNG, WebP, JPG o AVIF a public/clients.
// 2. Agrega una entrada en uno de estos dos grupos.
// Cada grupo alimenta exclusivamente su propia fila de 8 cajas, por lo que un
// logo nunca se repite ni aparece en otra sección.
export const clientLogoGroups: ClientLogoGroup[] = [
  {
    id: 'top',
    slots: 8,
    logos: [
      { file: 'vijosa.svg', alt: 'Logo de Vijosa' },
      { file: 'coca-cola.svg', alt: 'Logo de Coca Cola' },
      { file: 'flying-tiger.svg', alt: 'Logo de Flying Tiger' },
      { file: 'pollo-campero.svg', alt: 'Logo de Pollo Campero' },
      { file: 'toyota.svg', alt: 'Logo de Toyota' },
      { file: 'adidas.svg', alt: 'Logo de Adidas' },
      { file: 'mac.svg', alt: 'Logo de MAC' },
      { file: 'i-shop.svg', alt: 'Logo de iShop' },
      { file: 'pizza-hut.svg', alt: 'Logo de Pizza Hut' },
      { file: 'banco-cuscatlan.svg', alt: 'Logo de Banco Cuscatlán' },
      { file: 'banco-promerica.svg', alt: 'Logo de Banco Promerica' },
      { file: 'niu.svg', alt: 'Logo de NIU' },
      { file: 'agrisal.svg', alt: 'Logo de Agrisal' },
      { file: 'banco-agricola.svg', alt: 'Logo de Banco Agricola' },
      { file: 'banco-industrial.svg', alt: 'Logo de Banco Industrial' },
      { file: 'bimbo.svg', alt: 'Logo de Bimbo' },
      { file: 'boba-luba.svg', alt: 'Logo de Boba Luba' },
      { file: 'carvimax.svg', alt: 'Logo de Carvimax' },
      { file: 'changan.svg', alt: 'Logo de Changan' },
      { file: 'comersal.svg', alt: 'Logo de Comersal' },
      { file: 'crepe-lovers.svg', alt: 'Logo de Crepe Lovers' },
      { file: 'davivienda.svg', alt: 'Logo de Davivienda' },
      { file: 'essenza.svg', alt: 'Logo de Essenza' },
      { file: 'filemon.svg', alt: 'Logo de Filemon' },
      { file: 'gallo-cerveza.svg', alt: 'Logo de Gallo Cerveza' },
      { file: 'go-green.svg', alt: 'Logo de Go Green' },
      { file: 'hero.svg', alt: 'Logo de Hero' },
      { file: 'inbackar.svg', alt: 'Logo de Inbakcar' },
      { file: 'krisppys.svg', alt: 'Logo de Krisppys' },
      {
        file: 'la-despensa-de-don-juan.svg',
        alt: 'Logo de La Despensa de Don Juan',
      },
      { file: 'le-croissant.svg', alt: 'Logo de Le Croissant' },
      { file: 'los-cebollines.svg', alt: 'Logo de Los Cebollines' },
      { file: 'loteria.svg', alt: 'Logo de Loteria' },
    ],
  },
  {
    id: 'bottom',
    slots: 8,
    logos: [
      { file: 'starbucks.svg', alt: 'Logo de Starbucks' },
      {
        file: 'farmacias-san-nicolas.svg',
        alt: 'Logo de Farmacias San Nicolás',
      },
      { file: 'claro.svg', alt: 'Logo de Claro' },
      { file: 'cinemark.svg', alt: 'Logo de Cinemark' },
      { file: 'n1co.svg', alt: 'Logo de n1co' },
      { file: 'geely.svg', alt: 'Logo de Geely' },
      { file: 'carolina-herrera.svg', alt: 'Logo de Carolina Herrera' },
      { file: 'academia-europea.svg', alt: 'Logo de Academia Europea' },
      { file: 'lancome-paris.svg', alt: 'Logo de Lancôme Paris' },
      { file: 'valentino.svg', alt: 'Logo de Valentino' },
      { file: 'briko.svg', alt: 'Logo de Briko' },
      { file: 'gobierno-de-el-salvador.svg', alt: 'Logo de Gobierno de El Salvador' },
      {
        file: 'ministerio-de-salud-el-salvador.svg',
        alt: 'Logo de Ministerio de Salud El Salvador',
      },
      { file: 'miu-miu.svg', alt: 'Logo de Miu Miu' },
      { file: 'monica-herrera.svg', alt: 'Logo de Monica Herrera' },
      { file: 'movistar.svg', alt: 'Logo de Movistar' },
      { file: 'multi-money.svg', alt: 'Logo de Multi Money' },
      { file: 'nestle.svg', alt: 'Logo de Nestle' },
      { file: 'oriental-motor.svg', alt: 'Logo de Oriental Motor' },
      { file: 'pedidos-ya.svg', alt: 'Logo de Pedidos Ya' },
      { file: 'saba.svg', alt: 'Logo de Saba' },
      { file: 'samsung.svg', alt: 'Logo de Samsung' },
      { file: 'san-julian.svg', alt: 'Logo de San Julian' },
      { file: 'san-martin.svg', alt: 'Logo de San Martin' },
      { file: 'sherwin-williams.svg', alt: 'Logo de Sherwin Williams' },
      { file: 'subway.svg', alt: 'Logo de Subway' },
      { file: 'suzuki.svg', alt: 'Logo de Suzuki' },
      { file: 'sweets.svg', alt: 'Logo de Sweets' },
      { file: 'la-tecleña.svg', alt: 'Logo de La Tecleña' },
      { file: 'tu-vet.svg', alt: 'Logo de Tu Vet' },
      { file: 'urbanica.svg', alt: 'Logo de Urbanica' },
      { file: 'walmart.svg', alt: 'Logo de Walmart' },
      { file: 'wendys.svg', alt: 'Logo de Wendys' },
    ],
  },
]

const usedFiles = new Set<string>()

export const clientLogoSections: ClientLogoSection[] = clientLogoGroups.map(
  (group) => {
    if (group.logos.length < group.slots) {
      throw new Error(
        `El grupo de logos "${group.id}" necesita al menos ${group.slots} imágenes.`,
      )
    }

    const logos = group.logos.map((logo) => {
      if (usedFiles.has(logo.file)) {
        throw new Error(`El logo "${logo.file}" está repetido en el catálogo.`)
      }

      usedFiles.add(logo.file)
      return { ...logo, src: `/clients/${logo.file}` }
    })

    return { id: group.id, slots: group.slots, logos }
  },
)
