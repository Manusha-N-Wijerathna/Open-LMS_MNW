'use client'

import React, { useEffect, useState } from 'react'
import { useTheme } from './ThemeProvider'
import { Sun, Moon } from 'lucide-react'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div 
        className={`w-9 h-9 rounded-xl bg-slate-200/50 dark:bg-white/5 border border-slate-300/60 dark:border-white/10 flex items-center justify-center animate-pulse ${className}`}
        aria-hidden="true"
      />
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative group flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
        isDark
          ? 'bg-slate-900/80 hover:bg-slate-800/90 text-amber-400 border border-white/10 shadow-lg shadow-black/20 hover:border-amber-400/30'
          : 'bg-white hover:bg-slate-100 text-indigo-600 border border-slate-200 shadow-md shadow-slate-200/50 hover:border-indigo-300'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* Sun Icon */}
        <Sun
          className={`w-4.5 h-4.5 transition-all duration-500 transform ${
            isDark
              ? 'rotate-90 scale-0 opacity-0 absolute'
              : 'rotate-0 scale-100 opacity-100 text-amber-500'
          }`}
        />
        {/* Moon Icon */}
        <Moon
          className={`w-4.5 h-4.5 transition-all duration-500 transform ${
            isDark
              ? 'rotate-0 scale-100 opacity-100 text-indigo-300'
              : '-rotate-90 scale-0 opacity-0 absolute'
          }`}
        />
      </div>

      {showLabel && (
        <span className="text-xs font-semibold tracking-wide">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  )
}
