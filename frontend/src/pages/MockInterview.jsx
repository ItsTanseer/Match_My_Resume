import { useMemo, useState } from 'react'
import { evaluateInterview, getMockInterview } from '../services/api.js'
import Card from '../components/Card.jsx'
import DifficultyBadge from '../components/DifficultyBadge.jsx'
import { LoadingSpinner } from '../components/Loading.jsx'
import { useToast } from '../components/Toast.jsx'
import { useResume } from '../services/ResumeContext.jsx'

const categories = [
  { id: 'resume_qns', label: 'Resume Based Questions' },
  { id: 'jd_qns', label: 'JD Based Questions' },
  { id: 'gap_qns', label: 'Gap Questions' },
]

const difficultyMap = {
  0: 'Easy',
  1: 'Medium',
  2: 'Hard',
}

const normalizeQuestions = (data) => ({
  resume_qns: data.resume_qns.map((question, index) => ({
    ...question,
    category: 'resume',
    sourceIndex: index,
  })),
  jd_qns: data.jd_qns.map((question, index) => ({
    ...question,
    category: 'jd',
    sourceIndex: index,
  })),
  gap_qns: data.gap_qns.map((question, index) => ({
    ...question,
    category: 'gap',
    sourceIndex: index,
  })),
})

const questionKey = (question) => (question ? `${question.category}-${question.sourceIndex}` : '')

