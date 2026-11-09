'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { ThemeToggle } from '@/components/ThemeToggle'
import { GradeHubCardData } from '@/lib/types/exam-result'
import {
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Layers,
  Award,
  CheckCircle2,
  Search,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

export default function ExamResultsHubPage() {
  const router = useRouter()
  const { user, profile } = useAuthStore()
  const [grades, setGrades] = useState<GradeHubCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleRefresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/content/exam-results/grades')
      if (res.data && Array.isArray(res.data.grades)) {
        setGrades(res.data.grades)
      } else {
        setGrades([])
      }
    } catch (err) {
      console.error('Error loading grades for exam results:', err)
      setError('Unable to load available grades right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false

    api.get('/content/exam-results/grades')
      .then(res => {
        if (!ignore) {
          if (res.data && Array.isArray(res.data.grades)) {
            setGrades(res.data.grades)
          } else {
            setGrades([])
          }
          setLoading(false)
        }
      })
      .catch(err => {
        if (!ignore) {
          console.error('Error loading grades for exam results:', err)
          setError('Unable to load available grades right now. Please try again.')
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [user])

  const filteredGrades = grades.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.active_terms.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
    g.academic_year.toString().includes(searchQuery)
  )

  const gradeGradients = [
    'from-indigo-600 via-indigo-500 to-blue-600 shadow-indigo-500/20 group-hover:shadow-indigo-500/40',
    'from-violet-600 via-purple-500 to-pink-600 shadow-purple-500/20 group-hover:shadow-purple-500/40',
    'from-emerald-600 via-teal-500 to-cyan-600 shadow-emerald-500/20 group-hover:shadow-emerald-500/40',
    'from-amber-600 via-orange-500 to-red-600 shadow-amber-500/20 group-hover:shadow-amber-500/40',
    'from-blue-600 via-cyan-500 to-indigo-600 shadow-blue-500/20 group-hover:shadow-blue-500/40',
    'from-rose-600 via-pink-500 to-violet-600 shadow-rose-500/20 group-hover:shadow-rose-500/40',
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 dark:from-white dark:via-indigo-200 dark:to-cyan-400 bg-clip-text text-transparent tracking-tight">
                #ict_for_future
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 -mt-0.5">
                Exam Results Portal
              </span>
            </div>
          </Link>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to LMS</span>
              <span className="sm:hidden">Home</span>
            </Link>

            <ThemeToggle />

            {/* Profile link if authenticated */}
            {user && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {(profile?.full_name || user.email || 'S')[0].toUpperCase()}
                </div>
                <span className="hidden md:inline truncate max-w-[120px]">
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-10">
        
        {/* Hero Banner Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/10 via-violet-900/5 to-cyan-900/10 dark:from-indigo-950/50 dark:via-slate-900/60 dark:to-violet-950/40 border border-slate-200 dark:border-white/10 p-6 sm:p-10 shadow-xl">
          {/* Ambient Blur Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/15 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-indigo-500" />
              <span>Official Academic Evaluation Hub</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Student Examination <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Results & Performance
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Access official published examination marks, subject grades, and term evaluation reports.
              Select any curriculum grade below to view results.
            </p>

            {/* Quick Search & Filter Bar */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by grade or term..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 shadow-sm"
                />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-200/70 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Grades Grid Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              <span>Available Grade Hubs</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Select your academic grade level to review evaluation reports.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Refresh grades"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs sm:text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={handleRefresh}
              className="font-bold underline hover:no-underline ml-4"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 animate-pulse space-y-4 shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                <div className="flex gap-1.5 pt-2">
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-16" />
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-16" />
                </div>
                <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Responsive Grade Cards Grid */}
        {!loading && filteredGrades.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGrades.map((grade, index) => {
              const gradient = gradeGradients[index % gradeGradients.length]
              const targetUrl = `/exam-results/${grade.slug}`

              return (
                <div
                  key={grade.id || grade.slug}
                  onClick={() => router.push(targetUrl)}
                  className="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl p-6 bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200/90 dark:border-white/10 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer overflow-hidden"
                >
                  {/* Subtle top card glow accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div>
                    {/* Top Header: Grade Icon & Year Pill */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-110`}>
                        <GraduationCap className="w-6 h-6" />
                      </div>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        <Calendar className="w-3 h-3 text-indigo-500" />
                        <span>{grade.academic_year || 2026}</span>
                      </div>
                    </div>

                    {/* Grade Name */}
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {grade.name}
                    </h3>

                    {/* Published status if user has results */}
                    {grade.has_results && (
                      <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Your Results Available</span>
                      </div>
                    )}

                    {/* Active Examination Terms */}
                    <div className="mt-4 space-y-1.5">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                        Active Terms:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {grade.active_terms.map((term, tIdx) => (
                          <span
                            key={tIdx}
                            className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Link Button */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                    <Link
                      href={targetUrl}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white/10 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-white font-bold text-xs flex items-center justify-between transition-colors shadow-sm group/btn"
                    >
                      <span>View Grade Results</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Empty Search Results */}
        {!loading && filteredGrades.length === 0 && (
          <div className="rounded-3xl p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 space-y-4 max-w-md mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 mx-auto flex items-center justify-center">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No matching grades found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              We couldn&apos;t find any grades matching &ldquo;{searchQuery}&rdquo;. Try another keyword or reset the filter.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition shadow"
            >
              Reset Search
            </button>
          </div>
        )}

       
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-white/5 py-6 bg-white/60 dark:bg-slate-950/60 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} #ict_for_future LMS Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
