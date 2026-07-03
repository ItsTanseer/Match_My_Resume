import { useEffect, useState } from 'react'

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

export default function SpeechRecorder({ onTranscript }) {
  const [active, setActive] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [seconds, setSeconds] = useState(0)
  const [recognition, setRecognition] = useState(null)

  useEffect(() => {
    if (!SpeechRecognition) return
    const instance = new SpeechRecognition()
    instance.continuous = true
    instance.interimResults = true
    instance.lang = 'en-US'

    instance.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(' ')
      setTranscript(text)
      onTranscript?.(text)
    }

    instance.onend = () => {
      setActive(false)
    }

    setRecognition(instance)
  }, [onTranscript])

  useEffect(() => {
    let timer
    if (active) {
      timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    }
    return () => window.clearInterval(timer)
  }, [active])

  const start = () => {
    if (!recognition) return
    setTranscript('')
    setSeconds(0)
    setActive(true)
    recognition.start()
  }

  const stop = () => {
    if (!recognition) return
    recognition.stop()
    setActive(false)
  }

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-900">Voice Mode</p>
          <p className="text-sm text-slate-500">Record an answer and edit the transcript before sending.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={!recognition || active}
            onClick={start}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Start Recording
          </button>
          <button
            type="button"
            disabled={!active}
            onClick={stop}
            className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            Stop
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg">
          <span className="block h-3.5 w-3.5 animate-pulse rounded-full bg-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{active ? 'Listening...' : 'Ready to record'}</p>
          <p className="text-sm text-slate-500">{active ? `Recording timer: ${seconds}s` : 'Use your microphone to capture speech.'}</p>
        </div>
      </div>
      <textarea
        value={transcript}
        onChange={(event) => {
          setTranscript(event.target.value)
          onTranscript?.(event.target.value)
        }}
        rows={5}
        className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  )
}
