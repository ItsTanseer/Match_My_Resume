import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ResumeAnalyzer from './pages/ResumeAnalyzer.jsx'
import ResumeRewriter from './pages/ResumeRewriter.jsx'
import MockInterview from './pages/MockInterview.jsx'
import CoverLetter from './pages/CoverLetter.jsx'
import { ToastProvider } from './components/Toast.jsx'

function App() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Navigate to="/analyzer" replace />} />
            <Route path="/analyzer" element={<ResumeAnalyzer />} />
            <Route path="/rewriter" element={<ResumeRewriter />} />
            <Route path="/interview" element={<MockInterview />} />
            <Route path="/coverletter" element={<CoverLetter />} />
            <Route path="*" element={<Navigate to="/analyzer" replace />} />
          </Routes>
        </main>
      </div>
    </ToastProvider>
  )
}

export default App
