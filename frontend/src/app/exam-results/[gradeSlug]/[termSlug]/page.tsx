'use client'

import React, { useState, useEffect, use, useMemo } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { ThemeToggle } from '@/components/ThemeToggle'
import { GradeResultsResponse, matchTerm } from '@/lib/types/exam-result'
import {
  GraduationCap,
  ArrowLeft,
  Award,
  CheckCircle2,
  Sparkles,
  Search,
  BookOpen,
  AlertCircle,
  RefreshCw,
  Printer,
  TrendingUp,
  Building2,
  Calendar,
  Layers
} from 'lucide-react'

export default function TermResultsPage({
  params,
}: {
  params: Promise<{ gradeSlug: string; termSlug: string }>
}) {
  const resolvedParams = use(params)
  const gradeSlug = resolvedParams.gradeSlug
  const termSlug = resolvedParams.termSlug

  const [data, setData] = useState<GradeResultsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchSubject, setSearchSubject] = useState<string>('')

  const handleRefresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<GradeResultsResponse>(
        `/content/exam-results/${gradeSlug}/${termSlug}`
      )
      setData(res.data)
    } catch (err: unknown) {
      console.error('Error fetching term results:', err)
      const errorMsg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to load term examination results. Please try again later.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    api
      .get<GradeResultsResponse>(`/content/exam-results/${gradeSlug}/${termSlug}`)
      .then((res) => {
        if (!ignore) {
          setData(res.data)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          console.error('Error fetching term results:', err)
          const errorMsg =
            (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
            'Failed to load term examination results. Please try again later.'
          setError(errorMsg)
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [gradeSlug, termSlug])

  // Filtered and sorted results: filtered by search, sorted in descending order considering marks
  const filteredResults = useMemo(() => {
    if (!data?.results) return []

    // Ensure results match the term
    const termMatched = data.results.filter(
      (r) => !termSlug || matchTerm(r.term, termSlug)
    )

    const filtered = termMatched.filter((r) => {
      const q = searchSubject.trim().toLowerCase()
      if (!q) return true
      const studentName = r.student_name || r.student?.full_name || r.profiles?.full_name || ''
      const institute = r.institute || ''
      return (
        (r.subject && r.subject.toLowerCase().includes(q)) ||
        studentName.toLowerCase().includes(q) ||
        institute.toLowerCase().includes(q) ||
        r.grade_letter.toLowerCase().includes(q)
      )
    })

    // Sort strictly in descending order considering marks (highest marks first; null/absent at the bottom)
    return [...filtered].sort((a, b) => {
      const marksA = a.marks !== null && a.marks !== undefined ? Number(a.marks) : -1
      const marksB = b.marks !== null && b.marks !== undefined ? Number(b.marks) : -1
      if (marksB !== marksA) {
        return marksB - marksA
      }
      const nameA = a.student_name || a.student?.full_name || a.profiles?.full_name || ''
      const nameB = b.student_name || b.student?.full_name || b.profiles?.full_name || ''
      return nameA.localeCompare(nameB)
    })
  }, [data, searchSubject, termSlug])

  // Helper for grade letter badge color
  const getGradeBadgeStyles = (letter: string) => {
    const l = (letter || '').toUpperCase().trim()
    switch (l) {
      case 'A':
      case 'A+':
      case 'DISTINCTION':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
      case 'B':
      case 'VERY GOOD':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
      case 'C':
      case 'CREDIT':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
      case 'S':
      case 'D':
      case 'PASS':
        return 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
      case 'W':
      case 'F':
      case 'FAIL':
      case 'REFER':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
      case 'AB':
        return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30'
      default:
        return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30'
    }
  }

  const getStatusText = (marks: number | null, letter: string) => {
    const l = (letter || '').toUpperCase().trim()
    if (l === 'AB') return 'Absent'
    if (l === 'W' || l === 'F') return 'Weak / Remedial'
    if (l === 'A' || (marks !== null && marks >= 75)) return 'Distinction'
    if (l === 'B' || (marks !== null && marks >= 65)) return 'Very Good Pass'
    if (l === 'C' || (marks !== null && marks >= 50)) return 'Credit Pass'
    if (l === 'S' || (marks !== null && marks >= 35)) return 'Simple Pass'
    return 'Refer / Remedial'
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  const formattedGradeName =
    data?.grade?.name ||
    gradeSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')

  // Extract term title from result records or fallback to slug
  const termTitle =
    data?.results?.[0]?.term ||
    termSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')

  const academicYear = data?.results?.[0]?.academic_year || 2026

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 transition-all print:hidden">
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

          <div className="flex items-center gap-2.5">
            <Link
              href={`/exam-results/${gradeSlug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Grade Terms</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center justify-between flex-wrap gap-4 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              Home
            </Link>
            <span>/</span>
            <Link href="/exam-results" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              Exam Results
            </Link>
            <span>/</span>
            <Link
              href={`/exam-results/${gradeSlug}`}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              {formattedGradeName}
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold">{termTitle}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs"
              title="Print results sheet"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
              Retrieving {termTitle} results for {formattedGradeName}...
            </p>
          </div>
        )}

        {/* Error Banner */}
        {error && !loading && (
          <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-sm">Failed to Load Examination Results</h4>
              <p className="text-xs mt-1 leading-relaxed opacity-90">{error}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleRefresh}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition"
                >
                  Try Again
                </button>
                <Link
                  href={`/exam-results/${gradeSlug}`}
                  className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 text-xs font-semibold hover:bg-rose-500/10 transition"
                >
                  Back to Terms
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Loaded Term Content */}
        {!loading && !error && data && (
          <div className="space-y-8">
            {/* Term Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white p-7 sm:p-10 shadow-2xl border border-indigo-500/20">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{academicYear} Academic Year</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-slate-300 text-xs font-bold">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{formattedGradeName}</span>
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                    {termTitle}
                  </h1>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    Official score register and candidate rankings for {formattedGradeName}. Ranked in descending order of marks.
                  </p>
                </div>

                <div className="flex md:flex-col gap-3 shrink-0">
                  <Link
                    href={`/exam-results/${gradeSlug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition shadow-sm backdrop-blur-md"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>All {formattedGradeName} Terms</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Performance Summary Statistics Grid */}
            {data.results.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* 1. Average Marks */}
                <div className="p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Average Score
                    </span>
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                      {data.summary.average_marks}%
                    </span>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-violet-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, data.summary.average_marks))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Total Evaluated Candidates */}
                <div className="p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Candidates
                    </span>
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                      {data.summary.total_subjects}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {data.summary.passed_count} Passed •{' '}
                      {data.summary.total_subjects - data.summary.passed_count} Pending
                    </p>
                  </div>
                </div>

                {/* 3. Distinctions */}
                <div className="p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Distinctions (&apos;A&apos;)
                    </span>
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                      {data.summary.distinction_count}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Top Score: {data.summary.highest_marks}%
                    </p>
                  </div>
                </div>

                {/* 4. Overall Standing */}
                <div className="p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Academic Standing
                    </span>
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      {data.summary.performance_status}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Certified LMS Status
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Filter and Search Bar */}
            {data.results.length > 0 && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 shrink-0">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Ranked by Marks (High → Low)</span>
                  </span>

                  <span className="text-xs font-bold text-slate-400">
                    {filteredResults.length} {filteredResults.length === 1 ? 'Candidate' : 'Candidates'}
                  </span>
                </div>

                {/* Subject / Candidate Search Input */}
                <div className="relative max-w-xs w-full">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchSubject}
                    onChange={(e) => setSearchSubject(e.target.value)}
                    placeholder="Search candidate, institute..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* Results Table (Desktop) / Cards (Mobile) */}
            {filteredResults.length > 0 ? (
              <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 shadow-md overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <th className="py-4 px-4 text-center w-14">Rank</th>
                        <th className="py-4 px-6">Candidate / Student</th>
                        <th className="py-4 px-6">Institute / School</th>
                        <th className="py-4 px-6">Subject & Term</th>
                        <th className="py-4 px-6 text-center">Score / Marks</th>
                        <th className="py-4 px-6 text-center">Grade Letter</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs sm:text-sm">
                      {filteredResults.map((result, idx) => {
                        const marksNum =
                          result.marks !== null && result.marks !== undefined
                            ? Number(result.marks)
                            : null
                        const examTerm = result.term || result.exams?.term || termTitle
                        const examYear =
                          result.academic_year || result.exams?.academic_year || academicYear
                        const status = getStatusText(marksNum, result.grade_letter)
                        const studentName =
                          result.student_name ||
                          result.student?.full_name ||
                          result.profiles?.full_name ||
                          'Candidate'

                        return (
                          <tr
                            key={result.id}
                            className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                          >
                            {/* Rank Column */}
                            <td className="py-4 px-4 text-center">
                              {marksNum !== null && marksNum > 0 ? (
                                idx === 0 ? (
                                  <span
                                    className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-xs border border-amber-500/30 shadow-xs"
                                    title="1st Place"
                                  >
                                    🥇 1
                                  </span>
                                ) : idx === 1 ? (
                                  <span
                                    className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-slate-400/15 text-slate-600 dark:text-slate-300 font-black text-xs border border-slate-400/30 shadow-xs"
                                    title="2nd Place"
                                  >
                                    🥈 2
                                  </span>
                                ) : idx === 2 ? (
                                  <span
                                    className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-700/15 text-amber-700 dark:text-amber-500 font-black text-xs border border-amber-700/30 shadow-xs"
                                    title="3rd Place"
                                  >
                                    🥉 3
                                  </span>
                                ) : (
                                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                                    #{idx + 1}
                                  </span>
                                )
                              ) : (
                                <span className="text-xs font-mono text-slate-400 dark:text-slate-600">
                                  —
                                </span>
                              )}
                            </td>

                            {/* Candidate Name */}
                            <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 text-xs font-black">
                                  {studentName[0].toUpperCase()}
                                </div>
                                <span className="truncate max-w-[180px]">{studentName}</span>
                              </div>
                            </td>

                            {/* Institute */}
                            <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                              {result.institute ? (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate max-w-[160px]">{result.institute}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-600 italic text-xs">
                                  —
                                </span>
                              )}
                            </td>

                            {/* Subject & Term */}
                            <td className="py-4 px-6">
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {result.subject || 'ICT'}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {examTerm} ({examYear})
                                </span>
                              </div>
                            </td>

                            {/* Marks */}
                            <td className="py-4 px-6 text-center">
                              {marksNum !== null ? (
                                <div className="inline-flex flex-col items-center">
                                  <span className="font-black text-slate-900 dark:text-white text-base">
                                    {marksNum}
                                    <span className="text-xs font-normal text-slate-400">/100</span>
                                  </span>
                                  <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                                    <div
                                      className="bg-indigo-500 h-full rounded-full"
                                      style={{ width: `${Math.min(100, Math.max(0, marksNum))}%` }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 font-mono">—</span>
                              )}
                            </td>

                            {/* Grade Letter */}
                            <td className="py-4 px-6 text-center">
                              <span
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-xl font-black text-sm border shadow-xs ${getGradeBadgeStyles(
                                  result.grade_letter
                                )}`}
                              >
                                {result.grade_letter}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                <span>{status}</span>
                              </span>
                            </td>

                            {/* Remarks */}
                            <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                              {result.remarks ? (
                                <span className="italic">&ldquo;{result.remarks}&rdquo;</span>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-600">—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Responsive Cards View */}
                <div className="block md:hidden divide-y divide-slate-100 dark:divide-white/5">
                  {filteredResults.map((result, idx) => {
                    const marksNum =
                      result.marks !== null && result.marks !== undefined
                        ? Number(result.marks)
                        : null
                    const examTerm = result.term || result.exams?.term || termTitle
                    const status = getStatusText(marksNum, result.grade_letter)
                    const studentName =
                      result.student_name ||
                      result.student?.full_name ||
                      result.profiles?.full_name ||
                      'Candidate'

                    return (
                      <div key={result.id} className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 font-black text-xs relative">
                              {studentName[0].toUpperCase()}
                              {marksNum !== null && marksNum > 0 && idx < 3 && (
                                <span className="absolute -top-1.5 -left-1.5 text-xs">
                                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
                                  #{idx + 1}
                                </span>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                  {studentName}
                                </h4>
                              </div>
                              {result.institute && (
                                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-slate-400" />
                                  <span>{result.institute}</span>
                                </p>
                              )}
                              <p className="text-[11px] text-slate-400">
                                {result.subject || 'ICT'} • {examTerm}
                              </p>
                            </div>
                          </div>

                          {/* Grade Badge */}
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-xl font-black text-sm border shadow-xs shrink-0 ${getGradeBadgeStyles(
                              result.grade_letter
                            )}`}
                          >
                            {result.grade_letter}
                          </span>
                        </div>

                        {/* Marks & Status Row */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Score:</span>
                            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                              {marksNum !== null ? `${marksNum} / 100` : '—'}
                            </span>
                          </div>

                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{status}</span>
                          </span>
                        </div>

                        {/* Remarks if present */}
                        {result.remarks && (
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-[11px] text-slate-600 dark:text-slate-300 italic border border-slate-200/60 dark:border-white/5">
                            &ldquo;{result.remarks}&rdquo;
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="p-12 sm:p-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-2xl">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  No Results Found for {termTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  {searchSubject
                    ? `No candidates matched "${searchSubject}" in ${termTitle}.`
                    : `No candidate scores have been recorded for this term in ${formattedGradeName}.`}
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  {searchSubject && (
                    <button
                      onClick={() => setSearchSubject('')}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Clear Search
                    </button>
                  )}
                  <Link
                    href={`/exam-results/${gradeSlug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-md shadow-indigo-600/20"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to {formattedGradeName} Terms</span>
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

