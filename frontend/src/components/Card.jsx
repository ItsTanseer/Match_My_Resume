export default function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-[26px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.2)] transition-all duration-300 hover:-translate-y-0.5 ${className}`}
    >
      {children}
    </div>
  )
}
