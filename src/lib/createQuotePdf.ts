import {
  quoteSchemaVersion,
  quoteTotals,
  type QuoteDocument,
  type QuoteDocumentItem,
} from './quote'

export interface QuotePdfEntry {
  locationName: string
  name: string
  price: number
  url: string
}

interface QuotePdfOptions {
  campaignIdea: string
  customerEmail?: string
  customerName: string
  customerPhone?: string
  entries: QuotePdfEntry[]
  issuedAt?: string
  quoteId?: string
  taxRate?: number
  validDays?: number
}

interface PdfLink {
  rect: [number, number, number, number]
  url: string
}

interface PdfPage {
  links: PdfLink[]
  stream: string
}

const pageWidth = 612
const pageHeight = 792
const background = '0.106 0.094 0.098'
const white = '0.98 0.98 0.98'
const muted = '0.78 0.76 0.77'
const red = '0.97 0.035 0.075'
const blue = '0.09 0.67 0.91'
const green = '0.23 0.82 0.18'
const tableBottom = 190
const rowLineHeight = 10
const minimumRowHeight = 28

function addDays(isoDate: string, days: number) {
  const date = new Date(isoDate)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString()
}

function pdfSafeText(value: string) {
  return value
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\u00a0/g, ' ')
    .replace(/[^\x20-\xFF]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function textLine(
  text: string,
  x: number,
  y: number,
  size: number,
  font: 'F1' | 'F2' = 'F1',
  color = white,
) {
  return `${color} rg BT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${pdfSafeText(text)}) Tj ET\n`
}

function estimatedTextWidth(text: string, size: number, font: 'F1' | 'F2') {
  const width = [...text].reduce((total, character) => {
    if (/[ilI1.,:;'|]/.test(character)) return total + 0.28
    if (/[MW@%]/.test(character)) return total + 0.82
    if (/[A-Z0-9$]/.test(character)) return total + 0.6
    if (character === ' ') return total + 0.28
    return total + 0.52
  }, 0)

  return width * size * (font === 'F2' ? 1.03 : 1)
}

function textRight(
  text: string,
  rightX: number,
  y: number,
  size: number,
  font: 'F1' | 'F2' = 'F1',
  color = white,
) {
  return textLine(text, rightX - estimatedTextWidth(text, size, font), y, size, font, color)
}

function textCenter(
  text: string,
  centerX: number,
  y: number,
  size: number,
  font: 'F1' | 'F2' = 'F1',
  color = white,
) {
  return textLine(text, centerX - estimatedTextWidth(text, size, font) / 2, y, size, font, color)
}

function fillRect(x: number, y: number, width: number, height: number, color: string) {
  return `${color} rg ${x} ${y} ${width} ${height} re f\n`
}

function wrapText(value: string, maxLength: number) {
  const normalized = value.trim().replace(/\s+/g, ' ')
  if (!normalized) return []

  const lines: string[] = []
  let line = ''

  normalized.split(' ').forEach((word) => {
    const chunks = word.length > maxLength
      ? word.match(new RegExp(`.{1,${maxLength}}`, 'g')) ?? [word]
      : [word]

    chunks.forEach((chunk) => {
      const candidate = line ? `${line} ${chunk}` : chunk
      if (candidate.length <= maxLength) {
        line = candidate
        return
      }
      if (line) lines.push(line)
      line = chunk
    })
  })

  if (line) lines.push(line)
  return lines
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-SV', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value))
}

function money(value: number) {
  return `US$${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value)}`
}

function drawBrand() {
  let stream = ''
  stream += 'q 0.78 0 0 -0.78 68 715 cm\n'
  stream += `${blue} rg 43.0353 26.6296 m 44.4875 2.77441 l 34.9963 4.44748 l 35.902 16.4822 l 31.1837 39.0645 l 29.9401 43.0015 l 37.3543 37.6176 l 43.0353 26.6296 l h f\n`
  stream += `${green} rg 37.3544 37.6178 m 21.248 49.1966 l 21.248 49.1966 19.4579 39.5513 31.8109 31.1765 c 36.144 30.2517 37.3556 37.6189 37.3556 37.6189 c 37.3544 37.6178 l h f\n`
  stream += `${red} rg 0 46.4197 m 0 46.4197 3.40361 27.4772 22.162 26.1996 c 12.6293 18.3623 l 15.3678 2.7624 l 33.3853 0 l 43.0354 26.6294 l 37.3544 37.6174 l 8.36617 44.4104 l 0 46.4197 l h f\n`
  stream += 'Q\n'
  stream += textLine('PUBLIC', 108, 688, 31, 'F2')
  stream += textLine('Espacios únicos para elevar tu marca', 110, 675, 7.5, 'F1', muted)
  return stream
}

function drawFooter() {
  let stream = ''
  stream += textLine('(503) 2264-5458', 50, 24, 8, 'F1', muted)
  stream += textLine('LinkedIn  Public Outdoors', 149, 24, 8, 'F1', muted)
  stream += textLine('Facebook  Public Outdoors', 284, 24, 8, 'F1', muted)
  stream += textLine('Instagram  publicoutdoors', 422, 24, 8, 'F1', muted)
  stream += textLine('publicoutdoors.com', 438, 48, 15, 'F2')
  return stream
}

function drawPageHeader(quote: QuoteDocument, pageIndex: number, pageCount: number) {
  let stream = fillRect(0, 0, pageWidth, pageHeight, background)
  stream += drawBrand()
  stream += textLine(`Fecha: ${formatDate(quote.issuedAt)}`, 430, 704, 13)
  if (pageCount > 1) {
    stream += textLine(`Página ${pageIndex + 1} de ${pageCount}`, 473, 684, 8, 'F1', muted)
  }
  return stream
}

function drawCustomer(quote: QuoteDocument) {
  const customerLines = wrapText(`Atención a: ${quote.customer.name || 'Por definir'}`, 48)
  let y = 627
  let stream = ''

  customerLines.forEach((line) => {
    stream += textLine(line, 74, y, 13, 'F2')
    y -= 16
  })
  wrapText(`Correo: ${quote.customer.email}`, 64).forEach((line) => {
    stream += textLine(line, 74, y, 11)
    y -= 12
  })
  if (quote.customer.phone) {
    wrapText(`Teléfono: ${quote.customer.phone}`, 64).forEach((line) => {
      stream += textLine(line, 74, y, 11)
      y -= 12
    })
  }

  return { stream, tableY: y - 24 }
}

function drawTableHeader(y: number) {
  let stream = fillRect(72, y, 476, 30, red)
  stream += textLine('Medio', 84, y + 10, 10, 'F2')
  stream += textCenter('Descripción', 334, y + 16, 9.5, 'F2')
  stream += textCenter('Campaña', 334, y + 5, 9.5, 'F2')
  stream += textCenter('Total Estimado', 493, y + 16, 8.8, 'F2')
  stream += textCenter('US$', 493, y + 5, 8.8, 'F2')
  return stream
}

function itemLayout(item: QuoteDocumentItem) {
  const mediumLines = wrapText(item.medium, 26)
  const locationLines = wrapText(item.locationName, 26)
  const lineCount = Math.max(mediumLines.length + locationLines.length, 1)

  return {
    height: Math.max(minimumRowHeight, lineCount * rowLineHeight + 12),
    locationLines,
    mediumLines,
  }
}

function drawItem(item: QuoteDocumentItem, topY: number, height?: number) {
  const layout = itemLayout(item)
  const rowHeight = height ?? layout.height
  let stream = ''

  layout.mediumLines.forEach((line, index) => {
    stream += textLine(line, 82, topY - 13 - index * rowLineHeight, 8.5, 'F2')
  })
  layout.locationLines.forEach((line, index) => {
    const lineOffset = layout.mediumLines.length + index
    stream += textLine(line, 82, topY - 13 - lineOffset * rowLineHeight, 7.8, 'F1', muted)
  })
  stream += textRight(money(item.lineTotal), 540, topY - 13, 8.2, 'F2')
  stream += `${muted} RG 0.3 w 78 ${topY - rowHeight} m 220 ${topY - rowHeight} l S\n`
  stream += `${muted} RG 0.3 w 438 ${topY - rowHeight} m 542 ${topY - rowHeight} l S\n`

  return { height: rowHeight, stream }
}

function drawCampaignDescription(lines: string[], topY: number, bottomY: number) {
  if (!lines.length) return ''

  const lineHeight = 11
  const textHeight = (lines.length - 1) * lineHeight
  let y = (topY + bottomY) / 2 + textHeight / 2 - 3
  let stream = ''
  lines.forEach((line) => {
    stream += textCenter(line, 334, y, 8.5)
    y -= lineHeight
  })
  return stream
}

function drawTotals(quote: QuoteDocument) {
  const totals = quoteTotals(quote)
  const labelRight = 440
  const amountRight = 540
  let stream = fillRect(76, 155, 472, 23, red)
  stream += textRight('SUBTOTAL:', labelRight, 163, 10, 'F2')
  stream += textRight(money(totals.subtotal), amountRight, 163, 10, 'F2')
  stream += textRight('IVA:', labelRight, 141, 10, 'F2')
  stream += textRight(money(totals.tax), amountRight, 141, 10, 'F2')
  stream += textRight('TOTAL ESTIMADO:', labelRight, 116, 10, 'F2')
  stream += textRight(money(totals.total), amountRight, 116, 12, 'F2')
  return stream
}

function drawTerms(quote: QuoteDocument) {
  const defaultNotes = [
    'Los espacios publicitarios se asignan por orden de llegada y están sujetos a disponibilidad',
    'al momento de la contratación. La emisión de esta cotización no reserva ni garantiza',
    'los espacios solicitados.',
    `Esta cotización tiene vigencia hasta el ${formatDate(quote.validUntil)}.`,
  ]
  const notes = quote.notes?.length ? quote.notes : defaultNotes
  const lines = notes.flatMap((note) => wrapText(note, 105))
  let stream = ''
  lines.forEach((line, index) => {
    stream += textLine(line, 76, 87 - index * 12, 8.5)
  })
  return stream
}

function paginateItems(
  items: QuoteDocumentItem[],
  firstTableY: number,
  campaignDescriptionHeight: number,
) {
  const pages: QuoteDocumentItem[][] = []
  let itemIndex = 0
  let pageIndex = 0

  while (itemIndex < items.length) {
    const tableY = pageIndex === 0 ? firstTableY : 625
    const contentTop = tableY - 5
    let contentHeight = 0
    const pageItems: QuoteDocumentItem[] = []

    while (itemIndex < items.length) {
      const item = items[itemIndex]
      const height = itemLayout(item).height
      const nextContentHeight = contentHeight + height
      const effectiveHeight = Math.max(nextContentHeight, campaignDescriptionHeight)
      const fits = contentTop - effectiveHeight >= tableBottom

      if (!fits && pageItems.length) break
      if (!fits && pageIndex === 0) break

      pageItems.push(item)
      itemIndex += 1
      contentHeight = nextContentHeight
    }

    pages.push(pageItems)
    pageIndex += 1
  }

  return pages
}

function buildPages(quote: QuoteDocument) {
  const customer = drawCustomer(quote)
  const campaignLines = wrapText(quote.campaign.idea, 36)
  const campaignDescriptionHeight = campaignLines.length * 11 + 20
  const itemPages = paginateItems(
    quote.items,
    customer.tableY,
    campaignDescriptionHeight,
  )
  const pageCount = itemPages.length

  return Array.from({ length: pageCount }, (_, pageIndex): PdfPage => {
    const items = itemPages[pageIndex]
    const lastPage = pageIndex === pageCount - 1
    const links: PdfLink[] = []
    let stream = drawPageHeader(quote, pageIndex, pageCount)

    if (pageIndex === 0) stream += customer.stream

    const tableY = pageIndex === 0 ? customer.tableY : 625
    stream += drawTableHeader(tableY)
    const naturalHeights = items.map((item) => itemLayout(item).height)
    const naturalContentHeight = naturalHeights.reduce((sum, height) => sum + height, 0)
    const contentHeight = Math.max(naturalContentHeight, campaignDescriptionHeight)
    const rowHeights = [...naturalHeights]
    if (rowHeights.length) {
      rowHeights[rowHeights.length - 1] += contentHeight - naturalContentHeight
    }
    let cursorY = tableY - 5
    items.forEach((item, itemIndex) => {
      const rendered = drawItem(item, cursorY, rowHeights[itemIndex])
      stream += rendered.stream
      if (item.url) {
        links.push({ rect: [78, cursorY - rendered.height, 542, cursorY], url: item.url })
      }
      cursorY -= rendered.height
    })
    stream += drawCampaignDescription(campaignLines, tableY - 5, tableY - 5 - contentHeight)

    if (lastPage) {
      stream += drawTotals(quote)
      stream += drawTerms(quote)
    }
    stream += drawFooter()

    return { links, stream }
  })
}

function latin1Bytes(value: string) {
  const bytes = new Uint8Array(value.length)
  for (let index = 0; index < value.length; index += 1) {
    bytes[index] = value.charCodeAt(index) & 0xff
  }
  return bytes
}

function createPdfBlob(pages: PdfPage[]) {
  const objects = new Map<number, string>()
  const pageReferences: string[] = []

  objects.set(1, '<< /Type /Catalog /Pages 2 0 R >>')
  objects.set(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
  objects.set(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>')

  let nextAnnotationObject = 5 + pages.length * 2
  pages.forEach(({ links, stream }, index) => {
    const pageObject = 5 + index * 2
    const streamObject = pageObject + 1
    const annotationReferences = links.map((link) => {
      const annotationObject = nextAnnotationObject
      nextAnnotationObject += 1
      objects.set(
        annotationObject,
        `<< /Type /Annot /Subtype /Link /Rect [${link.rect.join(' ')}] /Border [0 0 0] /H /I /A << /S /URI /URI (${pdfSafeText(link.url)}) >> >>`,
      )
      return `${annotationObject} 0 R`
    })
    const annotations = annotationReferences.length
      ? ` /Annots [${annotationReferences.join(' ')}]`
      : ''
    pageReferences.push(`${pageObject} 0 R`)
    objects.set(
      pageObject,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${streamObject} 0 R${annotations} >>`,
    )
    objects.set(streamObject, `<< /Length ${latin1Bytes(stream).length} >>\nstream\n${stream}endstream`)
  })

  objects.set(2, `<< /Type /Pages /Kids [${pageReferences.join(' ')}] /Count ${pages.length} >>`)

  const objectCount = nextAnnotationObject - 1
  let pdf = '%PDF-1.4\n%âãÏÓ\n'
  const offsets = [0]
  for (let objectNumber = 1; objectNumber <= objectCount; objectNumber += 1) {
    offsets[objectNumber] = latin1Bytes(pdf).length
    pdf += `${objectNumber} 0 obj\n${objects.get(objectNumber)}\nendobj\n`
  }
  const xrefOffset = latin1Bytes(pdf).length
  pdf += `xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`
  for (let objectNumber = 1; objectNumber <= objectCount; objectNumber += 1) {
    pdf += `${String(offsets[objectNumber]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return new Blob([latin1Bytes(pdf)], { type: 'application/pdf' })
}

export function createQuotePdfBlob(quote: QuoteDocument) {
  if (!quote.items.length) throw new Error('A quote requires at least one item')
  return createPdfBlob(buildPages(quote))
}

export function quoteDocumentFromPdfOptions(options: QuotePdfOptions): QuoteDocument {
  const issuedAt = options.issuedAt ?? new Date().toISOString()
  const validDays = options.validDays ?? 7

  return {
    schemaVersion: quoteSchemaVersion,
    quoteId: options.quoteId ?? crypto.randomUUID(),
    issuedAt,
    validUntil: addDays(issuedAt, validDays),
    currency: 'USD',
    taxRate: options.taxRate ?? 0.13,
    customer: {
      name: options.customerName,
      email: options.customerEmail ?? '',
      phone: options.customerPhone,
    },
    campaign: { idea: options.campaignIdea },
    items: options.entries.map((entry) => ({
      medium: entry.name,
      locationName: entry.locationName,
      lineTotal: entry.price,
      url: entry.url,
    })),
  }
}

export function downloadQuotePdf(options: QuotePdfOptions) {
  if (!options.entries.length) return

  const quote = quoteDocumentFromPdfOptions(options)
  const url = URL.createObjectURL(createQuotePdfBlob(quote))
  const download = document.createElement('a')
  download.href = url
  download.download = `cotizacion-public-${quote.issuedAt.slice(0, 10)}.pdf`
  document.body.append(download)
  download.click()
  download.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
