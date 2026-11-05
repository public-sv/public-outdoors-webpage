import { AvailabilitySelectionIcon } from './AvailabilitySelectionIcon'

interface AvailabilitySelectionAccessProps {
  selectionCount: number
  onOpen: () => void
}

export function AvailabilitySelectionAccess({
  selectionCount,
  onOpen,
}: AvailabilitySelectionAccessProps) {
  return (
    <button
      className={`site-nav__selection-island site-selection-access${selectionCount ? ' has-items' : ''}`}
      type="button"
      aria-label={`Mi selección, ${selectionCount} ${selectionCount === 1 ? 'elemento' : 'elementos'}`}
      onClick={onOpen}
    >
      <AvailabilitySelectionIcon hasItems={selectionCount > 0} />
      <span className="site-nav__selection-count" aria-hidden="true">
        {selectionCount}
      </span>
    </button>
  )
}
