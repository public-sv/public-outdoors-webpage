import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { pages, notFound, pageUrl } from '../data/seo'

export function PageMetadata() {
  const { pathname } = useLocation()
  useEffect(() => {
    const path = pathname.replace(/\/+$/, '') || '/'
    const page = pages[path] ?? notFound
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
    document.title = page.title
    const setMeta = (key: string, value: string, property = false) => {
      const attribute = property ? 'property' : 'name'
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, key)
        document.head.append(element)
      }
      element.content = value
    }
    setMeta('description', page.description)
    setMeta('robots', process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true' && !page.noindex ? 'index, follow' : 'noindex, follow')
    setMeta('og:title', page.title, true)
    setMeta('og:description', page.description, true)
    setMeta('twitter:title', page.title)
    setMeta('twitter:description', page.description)
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (siteUrl && !page.noindex) {
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.rel = 'canonical'
        document.head.append(canonical)
      }
      canonical.href = pageUrl(siteUrl, path)
    } else canonical?.remove()
    if (siteUrl) setMeta('og:url', pageUrl(siteUrl, path), true)
  }, [pathname])
  return null
}
