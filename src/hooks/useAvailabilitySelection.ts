import { useEffect, useState } from 'react'

const storageKey = 'public:availability-selection'
const storageLifetime = 30 * 24 * 60 * 60 * 1000

interface StoredAvailabilitySelectionV3 {
  version: 3
  keys: string[]
  customerName: string
  campaignIdea: string
  updatedAt: number
}

interface AvailabilitySelectionState {
  selectedKeys: Set<string>
  customerName: string
  campaignIdea: string
  updatedAt: number
}

function emptySelection(): AvailabilitySelectionState {
  return {
    selectedKeys: new Set<string>(),
    customerName: '',
    campaignIdea: '',
    updatedAt: Date.now(),
  }
}

function readStoredSelection(): AvailabilitySelectionState {
  if (typeof window === 'undefined') return emptySelection()

  try {
    const stored = window.localStorage.getItem(storageKey)
    if (!stored) return emptySelection()

    const parsed: unknown = JSON.parse(stored)
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !('version' in parsed) ||
      (parsed.version !== 1 && parsed.version !== 2 && parsed.version !== 3) ||
      !('keys' in parsed) ||
      !Array.isArray(parsed.keys)
    ) {
      return emptySelection()
    }

    const updatedAt =
      parsed.version === 3 &&
      'updatedAt' in parsed &&
      typeof parsed.updatedAt === 'number'
        ? parsed.updatedAt
        : Date.now()

    if (Date.now() - updatedAt >= storageLifetime) return emptySelection()

    return {
      selectedKeys: new Set(
        parsed.keys.filter((key): key is string => typeof key === 'string'),
      ),
      customerName:
        (parsed.version === 2 || parsed.version === 3) &&
        'customerName' in parsed &&
        typeof parsed.customerName === 'string'
          ? parsed.customerName
          : '',
      campaignIdea:
        (parsed.version === 2 || parsed.version === 3) &&
        'campaignIdea' in parsed &&
        typeof parsed.campaignIdea === 'string'
          ? parsed.campaignIdea
          : '',
      updatedAt,
    }
  } catch {
    return emptySelection()
  }
}

export function useAvailabilitySelection() {
  const [selection, setSelection] = useState<AvailabilitySelectionState>(
    readStoredSelection,
  )

  useEffect(() => {
    const payload: StoredAvailabilitySelectionV3 = {
      version: 3,
      keys: [...selection.selectedKeys],
      customerName: selection.customerName,
      campaignIdea: selection.campaignIdea,
      updatedAt: selection.updatedAt,
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(payload))
    } catch {
      // Keep the current session usable when storage is unavailable or full.
    }
  }, [selection])

  const setSelectedKeys = (selectedKeys: Set<string>) => {
    setSelection((current) => ({ ...current, selectedKeys, updatedAt: Date.now() }))
  }
  const setCustomerName = (customerName: string) => {
    setSelection((current) => ({ ...current, customerName, updatedAt: Date.now() }))
  }
  const setCampaignIdea = (campaignIdea: string) => {
    setSelection((current) => ({ ...current, campaignIdea, updatedAt: Date.now() }))
  }

  return {
    selectedKeys: selection.selectedKeys,
    customerName: selection.customerName,
    campaignIdea: selection.campaignIdea,
    setSelectedKeys,
    setCustomerName,
    setCampaignIdea,
  }
}
