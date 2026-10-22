'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import api from '@/lib/api'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  FileText,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Link2,
  ExternalLink,
  Eye,
  Save,
  Trash2,
  Sparkles,
  RefreshCw,
} from 'lucide-react'
import {
  EXAM_TYPES,
  COMMON_SUBJECTS,
  MEDIUMS,
  PAPER_TYPES,
  COMMON_GRADES,
} from '@/lib/types/past-paper'
import { extractDriveFileId, formatDriveEmbedUrl } from '@/lib/drive'

export default function EditPastPaperPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const id = resolvedParams.id
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [examType, setExamType] = useState<string>('G.C.E. A/L')
  const [customExamType, setCustomExamType] = useState('')
  const [grade, setGrade] = useState<string>('')
  const [subject, setSubject] = useState<string>('Combined Mathematics')
  const [customSubject, setCustomSubject] = useState('')
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [medium, setMedium] = useState<string>('Sinhala')
  const [paperType, setPaperType] = useState<string>('Part I')
  const [customPaperType, setCustomPaperType] = useState('')
  const [driveInput, setDriveInput] = useState('')
  const [isPublished, setIsPublished] = useState(true)

  // Extracted drive ID
  const extractedFileId = extractDriveFileId(driveInput)

  // Auth & fetch paper
  useEffect(() => {
    let isMounted = true
    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          router.push('/admin/login')
          return
        }
        const userRes = await api.get('/admin/users/me')
        if (userRes.data.role !== 'admin') {
          await supabase.auth.signOut()
          router.push('/admin/login')
          return
        }

        // Fetch paper
        const res = await api.get(`/admin/past-papers/${id}`)
        const paper = res.data.data
        if (!isMounted) return

        setTitle(paper.title)
        if (EXAM_TYPES.includes(paper.exam_type as (typeof EXAM_TYPES)[number])) {
          setExamType(paper.exam_type)
        } else {
          setExamType('Other')
          setCustomExamType(paper.exam_type)
        }

        setGrade(paper.grade || '')

        if (COMMON_SUBJECTS.includes(paper.subject as (typeof COMMON_SUBJECTS)[number])) {
          setSubject(paper.subject)
        } else {
          setSubject('Other')
          setCustomSubject(paper.subject)
        }

        setYear(paper.year)
        setMedium(paper.medium)

        if (PAPER_TYPES.includes(paper.paper_type as (typeof PAPER_TYPES)[number])) {
          setPaperType(paper.paper_type)
        } else {
          setPaperType('Other')
          setCustomPaperType(paper.paper_type)
        }

        setDriveInput(paper.drive_file_id)
        setIsPublished(paper.is_published)
      } catch (err) {
        console.error('Failed to load past paper:', err)
        setError('Failed to load past paper details')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    init()
    return () => {
      isMounted = false
    }
  }, [id, router])

  // Auto-generate title helper
  const handleAutoGenerateTitle = () => {
    const activeExam = examType === 'Other' && customExamType ? customExamType : examType
    const activeSubject = subject === 'Other' && customSubject ? customSubject : subject
    const activePaperType =
      paperType === 'Other' && customPaperType ? customPaperType : paperType

    const generated = `${year} ${activeExam} ${activeSubject} - ${activePaperType} (${medium} Medium)`
    setTitle(generated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const finalExamType = examType === 'Other' ? customExamType.trim() : examType
    const finalSubject = subject === 'Other' ? customSubject.trim() : subject
    const finalPaperType = paperType === 'Other' ? customPaperType.trim() : paperType

    if (!title.trim()) {
      setError('Please provide a paper title')
      return
    }
    if (!finalExamType) {
      setError('Please select or specify an exam type')
      return
    }
    if (!finalSubject) {
      setError('Please select or specify a subject')
      return
    }
    if (!extractedFileId) {
      setError('Please provide a valid Google Drive URL or File ID')
      return
    }
    if (year < 1990 || year > 2100) {
      setError('Year must be between 1990 and 2100')
      return
    }

    setSubmitting(true)

    try {
      await api.put(`/admin/past-papers/${id}`, {
        title: title.trim(),
        exam_type: finalExamType,
        grade: grade.trim() ? grade.trim() : null,
        subject: finalSubject,
        year,
        medium,
        paper_type: finalPaperType,
        drive_file_id: extractedFileId,
        is_published: isPublished,
      })

      router.push('/admin/past-papers')
    } catch (err: unknown) {
      console.error('Failed to update past paper:', err)
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Failed to update past paper'
      setError(msg)
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/admin/past-papers/${id}`)
      router.push('/admin/past-papers')
    } catch (err: unknown) {
      console.error('Failed to delete past paper:', err)
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Failed to delete past paper'
      setError(msg)
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Loading paper details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Link
              href="/admin/past-papers"
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition flex-shrink-0"
              title="Back to Past Papers"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                Edit Past Paper
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 hidden xs:block truncate">
                Update metadata and Google Drive file connection
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Form Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {error && (
            <div className="p-3 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-2 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left 2 Cols: Paper Metadata */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Card 1: Core Details */}
              <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 sm:space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    1. Paper Identification
                  </h2>
                  <button
                    type="button"
                    onClick={handleAutoGenerateTitle}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-generate Title</span>
                  </button>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 2023 G.C.E. A/L Combined Mathematics - Part I"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

                {/* Exam Type & Grade */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Exam Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={examType}
                      onChange={(e) => setExamType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    >
                      {EXAM_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    {examType === 'Other' && (
                      <input
                        type="text"
                        placeholder="Specify custom exam type"
                        value={customExamType}
                        onChange={(e) => setCustomExamType(e.target.value)}
                        className="w-full mt-2 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Grade / Level (Optional)
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    >
                      <option value="">None / General</option>
                      {COMMON_GRADES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subject & Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    >
                      {COMMON_SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                      <option value="Other">Other / Custom</option>
                    </select>
                    {subject === 'Other' && (
                      <input
                        type="text"
                        placeholder="Type subject name"
                        value={customSubject}
                        onChange={(e) => setCustomSubject(e.target.value)}
                        className="w-full mt-2 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Year <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1990}
                      max={2100}
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value, 10) || year)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Medium & Paper Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Medium <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={medium}
                      onChange={(e) => setMedium(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    >
                      {MEDIUMS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Paper Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={paperType}
                      onChange={(e) => setPaperType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    >
                      {PAPER_TYPES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                      <option value="Other">Other / Custom</option>
                    </select>
                    {paperType === 'Other' && (
                      <input
                        type="text"
                        placeholder="e.g. MCQ Answers"
                        value={customPaperType}
                        onChange={(e) => setCustomPaperType(e.target.value)}
                        className="w-full mt-2 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Google Drive PDF Link */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    2. Google Drive File Link
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Update the Google Drive sharing link, preview link, or bare File ID
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Link2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={driveInput}
                      onChange={(e) => setDriveInput(e.target.value)}
                      placeholder="https://drive.google.com/file/d/1a2b3c4d5e6f.../view?usp=sharing"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-mono text-xs"
                    />
                  </div>

                  {/* Extraction Status */}
                  {driveInput.trim() && (
                    <div className="flex items-center gap-2 pt-1 text-xs">
                      {extractedFileId ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Extracted Drive File ID:</span>
                          <code className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 font-mono text-[11px]">
                            {extractedFileId}
                          </code>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                          <AlertCircle className="w-4 h-4" />
                          <span>Could not extract a valid Google Drive file ID from this URL</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Publishing & Actions */}
            <div className="space-y-4 sm:space-y-6">
              {/* Publishing Controls */}
              <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Publishing
                </h3>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                      Published for Public
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      Visible to all students in public library without login.
                    </span>
                  </div>
                </label>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={submitting || !extractedFileId}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>{submitting ? 'Saving Changes...' : 'Save Changes'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition border border-red-500/20 active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Past Paper</span>
                  </button>

                  <Link
                    href="/admin/past-papers"
                    className="w-full text-center px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </Link>
                </div>
              </div>

              {/* Live PDF Embed Preview */}
              <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Eye className="w-4 h-4 text-indigo-500" />
                    <span>Live Preview</span>
                  </h3>
                  {extractedFileId && (
                    <a
                      href={`https://drive.google.com/file/d/${extractedFileId}/view`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-indigo-500 transition"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="h-64 sm:h-auto sm:aspect-[3/4] w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden relative flex items-center justify-center">
                  {extractedFileId ? (
                    <iframe
                      src={formatDriveEmbedUrl(extractedFileId) || ''}
                      className="w-full h-full border-0"
                      title="Drive Preview"
                      allow="autoplay"
                    />
                  ) : (
                    <div className="p-4 text-center text-slate-400 text-xs space-y-1">
                      <FileText className="w-8 h-8 mx-auto opacity-40 mb-2" />
                      <p className="font-medium">No Drive URL provided</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Delete Past Paper?
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{title}</strong>? This action will remove its record from Open-LMS.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-red-600 text-white hover:bg-red-500 transition shadow-md shadow-red-600/20 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
