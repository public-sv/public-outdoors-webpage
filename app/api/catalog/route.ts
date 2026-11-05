import { NextRequest, NextResponse } from 'next/server'
import {
  CATALOG_CACHE_TTL_SECONDS,
  CatalogConfigurationError,
  fetchCatalog,
} from '../../../src/server/catalog-api'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const catalog = await fetchCatalog(request.nextUrl.searchParams)
    return NextResponse.json(catalog, {
      headers: {
        'Cache-Control': `public, max-age=60, s-maxage=${CATALOG_CACHE_TTL_SECONDS}, stale-while-revalidate=60`,
      },
    })
  } catch (error) {
    if (error instanceof CatalogConfigurationError) {
      return NextResponse.json(
        { error: 'Catalog API is not configured' },
        { status: 503 },
      )
    }

    console.error('Catalog API request failed', error)
    return NextResponse.json(
      { error: 'Catalog API is temporarily unavailable' },
      { status: 502 },
    )
  }
}
