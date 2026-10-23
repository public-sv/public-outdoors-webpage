import type { MetadataRoute } from 'next'
import { pages, pageUrl } from '../src/data/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  if (!siteUrl || process.env.NEXT_PUBLIC_ALLOW_INDEXING !== 'true') return []

  return Object.entries(pages)
    .filter(([, page]) => !page.noindex)
    .map(([path]) => ({
      url: pageUrl(siteUrl, path),
      changeFrequency: path === '/' ? 'monthly' : 'weekly',
      priority: path === '/' ? 1 : 0.8,
    }))
}
