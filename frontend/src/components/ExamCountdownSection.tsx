'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { 
  Calendar, 
  Clock, 
  Sparkles, 
  Radio, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

export interface Exam {
  id: number
  title: string
  exam_date: string
  duration: string
  target_grade?: string
  description?: string
  is_active: boolean
}

interface TimeLeft {
  years: number
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

function calculateTimeLeft(targetDateStr: string): TimeLeft {
  const target = new Date(targetDateStr).getTime()
  const now = new Date().getTime()
  const diff = target - now

  if (isNaN(target) || diff <= 0) {
    return { years: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
  }

  const totalSeconds = Math.floor(diff / 1000)
  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const totalHours = Math.floor(totalMinutes / 60)
  const hours = totalHours % 24
  const totalDays = Math.floor(totalHours / 24)
  const years = Math.floor(totalDays / 365)
  const days = totalDays % 365

  return { years, days, hours, minutes, seconds, isExpired: false }
}

export function ExamCountdownSection() {
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState<number>(Date.now())
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  // Fetch active exams from API
  useEffect(() => {
    api.get('/content/exams')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setExams(res.data)
          setSelectedExamId(res.data[0].id)
        }
      })
      .catch(err => {
        console.warn('Could not load exams:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Live timer tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const selectedExam = useMemo(() => {
    return exams.find(e => e.id === selectedExamId) || exams[0] || null
  }, [exams, selectedExamId])

  const currentIndex = useMemo(() => {
    if (!selectedExam || exams.length === 0) return 0
    const idx = exams.findIndex(e => e.id === selectedExam.id)
    return idx >= 0 ? idx : 0
  }, [exams, selectedExam])

  const timeLeft = useMemo(() => {
    if (!selectedExam) return null
    return calculateTimeLeft(selectedExam.exam_date)
  }, [selectedExam, currentTime])

  const handlePrev = () => {
    if (exams.length <= 1) return
    const prevIndex = (currentIndex - 1 + exams.length) % exams.length
    setSelectedExamId(exams[prevIndex].id)
  }

  const handleNext = () => {
    if (exams.length <= 1) return
    const nextIndex = (currentIndex + 1) % exams.length
    setSelectedExamId(exams[nextIndex].id)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return
    const diffX = touchStartX - e.changedTouches[0].clientX
    if (diffX > 45) {
      handleNext()
    } else if (diffX < -45) {
      handlePrev()
    }
    setTouchStartX(null)
  }

  const formatScheduledDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  return (
    <section id="exam-countdown" className="py-12 sm:py-20 md:py-28 bg-white dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-white/5 relative overflow-hidden transition-colors duration-300">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-32 w-80 sm:w-96 h-80 sm:h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-72 sm:w-80 h-72 sm:h-80 bg-violet-500/10 dark:bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10 space-y-2">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Target Your Exam Success
          </h2>
        </div>

        {/* Featured Live Countdown Card with Arrow Swappers */}
        {selectedExam && timeLeft && (
          <div 
            className="relative"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Outer gradient glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 rounded-3xl blur-xl opacity-25 dark:opacity-35 pointer-events-none" />
            

            <div className="relative bg-white/95 dark:bg-slate-950/85 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-2xl space-y-5 sm:space-y-7">
              
              {/* Top Navigation & Pagination Bar (Arrows on Mobile + Indicators) */}
              {exams.length > 1 && (
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/70 dark:border-white/5 select-none">
                  {/* Left Arrow Button */}
                  <button
                    onClick={handlePrev}
                    aria-label="Previous exam"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/80 dark:border-white/10 transition active:scale-95 text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  {/* Center Carousel Dots & Counter */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">
                      <span className="text-indigo-600 dark:text-indigo-400 font-black">{currentIndex + 1}</span> of {exams.length}
                    </span>
                    <div className="flex items-center gap-1.5 ml-1">
                      {exams.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedExamId(exams[i].id)}
                          aria-label={`Switch to exam ${i + 1}`}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            i === currentIndex
                              ? 'w-6 bg-gradient-to-r from-indigo-600 to-violet-600'
                              : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Right Arrow Button */}
                  <button
                    onClick={handleNext}
                    aria-label="Next exam"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/80 dark:border-white/10 transition active:scale-95 text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Card Header Info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-200/80 dark:border-white/5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                      <Flame className="w-3 h-3 fill-current" />
                      <span>{selectedExam.target_grade || 'National Exam'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                      <Clock className="w-3 h-3" />
                      <span>Duration: {selectedExam.duration}</span>
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    {selectedExam.title}
                  </h3>

                  {selectedExam.description && (
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                      {selectedExam.description}
                    </p>
                  )}
                </div>

                {/* Scheduled Exam Date Badge */}
                <div className="self-start md:self-auto shrink-0 bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 rounded-xl sm:rounded-2xl px-3.5 py-2 sm:p-4 text-left md:text-right">
                  <div className="flex items-center md:justify-end gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Exam Date & Time</span>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {formatScheduledDate(selectedExam.exam_date)}
                  </p>
                </div>
              </div>

              {/* 5-Unit Real-time Countdown Tiles: Years, Days, Hours, Minutes, Seconds */}
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-0.5">
                  <span>Countdown Timer</span>
                  {timeLeft.isExpired ? (
                    <span className="text-rose-500 font-extrabold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Date Reached
                    </span>
                  ) : (
                    <span className="text-emerald-500 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>

                {/* All 5 units in a balanced 5-column layout */}
                <div className="grid grid-cols-5 gap-1.5 sm:gap-3.5 md:gap-4">
                  
                  {/* Years Tile */}
                  <div className="bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-6 text-center shadow-xs flex flex-col justify-center items-center">
                    <span className="font-mono text-xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                      {String(timeLeft.years).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] sm:text-xs font-extrabold tracking-widest uppercase text-indigo-600 dark:text-indigo-400 mt-1.5 sm:mt-2.5">
                      <span className="sm:hidden">Yrs</span>
                      <span className="hidden sm:inline">Years</span>
                    </span>
                  </div>

                  {/* Days Tile */}
                  <div className="bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-6 text-center shadow-xs flex flex-col justify-center items-center">
                    <span className="font-mono text-xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                      {String(timeLeft.days).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] sm:text-xs font-extrabold tracking-widest uppercase text-indigo-600 dark:text-indigo-400 mt-1.5 sm:mt-2.5">
                      Days
                    </span>
                  </div>

                  {/* Hours Tile */}
                  <div className="bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-6 text-center shadow-xs flex flex-col justify-center items-center">
                    <span className="font-mono text-xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] sm:text-xs font-extrabold tracking-widest uppercase text-indigo-600 dark:text-indigo-400 mt-1.5 sm:mt-2.5">
                      <span className="sm:hidden">Hrs</span>
                      <span className="hidden sm:inline">Hours</span>
                    </span>
                  </div>

                  {/* Minutes Tile */}
                  <div className="bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-6 text-center shadow-xs flex flex-col justify-center items-center">
                    <span className="font-mono text-xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] sm:text-xs font-extrabold tracking-widest uppercase text-indigo-600 dark:text-indigo-400 mt-1.5 sm:mt-2.5">
                      <span className="sm:hidden">Min</span>
                      <span className="hidden sm:inline">Minutes</span>
                    </span>
                  </div>

                  {/* Seconds Tile (accented) */}
                  <div className="bg-gradient-to-b from-indigo-50/80 to-violet-50/50 dark:from-indigo-950/40 dark:to-slate-900/90 border border-indigo-300/80 dark:border-indigo-500/40 rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-6 text-center shadow-xs flex flex-col justify-center items-center">
                    <span className="font-mono text-xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight leading-none animate-pulse">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] sm:text-xs font-extrabold tracking-widest uppercase text-indigo-600 dark:text-indigo-400 mt-1.5 sm:mt-2.5">
                      <span className="sm:hidden">Sec</span>
                      <span className="hidden sm:inline">Seconds</span>
                    </span>
                  </div>

                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 sm:pt-4 border-t border-slate-200/80 dark:border-white/5">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 self-start sm:self-auto">
                  <Award className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Curriculum video lessons & past papers available in portal.</span>
                </div>

                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Start Revision</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </div>
        )}

        {/* Empty state if no exams configured */}
        {!loading && exams.length === 0 && (
          <div className="max-w-md mx-auto py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 p-6">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">
              No Exam Schedules Configured
            </h4>
            <p className="text-slate-500 text-xs">
              The administrator has not scheduled any examination dates yet. Check back soon for updated timetables.
            </p>
          </div>
        )}

      </div>
    </section>
  )
}
