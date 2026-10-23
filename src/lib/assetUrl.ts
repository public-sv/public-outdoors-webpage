export type BundledAsset = string | { src: string }

export function assetUrl(asset: BundledAsset) {
  return typeof asset === 'string' ? asset : asset.src
}
