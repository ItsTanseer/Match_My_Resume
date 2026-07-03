export default function DifficultyBadge({ difficulty }) {
  const colors = {
    Easy: 'bg-emerald-100 text-emerald-700',
    Medium: 'bg-amber-100 text-amber-700',
    Hard: 'bg-rose-100 text-rose-700',
  }

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${colors[difficulty] || colors.Medium}`}>
      {difficulty}
    </span>
  )
}
