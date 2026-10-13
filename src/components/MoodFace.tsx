import { MOOD_LABEL, type Mood } from '../data/feedback'

export function MoodFace({ mood }: { mood: Mood }) {
  const mouth = {
    angry: 'M8 16.5 Q12 13.5 16 16.5',
    worried: 'M8.5 16 Q12 14.5 15.5 16',
    neutral: 'M8.5 15.5 H15.5',
    happy: 'M8 14 Q12 18 16 14',
  }[mood]
  const label = MOOD_LABEL[mood]
  return (
    <span className={`mood mood-${mood}`} role="img" aria-label={label}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {mood === 'angry' && <path d="M6.5 8.5 L10 10 M17.5 8.5 L14 10" />}
        <circle cx="9" cy="11.5" r="1.1" />
        <circle cx="15" cy="11.5" r="1.1" />
        <path d={mouth} />
      </svg>
    </span>
  )
}
