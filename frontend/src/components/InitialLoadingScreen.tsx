'use client'

import React, { useEffect, useState } from 'react'
import { GraduationCap, Sparkles, Shield, Cpu } from 'lucide-react'

export function InitialLoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [statusIndex, setStatusIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  const statusMessages = [
    'Initializing secure environment...',
    'Connecting to #ict_for_future network...',
    'Loading curriculum modules & resources...',
    'Launching workspace...',
  ]

  useEffect(() => {
    // Smooth progress counter simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        // Accelerate smoothly
        const increment = prev < 60 ? Math.floor(Math.random() * 12) + 8 : Math.floor(Math.random() * 8) + 4
        return Math.min(100, prev + increment)
      })
    }, 180)

    return () => clearInterval(interval)
  }, [])

  // Rotate status message based on progress
  useEffect(() => {
    if (progress < 30) setStatusIndex(0)
    else if (progress < 65) setStatusIndex(1)
    else if (progress < 90) setStatusIndex(2)
    else setStatusIndex(3)

    if (progress === 100) {
      const timer = setTimeout(() => {
        setFadeOut(true)
        const removeTimer = setTimeout(() => {
          setVisible(false)
        }, 700)
        return () => clearTimeout(removeTimer)
      }, 350)
      return () => clearTimeout(timer)
    }
  }, [progress])

  if (!visible) return null

  return (
    <div
      id="app-initial-loader"
      aria-live="polite"
      aria-busy="true"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden select-none bg-slate-950 transition-all duration-700 ease-out ${
        fadeOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundColor: '#020617', // Match dark mode deep slate
      }}
    >
      {/* 1. Cyber Grid Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf812_1px,transparent_1px),linear-gradient(to_bottom,#38bdf812_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-40"
      />

      {/* 2. Deep Blue / Cyan Ambient Glow Orbs (Matching Dark Mode Blue) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[700px] h-[550px] sm:h-[700px] bg-indigo-600/20 rounded-full blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[450px] h-[350px] sm:h-[450px] bg-cyan-500/15 rounded-full blur-[90px] pointer-events-none [animation-delay:1.5s]" />

      {/* 3. Tech HUD Corner Coordinates (Desktop / Tablet) */}
      <div className="absolute top-6 left-6 hidden sm:flex items-center gap-2 text-[10px] font-mono tracking-widest text-cyan-400/60 uppercase">
        <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>SYS.STATUS: INITIALIZING</span>
      </div>
      <div className="absolute top-6 right-6 hidden sm:flex items-center gap-2 text-[10px] font-mono tracking-widest text-indigo-400/60 uppercase">
        <Shield className="w-3.5 h-3.5 text-indigo-400" />
        <span>SECURE LMS NODE</span>
      </div>
      <div className="absolute bottom-6 left-6 hidden sm:flex items-center gap-2 text-[10px] font-mono tracking-widest text-slate-500 uppercase">
        <Cpu className="w-3.5 h-3.5" />
        <span>ICT PLATFORM v2.0</span>
      </div>
      <div className="absolute bottom-6 right-6 hidden sm:flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-slate-500 uppercase">
        <Sparkles className="w-3 h-3 text-cyan-400" />
        <span>STUDENT WORKSPACE</span>
      </div>

      {/* 4. Center Main Loading Card & Typography */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg w-full">
        
        {/* Glowing Logo Badge with Orbital Ring */}
        <div className="relative mb-6 sm:mb-8 flex items-center justify-center">
          {/* Outer Pulsing Rings */}
          <div className="absolute -inset-4 rounded-3xl border border-cyan-500/20 animate-ping [animation-duration:3s]" />
          <div className="absolute -inset-2 rounded-2xl border border-indigo-500/30 animate-pulse" />
          
          {/* Logo Container */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 border border-white/20">
            <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md animate-bounce [animation-duration:2.5s]" />
          </div>
        </div>

        {/* Brand Main Heading (#ict_for_future) */}
        <div className="space-y-1 sm:space-y-2 mb-6 sm:mb-8">
          <h1 className="inline-block py-1 px-2 text-3xl sm:text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-200 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(56,189,248,0.45)]">
            #ict_for_future
          </h1>
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.25em] text-cyan-300/80 uppercase">
            Learning Management System
          </p>
        </div>

        {/* Tech Progress Bar Container */}
        <div className="w-full max-w-xs sm:max-w-sm space-y-3">
          {/* Progress Track */}
          <div className="relative h-2 w-full bg-slate-900/90 rounded-full overflow-hidden border border-indigo-500/30 shadow-inner">
            {/* Animated Gradient Fill */}
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-blue-500 transition-all duration-150 ease-out relative shadow-[0_0_15px_rgba(56,189,248,0.7)]"
              style={{ width: `${progress}%` }}
            >
              {/* Leading Sparkle on progress bar */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#fff]" />
            </div>
          </div>

          {/* Progress Status Text & Percentage Counter */}
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400 text-[11px] sm:text-xs truncate max-w-[200px] sm:max-w-[240px] text-left">
              {statusMessages[statusIndex]}
            </span>
            <span className="text-cyan-400 font-bold tracking-wider">
              {progress}%
            </span>
          </div>
        </div>

      </div>

      {/* 5. Bottom HUD Micro Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
    </div>
  )
}
