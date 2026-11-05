import { AvailabilitySelectionIcon } from './AvailabilitySelectionIcon'

interface AvailabilitySelectionAccessProps {
  selectionCount: number
  onOpen: () => void
  availabilityPage?: boolean
}

export function AvailabilitySelectionAccess({
  selectionCount,
  onOpen,
  availabilityPage = false,
}: AvailabilitySelectionAccessProps) {
  const className = [
    'site-nav__selection-island',
    'site-selection-access',
    selectionCount ? 'has-items' : '',
    availabilityPage ? 'site-selection-access--availability' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={className}
      type="button"
      aria-label={`Mi selección, ${selectionCount} ${selectionCount === 1 ? 'elemento' : 'elementos'}`}
      onClick={onOpen}
    >
      <AvailabilitySelectionIcon hasItems={selectionCount > 0} />
      {selectionCount > 0 && (
        <span className="site-nav__selection-count" aria-hidden="true">
          {selectionCount}
        </span>
      )}
    </button>
  )
}
