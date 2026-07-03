import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [message, setMessage] = useState(null)
  const [type, setType] = useState('success')

  const showToast = useCallback((text, mode = 'success') => {
    setMessage(text)
    setType(mode)
    window.setTimeout(() => setMessage(null), 3200)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message ? (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50 w-[calc(100%-2rem)] max-w-sm rounded-3xl border border-slate-200 bg-white/95 px-5 py-4 shadow-xl shadow-slate-900/10 sm:w-auto">
          <p className={`text-sm font-medium ${type === 'error' ? 'text-rose-700' : 'text-slate-900'}`}>
            {message}
          </p>
        </div>
      ) : null}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
