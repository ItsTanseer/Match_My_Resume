export default function DocumentViewer({ file, fileName, text, loading }) {
  const displayName = file?.name || fileName || 'Resume.pdf'
  
  const hasFile = Boolean(file || fileName)

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700 shadow-sm">
      <p className="mb-2 text-sm text-slate-500">Uploaded resume</p>
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-600 shadow-sm">
        <p className="font-medium text-slate-900">{displayName}</p>
        {loading ? (
          <p className="mt-3 text-sm leading-6 text-slate-600">Loading resume text...</p>
        ) : text ? (
          <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
        ) : hasFile ? (
          <p className="mt-3 text-xs text-slate-500">Resume is loaded and preserved, but text preview is not available yet.</p>
        ) : (
          <p className="mt-3 text-xs text-slate-500">No resume uploaded yet.</p>
        )}
      </div>
    </div>
  )
}
