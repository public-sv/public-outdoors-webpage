import { useEffect, useState } from 'react'
import {
  fallbackAvailabilityCatalog,
  isAvailabilityCatalog,
  type AvailabilityCatalog,
} from '../data/availability'

export function useAvailabilityCatalog() {
  const [catalog, setCatalog] = useState<AvailabilityCatalog>(fallbackAvailabilityCatalog)

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/catalog', { headers: { Accept: 'application/json' }, signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return null
        const payload: unknown = await response.json()
        return isAvailabilityCatalog(payload) ? payload : null
      })
      .then((payload) => {
        if (payload) setCatalog(payload)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
      })

    return () => controller.abort()
  }, [])

  return catalog
}
