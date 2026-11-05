interface AvailabilitySelectionIconProps {
  hasItems: boolean
}

export function AvailabilitySelectionIcon({ hasItems }: AvailabilitySelectionIconProps) {
  return (
    <span
      className={`availability-selection-icon${hasItems ? ' is-filled' : ''}`}
      aria-hidden="true"
    >
      <svg className="availability-selection-icon__closed" viewBox="0 0 64 64">
        <path d="M19 24v-5a13 13 0 0 1 26 0v5" />
        <path d="M14 24h36a7 7 0 0 1 7 7v18a10 10 0 0 1-10 10H17A10 10 0 0 1 7 49V31a7 7 0 0 1 7-7Z" />
      </svg>
      <svg className="availability-selection-icon__open" viewBox="0 0 64 64">
        <path d="M20 22v-5a7 7 0 0 1 7-7h10a7 7 0 0 1 7 7v5" />
        <path d="M13 22h38a7 7 0 0 1 7 7v18a11 11 0 0 1-11 11H17A11 11 0 0 1 6 47V29a7 7 0 0 1 7-7Z" />
        <path d="M7 34h50" />
        <path d="M21 39v5a11 11 0 0 0 22 0v-5" />
      </svg>
      <svg className="availability-selection-icon__filled" viewBox="0 0 64 64">
        <path d="m15 30-3-12a5 5 0 0 1 8-5l15 17" />
        <path d="m28 21 5-9h14l-5 18" />
        <path d="m38 30 7-19a7 7 0 0 1 13 5l-5 17" />
        <path d="M8 29h48v19a11 11 0 0 1-11 11H19A11 11 0 0 1 8 48V29Z" />
        <path d="M20 38v6a12 12 0 0 0 24 0v-6" />
      </svg>
    </span>
  )
}
