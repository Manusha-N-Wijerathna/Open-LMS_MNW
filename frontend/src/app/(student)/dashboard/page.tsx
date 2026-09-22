'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { 
  GraduationCap, 
  BookOpen, 
  LogOut, 
  ChevronRight, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  Award,
  Layers,
  Clock,
  User
} from 'lucide-react'

interface Grade {
  id: number
  name: string
  display_order: number
}

export default function Dashboard() {
  const router = useRouter()
  const { user, profile, loading, signOut } = useAuthStore()
  const [grades, setGrades] = useState<Grade[]>([])
  const [greeting, setGreeting] = useState('Welcome back')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/login')
      return
    }
    api.get('/content/grades')
      .then(res => setGrades(res.data))
      .catch(err => {
        console.error("Error fetching grades:", err)
        setGrades([])
      })
  }, [user, loading, router])

  const gradeGradients = [
    'from-indigo-600 via-indigo-500 to-blue-600 shadow-indigo-500/20 hover:shadow-indigo-500/35',
    'from-purple-600 via-violet-500 to-pink-600 shadow-purple-500/20 hover:shadow-purple-500/35',
    'from-emerald-600 via-teal-500 to-cyan-600 shadow-emerald-500/20 hover:shadow-emerald-500/35',
    'from-blue-600 via-indigo-500 to-violet-600 shadow-blue-500/20 hover:shadow-blue-500/35',
  ]

  const gradeIcons = [
    GraduationCap,
    BookOpen,
    Award,
    Layers
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent"></div>
          <span className="text-slate-500 dark:text-slate-400 font-medium text-sm tracking-wide">Loading workspace...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors duration-300">
      {/* Background Mesh Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-10" />

      {/* Decorative Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-violet-600/5 dark:bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/5 px-6 py-4 transition-all">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                #ict_for_future
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 -mt-1">
                Student Workspace
              </span>
            </div>
          </Link>

          {/* Right Action Bar (Profile + Theme Toggle + Sign Out) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Top-Right Theme Toggle Button */}
            <ThemeToggle />

            {/* Profile Info Badge (Desktop / Tablet view) */}
            <Link
              href="/profile"
              className="hidden md:flex items-center gap-3 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] rounded-2xl px-3.5 py-1.5 shadow-sm transition group"
              title="View and Edit Profile"
            >
              <div className="w-8 h-8 rounded-xl overflow-hidden bg-indigo-500/15 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs shrink-0 border border-indigo-500/20">
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
              
              {/* Verification Status Badge */}
              {profile?.is_verified ? (
                <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>Verified</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  <ShieldAlert className="w-2.5 h-2.5" />
                  <span>Pending</span>
                </span>
              )}
            </Link>

            {/* Sign Out Button (Desktop / Tablet view) */}
            <button
              onClick={signOut}
              className="hidden md:flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition duration-200"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-8 sm:py-10 relative z-10 space-y-10">
        
        {/* Hero Greeting Section */}
        <section className="bg-gradient-to-r from-indigo-50 via-white to-violet-50 dark:from-indigo-950/40 dark:via-slate-900/40 dark:to-violet-950/40 border border-slate-200/80 dark:border-white/[0.06] rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-xl dark:shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-4 h-4" />
                <span>Student Learning Space</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {greeting}, {profile?.full_name || 'Student'}! 👋
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
                Welcome back. Select your grade curriculum below to access course units, video archives, and study resources.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/[0.08] px-3.5 py-1.5 rounded-xl shadow-xs transition"
                >
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Manage Profile</span>
                </Link>
              </div>
            </div>
            
            {/* Metrics card */}
            <div className="flex items-center gap-3.5 bg-white dark:bg-slate-900/60 backdrop-blur border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 w-full md:w-auto min-w-[200px] shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{grades.length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Available Grades</p>
              </div>
            </div>
          </div>

          {/* Pending Verification Notice */}
          {!profile?.is_verified && (
            <div className="mt-6 flex items-start gap-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-800 dark:text-amber-300 text-xs sm:text-sm">Account Verification Pending</h4>
                <p className="text-amber-700/90 dark:text-amber-400/80 text-xs mt-0.5 leading-relaxed">
                  Your registered student account is currently awaiting administrative approval. You can explore curriculum units, and lesson material links will unlock once the admin approves your account.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Grade Selection Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Curriculum Grades
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                Select your class level to view structured study units
              </p>
            </div>
          </div>

          {grades.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 rounded-3xl">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto mb-4 text-slate-400 rounded-2xl">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h4 className="text-slate-700 dark:text-slate-300 font-bold mb-1">No Grades Available</h4>
              <p className="text-slate-500 text-xs sm:text-sm">Curriculum grades will appear here once published by the instructor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {grades.map((grade, i) => {
                const IconComponent = gradeIcons[i % gradeIcons.length]
                return (
                  <Link key={grade.id} href={`/grades/${grade.id}`} className="group">
                    <div className={`relative h-56 bg-gradient-to-br ${gradeGradients[i % gradeGradients.length]} rounded-3xl p-6 flex flex-col justify-between overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 border border-white/15 text-white`}>
                      {/* Decorative Background Icon */}
                      <div className="absolute -right-6 -bottom-6 opacity-15 group-hover:opacity-25 group-hover:scale-110 transition-all duration-300">
                        <IconComponent className="w-40 h-40" />
                      </div>
                      
                      {/* Card Top */}
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-white font-semibold border border-white/15">
                          Curriculum
                        </span>
                      </div>

                      {/* Card Bottom */}
                      <div className="space-y-1.5 relative z-10">
                        <div>
                          <p className="text-white/80 uppercase tracking-widest text-[10px] font-bold">
                            ICT Education
                          </p>
                          <h4 className="text-3xl font-black tracking-tight text-white">
                            {grade.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1 text-white/90 font-bold text-xs pt-2 group-hover:gap-2 transition-all">
                          <span>Explore Units</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

      </main>
    </div>
  )
}