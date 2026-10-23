import type { Metadata } from 'next'
import { notFound as notFoundMetadata, pageUrl, pages } from '../../src/data/seo'
import { SiteShell } from '../site-shell'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{ slug?: string[] }>
}

function resolvePath(slug?: string[]) {
  return slug?.length ? `/${slug.join('/')}` : '/'
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const path = resolvePath(slug)
  const page = pages[path] ?? notFoundMetadata
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
  const canonical = siteUrl && !page.noindex ? pageUrl(siteUrl, path) : undefined

  return {
    title: page.title,
    description: page.description,
    robots: allowIndexing && !page.noindex
      ? { index: true, follow: true }
      : { index: false, follow: true },
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      type: 'website',
      title: page.title,
      description: page.description,
      url: canonical,
      locale: 'es_SV',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
    },
  }
}

export default async function PublicSitePage({ params }: PageProps) {
  const { slug } = await params
  const path = resolvePath(slug)
  if (!pages[path]) notFound()

  return <SiteShell />
}
