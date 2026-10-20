'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import { getLessonThumbnail, extractDriveFileId } from '@/lib/drive'
import { ThemeToggle } from '@/components/ThemeToggle'
import { 
  GraduationCap, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Video, 
  ExternalLink, 
  ShieldAlert, 
  CheckCircle2,
  Lock,
  Sparkles,
  Layers
} from 'lucide-react'

interface Unit { 
  id: number
  name: string
  display_order?: number
  lessons?: { count: number }[]
}

interface Lesson { 
  id: number
  title: string
  description: string
  thumbnail_url: string
  drive_url: string 
}

export default function GradePage() {
  const params = useParams()
  const gradeId = params?.gradeId as string
  const router = useRouter()
  const { user, profile, loading } = useAuthStore()
  const [units, setUnits] = useState<Unit[]>([])
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [gradeName, setGradeName] = useState<string>('')
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/login')
      return
    }

    // Fetch units and grades
    api.get(`/content/grades/${gradeId}/units`).then(res => {
      setUnits(res.data)
      if (res.data.length > 0) selectUnit(res.data[0])
    }).catch(err => {
      console.error("Error fetching units:", err)
      setUnits([])
    })

    api.get('/content/grades').then(res => {
      const currentGrade = res.data.find(
        (g: { id: number; name: string }) => String(g.id) === String(gradeId)
      )
      if (currentGrade) setGradeName(currentGrade.name)
    }).catch(() => {})
  }, [user, gradeId, loading, router])

  const selectUnit = async (unit: Unit) => {
    setSelectedUnit(unit)
    setLoadingLessons(true)
    try {
      const res = await api.get(`/content/units/${unit.id}/lessons`)
      setLessons(res.data)
    } catch {
      setLessons([])
    }
    setLoadingLessons(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent"></div>
          <span className="text-slate-500 dark:text-slate-400 font-medium text-sm tracking-wide">Loading curriculum...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 relative overflow-hidden flex flex-col transition-colors duration-300">

      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/5 px-4 sm:px-6 py-3.5 sm:py-4 transition-all">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.06] px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold transition shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                #ict_for_future
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Top-Right Theme Toggle */}
            <ThemeToggle />

            {/* Profile Info Badge */}
            <Link
              href="/profile"
              className="hidden md:flex items-center gap-2 sm:gap-3 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] rounded-xl sm:rounded-2xl px-2.5 sm:px-3.5 py-1 sm:py-1.5 shadow-sm transition group"
              title="View and Edit Profile"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl overflow-hidden bg-indigo-500/15 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs shrink-0 border border-indigo-500/20">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt={profile?.full_name || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (profile?.full_name || user?.email || 'S')[0].toUpperCase()
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition leading-tight">
                  {profile?.full_name || user?.email?.split('@')[0]}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[130px]">
                  {user?.email}
                </p>
              </div>
              {profile?.is_verified ? (
                <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span className="hidden md:inline">Verified</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  <ShieldAlert className="w-2.5 h-2.5" />
                  <span className="hidden md:inline">Pending</span>
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* MOBILE RESPONSIVE VIEW: Units displayed as cards, clicking navigates to the dedicated lesson page */}
      <div className="md:hidden flex-1 max-w-6xl w-full mx-auto px-4 py-6 relative z-10 flex flex-col gap-5">
        
        {/* Mobile Header Banner */}
        <div className="bg-gradient-to-r from-indigo-50/90 via-white to-violet-50/90 dark:from-indigo-950/20 dark:via-slate-900/40 dark:to-violet-950/20 border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{gradeName ? `${gradeName} Curriculum` : 'Curriculum Lessons'}</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">
            Curriculum Lessons & Units
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Select a lesson topic below to open its dedicated page and view all video classes & materials.
          </p>
        </div>

        {/* Pending Verification Notice */}
        {!profile?.is_verified && (
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-800 dark:text-amber-300 text-xs">Verification Pending</h4>
              <p className="text-amber-700/90 dark:text-amber-400/80 text-[11px] mt-0.5 leading-relaxed">
                You can browse all lesson topics freely. Direct video links will unlock once verified.
              </p>
            </div>
          </div>
        )}

        {/* Mobile Units/Lessons Cards Grid */}
        {units.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/40 dark:bg-white/[0.01]">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500 text-xs font-medium">No lessons or units published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {units.map((unit, index) => {
              const lessonCount = unit.lessons?.[0]?.count ?? 0
              return (
                <Link
                  key={unit.id}
                  href={`/grades/${gradeId}/units/${unit.id}`}
                  className="bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.06] hover:border-indigo-500/40 dark:hover:border-indigo-500/40 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-3 group active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/15 dark:from-indigo-500/20 dark:to-violet-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xs shrink-0 group-hover:scale-105 transition-transform">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Lesson {index + 1}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-full shrink-0">
                      {lessonCount} {lessonCount === 1 ? 'Lesson' : 'Lessons'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                      {unit.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-white/5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <span>Show Lessons</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* DESKTOP VIEW: Left sidebar for units + Right main panel for lessons */}
      <div className="hidden md:flex flex-1 max-w-6xl w-full mx-auto px-6 py-8 relative z-10 flex-row gap-8">
        
        {/* Unit Selector: Desktop Sidebar */}
        <aside className="w-64 shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider ml-1">
              Curriculum Units
            </h2>
          </div>
          
          {units.length === 0 ? (
            <div className="text-slate-500 text-xs italic py-2 ml-1">No units created yet.</div>
          ) : (
            <div className="flex flex-col overflow-y-auto max-h-[70vh] gap-2 pr-1 no-scrollbar scroll-smooth">
              {units.map(unit => (
                <button
                  key={unit.id}
                  onClick={() => selectUnit(unit)}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 border flex items-center justify-between gap-3 group whitespace-normal ${
                    selectedUnit?.id === unit.id
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-500/20'
                      : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] shadow-sm'
                  }`}
                >
                  <span className="truncate">{unit.name}</span>
                  <ChevronRight className={`w-4 h-4 transition duration-200 ${
                    selectedUnit?.id === unit.id 
                      ? 'text-white' 
                      : 'text-slate-400 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-300 group-hover:translate-x-0.5'
                  }`} />
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Lessons Display Area */}
        <main className="flex-1 space-y-6">
          
          {/* Selected Unit Title Header */}
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-white/5">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                {gradeName ? `${gradeName} Curriculum` : 'Curriculum'}
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {selectedUnit?.name || 'Select a unit'}
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full font-bold">
                {lessons.length} Lesson{lessons.length !== 1 ? 's' : ''} available
              </span>
              {selectedUnit && (
                <Link
                  href={`/grades/${gradeId}/units/${selectedUnit.id}`}
                  className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 flex items-center gap-1 ml-2 transition"
                  title="Open dedicated page"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Dedicated page</span>
                </Link>
              )}
            </div>
          </div>

          {/* Pending Verification Notice */}
          {!profile?.is_verified && (
            <div className="flex items-start gap-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-800 dark:text-amber-300 text-xs sm:text-sm">Account Verification Required</h4>
                <p className="text-amber-700/90 dark:text-amber-400/80 text-xs mt-0.5 leading-relaxed">
                  Your profile is pending admin approval. You can view lesson topics, and streaming links will unlock once your account is verified.
                </p>
              </div>
            </div>
          )}

          {/* Lessons Grid or Loading states */}
          {loadingLessons ? (
            <div className="flex items-center gap-3 py-12 text-slate-500 dark:text-slate-400">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent"></div>
              <span className="text-sm font-medium">Loading lessons...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map(lesson => (
                <a
                  key={lesson.id}
                  href={profile?.is_verified ? lesson.drive_url : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.06] rounded-3xl overflow-hidden group transition-all duration-300 shadow-md hover:shadow-xl flex flex-col justify-between ${
                    profile?.is_verified 
                      ? 'hover:border-indigo-500/30 hover:scale-[1.02]' 
                      : 'opacity-70 cursor-not-allowed'
                  }`}
                >
                  {/* Video/Resource Thumbnail Preview */}
                  <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 h-40 flex items-center justify-center overflow-hidden relative">
                    {getLessonThumbnail(lesson.thumbnail_url, lesson.drive_url) && !brokenImages[lesson.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={getLessonThumbnail(lesson.thumbnail_url, lesson.drive_url)!} 
                        alt={lesson.title} 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const fileId = extractDriveFileId(lesson.thumbnail_url || lesson.drive_url)
                          const target = e.currentTarget
                          if (fileId && !target.dataset.triedLh3) {
                            target.dataset.triedLh3 = 'true'
                            target.src = `https://lh3.googleusercontent.com/d/${fileId}`
                            return
                          }
                          setBrokenImages(prev => ({ ...prev, [lesson.id]: true }))
                        }}
                        className={`w-full h-full object-cover transition-transform duration-300 ${
                          profile?.is_verified ? 'group-hover:scale-105' : ''
                        }`} 
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Video className="w-7 h-7" />
                      </div>
                    )}

                    {/* Play icon overlay on hover */}
                    {profile?.is_verified ? (
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                          <ExternalLink className="w-4 h-4 ml-0.5" />
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center">
                        <div className="w-9 h-9 rounded-full bg-slate-900/80 backdrop-blur text-amber-400 flex items-center justify-center border border-amber-400/20 shadow">
                          <Lock className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lesson Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                        {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-3 leading-relaxed">
                          {lesson.description}
                        </p>
                      )}
                    </div>
                    
                    {profile?.is_verified ? (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold group-hover:text-indigo-500 transition-colors">
                        <span>Open Lesson Material</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-500 font-semibold">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Locked (Verification Pending)</span>
                      </div>
                    )}
                  </div>
                </a>
              ))}

              {lessons.length === 0 && !loadingLessons && (
                <div className="col-span-full py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white/40 dark:bg-white/[0.01]">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400 dark:text-slate-600">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium">No lessons published in this unit yet.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}