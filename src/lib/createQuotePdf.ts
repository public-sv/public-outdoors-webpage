export interface QuotePdfEntry {
  locationName: string
  name: string
  price: number
  priceLabel: string
  url: string
}

interface QuotePdfOptions {
  campaignIdea: string
  customerName: string
  entries: QuotePdfEntry[]
}

interface PdfLink {
  rect: [number, number, number, number]
  url: string
}

interface PdfPage {
  links: PdfLink[]
  stream: string
}

const pageWidth = 595
const pageHeight = 842
const entriesPerPage = 10

function pdfSafeText(value: string) {
  return value
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x20-\xFF]/g, '?')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function wrapText(value: string, maxLength: number, maxLines = 3) {
  const words = value.trim().split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''

  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word
    if (candidate.length <= maxLength) {
      line = candidate
      return
    }
    if (line) lines.push(line)
    line = word
  })
  if (line) lines.push(line)

  if (lines.length > maxLines) {
    const visible = lines.slice(0, maxLines)
    visible[maxLines - 1] = `${visible[maxLines - 1].slice(0, maxLength - 3)}...`
    return visible
  }
  return lines
}

function textLine(
  text: string,
  x: number,
  y: number,
  size: number,
  font: 'F1' | 'F2' = 'F1',
  color = '0.969 0.961 0.937',
) {
  return `${color} rg BT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${pdfSafeText(text)}) Tj ET\n`
}

function money(value: number) {
  return `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)}`
}

function buildPage(
  entries: QuotePdfEntry[],
  options: QuotePdfOptions,
  pageIndex: number,
  pageCount: number,
) {
  const total = options.entries.reduce((sum, entry) => sum + entry.price, 0)
  const date = new Intl.DateTimeFormat('es-SV', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
  let stream = '0.035 0.043 0.043 rg 0 0 595 842 re f\n'
  const links: PdfLink[] = []
  stream += '1 0.004 0.035 rg 0 830 198 12 re f\n'
  stream += '0 0.69 0.957 rg 198 830 199 12 re f\n'
  stream += '0.22 0.831 0.188 rg 397 830 198 12 re f\n'
  stream += textLine('PUBLIC', 48, 772, 30, 'F2')
  stream += textLine('COTIZACION DE DISPONIBILIDAD', 48, 741, 11, 'F2', '0.63 0.67 0.65')
  stream += textLine(date.toUpperCase(), 422, 772, 8, 'F1', '0.63 0.67 0.65')
  stream += textLine(`PAGINA ${pageIndex + 1} / ${pageCount}`, 462, 755, 7, 'F1', '0.45 0.5 0.48')

  if (pageIndex === 0) {
    stream += textLine('CLIENTE', 48, 694, 7, 'F2', '0.45 0.5 0.48')
    stream += textLine(options.customerName.trim() || 'Por definir', 48, 674, 13, 'F2')
    stream += textLine('IDEA DE CAMPAÑA', 280, 694, 7, 'F2', '0.45 0.5 0.48')
    const ideaLines = wrapText(options.campaignIdea || 'Por definir', 45, 2)
    ideaLines.forEach((line, index) => {
      stream += textLine(line, 280, 674 - index * 15, 10)
    })
  }

  stream += '0.16 0.19 0.18 RG 48 632 m 547 632 l S\n'
  stream += textLine('MEDIOS SELECCIONADOS', 48, 608, 8, 'F2', '0.63 0.67 0.65')
  stream += textLine('TARIFA', 478, 608, 8, 'F2', '0.63 0.67 0.65')

  let y = 575
  entries.forEach((entry) => {
    stream += textLine(entry.name.toUpperCase(), 48, y, 11, 'F2')
    stream += textLine(`${entry.locationName}  /  ${entry.priceLabel}`, 48, y - 16, 8, 'F1', '0.58 0.62 0.6')
    stream += textLine('VER EN PUBLIC', 390, y - 16, 7, 'F2', '0 0.69 0.957')
    stream += textLine(money(entry.price), 478, y - 1, 11, 'F2')
    stream += `0.12 0.15 0.14 RG 48 ${y - 29} m 547 ${y - 29} l S\n`
    links.push({
      rect: [48, y - 24, 462, y + 15],
      url: entry.url,
    })
    y -= 48
  })

  if (pageIndex === pageCount - 1) {
    const totalY = Math.max(92, y - 4)
    stream += textLine('TOTAL ESTIMADO', 344, totalY, 9, 'F2', '0.63 0.67 0.65')
    stream += textLine(money(total), 478, totalY - 1, 16, 'F2')
  }

  stream += textLine(
    'Precios en USD. Tarifas mensuales sin IVA. Disponibilidad sujeta a confirmacion.',
    48,
    48,
    7,
    'F1',
    '0.45 0.5 0.48',
  )
  stream += textLine('marketing@publicsv.net  /  +503 7840-0641', 48, 29, 7, 'F1', '0.45 0.5 0.48')
  return { links, stream }
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
    objects.set(streamObject, `<< /Length ${stream.length} >>\nstream\n${stream}endstream`)
  })

  objects.set(2, `<< /Type /Pages /Kids [${pageReferences.join(' ')}] /Count ${pages.length} >>`)

  const objectCount = nextAnnotationObject - 1
  let pdf = '%PDF-1.4\n%âãÏÓ\n'
  const offsets = [0]
  for (let objectNumber = 1; objectNumber <= objectCount; objectNumber += 1) {
    offsets[objectNumber] = pdf.length
    pdf += `${objectNumber} 0 obj\n${objects.get(objectNumber)}\nendobj\n`
  }
  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`
  for (let objectNumber = 1; objectNumber <= objectCount; objectNumber += 1) {
    pdf += `${String(offsets[objectNumber]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return new Blob([latin1Bytes(pdf)], { type: 'application/pdf' })
}

export function createQuotePdfBlob(options: QuotePdfOptions) {
  const pageCount = Math.ceil(options.entries.length / entriesPerPage)
  const pages = Array.from({ length: pageCount }, (_, index) =>
    buildPage(
      options.entries.slice(index * entriesPerPage, (index + 1) * entriesPerPage),
      options,
      index,
      pageCount,
    ),
  )
  return createPdfBlob(pages)
}

export function downloadQuotePdf(options: QuotePdfOptions) {
  if (!options.entries.length) return

  const url = URL.createObjectURL(createQuotePdfBlob(options))
  const download = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  download.href = url
  download.download = `cotizacion-public-${date}.pdf`
  document.body.append(download)
  download.click()
  download.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
