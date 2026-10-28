'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore, getAssignedGradeIds } from '@/store/authStore'
import Link from 'next/link'
import { getLessonThumbnail, extractDriveFileId } from '@/lib/drive'
import { ThemeToggle } from '@/components/ThemeToggle'
import { 
  GraduationCap, 
  BookOpen, 
  ChevronLeft, 
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
  grade_id: number
  grades?: {
    id: number
    name: string
  }
}

interface Lesson {
  id: number
  title: string
  description: string
  thumbnail_url: string
  drive_url: string
}

export default function UnitLessonsPage() {
  const params = useParams()
  const gradeId = params?.gradeId as string
  const unitId = params?.unitId as string
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuthStore()

  const [unit, setUnit] = useState<Unit | null>(null)
  const [gradeName, setGradeName] = useState<string>('')
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({})
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      setLoading(true)
      if (profile && profile.role !== 'admin') {
        const assignedIds = getAssignedGradeIds(profile)
          const currentGradeNum = parseInt(gradeId, 10)
          if (!assignedIds.includes(currentGradeNum)) {
          setAccessDenied(true)
          setLoading(false)
          return
        }
      }
      try {
        // Fetch unit info & lessons in parallel
        const [unitRes, lessonsRes, gradesRes] = await Promise.allSettled([
          api.get(`/content/units/${unitId}`),
          api.get(`/content/units/${unitId}/lessons`),
          api.get('/content/grades')
        ])

        if (unitRes.status === 'fulfilled') {
          setUnit(unitRes.value.data)
          if (unitRes.value.data?.grades?.name) {
            setGradeName(unitRes.value.data.grades.name)
          }
        }

        if (lessonsRes.status === 'fulfilled') {
          setLessons(lessonsRes.value.data || [])
        }

        if (gradesRes.status === 'fulfilled' && !gradeName) {
          const currentGrade = gradesRes.value.data.find(
            (g: { id: number; name: string }) => String(g.id) === String(gradeId)
          )
          if (currentGrade) {
            setGradeName(currentGrade.name)
          }
        }
      } catch (err) {
        console.error('Error fetching unit lessons:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, gradeId, unitId, authLoading, router, gradeName])

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-3xl p-8 text-center shadow-xl backdrop-blur-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Access Restricted</h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
            You do not have permission to view units in this grade. You can only access materials for your assigned curriculum grade.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            {profile && getAssignedGradeIds(profile).length > 0 ? (
              <Link
                href={`/grades/${getAssignedGradeIds(profile)[0]}`}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition"
              >
                Go to Your Assigned Grade
              </Link>
            ) : null}
            <Link
              href="/dashboard"
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent"></div>
          <span className="text-slate-500 dark:text-slate-400 font-medium text-sm tracking-wide">Loading lessons...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 relative overflow-hidden flex flex-col transition-colors duration-300">
      
      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/5 px-4 sm:px-6 py-3.5 sm:py-4 transition-all">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link 
              href={`/grades/${gradeId}`}
              className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.06] px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold transition shadow-sm"
              title="Return to Grade Units"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{gradeName ? `${gradeName}` : 'All Units'}</span>
            </Link>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                #ict_for_future
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10 space-y-6">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            Dashboard
          </Link>
          <span>/</span>
          <Link href={`/grades/${gradeId}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            {gradeName || `Grade ${gradeId}`}
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[200px] sm:max-w-none">
            {unit?.name || 'Unit Lessons'}
          </span>
        </div>

        {/* Unit Header Banner */}
        <div className="bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/80 dark:from-indigo-950/20 dark:via-slate-900/40 dark:to-violet-950/20 border border-slate-200/80 dark:border-white/[0.06] rounded-3xl p-5 sm:p-7 relative overflow-hidden shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-wider uppercase">
                <BookOpen className="w-4 h-4" />
                <span>{gradeName ? `${gradeName} Curriculum` : 'Curriculum Unit'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {unit?.name || 'Curriculum Lessons'}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                Watch lecture recordings, practical tutorials, and study materials for this unit.
              </p>
            </div>

            <div className="self-start sm:self-auto shrink-0">
              <span className="inline-flex items-center gap-1.5 text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-3.5 py-1.5 rounded-full font-bold">
                <Video className="w-3.5 h-3.5" />
                <span>{lessons.length} Lesson{lessons.length !== 1 ? 's' : ''} available</span>
              </span>
            </div>
          </div>
        </div>

        {/* Pending Verification Notice */}
        {!profile?.is_verified && (
          <div className="flex items-start gap-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-800 dark:text-amber-300 text-xs sm:text-sm">
                Account Verification Required
              </h4>
              <p className="text-amber-700/90 dark:text-amber-400/80 text-xs mt-0.5 leading-relaxed">
                Your profile is pending admin approval. You can view lesson topics, and streaming links will unlock once your account is verified.
              </p>
            </div>
          </div>
        )}

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {lessons.map(lesson => (
            <a
              key={lesson.id}
              href={profile?.is_verified ? lesson.drive_url : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={`bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.06] rounded-3xl overflow-hidden group transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between ${
                profile?.is_verified 
                  ? 'hover:border-indigo-500/30 hover:scale-[1.02]' 
                  : 'opacity-75 cursor-not-allowed'
              }`}
            >
              {/* Thumbnail Preview */}
              <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 h-44 flex items-center justify-center overflow-hidden relative">
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

                {/* Overlay Icon */}
                {profile?.is_verified ? (
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
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

              {/* Lesson Metadata */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                    {lesson.title}
                  </h3>
                  {lesson.description && (
                    <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-3 leading-relaxed">
                      {lesson.description}
                    </p>
                  )}
                </div>
                
                {profile?.is_verified ? (
                  <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold group-hover:text-indigo-500 transition-colors pt-2 border-t border-slate-100 dark:border-white/5">
                    <span>Open Lesson Material</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-500 font-semibold pt-2 border-t border-slate-100 dark:border-white/5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Locked (Verification Pending)</span>
                  </div>
                )}
              </div>
            </a>
          ))}

          {lessons.length === 0 && (
            <div className="col-span-full py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white/40 dark:bg-white/[0.01]">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400 dark:text-slate-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">
                No lessons available yet
              </h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                No lesson recordings or study materials have been published in this unit yet. Check back soon!
              </p>
              <div className="mt-4">
                <Link
                  href={`/grades/${gradeId}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Choose another unit</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
