'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  GraduationCap,
  BookOpen,
  BarChart3,
  MessageSquare,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Layers,
  Menu,
  X,
  Compass,
  FileText
} from 'lucide-react'
import { ExamCountdownSection } from '@/components/ExamCountdownSection'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl sm:text-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 dark:from-white dark:via-indigo-200 dark:to-cyan-400 bg-clip-text text-transparent tracking-tight">
                #ict_for_future
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 -mt-1">
                LMS Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/past-papers" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition-colors flex items-center gap-1.5">
              <span>Past Papers</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">Free</span>
            </Link>
            <a href="#exam-countdown" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition-colors">
              Exam Countdown
            </a>
            <a href="#benefits" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition-colors">
              Curriculum
            </a>
          </nav>

          {/* Right Action Area (Theme Toggle + Auth Buttons) */}
          <div className="hidden md:flex items-center gap-3.5">
            {/* Top-Right Theme Toggle Button */}
            <ThemeToggle />
          </div>

          {/* Mobile Actions (Theme Toggle + Menu Trigger) */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/80 dark:border-white/5 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-5 py-6 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-200 shadow-2xl">
            <a
              href="#exam-countdown"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base text-slate-700 dark:text-slate-300 font-medium py-1"
            >
              Exam Countdown
            </a>
            <a
              href="#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base text-slate-700 dark:text-slate-300 font-medium py-1"
            >
              Curriculum
            </a>
            
            <div className="h-px bg-slate-200 dark:bg-white/10 my-2" />
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-semibold hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Student Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-14 pb-20 lg:pt-24 lg:pb-32">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-violet-500/10 dark:bg-violet-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen ICT Learning System</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                Empower Your <br />
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Learning Journey
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Access streaming video lessons, unit materials, track grades, and collaborate in one unified, beautifully designed student space.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-center shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>Start Learning Today</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-200 font-bold text-center shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  Student Dashboard
                </Link>
              </div>

              {/* Social & Community Links */}
              <div className="pt-6 border-t border-slate-200/80 dark:border-white/5 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <a
                  href="https://chat.whatsapp.com/JCS7lR5yUye6oSBcybGJJn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/15 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-200">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m-3.53 3.42c-.19 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.21 3.07c.15.19 2.06 3.29 5.09 4.49 2.52 1 3.04.8 3.59.75.55-.05 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.34-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      WhatsApp Community
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Join Discussion Group
                    </p>
                  </div>
                </a>

                <a
                  href="https://youtube.com/@manusha_n_wijerathna?si=GThCApsFjAOrf70K"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/15 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-600/25 group-hover:scale-105 transition-transform duration-200">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      YouTube Channel
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Watch Video Lessons
                    </p>
                  </div>
                </a>


              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-indigo-500 via-violet-500 to-cyan-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-700" />

                <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-3 border border-slate-200/80 dark:border-white/10 overflow-hidden">
                  <Image
                    src="/hero01.png"
                    alt="ICT LMS Digital Classroom Illustration"
                    width={600}
                    height={450}
                    className="rounded-2xl w-full h-auto object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exam Countdown & Schedule Section */}
      <ExamCountdownSection />

      {/* Past Papers Library - Professional Banner */}
      <section className="py-20 relative overflow-hidden bg-slate-900 border-y border-slate-800 text-white">
        {/* Ambient Glows */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-72 bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-violet-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          
          {/* Heading */}
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Examination {' '}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              Papers Library
            </span>
          </h2>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Access genuine Sri Lankan G.C.E. A/L, O/L, and scholarship past papers, model questions, and official marking schemes with instant preview and download.
          </p>

          {/* Feature highlights pill grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4 pb-2">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm flex items-center justify-center gap-3">
              <FileText className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-white">G.C.E. A/L & O/L</p>
                <p className="text-[11px] text-slate-400">Past Examination Papers</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm flex items-center justify-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-white">Official Schemes</p>
                <p className="text-[11px] text-slate-400">Marking & Answer Keys</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm flex items-center justify-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-white">Model Papers</p>
                <p className="text-[11px] text-slate-400">Target Revision Sets</p>
              </div>
            </div>
          </div>

          {/* CTA Links */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/past-papers"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 inline-flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              <span>Browse Past Papers</span>
            </Link>
            <a
              href="https://chat.whatsapp.com/JCS7lR5yUye6oSBcybGJJn"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white/5 border border-white/15 hover:border-white/30 text-white font-semibold hover:bg-white/10 transition-all"
            >
              Join WhatsApp Updates
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-xl text-white tracking-tight">#ict_for_future</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
               Modern educational management system empowering students and educators.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/past-papers" className="hover:text-white transition-colors">Past Papers Library</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Student Login</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Student Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Portal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/admin/login" className="hover:text-white transition-colors">Admin Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Developer</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-2">
                Designed & Developed by Manusha Wijerathna.
              </p>
              <a
                href="https://manushaw.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors group"
              >
                <span>Manusha Wijerathna</span>
                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>&copy; {new Date().getFullYear()} #ict_for_future LMS. All rights reserved.</p>
            <p className="text-slate-500 text-xs">Empowering the Future of ICT Education</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
