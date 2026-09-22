'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useTheme } from './ThemeProvider'
import {
  User,
  LogOut,
  GraduationCap,
  Sun,
  Moon,
  X,
  Menu,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

export function StudentMobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, profile, signOut } = useAuthStore()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // If user is not logged in, don't show the student floating menu
  if (!user) return null

  const avatarUrl = profile?.avatar_url
  const initialLetter = (profile?.full_name || user?.email || 'S')[0].toUpperCase()
  const isDark = theme === 'dark'

  const handleSignOut = async () => {
    setIsOpen(false)
    await signOut()
    router.push('/login')
  }

  return (
    <div className="md:hidden">
      {/* Dimmed Backdrop when menu is open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300 animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Floating Action Menu Container */}
      <div className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-3 pointer-events-none">
        
        {/* Expanded Options (appear as rounded buttons floating upwards) */}
        {isOpen && (
          <div className="flex flex-col items-end gap-3 mb-1 pointer-events-auto transition-all duration-300">
            
            {/* 1. Student Identity Capsule (Mini Profile Status) */}
            <div className="flex items-center gap-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl px-3.5 py-2 shadow-xl animate-slideUp">
              <div className="w-7 h-7 rounded-xl overflow-hidden bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  initialLetter
                )}
              </div>
              <div className="text-left max-w-[150px]">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {profile?.full_name || user?.email?.split('@')[0]}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {profile?.is_verified ? 'Verified Student' : 'Pending Verification'}
                </p>
              </div>
            </div>

            {/* 2. Profile Button */}
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 group animate-slideUp [animation-delay:40ms]"
            >
              <span className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                My Profile
              </span>
              <div className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95 border-2 ${
                pathname === '/profile'
                  ? 'bg-indigo-600 text-white border-indigo-400 ring-2 ring-indigo-500/40'
                  : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-slate-200 dark:border-white/10'
              }`}>
                <User className="w-5 h-5" />
              </div>
            </Link>

            {/* 3. Dashboard Button */}
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 group animate-slideUp [animation-delay:80ms]"
            >
              <span className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                Dashboard
              </span>
              <div className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95 border-2 ${
                pathname === '/dashboard'
                  ? 'bg-indigo-600 text-white border-indigo-400 ring-2 ring-indigo-500/40'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10'
              }`}>
                <GraduationCap className="w-5 h-5" />
              </div>
            </Link>

            {/* 4. Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-3 group animate-slideUp [animation-delay:120ms] cursor-pointer"
            >
              <span className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </span>
              <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 text-amber-500 dark:text-amber-400 border-2 border-slate-200 dark:border-white/10 shadow-lg flex items-center justify-center transition-transform active:scale-95">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-indigo-500" />}
              </div>
            </button>

            {/* 5. Logout Button */}
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-3 group animate-slideUp [animation-delay:160ms] cursor-pointer"
            >
              <span className="bg-red-500/90 backdrop-blur-md text-white border border-red-400/30 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                Sign Out
              </span>
              <div className="w-12 h-12 rounded-full bg-red-600 text-white border-2 border-red-400 shadow-xl shadow-red-500/30 flex items-center justify-center transition-transform active:scale-95">
                <LogOut className="w-5 h-5" />
              </div>
            </button>

          </div>
        )}

        {/* Main Floating Trigger Button (Bottom Rounded Button) */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Student Actions Menu"
          className={`pointer-events-auto w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-90 border-2 cursor-pointer ${
            isOpen
              ? 'bg-slate-900 text-white border-white/20 rotate-90 scale-105'
              : 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white border-white/30 shadow-indigo-500/40 hover:scale-105'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-11 h-11 rounded-full object-cover border border-white/40"
                />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
              )}
              {/* Online / Active Indicator Dot */}
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
            </div>
          )}
        </button>

      </div>
    </div>
  )
}
