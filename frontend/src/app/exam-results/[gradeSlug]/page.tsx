'use client'

import React, { useState, useEffect, use, useMemo } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { ThemeToggle } from '@/components/ThemeToggle'
import { GradeResultsResponse, TermCardData, getTermSlug } from '@/lib/types/exam-result'
import {
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Search,
  Users
} from 'lucide-react'

export default function GradeTermHubPage({
  params,
}: {
  params: Promise<{ gradeSlug: string }>
}) {
  const resolvedParams = use(params)
  const gradeSlug = resolvedParams.gradeSlug

  const [data, setData] = useState<GradeResultsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleRefresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<GradeResultsResponse>(`/content/exam-results/${gradeSlug}`)
      setData(res.data)
    } catch (err: unknown) {
      console.error('Error fetching exam results:', err)
      const errorMsg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to load examination terms. Please try again later.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    api
      .get<GradeResultsResponse>(`/content/exam-results/${gradeSlug}`)
      .then((res) => {
        if (!ignore) {
          setData(res.data)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          console.error('Error fetching exam results:', err)
          const errorMsg =
            (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
            'Failed to load examination terms. Please try again later.'
          setError(errorMsg)
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [gradeSlug])

  // Aggregate results into distinct terms given by the admin
  const termCards: TermCardData[] = useMemo(() => {
    if (!data?.results || data.results.length === 0) return []

    const termGroups: Record<string, typeof data.results> = {}

    data.results.forEach((r) => {
      const termName = (r.term || r.exams?.term || 'Evaluation Term').trim()
      if (!termGroups[termName]) {
        termGroups[termName] = []
      }
      termGroups[termName].push(r)
    })

    return Object.entries(termGroups).map(([termName, termResults]) => {
      const totalCandidates = termResults.length
      let totalMarks = 0
      let scoredCount = 0
      let highestMarks = 0
      let lowestMarks = 100
      let passedCount = 0
      let distinctionCount = 0
      const subjectsSet = new Set<string>()
      let academicYear = 2026

      termResults.forEach((r) => {
        if (r.academic_year) academicYear = r.academic_year
        if (r.subject) subjectsSet.add(r.subject)

        if (r.marks !== null && r.marks !== undefined) {
          const m = Number(r.marks)
          totalMarks += m
          scoredCount++
          if (m > highestMarks) highestMarks = m
          if (m < lowestMarks) lowestMarks = m
        }
        const letter = (r.grade_letter || '').trim().toUpperCase()
        if (['A', 'B', 'C', 'S', 'D'].includes(letter) || (r.marks !== null && r.marks !== undefined && r.marks >= 35)) {
          passedCount++
        }
        if (letter === 'A' || (r.marks !== null && r.marks !== undefined && r.marks >= 75)) {
          distinctionCount++
        }
      })

      const averageMarks = scoredCount > 0 ? Math.round((totalMarks / scoredCount) * 10) / 10 : 0
      const passRate = totalCandidates > 0 ? Math.round((passedCount / totalCandidates) * 100) : 0
      if (scoredCount === 0) lowestMarks = 0

      return {
        term: termName,
        slug: getTermSlug(termName),
        academic_year: academicYear,
        total_candidates: totalCandidates,
        average_marks: averageMarks,
        highest_marks: highestMarks,
        lowest_marks: lowestMarks,
        passed_count: passedCount,
        distinction_count: distinctionCount,
        pass_rate: passRate,
        subjects: Array.from(subjectsSet),
      }
    })
  }, [data])

  const filteredTerms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return termCards
    return termCards.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.academic_year.toString().includes(q) ||
        t.subjects.some((s) => s.toLowerCase().includes(q))
    )
  }, [termCards, searchQuery])

  const formattedGradeName =
    data?.grade?.name ||
    gradeSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')

  const termCardGradients = [
    {
      badge: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/80',
      accent: 'from-indigo-600 to-violet-600',
      borderHover: 'group-hover:border-indigo-500/40',
      bar: 'from-indigo-500 to-violet-500',
    },
    {
      badge: 'bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/80',
      accent: 'from-violet-600 to-purple-600',
      borderHover: 'group-hover:border-violet-500/40',
      bar: 'from-violet-500 to-purple-500',
    },
    {
      badge: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/80',
      accent: 'from-emerald-600 to-teal-600',
      borderHover: 'group-hover:border-emerald-500/40',
      bar: 'from-emerald-500 to-teal-500',
    },
    {
      badge: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/80',
      accent: 'from-amber-600 to-orange-600',
      borderHover: 'group-hover:border-amber-500/40',
      bar: 'from-amber-500 to-orange-500',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white block leading-tight">
                Open-LMS
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400 block">
                Exam Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/exam-results"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Grades</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              Home
            </Link>
            <span>/</span>
            <Link href="/exam-results" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              Exam Results
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold">{formattedGradeName}</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Hero Section Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-7 sm:p-10 shadow-2xl border border-indigo-500/20">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                {formattedGradeName} Exam Results
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Select an examination term below to inspect candidate performance, ranked score sheets, and certified mark listings.
              </p>
            </div>

            {/* Quick Metrics Badge */}
            <div className="flex flex-wrap md:flex-col gap-3 shrink-0">
              <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Active Terms
                </span>
                <span className="text-xl sm:text-2xl font-black text-white">
                  {termCards.length} {termCards.length === 1 ? 'Term' : 'Terms'}
                </span>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Candidates
                </span>
                <span className="text-xl sm:text-2xl font-black text-indigo-300">
                  {data?.summary?.total_subjects || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
              Retrieving examination terms for {formattedGradeName}...
            </p>
          </div>
        )}

        {/* Error Banner */}
        {error && !loading && (
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-sm">Failed to Load Examination Terms</h4>
              <p className="text-xs mt-1 leading-relaxed opacity-90">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-3 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loaded Terms Section */}
        {!loading && !error && (
          <div className="space-y-6">
            {/* Search Filter Bar */}
            {termCards.length > 1 && (
              <div className="flex items-center justify-between gap-4">
                <div className="relative max-w-sm w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search examination terms..."
                    className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 shadow-sm"
                  />
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Showing {filteredTerms.length} of {termCards.length} Terms
                </span>
              </div>
            )}

            {/* Term Cards Grid */}
            {filteredTerms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTerms.map((termItem, idx) => {
                  const style = termCardGradients[idx % termCardGradients.length]
                  const targetUrl = `/exam-results/${gradeSlug}/${termItem.slug}`

                  return (
                    <Link
                      key={termItem.term}
                      href={targetUrl}
                      className={`group relative rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 p-6 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 cursor-pointer overflow-hidden ${style.borderHover}`}
                    >
                      {/* Top Accent Strip */}
                      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${style.accent}`} />

                      <div className="space-y-4">
                        {/* Header Badges */}
                        <div className="flex items-start justify-between gap-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold border shadow-xs ${style.badge}`}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{termItem.academic_year}</span>
                          </span>

                          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{termItem.subjects.join(', ') || 'ICT'}</span>
                          </span>
                        </div>

                        {/* Term Name given by admin */}
                        <div>
                          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {termItem.term}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>{termItem.total_candidates} Candidates Evaluated</span>
                          </p>
                        </div>

                        {/* Performance Metrics Box */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Average Score</span>
                            </span>
                            <span className="font-extrabold text-slate-900 dark:text-white">
                              {termItem.average_marks}%
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-200/80 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${style.bar} transition-all duration-500`}
                              style={{ width: `${Math.min(100, Math.max(0, termItem.average_marks))}%` }}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/50 dark:border-white/5 text-[11px]">
                            <div>
                              <span className="text-slate-400 block">Top Score</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {termItem.highest_marks}%
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Distinctions (&apos;A&apos;)</span>
                              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                {termItem.distinction_count} Students
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Action Button */}
                      <div className="pt-5 mt-5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                        <span>View Term Results</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="p-12 sm:p-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-2xl">
                  <Layers className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  No Examination Terms Published Yet
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Results for {formattedGradeName} have not yet been categorized into examination terms by the admin. Please check back soon or browse other grades.
                </p>
                <div className="pt-2">
                  <Link
                    href="/exam-results"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-md shadow-indigo-600/20"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to All Grades</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
