export default function SkillChip({ label, variant = 'gray' }) {
  const styles = {
    green: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    red: 'bg-rose-100 text-rose-700 border border-rose-200',
    gray: 'bg-slate-100 text-slate-700 border border-slate-200',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${styles[variant]}`}>
      {label}
    </span>
  )
}
