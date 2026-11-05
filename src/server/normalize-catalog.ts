type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizedText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback
}

function normalizeSpace(value: unknown) {
  if (!isRecord(value)) return value

  return {
    ...value,
    category: value.category === 'innovation' ? 'innovations' : value.category,
    name: normalizedText(value.name),
    description: normalizedText(value.description),
  }
}

function normalizeLocation(value: unknown) {
  if (!isRecord(value)) return value

  const name = normalizedText(value.name)
  const spaces = Array.isArray(value.spaces)
    ? value.spaces.map(normalizeSpace)
    : value.spaces

  return {
    ...value,
    name,
    city: normalizedText(value.city),
    description: normalizedText(value.description, name),
    spaces,
  }
}

export function normalizeCatalogResponse(value: unknown): unknown {
  if (!isRecord(value) || !Array.isArray(value.locations)) return value

  const locations = value.locations
    .map(normalizeLocation)
    .filter((location) => (
      isRecord(location) &&
      Array.isArray(location.spaces) &&
      location.spaces.length > 0
    ))

  return { locations }
}
