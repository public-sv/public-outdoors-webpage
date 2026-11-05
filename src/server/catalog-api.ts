import 'server-only'
import { normalizeCatalogResponse } from './normalize-catalog'

const REQUEST_TIMEOUT_MS = 10_000
const DEFAULT_API_KEY_HEADER = 'X-API-Key'

export class CatalogConfigurationError extends Error {}

function catalogApiConfiguration() {
  const configuredUrl = process.env.CATALOG_API_URL
  if (!configuredUrl) {
    throw new CatalogConfigurationError('CATALOG_API_URL is not configured')
  }

  const apiKey = process.env.CATALOG_API_KEY
  if (!apiKey) {
    throw new CatalogConfigurationError('CATALOG_API_KEY is not configured')
  }

  const url = new URL(configuredUrl)
  const localDevelopmentUrl =
    process.env.NODE_ENV !== 'production' &&
    url.protocol === 'http:' &&
    ['localhost', '127.0.0.1'].includes(url.hostname)

  if (url.protocol !== 'https:' && !localDevelopmentUrl) {
    throw new CatalogConfigurationError('CATALOG_API_URL must use HTTPS')
  }

  const apiKeyHeader = process.env.CATALOG_API_KEY_HEADER?.trim() || DEFAULT_API_KEY_HEADER
  if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(apiKeyHeader)) {
    throw new CatalogConfigurationError('CATALOG_API_KEY_HEADER is invalid')
  }

  return { apiKey, apiKeyHeader, url }
}

export async function fetchCatalog(searchParams: URLSearchParams) {
  const { apiKey, apiKeyHeader, url } = catalogApiConfiguration()
  searchParams.forEach((value, key) => url.searchParams.append(key, value))

  const headers = new Headers({
    Accept: 'application/json',
    [apiKeyHeader]: apiKey,
  })

  const response = await fetch(url, {
    headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(`Catalog API responded with status ${response.status}`)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    throw new Error('Catalog API returned an unsupported content type')
  }

  const payload: unknown = await response.json()
  return normalizeCatalogResponse(payload)
}
