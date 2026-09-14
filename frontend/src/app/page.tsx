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
  Compass
} from 'lucide-react'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      {/* Background Mesh Grids */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-10" />

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
            <a href="#features" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition-colors">
              Features
            </a>
            <a href="#benefits" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition-colors">
              Curriculum
            </a>
            <a href="#stats" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition-colors">
              Statistics
            </a>
          </nav>

          {/* Right Action Area (Theme Toggle + Auth Buttons) */}
          <div className="hidden md:flex items-center gap-3.5">
            {/* Top-Right Theme Toggle Button */}
            <ThemeToggle />

            <Link 
              href="/login" 
              className="px-4.5 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 transition-all duration-200"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
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
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-base text-slate-700 dark:text-slate-300 font-medium py-1"
            >
              Features
            </a>
            <a 
              href="#benefits" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-base text-slate-700 dark:text-slate-300 font-medium py-1"
            >
              Curriculum
            </a>
            <a 
              href="#stats" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-base text-slate-700 dark:text-slate-300 font-medium py-1"
            >
              Statistics
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

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 dark:border-white/5 flex items-center justify-center lg:justify-start gap-8">
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">100%</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cloud Driven</p>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-white/10" />
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">HD</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Video Streaming</p>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-white/10" />
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">24/7</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Portal Access</p>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-indigo-500 via-violet-500 to-cyan-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-700" />
                
                <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-3 border border-slate-200/80 dark:border-white/10 overflow-hidden">
                  <Image
                    src="/lms_hero.png"
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

      {/* Features Grid Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Core Capabilities
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Designed For Academic Excellence
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
              Everything a student needs to study units, access Google Drive lesson content, and monitor curriculum progress.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-7 rounded-3xl border border-slate-200/80 dark:border-white/5 bg-slate-50/70 dark:bg-slate-950/60 hover:border-indigo-500/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Curriculum Units</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Structured grade-by-grade units with ordered learning roadmaps and comprehensive study outlines.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-3xl border border-slate-200/80 dark:border-white/5 bg-slate-50/70 dark:bg-slate-950/60 hover:border-indigo-500/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-5 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Video Streaming</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Seamless Google Drive integrated video lectures with high-res automatic thumbnail previews.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-3xl border border-slate-200/80 dark:border-white/5 bg-slate-50/70 dark:bg-slate-950/60 hover:border-indigo-500/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-5 group-hover:bg-cyan-600 group-hover:text-white transition-colors duration-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Verified Access</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Protected learning materials secured with admin profile verification and role management.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-7 rounded-3xl border border-slate-200/80 dark:border-white/5 bg-slate-50/70 dark:bg-slate-950/60 hover:border-indigo-500/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Adaptive Modes</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Comfortable viewing experience with instant top-right light and dark theme switching.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-10 top-10 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Ready to Start Learning?
          </h2>
          <p className="text-base sm:text-lg text-indigo-100 max-w-2xl mx-auto leading-relaxed">
            Create your student account in under a minute and access curriculum units and lesson archives.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register" 
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-indigo-700 font-bold hover:bg-slate-50 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              Register Free
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 border border-white/25 hover:border-white text-white font-bold hover:bg-white/20 transition-all"
            >
              Sign In to Account
            </Link>
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
                <span className="font-extrabold text-xl text-white tracking-tight">ICT LMS</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                #ict_for_future - Modern educational management system empowering students and educators.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Navigation</h4>
              <ul className="space-y-2 text-sm">
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
                Designed & Developed by Manusha.
              </p>
              <a
                href="https://manushaw.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors group"
              >
                <span>manushaw.vercel.app</span>
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
