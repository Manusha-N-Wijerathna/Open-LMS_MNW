'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  FileText,
  Search,
  Download,
  ExternalLink,
  BookOpen,
  Filter,
  RefreshCw,
  ArrowRight,
  GraduationCap,
  Calendar,
  Languages,
  X,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react'
import {
  PastPaper,
  EXAM_TYPES,
  COMMON_SUBJECTS,
  MEDIUMS,
  PAPER_TYPES,
} from '@/lib/types/past-paper'
import { formatDriveDownloadUrl, formatDriveOpenUrl } from '@/lib/drive'

export default function PublicPastPapersPage() {
  const [papers, setPapers] = useState<PastPaper[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(12)

  // Filters
  const [search, setSearch] = useState('')
  const [selectedExamType, setSelectedExamType] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedMedium, setSelectedMedium] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedPaperType, setSelectedPaperType] = useState('')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const fetchPapers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', limit.toString())
      if (search.trim()) params.set('search', search.trim())
      if (selectedExamType) params.set('exam_type', selectedExamType)
      if (selectedSubject) params.set('subject', selectedSubject)
      if (selectedMedium) params.set('medium', selectedMedium)
      if (selectedYear) params.set('year', selectedYear)
      if (selectedPaperType) params.set('paper_type', selectedPaperType)

      const res = await axios.get(`/api/content/past-papers?${params.toString()}`)
      setPapers(res.data.data || [])
      setTotal(res.data.total || 0)
    } catch (err) {
      console.error('Error fetching past papers:', err)
      setPapers([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [
    page,
    limit,
    search,
    selectedExamType,
    selectedSubject,
    selectedMedium,
    selectedYear,
    selectedPaperType,
  ])

  useEffect(() => {
    fetchPapers()
  }, [fetchPapers])

  const activeFilterCount = [
    Boolean(selectedExamType),
    Boolean(selectedSubject),
    Boolean(selectedMedium),
    Boolean(selectedYear),
    Boolean(selectedPaperType),
  ].filter(Boolean).length

  const hasAnyFilter = Boolean(search || activeFilterCount > 0)

  const handleClearFilters = () => {
    setSearch('')
    setSelectedExamType('')
    setSelectedSubject('')
    setSelectedMedium('')
    setSelectedYear('')
    setSelectedPaperType('')
    setPage(1)
  }

  // Generate Year options (current year down to 2000)
  const currentYear = new Date().getFullYear()
  const yearsList = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform flex-shrink-0">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm sm:text-lg tracking-tight bg-gradient-to-r from-slate-900 to-indigo-600 dark:from-white dark:to-indigo-400 bg-clip-text text-transparent leading-none">
                  #ict_for_future
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400 mt-0.5 sm:mt-0">
                  Papers Library
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Back to LMS</span>
              <span className="xs:hidden">Home</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-6 sm:pt-14 sm:pb-12 border-b border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-b from-indigo-500/10 via-violet-500/5 to-transparent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-[11px] sm:text-xs font-semibold">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span>Free & Open Examination Documents</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Official Past Papers & Marking Schemes
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed px-2">
            Access authentic G.C.E. Advanced Level, Ordinary Level, and Grade 5 Scholarship papers
            with official answer keys in Sinhala, English, and Tamil.
          </p>

          {/* Main Search Input */}
          <div className="max-w-2xl mx-auto pt-2 sm:pt-4">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 sm:left-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Search by subject, examination, or topic..."
                className="w-full pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-md shadow-indigo-500/5 text-xs sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-4 sm:space-y-6">
        {/* Quick Filter Section */}
        <div className="space-y-3 pb-2 border-b border-slate-200/70 dark:border-slate-800/70">
          {/* Exam Type Horizontal Scroll Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
            <button
              onClick={() => {
                setSelectedExamType('')
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex-shrink-0 ${
                selectedExamType === ''
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Examinations
            </button>
            {EXAM_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setSelectedExamType(selectedExamType === t ? '' : t)
                  setPage(1)
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex-shrink-0 ${
                  selectedExamType === t
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Mobile Filters Drawer Trigger (visible on screens < md) */}
            <div className="flex md:hidden items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm hover:border-indigo-500 transition"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                <span>Filter & Refine</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {hasAnyFilter && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200/50 dark:border-red-900/40 hover:bg-red-100 transition whitespace-nowrap"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Desktop Filters (visible on screens >= md) */}
            <div className="hidden md:flex items-center gap-2.5 flex-wrap">
              {/* Subject Selector */}
              <div className="relative">
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value)
                    setPage(1)
                  }}
                  className="pl-3 pr-8 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 max-w-[190px] truncate appearance-none cursor-pointer"
                >
                  <option value="">All Subjects</option>
                  {COMMON_SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Medium Selector */}
              <div className="relative">
                <select
                  value={selectedMedium}
                  onChange={(e) => {
                    setSelectedMedium(e.target.value)
                    setPage(1)
                  }}
                  className="pl-3 pr-7 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
                >
                  <option value="">All Mediums</option>
                  {MEDIUMS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Year Selector */}
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value)
                    setPage(1)
                  }}
                  className="pl-3 pr-7 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
                >
                  <option value="">All Years</option>
                  {yearsList.map((y) => (
                    <option key={y} value={y.toString()}>
                      {y}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Paper Type Selector */}
              <div className="relative">
                <select
                  value={selectedPaperType}
                  onChange={(e) => {
                    setSelectedPaperType(e.target.value)
                    setPage(1)
                  }}
                  className="pl-3 pr-7 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
                >
                  <option value="">All Types</option>
                  {PAPER_TYPES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {hasAnyFilter && (
                <button
                  onClick={handleClearFilters}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition whitespace-nowrap"
                  title="Reset filters"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Results count text */}
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium ml-auto">
              {loading ? 'Searching archive...' : `${total} past ${total === 1 ? 'paper' : 'papers'}`}
            </p>
          </div>

          {/* Active Filter Tags (Removable Pills) */}
          {hasAnyFilter && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Active:</span>

              {selectedExamType && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 text-[11px] font-semibold">
                  Exam: {selectedExamType}
                  <button onClick={() => setSelectedExamType('')} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedSubject && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 text-[11px] font-semibold">
                  Subject: {selectedSubject}
                  <button onClick={() => setSelectedSubject('')} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedMedium && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 text-[11px] font-semibold">
                  Medium: {selectedMedium}
                  <button onClick={() => setSelectedMedium('')} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedYear && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 text-[11px] font-semibold">
                  Year: {selectedYear}
                  <button onClick={() => setSelectedYear('')} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedPaperType && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 text-[11px] font-semibold">
                  Type: {selectedPaperType}
                  <button onClick={() => setSelectedPaperType('')} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                  &ldquo;{search}&rdquo;
                  <button onClick={() => setSearch('')} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Papers Grid */}
        {loading ? (
          <div className="py-16 sm:py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
            <RefreshCw className="w-7 h-7 sm:w-8 sm:h-8 animate-spin text-indigo-500" />
            <p className="text-xs sm:text-sm font-medium">Loading examination archive...</p>
          </div>
        ) : papers.length === 0 ? (
          <div className="py-14 sm:py-20 text-center space-y-4 px-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                No past papers found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {hasAnyFilter
                  ? 'We couldn’t find any past papers matching your criteria. Try resetting filters or using a broader search query.'
                  : 'No past papers have been published yet. Please check back soon.'}
              </p>
            </div>
            {hasAnyFilter && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-600/20"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
              {papers.map((paper) => (
                <div
                  key={paper.id}
                  className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Card Header & Content */}
                  <div className="p-4 sm:p-5 pb-3 space-y-2.5 sm:space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-800/40 truncate max-w-[70%]">
                        {paper.exam_type}
                      </span>
                      <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                        {paper.year}
                      </span>
                    </div>

                    <Link
                      href={`/past-papers/${paper.id}`}
                      className="block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                    >
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {paper.title}
                      </h3>
                    </Link>

                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {paper.subject}
                      </span>
                      <span>•</span>
                      <span>{paper.medium}</span>
                      <span>•</span>
                      <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold text-[10px] sm:text-[11px]">
                        {paper.paper_type}
                      </span>
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Card Footer Actions */}
                  <div className="p-3 sm:p-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-2">
                    <Link
                      href={`/past-papers/${paper.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 transition shadow-sm shadow-indigo-600/20 group/btn"
                    >
                      <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Read Online</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform flex-shrink-0" />
                    </Link>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <a
                        href={formatDriveDownloadUrl(paper.drive_file_id) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 active:scale-95 transition"
                        title="Download PDF directly"
                        aria-label="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <a
                        href={formatDriveOpenUrl(paper.drive_file_id) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 active:scale-95 transition"
                        title="Open in Google Drive"
                        aria-label="Open in Google Drive"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {total > limit && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-slate-200/70 dark:border-slate-800/70 text-center sm:text-left">
                <p className="text-xs text-slate-500 order-2 sm:order-1">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} papers
                </p>
                <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
                  <button
                    onClick={() => {
                      setPage((p) => Math.max(1, p - 1))
                      window.scrollTo({ top: 250, behavior: 'smooth' })
                    }}
                    disabled={page <= 1}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition shadow-sm"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-semibold px-2 whitespace-nowrap">
                    Page {page} of {Math.ceil(total / limit)}
                  </span>
                  <button
                    onClick={() => {
                      setPage((p) => p + 1)
                      window.scrollTo({ top: 250, behavior: 'smooth' })
                    }}
                    disabled={page >= Math.ceil(total / limit)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Filters Drawer / Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Drawer Header */}
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

            {/* Filter Fields */}
            <div className="space-y-3.5">
              {/* Subject */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value)
                    setPage(1)
                  }}
                  className="w-full px-3 py-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">All Subjects</option>
                  {COMMON_SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Medium & Year Grid */}
              <div className="grid grid-cols-2 gap-3">
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

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value)
                      setPage(1)
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">All Years</option>
                    {yearsList.map((y) => (
                      <option key={y} value={y.toString()}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Paper Type */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Paper Type
                </label>
                <select
                  value={selectedPaperType}
                  onChange={(e) => {
                    setSelectedPaperType(e.target.value)
                    setPage(1)
                  }}
                  className="w-full px-3 py-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">All Types</option>
                  {PAPER_TYPES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="pt-2 flex items-center gap-2">
              {hasAnyFilter && (
                <button
                  type="button"
                  onClick={() => {
                    handleClearFilters()
                    setMobileFiltersOpen(false)
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition text-center"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-md shadow-indigo-600/20 text-center"
              >
                Apply Filters ({total} results)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 py-6 sm:py-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1.5 px-4">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          Open-LMS • Sri Lanka National Examination Archive
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          All examination papers and marking schemes are provided for non-commercial educational purposes.
        </p>
      </footer>
    </div>
  )
}
