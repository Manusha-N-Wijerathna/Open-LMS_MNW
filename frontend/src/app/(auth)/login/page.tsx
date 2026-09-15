'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { ThemeToggle } from '@/components/ThemeToggle'
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  Home, 
  ShieldCheck 
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { user, setUser, loading: authLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
      setError('Configuration Error: NEXT_PUBLIC_SUPABASE_URL is not configured. If running locally, please restart your dev server (Ctrl+C and npm run dev) so .env.local is loaded.')
      setLoading(false)
      return
    }

    try {
      console.log('Authenticating with Supabase at:', supabaseUrl)
      const cleanEmail = email.trim().toLowerCase()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: cleanEmail, password })
      if (signInError) {
        console.error('Supabase Auth error:', signInError)
        if (signInError.message.toLowerCase().includes('email not confirmed')) {
          setError('Email not confirmed. If email confirmation is enabled in your project, please check your inbox for the confirmation link.')
        } else if (signInError.message.toLowerCase().includes('invalid login credentials')) {
          setError('Invalid email or password. Please verify your credentials or register a new account.')
        } else if (signInError.message.toLowerCase().includes('fetch')) {
          setError('Unable to reach Supabase authentication server. Please check your internet connection, ensure NEXT_PUBLIC_SUPABASE_URL is configured in your environment, or disable ad-blockers.')
        } else {
          setError(signInError.message)
        }
      } else {
        if (data?.user) {
          setUser(data.user)
        }
        router.push('/dashboard')
      }
    } catch (fetchErr: unknown) {
      console.error('Login connection error:', fetchErr)
      setError('Unable to connect to authentication services. Please check your internet connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Background Mesh Grids & Ambient Orbs */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-10" />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-pulse -z-10" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-violet-500/10 dark:bg-violet-600/15 rounded-full blur-3xl pointer-events-none animate-pulse [animation-delay:1s] -z-10" />

      {/* Top Header Bar with Home link & Top-Right Theme Toggle */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-20">
        <Link 
          href="/" 
          className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-semibold transition-colors"
        >
          <div className="w-8 h-8 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm">
            <Home className="w-4 h-4" />
          </div>
          <span>Back to Home</span>
        </Link>

        {/* Top-Right Theme Toggle */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Form Center Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/25 mb-4">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Student Sign In</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">#ict_for_future Learning Portal</p>
          </div>

          {/* Glassmorphic Auth Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-8 shadow-2xl shadow-slate-200/50 dark:shadow-black/40">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    placeholder="student@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-2xl pl-11 pr-11 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
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

              {/* Error Notification */}
              {error && (
                <div className="space-y-2">
                  <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-red-600 dark:text-red-400 text-xs font-medium">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                  {error.toLowerCase().includes('email not confirmed') && email && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await supabase.auth.resend({ type: 'signup', email })
                          setError(`Verification link resent to ${email}! Please check your inbox and spam folder.`)
                        } catch {
                          setError('Failed to resend confirmation email.')
                        }
                      }}
                      className="w-full text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold text-center py-1"
                    >
                      Resend Confirmation Link to {email} &rarr;
                    </button>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Navigation */}
            <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-white/5 space-y-3 text-center text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                  Create an account
                </Link>
              </p>
              <div>
                <Link 
                  href="/admin/login" 
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Instructor & Admin Portal →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Footer Note */}
      <footer className="py-4 text-center text-xs text-slate-500 dark:text-slate-400 relative z-20">
        &copy; {new Date().getFullYear()} #ict_for_future LMS. Secure Authentication.
      </footer>
    </div>
  )
}