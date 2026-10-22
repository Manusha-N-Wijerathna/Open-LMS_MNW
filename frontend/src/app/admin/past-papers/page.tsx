'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import api from '@/lib/api'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  FileText,
  Plus,
  Search,
  ExternalLink,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Filter,
  RefreshCw,
  ArrowLeft,
  Calendar,
  Globe,
  AlertTriangle,
  X,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
} from 'lucide-react'
import { PastPaper, EXAM_TYPES, MEDIUMS } from '@/lib/types/past-paper'
import { formatDriveEmbedUrl, formatDriveOpenUrl } from '@/lib/drive'

export default function AdminPastPapersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [papers, setPapers] = useState<PastPaper[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(25)

  // Filters
  const [search, setSearch] = useState('')
  const [selectedExamType, setSelectedExamType] = useState('')
  const [selectedMedium, setSelectedMedium] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'' | 'true' | 'false'>('')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Actions state
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteConfirmPaper, setDeleteConfirmPaper] = useState<PastPaper | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [previewPaper, setPreviewPaper] = useState<PastPaper | null>(null)

  // Auth verification
  useEffect(() => {
    let isMounted = true
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          router.push('/admin/login')
          return
        }
        const res = await api.get('/admin/users/me')
        if (res.data.role !== 'admin') {
          await supabase.auth.signOut()
          router.push('/admin/login')
          return
        }
      } catch (err) {
        console.error('Auth verification failed:', err)
        router.push('/admin/login')
      }
    }

    checkAuth()
    return () => {
      isMounted = false
    }
  }, [router])

  // Fetch papers
  const fetchPapers = useCallback(async () => {
    setLoading(true)
    setActionError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', limit.toString())
      if (search.trim()) params.set('search', search.trim())
      if (selectedExamType) params.set('exam_type', selectedExamType)
      if (selectedMedium) params.set('medium', selectedMedium)
      if (selectedStatus) params.set('is_published', selectedStatus)

      const res = await api.get(`/admin/past-papers?${params.toString()}`)
      setPapers(res.data.data || [])
      setTotal(res.data.total || 0)
      if (res.data.warning) {
        setActionError(res.data.warning)
      }
    } catch (err: unknown) {
      console.error('Failed to load past papers:', err)
      const errMessage =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Failed to load past papers'
      setActionError(errMessage)
    } finally {
      setLoading(false)
    }
  }, [page, limit, search, selectedExamType, selectedMedium, selectedStatus])

  useEffect(() => {
    fetchPapers()
  }, [fetchPapers])

  // Toggle publish status
  const handleTogglePublish = async (paper: PastPaper) => {
    setTogglingId(paper.id)
    try {
      const newStatus = !paper.is_published
      await api.put(`/admin/past-papers/${paper.id}`, {
        is_published: newStatus,
      })
      setPapers((prev) =>
        prev.map((p) => (p.id === paper.id ? { ...p, is_published: newStatus } : p))
      )
    } catch (err) {
      console.error('Failed to toggle publish status:', err)
      setActionError('Failed to update publication status')
    } finally {
      setTogglingId(null)
    }
  }

  // Delete paper
  const handleDelete = async () => {
    if (!deleteConfirmPaper) return
    setDeletingId(deleteConfirmPaper.id)
    try {
      await api.delete(`/admin/past-papers/${deleteConfirmPaper.id}`)
      setPapers((prev) => prev.filter((p) => p.id !== deleteConfirmPaper.id))
      setTotal((prev) => Math.max(0, prev - 1))
      setDeleteConfirmPaper(null)
    } catch (err) {
      console.error('Failed to delete past paper:', err)
      setActionError('Failed to delete past paper')
    } finally {
      setDeletingId(null)
    }
  }

  // Quick stats
  const publishedCount = papers.filter((p) => p.is_published).length
  const draftCount = papers.filter((p) => !p.is_published).length
  const hasActiveFilters = Boolean(search || selectedExamType || selectedMedium || selectedStatus)

  const handleClearFilters = () => {
    setSearch('')
    setSelectedExamType('')
    setSelectedMedium('')
    setSelectedStatus('')
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link
              href="/admin/dashboard"
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition flex-shrink-0"
              title="Back to Admin Dashboard"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">
                  Past Papers
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 hidden xs:block truncate">
                  Public PDF Archive & Marking Schemes
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <Link
              href="/past-papers"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Public Library</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <ThemeToggle />
            <Link
              href="/admin/past-papers/new"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-sm sm:shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>Add Paper</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Error Alert */}
        {actionError && (
          <div className="p-3 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-between text-xs sm:text-sm gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="truncate">{actionError}</span>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-xs font-bold hover:underline flex-shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Papers
            </p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {total}
            </p>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <p className="text-[11px] sm:text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Published
            </p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {publishedCount}
            </p>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <p className="text-[11px] sm:text-xs font-medium text-amber-600 dark:text-amber-400">
              Drafts
            </p>
            <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {draftCount}
            </p>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <p className="text-[11px] sm:text-xs font-medium text-indigo-600 dark:text-indigo-400">
              Storage Cloud
            </p>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">
              Google Drive PDF
            </p>
          </div>
        </div>

        {/* Quick Status Segmented Pills (Mobile & Desktop friendly) */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 w-full sm:w-fit overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              setSelectedStatus('')
              setPage(1)
            }}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedStatus === ''
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Papers ({total})
          </button>
          <button
            onClick={() => {
              setSelectedStatus('true')
              setPage(1)
            }}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center justify-center gap-1.5 ${
              selectedStatus === 'true'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Published ({publishedCount})</span>
          </button>
          <button
            onClick={() => {
              setSelectedStatus('false')
              setPage(1)
            }}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center justify-center gap-1.5 ${
              selectedStatus === 'false'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Drafts ({draftCount})</span>
          </button>
        </div>

        {/* Filters Bar */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2.5 sm:space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Search by title, subject..."
                className="w-full pl-9 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Controls Trigger (visible on < md) */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                <span>Filter By Exam & Medium</span>
                {(selectedExamType || selectedMedium) && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                )}
              </button>

              <button
                onClick={() => fetchPapers()}
                disabled={loading}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Desktop Filter Dropdowns (visible on >= md) */}
            <div className="hidden md:flex items-center gap-2.5">
              <div className="relative">
                <select
                  value={selectedExamType}
                  onChange={(e) => {
                    setSelectedExamType(e.target.value)
                    setPage(1)
                  }}
                  className="pl-3 pr-8 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-slate-700 dark:text-slate-200 appearance-none cursor-pointer"
                >
                  <option value="">All Exams</option>
                  {EXAM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={selectedMedium}
                  onChange={(e) => {
                    setSelectedMedium(e.target.value)
                    setPage(1)
                  }}
                  className="pl-3 pr-8 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-slate-700 dark:text-slate-200 appearance-none cursor-pointer"
                >
                  <option value="">All Mediums</option>
                  {MEDIUMS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              <button
                onClick={() => fetchPapers()}
                disabled={loading}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300 disabled:opacity-50 flex items-center justify-center flex-shrink-0"
                title="Refresh papers list"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
              <span className="text-[11px] text-slate-400 font-medium">Filtering:</span>

              {selectedExamType && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 text-[11px] font-semibold">
                  {selectedExamType}
                  <button onClick={() => setSelectedExamType('')} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedMedium && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 text-[11px] font-semibold">
                  {selectedMedium} Medium
                  <button onClick={() => setSelectedMedium('')} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedStatus && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 text-[11px] font-semibold">
                  Status: {selectedStatus === 'true' ? 'Published' : 'Draft'}
                  <button onClick={() => setSelectedStatus('')} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {search && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                  &ldquo;{search}&rdquo;
                  <button onClick={() => setSearch('')} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={handleClearFilters}
                className="text-[11px] font-bold text-red-500 hover:underline ml-1"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Content Section: Desktop Table & Mobile Card View */}
        <div className="space-y-4">
          {loading && papers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-xs sm:text-sm font-medium">Loading past papers...</p>
            </div>
          ) : papers.length === 0 ? (
            <div className="p-10 sm:p-16 text-center space-y-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  No past papers found
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {hasActiveFilters
                    ? 'No papers match your search or filter criteria. Try clearing filters.'
                    : 'Get started by creating your first public past paper.'}
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Clear Filters
                  </button>
                )}
                <Link
                  href="/admin/past-papers/new"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-sm"
                >
                  Create Past Paper
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* 1. MOBILE CARD VIEW (< md screens) */}
              <div className="block md:hidden space-y-3">
                {papers.map((paper) => (
                  <div
                    key={paper.id}
                    className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm space-y-3"
                  >
                    {/* Header tags & Quick Toggle */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-800/40">
                          {paper.exam_type}
                        </span>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                          {paper.year}
                        </span>
                        {paper.grade && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {paper.grade}
                          </span>
                        )}
                      </div>

                      {/* Inline Status Toggle Pill */}
                      <button
                        onClick={() => handleTogglePublish(paper)}
                        disabled={togglingId === paper.id}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition flex-shrink-0 ${
                          paper.is_published
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}
                        title="Click to toggle status"
                      >
                        {togglingId === paper.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : paper.is_published ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-amber-500" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Paper Title */}
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {paper.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {paper.subject}
                        </span>
                        <span>•</span>
                        <span>{paper.medium} Medium</span>
                        <span>•</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                          {paper.paper_type}
                        </span>
                      </div>
                    </div>

                    {/* Drive ID preview line */}
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate bg-slate-50 dark:bg-slate-800/40 px-2 py-1 rounded-lg">
                      ID: {paper.drive_file_id}
                    </div>

                    {/* Action Toolbar */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <Link
                        href={`/admin/past-papers/${paper.id}/edit`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 hover:bg-indigo-100 transition active:scale-95"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Paper</span>
                      </Link>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setPreviewPaper(paper)}
                          className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition"
                          title="Preview PDF"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <a
                          href={formatDriveOpenUrl(paper.drive_file_id) || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition"
                          title="Open Drive"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => setDeleteConfirmPaper(paper)}
                          className="w-8 h-8 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-100 active:scale-95 transition"
                          title="Delete Paper"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 2. DESKTOP TABLE VIEW (>= md screens) */}
              <div className="hidden md:block rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Title & Details</th>
                        <th className="py-3.5 px-4">Exam / Grade</th>
                        <th className="py-3.5 px-4">Subject</th>
                        <th className="py-3.5 px-4">Year & Medium</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {papers.map((paper) => (
                        <tr
                          key={paper.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          {/* Title & Details */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                                PDF
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                                  {paper.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                    ID: {paper.drive_file_id.slice(0, 10)}...
                                  </span>
                                  <span className="text-slate-300 dark:text-slate-700">•</span>
                                  <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                                    {paper.paper_type}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Exam / Grade */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {paper.exam_type}
                            </span>
                            {paper.grade && (
                              <span className="ml-1.5 text-xs text-slate-500 dark:text-slate-400">
                                {paper.grade}
                              </span>
                            )}
                          </td>

                          {/* Subject */}
                          <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                            {paper.subject}
                          </td>

                          {/* Year & Medium */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {paper.year}
                            </span>
                            <span className="text-slate-400 mx-1.5">•</span>
                            <span className="text-slate-500 dark:text-slate-400">
                              {paper.medium}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <button
                              onClick={() => handleTogglePublish(paper)}
                              disabled={togglingId === paper.id}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                                paper.is_published
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                              }`}
                              title="Click to toggle publish status"
                            >
                              {togglingId === paper.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : paper.is_published ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Published</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Draft</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {/* Preview modal button */}
                              <button
                                onClick={() => setPreviewPaper(paper)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                title="Quick Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Open in Drive */}
                              <a
                                href={formatDriveOpenUrl(paper.drive_file_id) || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                title="Open Google Drive File"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>

                              {/* Edit button */}
                              <Link
                                href={`/admin/past-papers/${paper.id}/edit`}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                title="Edit Past Paper"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Link>

                              {/* Delete button */}
                              <button
                                onClick={() => setDeleteConfirmPaper(paper)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                title="Delete Past Paper"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Pagination */}
          {total > limit && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-center sm:text-left">
              <p className="text-xs text-slate-500 order-2 sm:order-1">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} papers
              </p>
              <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold px-2">
                  Page {page} of {Math.ceil(total / limit)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                  className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Filter Sheet Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Filter Past Papers
                </h3>
              </div>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Exam Type */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Examination Type
                </label>
                <select
                  value={selectedExamType}
                  onChange={(e) => {
                    setSelectedExamType(e.target.value)
                    setPage(1)
                  }}
                  className="w-full px-3 py-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">All Examinations</option>
                  {EXAM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Medium */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Medium
                </label>
                <select
                  value={selectedMedium}
                  onChange={(e) => {
                    setSelectedMedium(e.target.value)
                    setPage(1)
                  }}
                  className="w-full px-3 py-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">All Mediums</option>
                  {MEDIUMS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedExamType('')
                  setSelectedMedium('')
                  setMobileFiltersOpen(false)
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition text-center"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-md shadow-indigo-600/20 text-center"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Delete Past Paper?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {deleteConfirmPaper.title}
                </strong>
                ? This will remove its metadata from the LMS. The file in Google Drive will remain
                intact.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmPaper(null)}
                disabled={Boolean(deletingId)}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={Boolean(deletingId)}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-red-600 text-white hover:bg-red-500 transition shadow-md shadow-red-600/20 disabled:opacity-50"
              >
                {deletingId ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Preview Modal */}
      {previewPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full h-[90vh] sm:h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {previewPaper.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                  {previewPaper.exam_type} • {previewPaper.subject} • {previewPaper.year} (
                  {previewPaper.medium})
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <a
                  href={formatDriveOpenUrl(previewPaper.drive_file_id) || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition flex items-center gap-1"
                >
                  <span className="hidden xs:inline">Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setPreviewPaper(null)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-950 relative">
              <iframe
                src={formatDriveEmbedUrl(previewPaper.drive_file_id) || ''}
                className="w-full h-full border-0"
                title={previewPaper.title}
                allow="autoplay"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
