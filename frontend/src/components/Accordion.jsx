import { useState } from 'react'

export default function Accordion({ title, subtitle, items = [] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-slate-900"
      >
        <div>
          <p className="text-base font-semibold">{title}</p>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        <span className={`text-xl transition ${open ? 'rotate-180' : ''}`}>&#9660;</span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[1000px] px-5 pb-5' : 'max-h-0 px-5'} `}>
        <div className="space-y-4 py-2">
          {items.map((item, index) => (
            <div key={index} className="rounded-3xl bg-white p-4 shadow-sm">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
