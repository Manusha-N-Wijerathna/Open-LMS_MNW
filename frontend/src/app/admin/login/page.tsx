'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { ThemeToggle } from '@/components/ThemeToggle'
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  Home, 
  GraduationCap 
} from 'lucide-react'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Step 1: Authenticate with Supabase
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      // Step 2: Verify the user is actually an admin via backend
      try {
        const res = await api.get('/admin/users/me')
        if (res.data.role !== 'admin') {
          await supabase.auth.signOut()
          setError('Access denied. This account does not have admin privileges.')
          setLoading(false)
          return
        }
        router.push('/admin/dashboard')
      } catch (err: unknown) {
        await supabase.auth.signOut()
        const axiosErr = err as { response?: { data?: { detail?: string } } }
        const detail = axiosErr?.response?.data?.detail || 'Unable to verify admin access.'
        setError(detail)
      }
    } catch (fetchErr: unknown) {
      console.error('Login connection error:', fetchErr)
      setError('Unable to connect to Supabase. Please check your internet connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Background Mesh Grids */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-10" />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-pulse -z-10" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-violet-500/10 dark:bg-violet-600/15 rounded-full blur-3xl pointer-events-none animate-pulse [animation-delay:1s] -z-10" />

      {/* Top Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between relative z-20">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs sm:text-sm font-semibold transition-colors"
        >
          <div className="w-8 h-8 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm">
            <Home className="w-4 h-4" />
          </div>
          <span className="hidden sm:inline">Back to Home</span>
        </Link>

        <ThemeToggle />
      </header>

      {/* Main Center Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Brand Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/25 mb-3 sm:mb-4">
              <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Admin Portal</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">#ict_for_future System Administration</p>
          </div>

          {/* Glass Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl shadow-slate-200/50 dark:shadow-black/40">
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              {/* Email field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 sm:py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    placeholder="admin@school.edu"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-2xl pl-11 pr-11 py-3 sm:py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Error display */}
              {error && (
                <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-2xl p-3 sm:p-3.5 text-red-600 dark:text-red-400 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Verifying Access...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer link */}
            <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/5 text-center text-xs">
              <Link 
                href="/login" 
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Switch to Student Login →</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-500 dark:text-slate-400 relative z-20">
        &copy; {new Date().getFullYear()} #ict_for_future LMS. Administrative Gateway.
      </footer>
    </div>
  )
}