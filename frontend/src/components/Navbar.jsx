import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
    { label: 'Resume Analyzer', to: '/analyzer' },
    { label: 'Resume Rewriter', to: '/rewriter' },
    { label: 'Mock Interview', to: '/interview' },
    { label: 'Cover Letter Generator', to: '/coverletter' },
]

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <header className=" top-0  z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl relative">
           <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:pr-10 py-4 sm:px-6 lg:px-8">
                <div className="flex w-full md:w-auto   items-center justify-between gap-3">
                    <div className="flex   items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/10">
                            <img src="icon.png" alt="Logo" />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-slate-900">Match My Resume</p>
                            <p className="text-sm text-slate-500">AI Resume Coach</p>
                        </div>
                    </div>
                    <button
    type="button"
    onClick={() => setMenuOpen((open) => !open)}
    aria-label="Toggle navigation menu"
    aria-expanded={menuOpen}
    className="relative flex mr-5 h-11 w-11 items-center justify-center rounded-xl transition hover:bg-slate-100 md:hidden"
>
    <span
        className={`absolute h-0.5 w-6 rounded-full bg-slate-700 transition-all duration-300 ${
            menuOpen ? "rotate-45" : "-translate-y-2"
        }`}
    />

    <span
        className={`absolute h-0.5 w-6 rounded-full bg-slate-700 transition-all duration-300 ${
            menuOpen ? "opacity-0" : "opacity-100"
        }`}
    />

    <span
        className={`absolute h-0.5 w-6 rounded-full bg-slate-700 transition-all duration-300 ${
            menuOpen ? "-rotate-45" : "translate-y-2"
        }`}
    />
</button>
                </div>

                <nav
  className={`${
    menuOpen ? "flex" : "hidden"
  } absolute left-0 top-full w-full flex-col gap-3 border-b border-slate-200 bg-white px-4 py-4 md:static md:flex md:w-auto md:flex-row md:items-center md:gap-3 md:border-0 md:bg-transparent md:p-0`}
>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `block rounded-full px-4 py-2 text-sm font-medium transition ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`
                            }
                            onClick={() => setMenuOpen(false)}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </header>
    )
}
