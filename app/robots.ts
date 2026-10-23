import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'

  if (!allowIndexing || !siteUrl) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
