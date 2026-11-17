# PUBLIC Quote API Handoff

## Goal

Generate each quote PDF once, store it privately in the backend, and return a
temporary link to the frontend. The same stored file will be used for online
viewing and downloading.

## Flow

1. The frontend sends the customer information, campaign idea, and selected
   catalog IDs to `POST /api/quotes`.
2. The backend validates each selection against the current catalog.
3. The backend builds the final `QuoteDocument` with the official media names,
   location names, and prices.
4. The backend generates the PDF and stores it in a private Supabase Storage
   bucket.
5. The API returns a temporary PDF link for the email or WhatsApp message.

## Frontend request

```http
POST /api/quotes
Content-Type: application/json
```

```json
{
  "customer": {
    "name": "Carlos González",
    "email": "carlos@example.com",
    "phone": "+503 7000-0000"
  },
  "campaign": {
    "idea": "December product launch"
  },
  "selections": [
    {
      "locationId": "las-ramblas-santa-tecla",
      "spaceId": "cilindros-fijos-las-ramblas-santa-tecla-fix-cil-ram"
    },
    {
      "locationId": "las-ramblas-santa-ana",
      "spaceId": "cilindros-fijos-las-ramblas-santa-ana-fix-cil-sa"
    }
  ]
}
```

Required:

- `customer.name`
- `customer.email`
- `campaign.idea`
- At least one valid `locationId` and `spaceId` pair

Optional:

- `customer.phone`

The frontend does not send prices or totals.

## Backend-generated PDF

The backend resolves the selected IDs using the current catalog and sends this
object to the PDF renderer:

```json
{
  "schemaVersion": 1,
  "quoteId": "dfe9814e-1ff5-4af2-a878-140a649d4763",
  "issuedAt": "2026-11-12T17:00:00.000Z",
  "validUntil": "2026-11-19T17:00:00.000Z",
  "currency": "USD",
  "taxRate": 0.13,
  "customer": {
    "name": "Carlos González",
    "email": "carlos@example.com",
    "phone": "+503 7000-0000"
  },
  "campaign": {
    "idea": "December product launch"
  },
  "items": [
    {
      "medium": "Cilindro fijo",
      "locationName": "Las Ramblas Santa Tecla",
      "lineTotal": 250,
      "url": "https://publicoutdoors.com/disponibilidad?catalog=location&location=las-ramblas-santa-tecla&space=cilindros-fijos-las-ramblas-santa-tecla-fix-cil-ram"
    },
    {
      "medium": "Cilindro fijo",
      "locationName": "Las Ramblas Santa Ana",
      "lineTotal": 235,
      "url": "https://publicoutdoors.com/disponibilidad?catalog=location&location=las-ramblas-santa-ana&space=cilindros-fijos-las-ramblas-santa-ana-fix-cil-sa"
    }
  ],
  "notes": [
    "Advertising spaces are subject to availability.",
    "Generating this quote does not reserve the selected spaces."
  ]
}
```

The backend is responsible for:

- Validating the selected catalog IDs
- Creating the quote ID and dates
- Providing the official media names, location names, and prices
- Calculating each `lineTotal`, subtotal, tax, and total
- Generating and privately storing the final PDF

The item object intentionally contains only `medium`, `locationName`,
`lineTotal`, and the optional `url`. The PDF displays `campaign.idea` once as
the general campaign description instead of repeating a description for every
selected space.

## API response

```json
{
  "quoteId": "dfe9814e-1ff5-4af2-a878-140a649d4763",
  "pdfUrl": "https://publicoutdoors.com/api/quotes/dfe9814e-1ff5-4af2-a878-140a649d4763/pdf?token=...",
  "downloadUrl": "https://publicoutdoors.com/api/quotes/dfe9814e-1ff5-4af2-a878-140a649d4763/pdf?token=...&download=COT-12345678.pdf",
  "expiresAt": "2026-11-19T17:00:00.000Z"
}
```

The PDF endpoint should return the stored file instead of generating another
version. This keeps the shared and downloaded PDFs identical.

## Backend integration

Use `createQuotePdfBlob(quoteDocument)` to generate the final file. The
function returns a PDF `Blob` and does not require browser DOM APIs. Convert it
to bytes before uploading it to the private Supabase Storage bucket:

```ts
const pdfBlob = createQuotePdfBlob(quoteDocument)
const pdfBytes = new Uint8Array(await pdfBlob.arrayBuffer())

await supabase.storage
  .from('quotes')
  .upload(`${quoteDocument.quoteId}.pdf`, pdfBytes, {
    contentType: 'application/pdf',
    upsert: false,
  })
```

Call the renderer once when the quote is created. The download endpoint and
temporary share URL must both reference that stored object.

## Existing code

- Shared contract: `src/lib/quote.ts`
- PDF renderer: `src/lib/createQuotePdf.ts`
- The renderer receives the resolved `QuoteDocument` shown above.
- The PDF uses US Letter size and supports continuation pages.
- Each location appears directly below its media name.
- `campaign.idea` is centered once in a merged `Descripción Campaña` column for
  all media rows on the page.
- Long media names, locations, and campaign descriptions wrap instead of being
  truncated.
- The table header displays `Total Estimado US$`.
- `SUBTOTAL`, `IVA`, and `TOTAL ESTIMADO` are aligned without displaying the
  tax rate.
- Customer email is displayed below the name. Phone is displayed only when it
  is included in the request.

## Items to confirm

- Tax rate used by the backend.
- Access to Poppins Regular and Poppins Bold so the PDF can match the original
  template exactly.
