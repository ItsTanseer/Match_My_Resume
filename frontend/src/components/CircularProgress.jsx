import { useEffect, useState } from 'react'

export default function CircularProgress({ value = 0 }) {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    const animation = requestAnimationFrame(() => setAnimatedValue(value))
    return () => cancelAnimationFrame(animation)
  }, [value])

  const radius = 50
  const stroke = 10
  const normalizedRadius = radius - stroke * 0.5
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference

  const ringColor =
    value >= 80 ? '#16a34a' : value >= 60 ? '#eab308' : '#ef4444'

  return (
    <div className="flex flex-col items-center gap-3 text-slate-900">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle
          stroke="#e2e8f0"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={ringColor}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-700"
        />
      </svg>
      <div className="text-center">
        <p className="text-3xl font-semibold">{Math.round(animatedValue)}%</p>
        <p className="text-sm text-slate-500">Overall Resume Score</p>
      </div>
    </div>
  )
}
