'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
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

interface PastPapersStudioProps {
  embedded?: boolean
  onNotify?: (message: string, type: 'success' | 'error' | 'info') => void
}

export function PastPapersStudio({ embedded = false, onNotify }: PastPapersStudioProps) {
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
      if (onNotify) onNotify(errMessage, 'error')
    } finally {
      setLoading(false)
    }
  }, [page, limit, search, selectedExamType, selectedMedium, selectedStatus, onNotify])

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
      const msg = newStatus ? 'Paper published successfully' : 'Paper moved to drafts'
      if (onNotify) onNotify(msg, 'success')
    } catch (err) {
      console.error('Failed to toggle publish status:', err)
      setActionError('Failed to update publication status')
      if (onNotify) onNotify('Failed to update publication status', 'error')
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
      if (onNotify) onNotify('Past paper deleted successfully', 'success')
    } catch (err) {
      console.error('Failed to delete past paper:', err)
      setActionError('Failed to delete past paper')
      if (onNotify) onNotify('Failed to delete past paper', 'error')
    } finally {
      setDeletingId(null)
    }
  }

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
    <div className="space-y-6">
      {/* Studio Header Bar */}
      <div className="bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05] rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-sm dark:shadow-none flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Past Papers Management Studio
            </h2>
            <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full shrink-0">
              {total} Papers
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Publish, curate, and organize past papers with marking schemes and Google Drive storage.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/past-papers"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/5 transition"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Public Library</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </Link>

          <button
            onClick={() => fetchPapers()}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-600 dark:text-slate-300 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/admin/past-papers/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 shadow-md shadow-indigo-600/20 transition cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Paper</span>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {actionError && (
        <div className="p-3 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-between text-xs sm:text-sm gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="truncate">{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-xs font-bold hover:underline flex-shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 shadow-sm flex flex-col justify-between">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Archives
          </p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {total}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 shadow-sm flex flex-col justify-between">
          <p className="text-[11px] sm:text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Live Published
          </p>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {publishedCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 shadow-sm flex flex-col justify-between">
          <p className="text-[11px] sm:text-xs font-medium text-amber-600 dark:text-amber-400">
            Draft Archives
          </p>
          <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {draftCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 shadow-sm flex flex-col justify-between">
          <p className="text-[11px] sm:text-xs font-medium text-indigo-600 dark:text-indigo-400">
            Storage Engine
          </p>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">
            Google Drive PDF
          </p>
        </div>
      </div>

      {/* Quick Status Segmented Pills */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 w-full sm:w-fit overflow-x-auto scrollbar-none">
        <button
          onClick={() => {
            setSelectedStatus('')
            setPage(1)
          }}
          className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
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
          className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center justify-center gap-1.5 cursor-pointer ${
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
          className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center justify-center gap-1.5 cursor-pointer ${
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
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 shadow-sm space-y-3">
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
              placeholder="Search by title, subject, grade, year..."
              className="w-full pl-9 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Desktop Filter Dropdowns */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-2.5">
            <select
              value={selectedExamType}
              onChange={(e) => {
                setSelectedExamType(e.target.value)
                setPage(1)
              }}
              className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="">All Exam Types</option>
              {EXAM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              value={selectedMedium}
              onChange={(e) => {
                setSelectedMedium(e.target.value)
                setPage(1)
              }}
              className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="">All Mediums</option>
              {MEDIUMS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Papers Table & List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-xs font-semibold text-slate-400">Loading past papers archive...</p>
          </div>
        ) : papers.length === 0 ? (
          <div className="py-16 text-center px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">No Past Papers Found</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'Try adjusting your search criteria or resetting filters.'
                : 'No past papers have been added to the library yet.'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={handleClearFilters}
                className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            ) : (
              <Link
                href="/admin/past-papers/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Paper</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">Title & Details</th>
                  <th className="py-3.5 px-4">Exam Type</th>
                  <th className="py-3.5 px-4">Medium</th>
                  <th className="py-3.5 px-4">Year / Term</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {papers.map((paper) => (
                  <tr
                    key={paper.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1">
                            {paper.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {paper.subject} • {paper.grade || 'All Grades'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 text-xs font-semibold">
                        {paper.exam_type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 text-xs font-semibold">
                        {paper.medium}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                      {paper.year} {paper.paper_type ? `• ${paper.paper_type}` : ''}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleTogglePublish(paper)}
                        disabled={togglingId === paper.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                          paper.is_published
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            paper.is_published ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        <span>{paper.is_published ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* PDF View / Preview */}
                        <a
                          href={formatDriveOpenUrl(paper.drive_file_id) || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition"
                          title="Open PDF in Drive"
                        >
                          <Eye className="w-4 h-4" />
                        </a>

                        {/* Edit Paper */}
                        <Link
                          href={`/admin/past-papers/${paper.id}/edit`}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition"
                          title="Edit Paper"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>

                        {/* Delete Paper */}
                        <button
                          onClick={() => setDeleteConfirmPaper(paper)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
                          title="Delete Paper"
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
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-black text-lg">Delete Past Paper</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to delete{' '}
              <strong className="text-slate-900 dark:text-white">&ldquo;{deleteConfirmPaper.title}&rdquo;</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmPaper(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={Boolean(deletingId)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition disabled:opacity-50 cursor-pointer shadow-md shadow-rose-600/20"
              >
                {deletingId ? 'Deleting...' : 'Delete Paper'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
