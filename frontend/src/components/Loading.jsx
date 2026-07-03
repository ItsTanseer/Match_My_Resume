export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="relative inline-flex h-12 w-12 animate-spin items-center justify-center rounded-full border-4 border-blue-300/60 text-blue-600">
        <div className="absolute inset-1 rounded-full border-4 border-blue-600/20" />
      </div>
    </div>
  )
}

export function LoadingSkeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-3xl bg-slate-200/80 ${className}`} />
}
