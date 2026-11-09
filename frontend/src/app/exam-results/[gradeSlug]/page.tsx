'use client'

import React, { useState, useEffect, use, useMemo } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { ThemeToggle } from '@/components/ThemeToggle'
import { GradeResultsResponse } from '@/lib/types/exam-result'
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
  Filter,
  Building2
} from 'lucide-react'

export default function GradeResultsPage({
  params,
}: {
  params: Promise<{ gradeSlug: string }>
}) {
  const resolvedParams = use(params)
  const gradeSlug = resolvedParams.gradeSlug
  const { user, profile } = useAuthStore()

  const [data, setData] = useState<GradeResultsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTerm, setSelectedTerm] = useState<string>('all')
  const [searchSubject, setSearchSubject] = useState<string>('')

  const handleRefresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<GradeResultsResponse>(`/content/exam-results/${gradeSlug}`)
      setData(res.data)
    } catch (err: unknown) {
      console.error('Error fetching exam results:', err)
      const errorMsg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail 
        || 'Failed to load examination results. Please try again later.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    api.get<GradeResultsResponse>(`/content/exam-results/${gradeSlug}`)
      .then(res => {
        if (!ignore) {
          setData(res.data)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          console.error('Error fetching exam results:', err)
          const errorMsg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail 
            || 'Failed to load examination results. Please try again later.'
          setError(errorMsg)
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [gradeSlug])

  // Extract unique terms from results
  const availableTerms = useMemo(() => {
    if (!data?.results) return []
    const terms = new Set<string>()
    data.results.forEach(r => {
      const term = r.term || r.exams?.term || 'Evaluation'
      terms.add(term)
    })
    return Array.from(terms)
  }, [data])

  // Filtered results based on selected term and search query (subject, student name, institute)
  const filteredResults = useMemo(() => {
    if (!data?.results) return []
    return data.results.filter(r => {
      const term = r.term || r.exams?.term || 'Evaluation'
      const termMatch = selectedTerm === 'all' || (term === selectedTerm)
      const q = searchSubject.trim().toLowerCase()
      if (!q) return termMatch
      const studentName = r.student_name || r.student?.full_name || r.profiles?.full_name || ''
      const institute = r.institute || ''
      const searchMatch =
        (r.subject && r.subject.toLowerCase().includes(q)) ||
        studentName.toLowerCase().includes(q) ||
        institute.toLowerCase().includes(q) ||
        r.grade_letter.toLowerCase().includes(q)
      return termMatch && searchMatch
    })
  }, [data, selectedTerm, searchSubject])

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

  const formattedGradeName = data?.grade?.name 
    || gradeSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300 print:bg-white print:text-black">
      
      {/* Navigation Header (Hidden during Print) */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 transition-all print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <Link
              href="/exam-results"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Grades</span>
            </Link>

            <span className="text-slate-400 dark:text-slate-600">/</span>

            <span className="font-bold text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-xs">
              {formattedGradeName}
            </span>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition"
              title="Print or Save PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Refresh results"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full space-y-8">
        
        {/* Printable Official Header */}
        <div className="hidden print:block text-center border-b pb-6 space-y-2">
          <h1 className="text-2xl font-black uppercase tracking-wider text-black">
            #ict_for_future Learning Management System
          </h1>
          <p className="text-sm font-semibold text-gray-700">
            Official Examination Report • {formattedGradeName}
          </p>
          <p className="text-xs text-gray-500">
            Generated on {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Student Profile / Public Grade Banner */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-900/15 via-white dark:via-slate-900/80 to-violet-900/15 dark:from-indigo-950/40 dark:to-violet-950/40 border border-slate-200/90 dark:border-white/10 shadow-lg print:border-none print:shadow-none print:p-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* User / Hub Info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0 text-xl font-black">
                {user ? (profile?.full_name || user.email || 'S')[0].toUpperCase() : <GraduationCap className="w-8 h-8 text-white" />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider">
                    {formattedGradeName}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{user ? 'Signed In Student' : 'Public Access'}</span>
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {user ? (profile?.full_name || user.email?.split('@')[0]) : `${formattedGradeName} Examination Results`}
                </h1>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user 
                    ? `Account: ${user.email} • Student ID: ${user.id.slice(0, 8)}`
                    : `Published examination records and scores for ${formattedGradeName}`}
                </p>
              </div>
            </div>

            {/* Back Button (Desktop Quick Action) */}
            <div className="print:hidden">
              <Link
                href="/exam-results"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-700/80 font-bold text-xs shadow-sm transition"
              >
                <ArrowLeft className="w-4 h-4 text-indigo-500" />
                <span>Back to All Grades</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs sm:text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={handleRefresh} className="font-bold underline hover:no-underline ml-4">
              Retry
            </button>
          </div>
        )}

        {/* Loading State Skeleton */}
        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 animate-pulse" />
              ))}
            </div>
            <div className="h-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 animate-pulse" />
          </div>
        )}

        {/* Loaded Results Content */}
        {!loading && data && (
          <>
            {/* Statistical Performance Cards */}
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

                {/* 2. Total Evaluated Subjects */}
                <div className="p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Subjects Evaluated
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
                      {data.summary.passed_count} Passed • {data.summary.total_subjects - data.summary.passed_count} Pending
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
                      Highest Score: {data.summary.highest_marks}%
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

            {/* Filter and Search Bar (Hidden during Print) */}
            {data.results.length > 0 && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 print:hidden">
                
                {/* Term Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Term:</span>
                  </span>

                  <button
                    onClick={() => setSelectedTerm('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                      selectedTerm === 'all'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    All Terms ({data.results.length})
                  </button>

                  {availableTerms.map((term, idx) => {
                    const count = data.results.filter(r => (r.exams?.term || 'Evaluation') === term).length
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedTerm(term)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                          selectedTerm === term
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {term} ({count})
                      </button>
                    )
                  })}
                </div>

                {/* Subject Search Input */}
                <div className="relative max-w-xs w-full">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchSubject}
                    onChange={(e) => setSearchSubject(e.target.value)}
                    placeholder="Search subject..."
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
                      {filteredResults.map((result) => {
                        const marksNum = result.marks !== null && result.marks !== undefined ? Number(result.marks) : null
                        const examTitle = result.exams?.title || 'Term Evaluation'
                        const examTerm = result.term || result.exams?.term || 'Current Term'
                        const examYear = result.academic_year || result.exams?.academic_year || 2026
                        const status = getStatusText(marksNum, result.grade_letter)
                        const studentName = result.student_name || result.student?.full_name || result.profiles?.full_name || 'Candidate'

                        return (
                          <tr
                            key={result.id}
                            className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                          >
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
                                <span className="text-slate-400 dark:text-slate-600 italic text-xs">—</span>
                              )}
                            </td>

                            {/* Subject & Term */}
                            <td className="py-4 px-6">
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {result.subject || 'ICT'}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {examTerm} • {examTitle} ({examYear})
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
                  {filteredResults.map((result) => {
                    const marksNum = result.marks !== null && result.marks !== undefined ? Number(result.marks) : null
                    const examTerm = result.term || result.exams?.term || 'Evaluation'
                    const status = getStatusText(marksNum, result.grade_letter)
                    const studentName = result.student_name || result.student?.full_name || result.profiles?.full_name || 'Candidate'

                    return (
                      <div key={result.id} className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 font-black text-xs">
                              {studentName[0].toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                {studentName}
                              </h4>
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
              /* Empty State: No results published yet for this student */
              <div className="rounded-3xl p-8 sm:p-14 text-center bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 shadow-sm max-w-xl mx-auto space-y-5">
                <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 mx-auto flex items-center justify-center shadow-inner">
                  <GraduationCap className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    No Examination Results Published Yet
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                    Your course instructor or coordinator has not published examination marks under <strong className="text-slate-800 dark:text-slate-200">{formattedGradeName}</strong> for your student account yet.
                  </p>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/exam-results"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to All Grades</span>
                  </Link>

                  <button
                    onClick={handleRefresh}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Check Again</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-white/5 py-6 bg-white/60 dark:bg-slate-950/60 text-center text-xs text-slate-500 dark:text-slate-400 print:hidden">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} #ict_for_future LMS Platform • Confidential Student Record</p>
        </div>
      </footer>
    </div>
  )
}
