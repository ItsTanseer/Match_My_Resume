import { createContext, useContext, useState } from 'react'
import { extractTextFromPdf } from './pdfText.js'

const ResumeContext = createContext(null)

export function ResumeProvider({ children }) {
  const [resumeFile, setResumeFileState] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [resumeLoading, setResumeLoading] = useState(false)
  const [resumeError, setResumeError] = useState('')

  const setResumeFile = async (file) => {
    if (!file) {
      setResumeFileState(null)
      setResumeText('')
      setResumeError('')
      return
    }

    setResumeFileState(file)
    setResumeLoading(true)
    setResumeError('')

    try {
      const text = await extractTextFromPdf(file)
      setResumeText(text)
    } catch (error) {
      setResumeError('Unable to extract text from PDF. Please try another file.')
      setResumeText('')
    } finally {
      setResumeLoading(false)
    }
  }

  return (
    <ResumeContext.Provider
      value={{
        resumeFile,
        resumeText,
        resumeLoading,
        resumeError,
        setResumeFile,
        jobTitle,
        setJobTitle,
        jobDescription,
        setJobDescription,
      }}
    >
      {children}
    </ResumeContext.Provider>
  )
}

export function useResume() {
  const ctx = useContext(ResumeContext)
  if (!ctx) throw new Error('useResume must be used within ResumeProvider')
  return ctx
}
