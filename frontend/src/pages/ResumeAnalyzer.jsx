import { useMemo, useState } from 'react'
import { analyzeResume } from '../services/api.js'
import Card from '../components/Card.jsx'
import CircularProgress from '../components/CircularProgress.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import SkillChip from '../components/SkillChip.jsx'
import DocumentViewer from '../components/DocumentViewer.jsx'
import { LoadingSpinner } from '../components/Loading.jsx'
import { useToast } from '../components/Toast.jsx'
import { useResume } from '../services/ResumeContext.jsx'

const scoreColor = (value) =>
  value >= 80 ? 'text-emerald-600' : value >= 60 ? 'text-amber-600' : 'text-rose-600'

export default function ResumeAnalyzer() {
  const { resumeFile, resumeText, resumeLoading, setResumeFile, jobTitle, setJobTitle, jobDescription, setJobDescription } = useResume()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const resumeName = resumeFile?.name || ''

  const handleAnalyze = async () => {
    if (!resumeFile || !jobTitle.trim() || !jobDescription.trim()) {
      showToast('Please upload a resume, enter a job title, and paste a job description.', 'error')
      return
    }

    const formData = new FormData()
    formData.append('resumeFile', resumeFile)
    formData.append('jd', jobDescription)
    formData.append('job_title', jobTitle)

    setLoading(true)
    setResult(null)

    try {
      const response = await analyzeResume(formData)
      setResult(response.data)
      showToast('Resume analysis is ready!')
    } catch (error) {
      showToast('Unable to analyze resume. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const projectScore = result?.semantic_scores?.project || 0
  const experienceScore = result?.semantic_scores?.experience || 0

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-6 fade-in">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Resume Analyzer</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Match your resume to the job description with AI.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Upload a PDF and paste the job description to receive a full resume score, skill match breakdown, and AI recommendations.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Upload Resume (PDF)</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              {resumeFile && (
                <p className="text-sm text-slate-500">Loaded resume: <span className="font-medium text-slate-900">{resumeName}</span></p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="e.g. Product Manager"
              />
            </div>
            <div className="space-y-2 lg:col-span-1">
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
              <p>Upload a PDF resume and analyze it to your target role.</p>
            </div>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              {loading ? 'Analyzing...' : 'Analyze Resume'}
            </button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="fade-in">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Upload Preview</p>
            <DocumentViewer file={resumeFile} fileName={resumeName} text={resumeText} loading={resumeLoading} />
          </Card>
        </div>
      </div>

      {loading && (
        <Card className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4 fade-in">
          <div className="space-y-3">
            <div className="h-48 rounded-3xl bg-slate-100" />
          </div>
          <div className="space-y-3">
            <div className="h-48 rounded-3xl bg-slate-100" />
          </div>
          <div className="space-y-3">
            <div className="h-48 rounded-3xl bg-slate-100" />
          </div>
          <div className="space-y-3">
            <div className="h-48 rounded-3xl bg-slate-100" />
          </div>
        </Card>
      )}

      {result && (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <Card className="fade-in">
              <CircularProgress value={result.Overall || 0} />
            </Card>

            <Card className="space-y-4 fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Skill Match</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950">Match breakdown</h2>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${scoreColor(result.match_score)}`}>
                  {Math.round(result.match_score || 0)}%
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Matched Skills</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.matched_skills?.map((skill) => (
                      <SkillChip key={skill} label={skill} variant="green" />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Missing Skills</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.missing_skills?.map((skill) => (
                      <SkillChip key={skill} label={skill} variant="red" />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Extra Skills</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.extra_skills?.map((skill) => (
                      <SkillChip key={skill} label={skill} variant="gray" />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="space-y-4 fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Semantic Scores</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950">AI matching confidence</h2>
                </div>
              </div>
              <ProgressBar label="Project Match" value={projectScore} color="bg-blue-600" />
              <ProgressBar label="Experience Match" value={experienceScore} color="bg-sky-500" />
            </Card>

            <Card className="space-y-4 fade-in">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">AI Resume Report</p>
              <div className="space-y-4">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Review</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{result.report?.review || 'No review available.'}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-3xl bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-800">Strengths</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {result.report?.strengths?.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-3xl bg-rose-50 p-4">
                    <p className="text-sm font-semibold text-rose-800">Weaknesses</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {result.report?.weaknesses?.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-3xl bg-sky-50 p-4">
                    <p className="text-sm font-semibold text-sky-800">Improvements</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {result.report?.improvements?.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
