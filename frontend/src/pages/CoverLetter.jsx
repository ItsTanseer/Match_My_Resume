import { useState } from 'react'
import { generateCoverLetter } from '../services/api.js'
import Card from '../components/Card.jsx'
import { LoadingSpinner } from '../components/Loading.jsx'
import { useToast } from '../components/Toast.jsx'
import { useResume } from '../services/ResumeContext.jsx'

const tones = ['Professional', 'Formal', 'Friendly', 'Confident', 'Enthusiastic']

export default function CoverLetter() {
  const { resumeFile, resumeText, resumeLoading, resumeError, setResumeFile, jobDescription, setJobDescription } = useResume()
  const [companyName, setCompanyName] = useState('')
  const [tone, setTone] = useState(tones[0])
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const handleGenerate = async () => {
    if (resumeLoading) {
      showToast('Resume text is still loading. Please wait.', 'error')
      return
    }
    if (!resumeText || !jobDescription?.trim() || !companyName.trim()) {
      showToast('Please provide a resume, job description, and company name.', 'error')
      return
    }

    const payload = {
      resume: resumeText,
      jd: jobDescription,
      company: companyName,
      tone,
    }

    setLoading(true)
    setCoverLetter('')

    try {
      const response = await generateCoverLetter(payload)
      setCoverLetter(response.data)
      showToast('Cover letter generated successfully!')
    } catch (error) {
      showToast('Could not generate cover letter. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const downloadTxt = () => {
    const blob = new Blob([coverLetter], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'cover_letter.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card className="fade-in">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Cover Letter Generator</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Create a tailored cover letter in seconds.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Upload your resume, share the job description and company name, then choose a tone to generate a polished cover letter.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Upload Resume (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            {resumeFile && (
              <p className="text-sm text-slate-500">Loaded resume: <span className="font-medium text-slate-900">{resumeFile.name}</span></p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Target company name"
            />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-medium text-slate-700">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              rows={7}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Paste the job description here..."
            />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-medium text-slate-700">Tone</label>
            <select
              value={tone}
              onChange={(event) => setTone(event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {tones.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-end">
          
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            {loading ? 'Generating...' : 'Generate Cover Letter'}
          </button>
        </div>
      </Card>

      {loading && (
        <Card className="flex items-center justify-center py-16">
          <LoadingSpinner />
        </Card>
      )}

      {coverLetter && (
        <Card className="space-y-5 fade-in">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Cover Letter</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">AI generated document</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(coverLetter)}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={downloadTxt}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Download TXT
              </button>
            </div>
          </div>
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-slate-700 shadow-sm">
            <pre className="whitespace-pre-wrap break-words text-sm leading-7">{coverLetter}</pre>
          </div>
        </Card>
      )}
    </div>
  )
}
