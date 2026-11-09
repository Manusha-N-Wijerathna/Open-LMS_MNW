'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Grade, ExamResult, VALID_GRADE_LETTERS, ValidGradeLetter } from '@/lib/types/exam-result'
import {
  GraduationCap,
  Plus,
  Search,
  ExternalLink,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Filter,
  RefreshCw,
  ArrowLeft,
  Building2,
  Award,
  BookOpen,
  Layers,
  X,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  FolderPlus
} from 'lucide-react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export default function AdminExamResultsPage() {
  const router = useRouter()

  // Auth verification state
  const [verifying, setVerifying] = useState(true)
  const [adminName, setAdminName] = useState<string>('Administrator')

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

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([])

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

  const notify = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4500)
  }, [])

  // 1. Auth check
  useEffect(() => {
    let isMounted = true
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.replace('/login?redirect=/admin/exam-results')
          return
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', session.user.id)
          .maybeSingle()

        if (error || !profile || profile.role !== 'admin') {
          router.replace('/admin/login')
          return
        }

        if (isMounted) {
          setAdminName(profile.full_name || session.user.email?.split('@')[0] || 'Administrator')
          setVerifying(false)
        }
      } catch {
        router.replace('/login')
      }
    }
    checkAdmin()
    return () => {
      isMounted = false
    }
  }, [router])

  // 2. Fetch Grades helper for manual refresh / mutation
  const fetchGrades = useCallback(async () => {
    setGradesLoading(true)
    try {
      const res = await api.get('/content/exam-results/grades')
      const fetchedGrades: Grade[] = res.data?.grades || []
      setGrades(fetchedGrades)

      if (fetchedGrades.length > 0) {
        setSelectedGradeId(prev => {
          if (prev && fetchedGrades.some(g => g.id === prev)) return prev
          return fetchedGrades[0].id
        })
      }
    } catch (err: unknown) {
      console.error('Failed to load grades for admin:', err)
      notify('Failed to load grades list', 'error')
    } finally {
      setGradesLoading(false)
    }
  }, [notify])

  // Initial Fetch Grades
  useEffect(() => {
    if (verifying) return
    let ignore = false

    api.get('/content/exam-results/grades')
      .then(res => {
        if (!ignore) {
          const fetchedGrades: Grade[] = res.data?.grades || []
          setGrades(fetchedGrades)
          setGradesLoading(false)
          if (fetchedGrades.length > 0) {
            setSelectedGradeId(prev => {
              if (prev && fetchedGrades.some(g => g.id === prev)) return prev
              return fetchedGrades[0].id
            })
          }
        }
      })
      .catch(err => {
        if (!ignore) {
          console.error('Failed to load grades for admin:', err)
          notify('Failed to load grades list', 'error')
          setGradesLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [verifying, notify])

  // 3. Fetch Exam Results helper for manual refresh / mutation
  const fetchResults = useCallback(async (gradeId: number) => {
    setResultsLoading(true)
    try {
      const res = await api.get<{ results: ExamResult[] }>(`/admin/exam-results?grade_id=${gradeId}`)
      setResults(res.data?.results || [])
    } catch (err: unknown) {
      console.error('Failed to load exam results:', err)
      notify('Failed to load exam results for this grade', 'error')
      setResults([])
    } finally {
      setResultsLoading(false)
    }
  }, [notify])

  // Initial Fetch Exam Results for selected Grade
  useEffect(() => {
    if (selectedGradeId === null || verifying) return
    let ignore = false

    api.get<{ results: ExamResult[] }>(`/admin/exam-results?grade_id=${selectedGradeId}`)
      .then(res => {
        if (!ignore) {
          setResults(res.data?.results || [])
          setResultsLoading(false)
        }
      })
      .catch(err => {
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
  }, [selectedGradeId, verifying, notify])

  // Active Grade object
  const activeGrade = useMemo(() => {
    return grades.find(g => g.id === selectedGradeId) || null
  }, [grades, selectedGradeId])

  // Summary statistics for the active grade
  const stats = useMemo(() => {
    const total = results.length
    let totalMarks = 0
    let scoredCount = 0
    let distinctions = 0
    let passed = 0
    let absents = 0

    results.forEach(r => {
      const letter = (r.grade_letter || '').trim().toUpperCase()
      if (r.marks !== null && r.marks !== undefined) {
        totalMarks += Number(r.marks)
        scoredCount++
      }
      if (letter === 'AB') {
        absents++
      } else if (['A', 'B', 'C', 'S'].includes(letter) || (r.marks !== null && r.marks >= 35)) {
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

  // Filtered results
  const filteredResults = useMemo(() => {
    return results.filter(r => {
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

    setResultForm(prev => ({
      ...prev,
      marks: val,
      grade_letter: autoLetter,
    }))
  }

  // Open Create Grade Modal
  const openCreateGradeModal = () => {
    setEditingGrade(null)
    setGradeForm({
      name: '',
      display_order: grades.length + 1,
    })
    setShowAddGradeModal(true)
  }

  // Open Edit Grade Modal
  const openEditGradeModal = (g: Grade) => {
    setEditingGrade(g)
    setGradeForm({
      name: g.name,
      display_order: g.display_order ?? 1,
    })
    setShowAddGradeModal(true)
  }

  // Save Grade (Create or Update)
  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gradeForm.name.trim()) {
      notify('Grade name is required', 'error')
      return
    }

    setSavingGrade(true)
    try {
      if (editingGrade) {
        // Update grade
        await api.put(`/admin/grades/${editingGrade.id}`, {
          name: gradeForm.name.trim(),
          display_order: Number(gradeForm.display_order) || 1,
        })
        notify(`Grade "${gradeForm.name}" updated successfully`, 'success')
      } else {
        // Create grade
        await api.post('/admin/grades', {
          name: gradeForm.name.trim(),
          display_order: Number(gradeForm.display_order) || 1,
        })
        notify(`Grade "${gradeForm.name}" created successfully`, 'success')
      }
      setShowAddGradeModal(false)
      await fetchGrades()
    } catch (err: unknown) {
      console.error('Failed to save grade:', err)
      const errorMsg = (err as { response?: { data?: { detail?: string; message?: string } } })?.response?.data?.detail 
        || (err as { response?: { data?: { detail?: string; message?: string } } })?.response?.data?.message
        || 'Failed to save grade'
      notify(errorMsg, 'error')
    } finally {
      setSavingGrade(false)
    }
  }

  // Delete Grade
  const handleConfirmDeleteGrade = async () => {
    if (!deleteGradeTarget) return
    setDeletingGrade(true)
    try {
      await api.delete(`/admin/grades/${deleteGradeTarget.id}?force=true`)
      notify(`Grade "${deleteGradeTarget.name}" deleted successfully`, 'success')
      setDeleteGradeTarget(null)
      await fetchGrades()
    } catch (err: unknown) {
      console.error('Failed to delete grade:', err)
      const errorMsg = (err as { response?: { data?: { detail?: string; message?: string } } })?.response?.data?.detail 
        || (err as { response?: { data?: { detail?: string; message?: string } } })?.response?.data?.message
        || 'Failed to delete grade'
      notify(errorMsg, 'error')
    } finally {
      setDeletingGrade(false)
    }
  }

  // Open Create Result Modal
  const openCreateResultModal = () => {
    if (!selectedGradeId) {
      notify('Please select a grade first', 'error')
      return
    }
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
      academic_year: r.academic_year || new Date().getFullYear(),
      remarks: r.remarks || '',
    })
    setShowResultModal(true)
  }

  // Save Result (Create or Update)
  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGradeId) {
      notify('No grade selected', 'error')
      return
    }
    if (!resultForm.student_name.trim()) {
      notify('Candidate / Student name is required', 'error')
      return
    }

    setSavingResult(true)
    try {
      const payload = {
        grade_id: selectedGradeId,
        student_name: resultForm.student_name.trim(),
        institute: resultForm.institute.trim() || null,
        marks: resultForm.marks !== '' ? Number(resultForm.marks) : null,
        grade_letter: resultForm.grade_letter,
        subject: resultForm.subject.trim() || 'ICT',
        term: resultForm.term.trim() || '1st Term Evaluation',
        academic_year: Number(resultForm.academic_year) || new Date().getFullYear(),
        remarks: resultForm.remarks.trim() || null,
      }

      if (editingResult) {
        await api.put(`/admin/exam-results/${editingResult.id}`, payload)
        notify(`Result for "${resultForm.student_name}" updated successfully`, 'success')
      } else {
        await api.post('/admin/exam-results', payload)
        notify(`Result for "${resultForm.student_name}" added successfully`, 'success')
      }

      setShowResultModal(false)
      if (selectedGradeId) {
        await fetchResults(selectedGradeId)
      }
    } catch (err: unknown) {
      console.error('Failed to save exam result:', err)
      const errorMsg = (err as { response?: { data?: { detail?: string; message?: string } } })?.response?.data?.detail 
        || (err as { response?: { data?: { detail?: string; message?: string } } })?.response?.data?.message
        || 'Failed to save examination result'
      notify(errorMsg, 'error')
    } finally {
      setSavingResult(false)
    }
  }

  // Delete Result
  const handleConfirmDeleteResult = async () => {
    if (!deleteResultTarget) return
    setDeletingResult(true)
    try {
      await api.delete(`/admin/exam-results/${deleteResultTarget.id}`)
      notify(`Record for "${deleteResultTarget.student_name}" deleted`, 'success')
      setDeleteResultTarget(null)
      if (selectedGradeId) {
        await fetchResults(selectedGradeId)
      }
    } catch (err: unknown) {
      console.error('Failed to delete result:', err)
      notify('Failed to delete exam record', 'error')
    } finally {
      setDeletingResult(false)
    }
  }

  // Grade badge color helper
  const getGradeBadgeStyle = (letter: string) => {
    const l = (letter || '').trim().toUpperCase()
    switch (l) {
      case 'A':
      case 'A+':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
      case 'B':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
      case 'C':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
      case 'S':
      case 'D':
        return 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
      case 'W':
      case 'F':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
      case 'AB':
        return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30'
      default:
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-sm font-semibold tracking-wide text-slate-400">Verifying Admin Access...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Toast Notifications */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-medium border backdrop-blur-md animate-in slide-in-from-top duration-300 ${
              toast.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200'
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-800 dark:text-indigo-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
            {toast.type === 'error' && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
            {toast.type === 'info' && <AlertTriangle className="w-4 h-4 text-indigo-500 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Admin Top Header */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </Link>

            <span className="text-slate-300 dark:text-slate-700">|</span>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-500/20">
                <Award className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                Exam Results Management Studio
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeGrade && (
              <Link
                href={`/exam-results/${activeGrade.slug}`}
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                <span>View Public Page</span>
              </Link>
            )}

            <ThemeToggle />

            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300">
              <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span className="truncate max-w-[120px]">{adminName}</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Section 1: Grade Hub Selector & Management */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Academic Grade Categories
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Create, edit, or remove grade levels. Select a grade to view and manage its student exam results.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={openCreateGradeModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition active:scale-95"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Create New Grade</span>
              </button>

              <button
                onClick={fetchGrades}
                disabled={gradesLoading}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Refresh grades"
              >
                <RefreshCw className={`w-4 h-4 ${gradesLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Grade selection pills */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {grades.map(grade => {
              const isSelected = selectedGradeId === grade.id
              return (
                <div
                  key={grade.id}
                  onClick={() => setSelectedGradeId(grade.id)}
                  className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-2xl cursor-pointer text-xs font-bold transition-all border shadow-sm ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-500/25 ring-2 ring-indigo-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-indigo-500/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <GraduationCap className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-indigo-500'}`} />
                  <span>{grade.name}</span>

                  {/* Actions inside grade pill */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 ml-1.5 opacity-60 group-hover:opacity-100 transition-opacity"
                  >
                    <button
                      onClick={() => openEditGradeModal(grade)}
                      className={`p-1 rounded-md transition ${
                        isSelected
                          ? 'hover:bg-white/20 text-white'
                          : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                      title="Edit Grade"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setDeleteGradeTarget(grade)}
                      className={`p-1 rounded-md transition ${
                        isSelected
                          ? 'hover:bg-rose-500/30 text-rose-200'
                          : 'hover:bg-rose-500/10 text-rose-500'
                      }`}
                      title="Delete Grade"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )
            })}

            {grades.length === 0 && !gradesLoading && (
              <p className="text-xs text-slate-400 italic">No grades found. Click &quot;Create New Grade&quot; to begin.</p>
            )}
          </div>
        </div>

        {/* Section 2: Exam Results for Active Grade */}
        {activeGrade ? (
          <div className="space-y-6">
            
            {/* Active Grade Header & Performance Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Candidates
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {stats.total}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {activeGrade.name}
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Class Average
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                    {stats.average}%
                  </span>
                  <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-500">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Distinctions (&apos;A&apos;)
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {stats.distinctions}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {stats.total > 0 ? Math.round((stats.distinctions / stats.total) * 100) : 0}% of class
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Pass Rate / Absent
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {stats.passRate}%
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {stats.absents} Absent (ab)
                  </span>
                </div>
              </div>

            </div>

            {/* Results Table Section Container */}
            <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 shadow-lg overflow-hidden space-y-4 p-6">
              
              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                
                {/* Search Bar */}
                <div className="relative max-w-sm w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search candidate name, institute..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 shadow-sm"
                  />
                </div>

                {/* Grade Letter Filter & Add Button */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 overflow-x-auto">
                    <span className="text-xs font-bold text-slate-400 mr-1 hidden lg:inline flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5" />
                      <span>Grade:</span>
                    </span>

                    <button
                      onClick={() => setGradeFilter('all')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                        gradeFilter === 'all'
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      All
                    </button>

                    {VALID_GRADE_LETTERS.map(letter => (
                      <button
                        key={letter}
                        onClick={() => setGradeFilter(letter)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                          gradeFilter === letter
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={openCreateResultModal}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition active:scale-95 shrink-0 ml-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Result</span>
                  </button>

                  <button
                    onClick={() => selectedGradeId && fetchResults(selectedGradeId)}
                    disabled={resultsLoading}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Refresh results"
                  >
                    <RefreshCw className={`w-4 h-4 ${resultsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

              </div>

              {/* Results Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="py-3.5 px-4 w-12 text-center">#</th>
                      <th className="py-3.5 px-4">Candidate / Student Name</th>
                      <th className="py-3.5 px-4">Institute / School</th>
                      <th className="py-3.5 px-4">Subject & Term</th>
                      <th className="py-3.5 px-4 text-center">Marks / Score</th>
                      <th className="py-3.5 px-4 text-center">Grade (A,B,C,S,W,ab)</th>
                      <th className="py-3.5 px-4">Remarks</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs sm:text-sm">
                    {filteredResults.map((r, index) => {
                      const marksNum = r.marks !== null ? Number(r.marks) : null

                      return (
                        <tr
                          key={r.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                        >
                          {/* Row Index */}
                          <td className="py-3.5 px-4 text-center text-xs text-slate-400 font-mono">
                            {index + 1}
                          </td>

                          {/* Student Name */}
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 text-xs font-black">
                                {(r.student_name || 'S')[0].toUpperCase()}
                              </div>
                              <span className="truncate max-w-[200px]">{r.student_name}</span>
                            </div>
                          </td>

                          {/* Institute */}
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            {r.institute ? (
                              <div className="flex items-center gap-1.5 text-xs">
                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[180px]">{r.institute}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-600 italic text-xs">Default Institute</span>
                            )}
                          </td>

                          {/* Subject & Term */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {r.subject || 'ICT'}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {r.term || '1st Term Evaluation'}
                              </span>
                            </div>
                          </td>

                          {/* Marks */}
                          <td className="py-3.5 px-4 text-center">
                            {marksNum !== null ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="font-extrabold text-slate-900 dark:text-white">
                                  {marksNum}
                                  <span className="text-[10px] text-slate-400 font-normal">/100</span>
                                </span>
                                <div className="w-14 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
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
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-lg font-black text-xs border shadow-xs ${getGradeBadgeStyle(
                                r.grade_letter
                              )}`}
                            >
                              {r.grade_letter}
                            </span>
                          </td>

                          {/* Remarks */}
                          <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                            {r.remarks || '—'}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => openEditResultModal(r)}
                                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                title="Edit Result"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteResultTarget(r)}
                                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                                title="Delete Result"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {/* Empty Results State */}
                {filteredResults.length === 0 && !resultsLoading && (
                  <div className="p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 mx-auto flex items-center justify-center">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      No exam results entered for {activeGrade.name} yet
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      Click the &ldquo;Add New Result&rdquo; button above to enter student marks, institute, and grades.
                    </p>
                    <button
                      onClick={openCreateResultModal}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Enter First Result</span>
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 space-y-3">
            <Layers className="w-8 h-8 text-indigo-500 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Please select or create an academic grade to manage results.
            </p>
          </div>
        )}

      </main>

      {/* MODAL 1: Add/Edit Grade */}
      {showAddGradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {editingGrade ? 'Edit Grade Category' : 'Create New Academic Grade'}
              </h3>
              <button
                onClick={() => setShowAddGradeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Grade Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 10, Grade 11 (O/L)"
                  value={gradeForm.name}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={gradeForm.display_order}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, display_order: parseInt(e.target.value, 10) || 0 }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
                <p className="text-[11px] text-slate-400 mt-1">Lower numbers appear first in lists.</p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddGradeModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingGrade}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
                >
                  {savingGrade && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingGrade ? 'Save Changes' : 'Create Grade'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Delete Grade Confirmation */}
      {deleteGradeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Delete Grade &quot;{deleteGradeTarget.name}&quot;?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This will remove this grade category and all associated student examination results under it. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteGradeTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteGrade}
                disabled={deletingGrade}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition flex items-center gap-1.5"
              >
                {deletingGrade && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Grade</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Add / Edit Exam Result */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingResult ? 'Edit Exam Result' : `Add Result for ${activeGrade?.name}`}
                </h3>
                <p className="text-xs text-slate-400">
                  Enter student candidate details, institute, marks, and grade letter.
                </p>
              </div>
              <button
                onClick={() => setShowResultModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResult} className="space-y-4">
              
              {/* Candidate / Student Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Candidate Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kavindu Perera"
                  value={resultForm.student_name}
                  onChange={(e) => setResultForm(prev => ({ ...prev, student_name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              {/* Institute / School */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Institute / School Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Royal College / Colombo Branch / Online"
                  value={resultForm.institute}
                  onChange={(e) => setResultForm(prev => ({ ...prev, institute: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              {/* Marks & Grade Letter Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Marks */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Marks / Score (0–100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    placeholder="e.g. 85 (leave blank if ab)"
                    value={resultForm.marks}
                    onChange={(e) => handleMarksChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-mono font-bold"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Leave empty for absent (&apos;ab&apos;).</p>
                </div>

                {/* Grade Letter Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Grade (A, B, C, S, W, ab) *
                  </label>
                  <div className="grid grid-cols-6 gap-1">
                    {VALID_GRADE_LETTERS.map(letter => (
                      <button
                        type="button"
                        key={letter}
                        onClick={() => setResultForm(prev => ({ ...prev, grade_letter: letter }))}
                        className={`py-2 rounded-xl text-xs font-black transition border shadow-xs ${
                          resultForm.grade_letter === letter
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-500/30'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Subject & Term Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={resultForm.subject}
                    onChange={(e) => setResultForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g. ICT"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Examination Term
                  </label>
                  <input
                    type="text"
                    value={resultForm.term}
                    onChange={(e) => setResultForm(prev => ({ ...prev, term: e.target.value }))}
                    placeholder="e.g. 1st Term Evaluation"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Remarks / Comments
                </label>
                <input
                  type="text"
                  value={resultForm.remarks}
                  onChange={(e) => setResultForm(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="e.g. Excellent practical exam performance"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setShowResultModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingResult}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
                >
                  {savingResult && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingResult ? 'Update Result' : 'Save Result'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Delete Result Confirmation */}
      {deleteResultTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Delete Exam Record?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to delete the exam result for <strong className="text-slate-800 dark:text-slate-200">{deleteResultTarget.student_name}</strong>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteResultTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteResult}
                disabled={deletingResult}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition flex items-center gap-1.5"
              >
                {deletingResult && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Result</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
