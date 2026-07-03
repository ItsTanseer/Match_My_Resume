import { useState } from 'react'
import { rewriteResume } from '../services/api.js'
import Accordion from '../components/Accordion.jsx'
import Card from '../components/Card.jsx'
import { LoadingSpinner } from '../components/Loading.jsx'
import { useToast } from '../components/Toast.jsx'
import { useResume } from '../services/ResumeContext.jsx'

export default function ResumeRewriter() {
  const { resumeFile, resumeText, resumeLoading, resumeError, setResumeFile, jobDescription, setJobDescription } = useResume()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const handleRewrite = async () => {
    if (resumeLoading) {
      showToast('Resume text is still loading. Please wait.', 'error')
      return
    }
    if (!resumeText || !jobDescription?.trim()) {
      showToast('Please upload a resume and paste a job description.', 'error')
      return
    }

    const payload = {
      resume: resumeText,
      jd: jobDescription,
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await rewriteResume(payload)
      setResult(response.data)
      showToast('Resume rewrite completed!')
    } catch (error) {
      showToast('Unable to rewrite resume. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const downloadTxt = () => {
    const content = [
      'Projects:',
      ...(result?.project?.flatMap((project) => [project.title, ...project.bullets]) || []),
      '',
      'Experience:',
      ...(result?.experience?.flatMap((exp) => [exp.company + ' - ' + exp.role, ...exp.bullets]) || []),
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'rewritten_resume.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card className="fade-in">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Resume Rewriter</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Reframe your resume for the role with AI-powered polish.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Upload your resume and the job description, then get rewritten project and experience bullets ready to copy.
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
            <label className="text-sm font-medium text-slate-700">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              rows={7}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Paste the job description here..."
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1 text-sm text-slate-500">
            <p>AI enhanced projects and experience section of your resume.</p>
          </div>
          <button
            type="button"
            onClick={handleRewrite}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            {loading ? 'Rewriting...' : 'Rewrite Resume'}
          </button>
        </div>
      </Card>

      {loading && (
        <Card className="flex items-center justify-center py-16">
          <LoadingSpinner />
          <p>Loading.. This may take a while</p>
        </Card>
      )}

      {result && (
        <div className="space-y-6">
          <Card className="space-y-6 fade-in">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Projects</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">AI improved project bullets</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(result.project?.map((project) => [project.title, ...project.bullets].join('\n')).join('\n\n') || '')}
                  className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                >
                  Copy All
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
            <div className="space-y-4">
              {result.project?.map((project, index) => (
                <Accordion
                  key={index}
                  title={project.title}
                  subtitle={`Updated bullets`}
                  items={project.bullets.map((bullet, idx) => <p key={idx}>{bullet}</p>)}
                />
              ))}
            </div>
          </Card>

          <Card className="space-y-6 fade-in">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Experience</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">AI enhanced experience bullets</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(result.experience?.map((exp) => [exp.company + ' - ' + exp.role, ...exp.bullets].join('\n')).join('\n\n') || '')}
                  className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                >
                  Copy All
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
            <div className="space-y-4">
              {result.experience?.map((experience, index) => (
                <Accordion
                  key={index}
                  title={`${experience.company}`}
                  subtitle={experience.role}
                  items={experience.bullets.map((bullet, idx) => <p key={idx}>{bullet}</p>)}
                />
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
