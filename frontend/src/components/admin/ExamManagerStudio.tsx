'use client'

import React, { useState, useEffect } from 'react'
import api from '@/lib/api'
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Radio, 
  Layers, 
  Award,
  Eye,
  RefreshCw
} from 'lucide-react'

export interface AdminExam {
  id: number
  title: string
  exam_date: string
  duration: string
  target_grade?: string
  description?: string
  is_active: boolean
  created_at: string
}

interface ExamManagerStudioProps {
  onNotify?: (message: string, type: 'success' | 'error' | 'info') => void
}

export function ExamManagerStudio({ onNotify }: ExamManagerStudioProps) {
  const [exams, setExams] = useState<AdminExam[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [currentTime, setCurrentTime] = useState(Date.now())

  const [form, setForm] = useState({
    title: '',
    exam_date: '',
    duration: '',
    target_grade: '',
    description: '',
    is_active: true
  })

  // Refresh interval for live timer badges
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchExams = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/exams')
      setExams(res.data)
    } catch {
      onNotify?.('Failed to load exams', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExams()
  }, [])

  const openCreateModal = () => {
    setEditingId(null)
    // Default to 30 days from now at 08:30 AM
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    nextMonth.setHours(8, 30, 0, 0)
    // Convert to YYYY-MM-DDTHH:mm format for datetime-local
    const pad = (n: number) => String(n).padStart(2, '0')
    const defaultDateStr = `${nextMonth.getFullYear()}-${pad(nextMonth.getMonth() + 1)}-${pad(nextMonth.getDate())}T${pad(nextMonth.getHours())}:${pad(nextMonth.getMinutes())}`

    setForm({
      title: '',
      exam_date: defaultDateStr,
      duration: '3 Hours',
      target_grade: 'Grade 11',
      description: '',
      is_active: true
    })
    setShowModal(true)
  }

  const openEditModal = (exam: AdminExam) => {
    setEditingId(exam.id)
    const pad = (n: number) => String(n).padStart(2, '0')
    let dateStr = ''
    try {
      const d = new Date(exam.exam_date)
      dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    } catch {
      dateStr = exam.exam_date
    }

    setForm({
      title: exam.title,
      exam_date: dateStr,
      duration: exam.duration,
      target_grade: exam.target_grade || '',
      description: exam.description || '',
      is_active: exam.is_active
    })
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      onNotify?.('Exam title is required', 'error')
      return
    }
    if (!form.exam_date) {
      onNotify?.('Exam date is required', 'error')
      return
    }
    if (!form.duration.trim()) {
      onNotify?.('Exam duration is required', 'error')
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        await api.put(`/admin/exams/${editingId}`, form)
        onNotify?.('Exam schedule updated successfully', 'success')
      } else {
        await api.post('/admin/exams', form)
        onNotify?.('New exam schedule added successfully', 'success')
      }
      setShowModal(false)
      await fetchExams()
    } catch (err: any) {
      onNotify?.(err?.response?.data?.detail || 'Failed to save exam schedule', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to remove the exam schedule: "${title}"?`)) return
    try {
      await api.delete(`/admin/exams/${id}`)
      onNotify?.('Exam schedule removed', 'info')
      await fetchExams()
    } catch {
      onNotify?.('Failed to delete exam', 'error')
    }
  }

  const handleToggleActive = async (exam: AdminExam) => {
    try {
      await api.put(`/admin/exams/${exam.id}`, { is_active: !exam.is_active })
      onNotify?.(`Exam is now ${!exam.is_active ? 'Visible' : 'Hidden'} on Landing Page`, 'info')
      await fetchExams()
    } catch {
      onNotify?.('Failed to update status', 'error')
    }
  }

  const getCountdownString = (targetDateStr: string) => {
    const target = new Date(targetDateStr).getTime()
    const diff = target - currentTime
    if (isNaN(target) || diff <= 0) return 'Exam date reached'

    const totalSeconds = Math.floor(diff / 1000)
    const s = totalSeconds % 60
    const m = Math.floor(totalSeconds / 60) % 60
    const h = Math.floor(totalSeconds / 3600) % 24
    const totalDays = Math.floor(totalSeconds / 86400)
    const y = Math.floor(totalDays / 365)
    const d = totalDays % 365

    return `${y}y ${d}d ${h}h ${m}m ${s}s`
  }

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>Public Landing Page Countdown</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Exam Countdown & Schedule Manager
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Configure examination titles, target dates, and durations displayed on the homepage real-time counter.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchExams}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/25 transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Exam</span>
          </button>
        </div>
      </div>

      {/* Exams Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mr-3" />
          <span>Loading exam timers...</span>
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-8">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">
            No Exam Timers Created Yet
          </h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto mb-4">
            Add your first examination countdown to display years, days, hours, minutes, and seconds on the student landing page.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Exam</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exams.map(exam => {
            const countdownStr = getCountdownString(exam.exam_date)
            return (
              <div
                key={exam.id}
                className={`bg-white dark:bg-slate-900/70 border rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between gap-4 ${
                  exam.is_active
                    ? 'border-slate-200 dark:border-white/10 hover:border-indigo-500/40 hover:shadow-md'
                    : 'border-slate-200/50 dark:border-white/5 opacity-65 bg-slate-50/50 dark:bg-slate-950/40'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      {exam.target_grade || 'All Classes'}
                    </span>

                    <button
                      onClick={() => handleToggleActive(exam)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition ${
                        exam.is_active
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {exam.is_active ? 'Live on Landing Page' : 'Hidden'}
                    </button>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                      {exam.title}
                    </h3>
                    {exam.description && (
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 line-clamp-2">
                        {exam.description}
                      </p>
                    )}
                  </div>

                  {/* Exam Date & Duration Details */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{new Date(exam.exam_date).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Duration: {exam.duration}</span>
                    </div>
                  </div>

                  {/* Live Countdown Badge */}
                  <div className="bg-slate-100 dark:bg-slate-950/80 rounded-xl p-3 border border-slate-200/80 dark:border-white/5 font-mono text-center">
                    <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                      Live Countdown
                    </span>
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                      {countdownStr}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
                  <button
                    onClick={() => openEditModal(exam)}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition"
                    title="Edit Exam"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(exam.id, exam.title)}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition"
                    title="Delete Exam"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/5">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {editingId ? 'Edit Exam Countdown' : 'Add New Exam Schedule'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Exam Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. G.C.E. O/L Examination - ICT"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Exam Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={form.exam_date}
                    onChange={e => setForm({ ...form, exam_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duration *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3 Hours"
                    value={form.duration}
                    onChange={e => setForm({ ...form, duration: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Grade / Class Level
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grade 11 / O/L"
                  value={form.target_grade}
                  onChange={e => setForm({ ...form, target_grade: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Instructions / Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Bring scientific calculator and student admission card."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={form.is_active}
                  onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Display this countdown publicly on the landing page
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Exam' : 'Add Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
