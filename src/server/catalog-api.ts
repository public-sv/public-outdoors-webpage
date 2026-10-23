import 'server-only'

const REQUEST_TIMEOUT_MS = 10_000

export class CatalogConfigurationError extends Error {}

function catalogApiUrl() {
  const configuredUrl = process.env.CATALOG_API_URL
  if (!configuredUrl) {
    throw new CatalogConfigurationError('CATALOG_API_URL is not configured')
  }

  const url = new URL(configuredUrl)
  const localDevelopmentUrl =
    process.env.NODE_ENV !== 'production' &&
    url.protocol === 'http:' &&
    ['localhost', '127.0.0.1'].includes(url.hostname)

  if (url.protocol !== 'https:' && !localDevelopmentUrl) {
    throw new CatalogConfigurationError('CATALOG_API_URL must use HTTPS')
  }

  return url
}

export async function fetchCatalog(searchParams: URLSearchParams) {
  const url = catalogApiUrl()
  searchParams.forEach((value, key) => url.searchParams.append(key, value))

  const headers = new Headers({ Accept: 'application/json' })
  if (process.env.CATALOG_API_TOKEN) {
    headers.set('Authorization', `Bearer ${process.env.CATALOG_API_TOKEN}`)
  }

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

  return response.json() as Promise<unknown>
}
