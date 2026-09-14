'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import api from '@/lib/api'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { 
  GraduationCap, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Home, 
  Sparkles,
  ShieldCheck 
} from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Call server-side registration route (creates Auth user + inserts into public.profiles)
      const res = await api.post('/auth/register', {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      })

      if (res.status === 200 || res.status === 201) {
        setSuccess(true)
      } else {
        throw new Error(res.data?.detail || res.data?.error || 'Registration failed')
      }
    } catch (err: unknown) {
      console.warn('Registration attempt via route handler error:', err)
      const axiosErr = err as { response?: { data?: { detail?: string; error?: string } }; message?: string }
      const errorMsg = axiosErr?.response?.data?.detail || axiosErr?.response?.data?.error

      if (errorMsg) {
        setError(errorMsg)
      } else {
        // Direct SDK fallback
        try {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
              data: { full_name: form.fullName }
            }
          })

          if (signUpError) {
            setError(signUpError.message)
          } else {
            if (signUpData?.user?.id) {
              try {
                await supabase.from('profiles').upsert({
                  id: signUpData.user.id,
                  full_name: form.fullName,
                  role: 'student',
                  is_verified: false,
                })
              } catch {}
            }
            setSuccess(true)
          }
        } catch {
          setError('An error occurred during registration. Please try again.')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const checkPasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 6) strength++
    if (pwd.length >= 10) strength++
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) strength++
    if (/\d/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++
    setPasswordStrength(strength)
    return strength
  }

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500'
    if (passwordStrength <= 2) return 'bg-amber-500'
    if (passwordStrength <= 3) return 'bg-yellow-500'
    if (passwordStrength <= 4) return 'bg-indigo-500'
    return 'bg-emerald-500'
  }

  const getStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak'
    if (passwordStrength <= 2) return 'Fair'
    if (passwordStrength <= 3) return 'Good'
    if (passwordStrength <= 4) return 'Strong'
    return 'Very Strong'
  }

  // Registration Success Card
  if (success) {
    return (
      <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-10" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-20">
          <Link href="/" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-semibold transition-colors">
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <ThemeToggle />
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
          <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight">Registration Complete! 🎉</h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Your student profile for <strong className="text-indigo-600 dark:text-indigo-400">{form.email}</strong> has been registered. You can now sign in to view your dashboard while an administrator verifies your account.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </main>

        <footer className="py-4 text-center text-xs text-slate-500 dark:text-slate-400 relative z-20">
          &copy; {new Date().getFullYear()} #ict_for_future LMS.
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Background Mesh Grids & Ambient Orbs */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-10" />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-pulse -z-10" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-violet-500/10 dark:bg-violet-600/15 rounded-full blur-3xl pointer-events-none animate-pulse [animation-delay:1s] -z-10" />

      {/* Top Header Bar */}
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
            <h1 className="text-3xl font-extrabold tracking-tight">Create Account</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Join the #ict_for_future LMS student workspace</p>
          </div>

          {/* Glassmorphic Auth Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-8 shadow-2xl shadow-slate-200/50 dark:shadow-black/40">
            <form onSubmit={handleRegister} className="space-y-4.5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    placeholder="Kasun Perera"
                    required
                  />
                </div>
              </div>

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
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
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
                  {form.password && (
                    <span className="text-[11px] font-semibold text-slate-500">
                      Strength: <strong className="text-indigo-600 dark:text-indigo-400">{getStrengthText()}</strong>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => {
                      setForm({ ...form, password: e.target.value })
                      checkPasswordStrength(e.target.value)
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-2xl pl-11 pr-11 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    placeholder="Min. 6 characters"
                    minLength={6}
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

                {/* Password Strength Meter */}
                {form.password.length > 0 && (
                  <div className="pt-1.5 space-y-1">
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getStrengthColor()} transition-all duration-300`} 
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-red-600 dark:text-red-400 text-xs font-medium">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Navigation */}
            <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-white/5 space-y-3 text-center text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Already registered?{' '}
                <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                  Sign in to your account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 dark:text-slate-400 relative z-20">
        &copy; {new Date().getFullYear()} #ict_for_future LMS. Secure Authentication.
      </footer>
    </div>
  )
}