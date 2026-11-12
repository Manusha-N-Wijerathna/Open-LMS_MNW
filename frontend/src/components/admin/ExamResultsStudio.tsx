'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { Grade, ExamResult, VALID_GRADE_LETTERS, ValidGradeLetter } from '@/lib/types/exam-result'
import {
  Plus,
  Search,
  ExternalLink,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Filter,
  RefreshCw,
  Building2,
  Award,
  BookOpen,
  Layers,
  X,
  TrendingUp,
  AlertTriangle,
  FolderPlus,
  Users
} from 'lucide-react'

interface ExamResultsStudioProps {
  embedded?: boolean
  onNotify?: (message: string, type: 'success' | 'error' | 'info') => void
}

export function ExamResultsStudio({ embedded = false, onNotify }: ExamResultsStudioProps) {
  // Grades state
  const [grades, setGrades] = useState<Grade[]>([])
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null)
  const [gradesLoading, setGradesLoading] = useState(true)

  // Exam Results state
  const [results, setResults] = useState<ExamResult[]>([])
  const [resultsLoading, setResultsLoading] = useState(false)

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [gradeFilter, setGradeFilter] = useState<string>('all')

  // Grade Modals
  const [showAddGradeModal, setShowAddGradeModal] = useState(false)
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null)
  const [gradeForm, setGradeForm] = useState({ name: '', display_order: 1 })
  const [savingGrade, setSavingGrade] = useState(false)
  const [deleteGradeTarget, setDeleteGradeTarget] = useState<Grade | null>(null)
  const [deletingGrade, setDeletingGrade] = useState(false)

  // Result Modals
  const [showResultModal, setShowResultModal] = useState(false)
  const [editingResult, setEditingResult] = useState<ExamResult | null>(null)
  const [savingResult, setSavingResult] = useState(false)
  const [deleteResultTarget, setDeleteResultTarget] = useState<ExamResult | null>(null)
  const [deletingResult, setDeletingResult] = useState(false)

  const [resultForm, setResultForm] = useState<{
    student_name: string
    institute: string
    marks: string
    grade_letter: ValidGradeLetter
    subject: string
    term: string
    academic_year: number
    remarks: string
  }>({
    student_name: '',
    institute: '',
    marks: '',
    grade_letter: 'A',
    subject: 'ICT',
    term: '1st Term Evaluation',
    academic_year: new Date().getFullYear(),
    remarks: '',
  })

  const notify = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      if (onNotify) {
        onNotify(message, type)
      }
    },
    [onNotify]
  )

  // Fetch grades helper
  const fetchGrades = useCallback(async () => {
    setGradesLoading(true)
    try {
      const res = await api.get('/content/exam-results/grades')
      if (res.data && Array.isArray(res.data.grades)) {
        setGrades(res.data.grades)
        if (res.data.grades.length > 0 && selectedGradeId === null) {
          setSelectedGradeId(res.data.grades[0].id)
        }
      }
    } catch (err: unknown) {
      console.error('Failed to load grades for exam results:', err)
      notify('Failed to load grades', 'error')
    } finally {
      setGradesLoading(false)
    }
  }, [selectedGradeId, notify])

  // Initial Fetch Grades
  useEffect(() => {
    let ignore = false
    api
      .get('/content/exam-results/grades')
      .then((res) => {
        if (!ignore && res.data && Array.isArray(res.data.grades)) {
          setGrades(res.data.grades)
          if (res.data.grades.length > 0) {
            setSelectedGradeId((prev) => (prev !== null ? prev : res.data.grades[0].id))
          }
          setGradesLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Failed to load grades:', err)
          notify('Failed to load grades', 'error')
          setGradesLoading(false)
        }
      })
    return () => {
      ignore = true
    }
  }, [notify])

  // Fetch Exam Results helper
  const fetchResults = useCallback(
    async (gradeId: number) => {
      setResultsLoading(true)
      try {
        const res = await api.get<{ results: ExamResult[] }>(
          `/admin/exam-results?grade_id=${gradeId}`
        )
        setResults(res.data?.results || [])
      } catch (err: unknown) {
        console.error('Failed to load exam results:', err)
        notify('Failed to load exam results for this grade', 'error')
        setResults([])
      } finally {
        setResultsLoading(false)
      }
    },
    [notify]
  )

  // Fetch Exam Results whenever selectedGradeId changes
  useEffect(() => {
    if (selectedGradeId === null) return
    let ignore = false

    api
      .get<{ results: ExamResult[] }>(`/admin/exam-results?grade_id=${selectedGradeId}`)
      .then((res) => {
        if (!ignore) {
          setResults(res.data?.results || [])
          setResultsLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Failed to load exam results:', err)
          notify('Failed to load exam results for this grade', 'error')
          setResults([])
          setResultsLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [selectedGradeId, notify])

  // Active Grade object
  const activeGrade = useMemo(() => {
    return grades.find((g) => g.id === selectedGradeId) || null
  }, [grades, selectedGradeId])

  // Summary statistics for the active grade
  const stats = useMemo(() => {
    const total = results.length
    let totalMarks = 0
    let scoredCount = 0
    let distinctions = 0
    let passed = 0
    let absents = 0

    results.forEach((r) => {
      const letter = (r.grade_letter || '').trim().toUpperCase()
      if (letter === 'AB') {
        absents++
        return
      }
      if (r.marks !== null && r.marks !== undefined) {
        totalMarks += Number(r.marks)
        scoredCount++
      }
      if (['A', 'B', 'C', 'S'].includes(letter) || (r.marks !== null && r.marks >= 35)) {
        passed++
      }
      if (letter === 'A' || (r.marks !== null && r.marks >= 75)) {
        distinctions++
      }
    })

    const average = scoredCount > 0 ? Math.round((totalMarks / scoredCount) * 10) / 10 : 0
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0

    return { total, average, distinctions, passed, absents, passRate }
  }, [results])

  // Filtered and sorted results: descending order considering marks
  const filteredResults = useMemo(() => {
    const filtered = results.filter((r) => {
      const q = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !q ||
        r.student_name.toLowerCase().includes(q) ||
        (r.institute && r.institute.toLowerCase().includes(q)) ||
        (r.subject && r.subject.toLowerCase().includes(q)) ||
        r.grade_letter.toLowerCase().includes(q)

      const matchesGradeLetter =
        gradeFilter === 'all' ||
        r.grade_letter.toLowerCase() === gradeFilter.toLowerCase()

      return matchesSearch && matchesGradeLetter
    })

    return [...filtered].sort((a, b) => {
      const marksA = a.marks !== null && a.marks !== undefined ? Number(a.marks) : -1
      const marksB = b.marks !== null && b.marks !== undefined ? Number(b.marks) : -1
      if (marksB !== marksA) {
        return marksB - marksA
      }
      return (a.student_name || '').localeCompare(b.student_name || '')
    })
  }, [results, searchQuery, gradeFilter])

  // Auto-calculate grade letter when marks change
  const handleMarksChange = (val: string) => {
    const numeric = parseFloat(val)
    let autoLetter: ValidGradeLetter = resultForm.grade_letter

    if (!isNaN(numeric)) {
      if (numeric >= 75) autoLetter = 'A'
      else if (numeric >= 65) autoLetter = 'B'
      else if (numeric >= 50) autoLetter = 'C'
      else if (numeric >= 35) autoLetter = 'S'
      else autoLetter = 'W'
    }

    setResultForm((prev) => ({
      ...prev,
      marks: val,
      grade_letter: autoLetter,
    }))
  }

  // Save Grade
  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gradeForm.name.trim()) {
      notify('Please enter a grade name', 'error')
      return
    }

    setSavingGrade(true)
    try {
      if (editingGrade) {
        await api.put(`/admin/grades/${editingGrade.id}`, gradeForm)
        notify('Grade updated successfully', 'success')
      } else {
        const res = await api.post('/admin/grades', gradeForm)
        notify('Grade created successfully', 'success')
        if (res.data?.id) {
          setSelectedGradeId(res.data.id)
        }
      }
      setShowAddGradeModal(false)
      setEditingGrade(null)
      setGradeForm({ name: '', display_order: 1 })
      await fetchGrades()
    } catch (err: unknown) {
      console.error('Error saving grade:', err)
      const errorMsg =
        (err as { response?: { data?: { detail?: string; error?: string } } })?.response?.data
          ?.detail ||
        (err as { response?: { data?: { detail?: string; error?: string } } })?.response?.data
          ?.error ||
        'Failed to save grade'
      notify(errorMsg, 'error')
    } finally {
      setSavingGrade(false)
    }
  }

  // Delete Grade
  const handleDeleteGrade = async () => {
    if (!deleteGradeTarget) return
    setDeletingGrade(true)
    try {
      await api.delete(`/admin/grades/${deleteGradeTarget.id}`)
      notify(`Grade "${deleteGradeTarget.name}" deleted successfully`, 'success')
      setDeleteGradeTarget(null)
      const remaining = grades.filter((g) => g.id !== deleteGradeTarget.id)
      setGrades(remaining)
      if (selectedGradeId === deleteGradeTarget.id) {
        setSelectedGradeId(remaining.length > 0 ? remaining[0].id : null)
      }
    } catch (err: unknown) {
      console.error('Failed to delete grade:', err)
      const errorMsg =
        (err as { response?: { data?: { detail?: string; error?: string } } })?.response?.data
          ?.detail ||
        (err as { response?: { data?: { detail?: string; error?: string } } })?.response?.data
          ?.error ||
        'Failed to delete grade. It may contain lessons or exam records.'
      notify(errorMsg, 'error')
    } finally {
      setDeletingGrade(false)
    }
  }

  // Open Create Result Modal
  const openCreateResultModal = () => {
    setEditingResult(null)
    setResultForm({
      student_name: '',
      institute: '',
      marks: '',
      grade_letter: 'A',
      subject: 'ICT',
      term: '1st Term Evaluation',
      academic_year: new Date().getFullYear(),
      remarks: '',
    })
    setShowResultModal(true)
  }

  // Open Edit Result Modal
  const openEditResultModal = (r: ExamResult) => {
    setEditingResult(r)
    setResultForm({
      student_name: r.student_name,
      institute: r.institute || '',
      marks: r.marks !== null && r.marks !== undefined ? String(r.marks) : '',
      grade_letter: (r.grade_letter as ValidGradeLetter) || 'A',
      subject: r.subject || 'ICT',
      term: r.term || '1st Term Evaluation',
      academic_year: r.academic_year || 2026,
      remarks: r.remarks || '',
    })
    setShowResultModal(true)
  }

  // Save Result
  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGradeId) {
      notify('Please select a grade first', 'error')
      return
    }

    if (!resultForm.student_name.trim()) {
      notify('Student Name is required', 'error')
      return
    }

    const payload = {
      grade_id: selectedGradeId,
      student_name: resultForm.student_name.trim(),
      institute: resultForm.institute.trim() || null,
      marks:
        resultForm.grade_letter.toLowerCase() === 'ab'
          ? null
          : resultForm.marks !== ''
          ? parseFloat(resultForm.marks)
          : null,
      grade_letter: resultForm.grade_letter,
      subject: resultForm.subject.trim() || 'ICT',
      term: resultForm.term.trim() || '1st Term Evaluation',
      academic_year: resultForm.academic_year || new Date().getFullYear(),
      remarks: resultForm.remarks.trim() || null,
    }

    setSavingResult(true)
    try {
      if (editingResult) {
        await api.put(`/admin/exam-results/${editingResult.id}`, payload)
        notify('Exam result updated successfully', 'success')
      } else {
        await api.post('/admin/exam-results', payload)
        notify('Exam result added successfully', 'success')
      }
      setShowResultModal(false)
      setEditingResult(null)
      await fetchResults(selectedGradeId)
    } catch (err: unknown) {
      console.error('Failed to save exam result:', err)
      const errorMsg =
        (err as { response?: { data?: { detail?: string; error?: string } } })?.response?.data
          ?.detail ||
        (err as { response?: { data?: { detail?: string; error?: string } } })?.response?.data
          ?.error ||
        'Failed to save exam result'
      notify(errorMsg, 'error')
    } finally {
      setSavingResult(false)
    }
  }

  // Delete Result
  const handleDeleteResult = async () => {
    if (!deleteResultTarget) return
    setDeletingResult(true)
    try {
      await api.delete(`/admin/exam-results/${deleteResultTarget.id}`)
      notify('Exam result deleted successfully', 'success')
      setDeleteResultTarget(null)
      if (selectedGradeId) {
        await fetchResults(selectedGradeId)
      }
    } catch (err: unknown) {
      console.error('Failed to delete exam result:', err)
      notify('Failed to delete exam result', 'error')
    } finally {
      setDeletingResult(false)
    }
  }

  const getBadgeColor = (letter: string) => {
    const l = (letter || '').toUpperCase().trim()
    switch (l) {
      case 'A':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
      case 'B':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
      case 'C':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
      case 'S':
        return 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
      case 'W':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
      case 'AB':
        return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30'
      default:
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Studio Header Bar */}
      <div className="bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05] rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-sm dark:shadow-none flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Exam Results Management Studio
            </h2>
            {activeGrade && (
              <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full shrink-0">
                {activeGrade.name} • {results.length} Candidates
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage student evaluation marks, terms, certificates, and published score registers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {activeGrade && (
            <Link
              href={`/exam-results/${activeGrade.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Student Portal View</span>
            </Link>
          )}

          <button
            onClick={() => {
              fetchGrades()
              if (selectedGradeId) fetchResults(selectedGradeId)
            }}
            disabled={gradesLoading || resultsLoading}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-600 dark:text-slate-300 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${gradesLoading || resultsLoading ? 'animate-spin' : ''}`}
            />
          </button>

          <button
            onClick={openCreateResultModal}
            disabled={!selectedGradeId}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 shadow-md shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enter Exam Results</span>
          </button>
        </div>
      </div>

      {/* Grade Selector Tabs Row */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-2">
          {grades.map((grade) => {
            const isSelected = selectedGradeId === grade.id
            return (
              <div
                key={grade.id}
                className={`group flex items-center rounded-2xl border transition-all duration-200 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-indigo-400'
                }`}
              >
                <button
                  onClick={() => setSelectedGradeId(grade.id)}
                  className="px-4 py-2 text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 opacity-70" />
                  <span>{grade.name}</span>
                </button>

                <div className="flex items-center pr-2 gap-1 border-l border-white/20 pl-1.5">
                  <button
                    onClick={() => {
                      setEditingGrade(grade)
                      setGradeForm({
                        name: grade.name,
                        display_order: grade.display_order ?? 1,
                      })
                      setShowAddGradeModal(true)
                    }}
                    className={`p-1 rounded-lg transition ${
                      isSelected
                        ? 'hover:bg-indigo-500 text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-indigo-600'
                    }`}
                    title="Edit Grade"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setDeleteGradeTarget(grade)}
                    className={`p-1 rounded-lg transition ${
                      isSelected
                        ? 'hover:bg-indigo-500 text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-rose-600'
                    }`}
                    title="Delete Grade"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )
          })}

          <button
            onClick={() => {
              setEditingGrade(null)
              setGradeForm({ name: '', display_order: grades.length + 1 })
              setShowAddGradeModal(true)
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-dashed border-slate-300 dark:border-white/20 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition shrink-0 cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>+ Add Grade</span>
          </button>
        </div>
      </div>

      {/* Active Grade Metrics */}
      {activeGrade && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Evaluated Candidates
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {stats.total}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Class Average
            </span>
            <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
              {stats.average}%
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 shadow-sm">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Distinctions (&apos;A&apos;)
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {stats.distinctions}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 shadow-sm">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
              Pass Rate
            </span>
            <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
              {stats.passRate}%
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Absent / Withdrawn
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-500 dark:text-slate-400 mt-1 block">
              {stats.absents}
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, institute, term..."
            className="w-full pl-9 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Grade Letter:</span>
          {['all', ...VALID_GRADE_LETTERS].map((letter) => (
            <button
              key={letter}
              onClick={() => setGradeFilter(letter)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                gradeFilter.toLowerCase() === letter.toLowerCase()
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {letter.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
        {resultsLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-xs font-semibold text-slate-400">Loading student scores...</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="py-16 text-center px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              No Results Recorded for {activeGrade?.name || 'this grade'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Click &quot;Enter Exam Results&quot; above to add marks for this grade.
            </p>
            <button
              onClick={openCreateResultModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enter First Result</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4 text-center w-14"># Rank</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Institute / School</th>
                  <th className="py-3.5 px-4">Term & Year</th>
                  <th className="py-3.5 px-4 text-center">Marks</th>
                  <th className="py-3.5 px-4 text-center">Grade Letter</th>
                  <th className="py-3.5 px-4">Remarks</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredResults.map((r, idx) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center">
                      {idx === 0 ? (
                        <span className="font-black text-amber-500">🥇 1</span>
                      ) : idx === 1 ? (
                        <span className="font-black text-slate-400">🥈 2</span>
                      ) : idx === 2 ? (
                        <span className="font-black text-amber-700">🥉 3</span>
                      ) : (
                        <span className="text-xs font-mono text-slate-400">#{idx + 1}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {r.student_name[0].toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {r.student_name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {r.institute ? (
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{r.institute}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <span>{r.term || '1st Term Evaluation'}</span>
                      <span className="text-[11px] text-slate-400 block">
                        {r.academic_year || 2026}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-black text-slate-900 dark:text-white">
                      {r.marks !== null && r.marks !== undefined ? `${r.marks} / 100` : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-xs border ${getBadgeColor(
                          r.grade_letter
                        )}`}
                      >
                        {r.grade_letter}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-xs italic max-w-xs truncate">
                      {r.remarks || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditResultModal(r)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
                          title="Edit Result"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteResultTarget(r)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
                          title="Delete Result"
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

      {/* Add / Edit Grade Modal */}
      {showAddGradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              {editingGrade ? 'Edit Grade' : 'Add New Grade'}
            </h3>
            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Grade Name *
                </label>
                <input
                  type="text"
                  required
                  value={gradeForm.name}
                  onChange={(e) => setGradeForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Grade 8"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={gradeForm.display_order}
                  onChange={(e) =>
                    setGradeForm((prev) => ({
                      ...prev,
                      display_order: parseInt(e.target.value, 10) || 1,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGradeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingGrade}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  {savingGrade ? 'Saving...' : editingGrade ? 'Update Grade' : 'Create Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Grade Modal */}
      {deleteGradeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-black text-lg">Delete Grade</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to delete{' '}
              <strong className="text-slate-900 dark:text-white">
                &ldquo;{deleteGradeTarget.name}&rdquo;
              </strong>
              ? All associated results for this grade will be removed.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteGradeTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteGrade}
                disabled={deletingGrade}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition disabled:opacity-50 cursor-pointer shadow-md shadow-rose-600/20"
              >
                {deletingGrade ? 'Deleting...' : 'Delete Grade'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Exam Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                {editingResult ? 'Edit Exam Result' : 'Enter New Exam Result'}
              </h3>
              <button
                onClick={() => setShowResultModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResult} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Candidate / Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={resultForm.student_name}
                  onChange={(e) =>
                    setResultForm((prev) => ({ ...prev, student_name: e.target.value }))
                  }
                  placeholder="e.g. Kasun Perera"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Institute / School Name
                </label>
                <input
                  type="text"
                  value={resultForm.institute}
                  onChange={(e) =>
                    setResultForm((prev) => ({ ...prev, institute: e.target.value }))
                  }
                  placeholder="e.g. Royal College Colombo"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Marks / Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={resultForm.marks}
                    onChange={(e) => handleMarksChange(e.target.value)}
                    placeholder="e.g. 85"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Grade Letter
                  </label>
                  <select
                    value={resultForm.grade_letter}
                    onChange={(e) =>
                      setResultForm((prev) => ({
                        ...prev,
                        grade_letter: e.target.value as ValidGradeLetter,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-bold cursor-pointer"
                  >
                    {VALID_GRADE_LETTERS.map((l) => (
                      <option key={l} value={l}>
                        {l.toUpperCase()} {l === 'ab' ? '(Absent)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Examination Term *
                  </label>
                  <input
                    type="text"
                    required
                    value={resultForm.term}
                    onChange={(e) => setResultForm((prev) => ({ ...prev, term: e.target.value }))}
                    placeholder="e.g. 1st Term Evaluation"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Academic Year
                  </label>
                  <input
                    type="number"
                    value={resultForm.academic_year}
                    onChange={(e) =>
                      setResultForm((prev) => ({
                        ...prev,
                        academic_year: parseInt(e.target.value, 10) || 2026,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={resultForm.subject}
                  onChange={(e) =>
                    setResultForm((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  placeholder="e.g. ICT"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Remarks / Comments
                </label>
                <input
                  type="text"
                  value={resultForm.remarks}
                  onChange={(e) =>
                    setResultForm((prev) => ({ ...prev, remarks: e.target.value }))
                  }
                  placeholder="e.g. Distinction, Top Performer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setShowResultModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingResult}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 shadow-md shadow-indigo-600/20 transition disabled:opacity-50 cursor-pointer"
                >
                  {savingResult ? 'Saving...' : editingResult ? 'Update Result' : 'Save Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Result Confirmation Modal */}
      {deleteResultTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-black text-lg">Delete Exam Result</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to delete exam score for candidate{' '}
              <strong className="text-slate-900 dark:text-white">
                &ldquo;{deleteResultTarget.student_name}&rdquo;
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteResultTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteResult}
                disabled={deletingResult}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition disabled:opacity-50 cursor-pointer shadow-md shadow-rose-600/20"
              >
                {deletingResult ? 'Deleting...' : 'Delete Result'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

