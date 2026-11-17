import { NextResponse } from 'next/server'
import {
  createQuote,
  parseQuoteCreationRequest,
  QuoteConfigurationError,
  QuoteRequestError,
} from '../../../src/server/quote-api'

const MAX_REQUEST_BYTES = 32 * 1024

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function isAllowedBrowserOrigin(request: Request) {
  if (process.env.NODE_ENV !== 'production') return true

  const origin = request.headers.get('origin')
  if (!origin) return false

  let originUrl: URL
  try {
    originUrl = new URL(origin)
  } catch {
    return false
  }

  const allowedOrigins = new Set([new URL(request.url).origin])
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (configuredSiteUrl) {
    try {
      allowedOrigins.add(new URL(configuredSiteUrl).origin)
    } catch {
      // Invalid public site configuration cannot grant access.
    }
  }

  if (allowedOrigins.has(originUrl.origin)) return true

  // Netlify exposes the site name to Functions at runtime. Allow only HTTPS
  // production, branch-deploy, and immutable deploy hosts belonging to this
  // exact Netlify site (for example, branch--site-name.netlify.app).
  const netlifySiteName = process.env.SITE_NAME?.trim().toLowerCase()
  if (!netlifySiteName || originUrl.protocol !== 'https:' || originUrl.port) {
    return false
  }

  const netlifySiteHost = `${netlifySiteName}.netlify.app`
  const originHost = originUrl.hostname.toLowerCase()
  return originHost === netlifySiteHost || originHost.endsWith(`--${netlifySiteHost}`)
}

export async function POST(request: Request) {
  try {
    if (!isAllowedBrowserOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 })
    }

    const contentType = request.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 415 },
      )
    }

    const declaredLength = Number(request.headers.get('content-length') ?? 0)
    if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
      return NextResponse.json({ error: 'Request body is too large' }, { status: 413 })
    }

    const body = await request.text()
    if (Buffer.byteLength(body, 'utf8') > MAX_REQUEST_BYTES) {
      return NextResponse.json({ error: 'Request body is too large' }, { status: 413 })
    }

    const payload: unknown = JSON.parse(body)
    const quoteRequest = parseQuoteCreationRequest(payload)
    const quote = await createQuote(quoteRequest)

    return NextResponse.json(quote, {
      status: 201,
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
    if (error instanceof QuoteConfigurationError) {
      return NextResponse.json(
        { error: 'Quote API is not configured' },
        { status: 503 },
      )
    }
    if (error instanceof QuoteRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('Quote API request failed', error)
    return NextResponse.json(
      { error: 'Quote API is temporarily unavailable' },
      { status: 502 },
    )
  }
}