const getCommonItems = (items) =>
  Object.entries(
    items.reduce((acc, item) => {
      if (!item) return acc
      acc[item] = (acc[item] || 0) + 1
      return acc
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .map(([item]) => item)

export default function MockInterview() {
  const [questionCount, setQuestionCount] = useState(5)
  const { resumeText, resumeLoading, jobDescription } = useResume()
  const [questions, setQuestions] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [evaluations, setEvaluations] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadingAnswer, setLoadingAnswer] = useState(false)
  const { showToast } = useToast()

  const currentList = useMemo(() => {
    if (!questions) return []
    return selectedCategory === 'all'
      ? [...questions.resume_qns, ...questions.jd_qns, ...questions.gap_qns]
      : questions[selectedCategory] || []
  }, [questions, selectedCategory])

  const currentQuestion = useMemo(() => currentList[currentIndex] || null, [currentList, currentIndex])
  const currentQuestionKey = useMemo(() => questionKey(currentQuestion), [currentQuestion])
  const currentAnswer = answers[currentQuestionKey] || ''
  const currentEvaluation = evaluations[currentQuestionKey] || null

  const currentKeys = useMemo(() => currentList.map(questionKey), [currentList])
  const allEvaluated = useMemo(
    () => currentKeys.length > 0 && currentKeys.every((key) => Boolean(evaluations[key])),
    [currentKeys, evaluations],
  )

  const summary = useMemo(() => {
    if (!allEvaluated) return null

    const evaluatedItems = currentKeys.map((key, index) => ({
      ...evaluations[key],
      question: currentList[index]?.question || '',
    }))

    const scores = evaluatedItems.map((item) => item.score ?? 0)
    const averageScore = Number((scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(1))
    const highestScore = Math.max(...scores)
    const lowestScore = Math.min(...scores)
    const strongestQuestion = evaluatedItems.reduce(
      (best, item) => (item.score > best.score ? item : best),
      { score: -Infinity, question: '' },
    ).question
    const weakestQuestion = evaluatedItems.reduce(
      (worst, item) => (item.score < worst.score ? item : worst),
      { score: Infinity, question: '' },
    ).question

    const strengthList = evaluatedItems.flatMap((item) => item.strengths || [])
    const weaknessList = evaluatedItems.flatMap((item) => item.weaknesses || [])
    const missingPointsList = evaluatedItems.flatMap((item) => item.missing_points || [])

    return {
      averageScore,
      highestScore,
      lowestScore,
      answeredCount: evaluatedItems.length,
      strongestQuestion,
      weakestQuestion,
      strongAreas: getCommonItems(strengthList).slice(0, 3),
      weakAreas: getCommonItems(weaknessList).slice(0, 3),
      improvementQuestions: evaluatedItems.filter((item) => item.score < 70).map((item) => item.question),
      mostCommonWeaknesses: getCommonItems(weaknessList).slice(0, 3),
      mostCommonMissingPoints: getCommonItems(missingPointsList).slice(0, 3),
    }
  }, [allEvaluated, currentKeys, currentList, evaluations])

  const handleGenerate = async () => {
    if (resumeLoading) {
      showToast('Resume text is still loading. Please wait.', 'error')
      return
    }
    if (!resumeText || !jobDescription?.trim()) {
      showToast('Please upload a resume and paste a job description.', 'error')
      return
    }

    setLoading(true)
    setQuestions(null)
    setAnswers({})
    setEvaluations({})
    setCurrentIndex(0)
    setSelectedCategory('all')

    try {
      const payload = {
        numqns: questionCount,
        resume: resumeText,
        jd: jobDescription,
      }

      const response = await getMockInterview(payload)
      setQuestions(normalizeQuestions(response.data))
      showToast('Interview questions are ready!')
    } catch (error) {
      showToast('Could not generate questions. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const updateAnswer = (value) => {
    if (!currentQuestionKey) return

    setAnswers((prev) => ({
      ...prev,
      [currentQuestionKey]: value,
    }))

    setEvaluations((prev) => {
      if (!prev[currentQuestionKey]) return prev
      const next = { ...prev }
      delete next[currentQuestionKey]
      return next
    })
  }

  const submitAnswer = async () => {
    if (!currentQuestion) return
    if (!currentAnswer.trim()) {
      showToast('Please type an answer before submitting.', 'error')
      return
    }
    if (currentEvaluation) {
      showToast('Showing saved evaluation for this answer.')
      return
    }

    setLoadingAnswer(true)

    try {
      const response = await evaluateInterview({ question: currentQuestion.question, answer: currentAnswer })
      setEvaluations((prev) => ({
        ...prev,
        [currentQuestionKey]: response.data,
      }))
      showToast('Answer evaluated.')

      const nextIndex = currentIndex + 1
      if (nextIndex < currentList.length) {
        setCurrentIndex(nextIndex)
      }
    } catch (error) {
      showToast('Evaluation failed. Please try again.', 'error')
    } finally {
      setLoadingAnswer(false)
    }
  }

  const handlePrev = () => {
    setCurrentIndex((index) => Math.max(index - 1, 0))
  }

  const showQuestion = (category) => {
    setSelectedCategory(category)
    setCurrentIndex(0)
  }

  return (
    <div className="space-y-6">
      <Card className="fade-in">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Mock Interview</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Practice mock interview questions with AI feedback.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Generate tailored questions, type answers, and get AI evaluation.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Number of Questions</label>
              <input
                type="number"
                min={1}
                max={15}
                value={questionCount}
                onChange={(event) => setQuestionCount(Number(event.target.value))}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
          <div className="flex items-end justify-end">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              {loading ? 'Generating...' : 'Generate Interview'}
            </button>
          </div>
        </div>
      </Card>

      {loading && (
        <Card className="flex items-center justify-center py-16">
          <LoadingSpinner />
        </Card>
      )}

      {questions && (
        <div className="space-y-6">
          <Card className="space-y-5 fade-in">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Interview Setup</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">Choose your question set</h2>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <button
                  onClick={() => showQuestion('all')}
                  className="rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                >
                  Start Complete Interview
                </button>
                <button
                  onClick={() => showQuestion('resume_qns')}
                  className="rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                >
                  Resume Focused
                </button>
                <button
                  onClick={() => showQuestion('jd_qns')}
                  className="rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                >
                  JD Focused
                </button>
                <button
                  onClick={() => showQuestion('gap_qns')}
                  className="rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                >
                Skill gap
                </button>
              </div>
            </div>
          </Card>

          {currentQuestion && (
            <Card className="space-y-6 fade-in">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Question {currentIndex + 1} / {currentList.length}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">{currentQuestion.question}</h2>
                </div>
                <DifficultyBadge difficulty={difficultyMap[currentQuestion.difficulty]} />
              </div>

              <div className="space-y-4">
                <div>
                  <textarea
                    value={currentAnswer}
                    onChange={(event) => updateAnswer(event.target.value)}
                    rows={8}
                    className="mt-4 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Type your answer here..."
                  />
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">Feedback</p>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <p>Score: {currentEvaluation?.score ?? 'Pending'}</p>
                    <p>Weaknesses: {currentEvaluation?.weaknesses?.join(', ') || 'Pending'}</p>
                    <p>Missing Points: {currentEvaluation?.missing_points?.join(', ') || 'Pending'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-slate-200"
                  >
                    Previous Question
                  </button>
                  <button
                    type="button"
                    onClick={submitAnswer}
                    disabled={loadingAnswer}
                    className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                  >
                    {loadingAnswer ? 'Submitting...' : 'Send Answer'}
                  </button>
                </div>
              </div>
            </Card>
          )}

          {summary && (
            <Card className="space-y-5 fade-in">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Current set Summary</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Your progress at a glance</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">Average Score</p>
                  <p className="mt-4 text-4xl font-semibold text-slate-950">{summary.averageScore}%</p>
                  <p className="mt-3 text-sm text-slate-600">Answered: {summary.answeredCount}</p>
                </div>
                
                <div className="rounded-3xl bg-rose-50 p-5">
                  <p className="text-sm font-semibold text-rose-900">Weak Areas</p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    {summary.weakAreas.map((item, index) => (<li key={index}>• {item}</li>))}
                  </ul>
                  <p className="mt-3 text-sm text-slate-700">Lowest: {summary.lowestScore}%</p>
                </div>
                <div className="rounded-3xl bg-sky-50 p-5">
                  <p className="text-sm font-semibold text-sky-900">Questions to Improve</p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    {summary.improvementQuestions.slice(0, 3).map((question, index) => (<li key={index}>• {question}</li>))}
                  </ul>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">Most Common Weaknesses</p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    {summary.mostCommonWeaknesses.map((item, index) => (<li key={index}>• {item}</li>))}
                  </ul>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">Most Common Missing Points</p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    {summary.mostCommonMissingPoints.map((item, index) => (<li key={index}>• {item}</li>))}
                  </ul>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setQuestions(null)
                  setAnswers({})
                  setEvaluations({})
                  setCurrentIndex(0)
                  setSelectedCategory('all')
                }}
                className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Restart Interview
              </button>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
