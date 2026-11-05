import { useEffect, useState } from 'react'
import {
  fallbackAvailabilityCatalog,
  isAvailabilityCatalog,
  type AvailabilityCatalog,
} from '../data/availability'

const CLIENT_CACHE_TTL_MS = 5 * 60 * 1000

let cachedCatalog: { value: AvailabilityCatalog; expiresAt: number } | null = null
let pendingCatalogRequest: Promise<AvailabilityCatalog | null> | null = null

function requestCatalog() {
  if (cachedCatalog && cachedCatalog.expiresAt > Date.now()) {
    return Promise.resolve(cachedCatalog.value)
  }

  if (pendingCatalogRequest) return pendingCatalogRequest

  pendingCatalogRequest = fetch('/api/catalog', {
    headers: { Accept: 'application/json' },
  })
    .then(async (response) => {
      if (!response.ok) return null
      const payload: unknown = await response.json()
      return isAvailabilityCatalog(payload) ? payload : null
    })
    .then((payload) => {
      if (payload) {
        cachedCatalog = {
          value: payload,
          expiresAt: Date.now() + CLIENT_CACHE_TTL_MS,
        }
      }
      return payload
    })
    .finally(() => {
      pendingCatalogRequest = null
    })

  return pendingCatalogRequest
}

export function useAvailabilityCatalog() {
  const [catalog, setCatalog] = useState<AvailabilityCatalog>(
    () => cachedCatalog?.value ?? fallbackAvailabilityCatalog,
  )

  useEffect(() => {
    let active = true

    requestCatalog()
      .then((payload) => {
        if (active && payload) setCatalog(payload)
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [])

  return catalog
}
