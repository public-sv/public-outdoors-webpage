import 'server-only'
import type {
  QuoteCreationRequest,
  QuoteCreationResponse,
} from '../lib/quote'

const REQUEST_TIMEOUT_MS = 15_000
const DEFAULT_API_KEY_HEADER = 'X-API-Key'

type JsonRecord = Record<string, unknown>

export class QuoteConfigurationError extends Error {}

export class QuoteRequestError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function quoteApiConfiguration() {
  const configuredUrl = process.env.QUOTE_API_URL
  if (!configuredUrl) {
    throw new QuoteConfigurationError('QUOTE_API_URL is not configured')
  }

  const apiKey = process.env.CATALOG_API_KEY
  if (!apiKey) {
    throw new QuoteConfigurationError('CATALOG_API_KEY is not configured')
  }

  let url: URL
  try {
    url = new URL(configuredUrl)
  } catch {
    throw new QuoteConfigurationError('QUOTE_API_URL is invalid')
  }
  const localDevelopmentUrl =
    process.env.NODE_ENV !== 'production' &&
    url.protocol === 'http:' &&
    ['localhost', '127.0.0.1'].includes(url.hostname)

  if (url.protocol !== 'https:' && !localDevelopmentUrl) {
    throw new QuoteConfigurationError('QUOTE_API_URL must use HTTPS')
  }

  const apiKeyHeader = process.env.CATALOG_API_KEY_HEADER?.trim() || DEFAULT_API_KEY_HEADER
  if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(apiKeyHeader)) {
    throw new QuoteConfigurationError('CATALOG_API_KEY_HEADER is invalid')
  }

  return { apiKey, apiKeyHeader, url }
}

function requiredText(value: unknown, field: string, maximum: number) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new QuoteRequestError(`${field} is required`)
  }

  const text = value.trim()
  if (text.length > maximum) {
    throw new QuoteRequestError(`${field} is too long`)
  }
  return text
}

function responseText(value: unknown, field: string, maximum: number) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maximum) {
    throw new QuoteRequestError(`Quote API returned an invalid ${field}`, 502)
  }
  return value.trim()
}

export function parseQuoteCreationRequest(value: unknown): QuoteCreationRequest {
  if (!isRecord(value) || !isRecord(value.customer) || !isRecord(value.campaign)) {
    throw new QuoteRequestError('Invalid quote request')
  }
  if (!Array.isArray(value.selections) || !value.selections.length || value.selections.length > 50) {
    throw new QuoteRequestError('Between 1 and 50 selections are required')
  }

  const email = requiredText(value.customer.email, 'customer.email', 254)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new QuoteRequestError('customer.email is invalid')
  }

  const phone = typeof value.customer.phone === 'string'
    ? value.customer.phone.trim()
    : ''
  if (phone.length > 40) {
    throw new QuoteRequestError('customer.phone is too long')
  }

  const selections = value.selections.map((selection, index) => {
    if (!isRecord(selection)) {
      throw new QuoteRequestError(`selections[${index}] is invalid`)
    }
    return {
      locationId: requiredText(selection.locationId, `selections[${index}].locationId`, 160),
      spaceId: requiredText(selection.spaceId, `selections[${index}].spaceId`, 160),
    }
  })
  const uniqueSelections = new Set(
    selections.map(({ locationId, spaceId }) => `${locationId}\u0000${spaceId}`),
  )
  if (uniqueSelections.size !== selections.length) {
    throw new QuoteRequestError('Duplicate selections are not allowed')
  }

  return {
    customer: {
      name: requiredText(value.customer.name, 'customer.name', 100),
      email,
      ...(phone ? { phone } : {}),
    },
    campaign: {
      idea: requiredText(value.campaign.idea, 'campaign.idea', 1_000),
    },
    selections,
  }
}

function parseQuoteCreationResponse(value: unknown): QuoteCreationResponse {
  if (!isRecord(value)) {
    throw new QuoteRequestError('Quote API returned an invalid response', 502)
  }

  const response = {
    quoteId: responseText(value.quoteId, 'quoteId', 160),
    pdfUrl: responseText(value.pdfUrl, 'pdfUrl', 4_096),
    downloadUrl: responseText(value.downloadUrl, 'downloadUrl', 4_096),
    expiresAt: responseText(value.expiresAt, 'expiresAt', 80),
  }

  for (const [field, url] of Object.entries({ pdfUrl: response.pdfUrl, downloadUrl: response.downloadUrl })) {
    try {
      if (new URL(url).protocol !== 'https:') throw new Error()
    } catch {
      throw new QuoteRequestError(`Quote API returned an invalid ${field}`, 502)
    }
  }
  if (Number.isNaN(Date.parse(response.expiresAt))) {
    throw new QuoteRequestError('Quote API returned an invalid expiresAt', 502)
  }

  return response
}

export async function createQuote(request: QuoteCreationRequest) {
  const { apiKey, apiKeyHeader, url } = quoteApiConfiguration()
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      [apiKeyHeader]: apiKey,
    },
    body: JSON.stringify(request),
    cache: 'no-store',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!response.ok) {
    const status = response.status >= 400 && response.status < 500
      ? response.status
      : 502
    throw new QuoteRequestError('No fue posible generar la cotización.', status)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    throw new QuoteRequestError('Quote API returned an unsupported content type', 502)
  }

  return parseQuoteCreationResponse(await response.json())
}
