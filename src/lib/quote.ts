export const quoteSchemaVersion = 1 as const

export interface QuoteCustomerInput {
  name: string
  email: string
  phone?: string
}

export interface QuoteCampaignInput {
  idea: string
}

export interface QuoteSelectionInput {
  locationId: string
  spaceId: string
}

export interface QuoteCreationRequest {
  customer: QuoteCustomerInput
  campaign: QuoteCampaignInput
  selections: QuoteSelectionInput[]
}

export interface QuoteCreationResponse {
  quoteId: string
  pdfUrl: string
  downloadUrl: string
  expiresAt: string
}

export interface QuoteDocumentItem {
  medium: string
  locationName: string
  lineTotal: number
  url?: string
}

export interface QuoteDocument {
  schemaVersion: typeof quoteSchemaVersion
  quoteId: string
  issuedAt: string
  validUntil: string
  currency: 'USD'
  taxRate: number
  customer: QuoteCustomerInput
  campaign: QuoteCampaignInput
  items: QuoteDocumentItem[]
  notes?: string[]
}

export function quoteTotals(quote: QuoteDocument) {
  const subtotal = quote.items.reduce((sum, item) => sum + item.lineTotal, 0)
  const tax = subtotal * quote.taxRate

  return {
    subtotal,
    tax,
    total: subtotal + tax,
  }
}
