'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { InstallButton } from '@/components/InstallButton'
import {
  GraduationCap,
  BookOpen,
  Video,
  FileText,
  Clock,
  Award,
  ShieldCheck,
  Users,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Search,
  Download,
  Laptop,
  Layers,
  Tv,
  Filter,
  BarChart3,
  ExternalLink,
  FileSpreadsheet,
  Moon,
  Smartphone,
  ChevronRight,
  Menu,
  X,
  Zap,
  HelpCircle,
  FolderTree,
  Lock,
  Globe2,
  FileCheck
} from 'lucide-react'

export default function FeaturesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const categories = [
    { id: 'all', label: 'All Features' },
    { id: 'learning', label: 'Video & Curriculum' },
    { id: 'pastpapers', label: 'Past Papers' },
    { id: 'timers', label: 'Exam Timers' },
    { id: 'results', label: 'Exam Results' },
    { id: 'admin', label: 'Admin Studio' },
  ]

  const featureCards = [
    {
      category: 'learning',
      badge: 'Curriculum',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      title: 'Structured Grade & Unit Hierarchy',
      desc: 'Seamlessly organize lessons from Grade 6 to Grade 13 A/L. Group educational content into logical units with real-time sequencing and lesson reordering.',
      icon: <FolderTree className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      highlights: [
        'Organized by Grade -> Unit -> Lessons',
        'Custom thumbnails & rich descriptions',
        'Instant lesson reordering via arrow controls'
      ]
    },
    {
      category: 'learning',
      badge: 'Video Cloud',
      badgeColor: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
      title: 'Google Drive Video Integration',
      desc: 'High-speed cloud video streaming directly from Google Drive links. Video lessons stream in embedded players without heavy hosting costs or buffering delays.',
      icon: <Video className="w-6 h-6 text-violet-600 dark:text-violet-400" />,
      highlights: [
        'Automatic Drive file ID extraction',
        'Zero video compression loss',
        'Protected player iframe for enrolled students'
      ]
    },
    {
      category: 'learning',
      badge: 'Bulk Tools',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      title: 'CSV Bulk Lesson Importer',
      desc: 'Upload dozens of lessons for any unit in seconds using a simple CSV file with title, description, Drive link, and thumbnail URLs.',
      icon: <FileSpreadsheet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      highlights: [
        'One-click template download',
        'Automatic row validation & preview',
        'Fast bulk insert with real-time feedback'
      ]
    },
    {
      category: 'pastpapers',
      badge: 'Free Archive',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      title: 'Past Papers & Model Papers Archive',
      desc: 'Comprehensive repository of national O/L and A/L ICT past examination papers, model evaluation papers, and official marking schemes.',
      icon: <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      highlights: [
        'O/L & A/L categorization with years',
        'Sinhala, English & Tamil mediums',
        'Direct download & interactive PDF modal'
      ]
    },
    {
      category: 'pastpapers',
      badge: 'Smart Discovery',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      title: 'Instant Multi-Filter Paper Search',
      desc: 'Filter by Exam Type (A/L or O/L), Medium (Sinhala/English/Tamil), or search terms in real-time to find target question papers in milliseconds.',
      icon: <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      highlights: [
        'Live search as you type',
        'Year and paper-type pill filters',
        'Direct PDF viewer modal without leaving page'
      ]
    },
    {
      category: 'timers',
      badge: 'Real-time',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      title: 'Live Examination Countdowns',
      desc: 'Interactive live countdown clocks for Sri Lanka G.C.E. Advanced Level, Ordinary Level, and school term exams keep students on track.',
      icon: <Clock className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
      highlights: [
        'Synchronized Days, Hours, Minutes, Seconds',
        'Status indicators: Active, Upcoming, or Concluded',
        'Hero section countdown banner on landing page'
      ]
    },
    {
      category: 'timers',
      badge: 'Admin Studio',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      title: 'Exam Timers Management Studio',
      desc: 'Administrators can add, edit, or retire exam countdown clocks with custom dates, descriptions, and publish status from a dedicated tab.',
      icon: <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      highlights: [
        'One-click countdown toggle',
        'Live countdown preview before publishing',
        'Unified admin dashboard tab integration'
      ]
    },
    {
      category: 'results',
      badge: 'Public & Open',
      badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      title: 'Public Exam Results Hub',
      desc: 'Check test scores and performance metrics with public access without requiring mandatory logins. Clean and transparent academic reporting.',
      icon: <Award className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />,
      highlights: [
        'Accessible without student login barrier',
        'Grouped by Grade and Term (e.g. /grade-8/first-term)',
        'Instant name & institute student search'
      ]
    },
    {
      category: 'results',
      badge: 'Rankings',
      badgeColor: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
      title: 'Descending Marks & Merit Medals',
      desc: 'Results are sorted in descending order considering marks, featuring Gold, Silver, and Bronze medals for the top 3 high achievers.',
      icon: <BarChart3 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />,
      highlights: [
        'Automatic rank calculations',
        'Color-coded grade pills (A, B, C, S, W, ab)',
        'Summary statistics: Total sat, Passed, Average'
      ]
    },
    {
      category: 'admin',
      badge: 'Management',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      title: 'Unified Admin Dashboard & Sidebar',
      desc: 'Switch instantly between Users, Content, Past Papers, Exam Timers, Exam Results, and Broadcast Studios without page refreshes or blocking loading screens.',
      icon: <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      highlights: [
        'Persistent collapsible sidebar',
        'Instant URL tab persistence (?tab=...)',
        'Non-blocking background data fetching'
      ]
    },
    {
      category: 'admin',
      badge: 'Security',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      title: 'Student Verification & Multi-Grade Access',
      desc: 'Control student video access with a verification approval workflow. Easily assign students to multiple grades simultaneously.',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      highlights: [
        'Pending approval verification queue',
        'Multi-grade assignment modal for students',
        'Row-Level Security (RLS) database policies'
      ]
    },
    {
      category: 'admin',
      badge: 'Broadcast',
      badgeColor: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
      title: 'Video Announcements & Banner Studio',
      desc: 'Broadcast urgent video alerts, lesson announcements, and notices directly onto the student portal with the interactive Banner Generator.',
      icon: <Tv className="w-6 h-6 text-pink-600 dark:text-pink-400" />,
      highlights: [
        'Floating video announcement cards',
        'Interactive preview generator',
        'One-click publish to student dashboards'
      ]
    },
  ]

  const filteredCards = activeCategory === 'all'
    ? featureCards
    : featureCards.filter(c => c.category === activeCategory)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">

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

          

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-3.5">
            <ThemeToggle />
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Actions */}
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
            <div className="pb-1">
              <InstallButton className="w-full justify-center py-2.5 text-sm" variant="solid" />
            </div>
            <Link
              href="/features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base text-indigo-600 dark:text-indigo-400 font-bold py-1 flex items-center justify-between"
            >
              <span>Features</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">All-in-One</span>
            </Link>
            <Link
              href="/past-papers"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base text-slate-700 dark:text-slate-300 font-medium py-1 flex items-center justify-between"
            >
              <span>Past Papers</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">Free</span>
            </Link>
            <Link
              href="/exam-results"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base text-slate-700 dark:text-slate-300 font-medium py-1"
            >
              Exam Results
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base text-slate-700 dark:text-slate-300 font-medium py-1"
            >
              Student Login
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20 mt-2"
            >
              Join LMS Today
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200/80 dark:border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.2),rgba(15,23,42,0))] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
            Everything you need for {''} <br></br>
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-400 bg-clip-text text-transparent">
              world-class ICT education
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover the powerful suite of features built into <span className="font-semibold text-slate-900 dark:text-white">#ict_for_future LMS</span>. Designed for students, parents, and educators from Grade 6 to A/L.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto mb-10">
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-white/5 shadow-sm">
              <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">Grades 6–13</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Syllabus Coverage</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-white/5 shadow-sm">
              <p className="text-2xl sm:text-3xl font-black text-violet-600 dark:text-violet-400">100% Free</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Past Papers Archive</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-white/5 shadow-sm">
              <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">Live Ticking</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Exam Countdowns</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-white/5 shadow-sm">
              <p className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400">Public</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Exam Results Hub</p>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/past-papers"
              className="px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all"
            >
              Browse Past Papers
            </Link>
            <Link
              href="/exam-results"
              className="px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all"
            >
              View Exam Results
            </Link>
          </div>
        </div>
      </section>

      {/* Filter Tabs Section */}
      <section className="py-8 bg-white/50 dark:bg-slate-900/30 border-b border-slate-200/80 dark:border-white/5 sticky top-20 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map(c => {
              const active = activeCategory === c.id
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/5'
                  }`}
                >
                  {c.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredCards.map((feat, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group"
            >
              <div>
                {/* Header Icon + Badge */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {feat.icon}
                  </div>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${feat.badgeColor}`}>
                    {feat.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2.5 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  {feat.desc}
                </p>
              </div>

              {/* Highlights List */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
                {feat.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Role Breakdown: Students vs Administrators */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-transparent via-indigo-500/[0.03] to-transparent border-t border-slate-200/80 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Tailored Experiences for Every User
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Whether you are an ambitious student aiming for island rank or an administrator curating study material, our platform is built for speed and clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Student Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-lg shadow-indigo-500/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">For Students</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Effortless, distraction-free studying</p>
                </div>
              </div>

              <ul className="space-y-3.5 mb-8 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Instant access to curated grade syllabus and video recordings.</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Download past papers and marking schemes in Sinhala, English, and Tamil.</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Track remaining days, hours, and minutes for national A/L & O/L ICT exams.</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>View test scores and island/class ranking without complex login gates.</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Install as a native application on phones and desktops with offline readiness.</span>
                </li>
              </ul>

              <Link
                href="/register"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20"
              >
                <span>Create Student Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Admin Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-lg shadow-violet-500/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">For Administrators</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total pedagogical & administrative command</p>
                </div>
              </div>

              <ul className="space-y-3.5 mb-8 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Unified dashboard with instant tab switching (Users, Content, Papers, Results).</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Import hundreds of lessons across grades in seconds via CSV Bulk Uploader.</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Verify new registrations and assign students to multiple grades simultaneously.</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Publish term exam countdown timers and floating broadcast video notices.</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Manage grade evaluation results and award merit scores with instant calculation.</span>
                </li>
              </ul>

              <Link
                href="/admin/login"
                className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>Administrative Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 sm:py-20 border-t border-slate-200/80 dark:border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Clear answers regarding student access, features, and curriculum support.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10">
              <h4 className="font-bold text-base text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-500" />
                <span>Do students need an account to view exam results and past papers?</span>
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                No! The Exam Results Hub and the Past Papers Archive are publicly accessible so parents and students can review evaluation marks, download question papers, and check exam countdowns without any barrier.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10">
              <h4 className="font-bold text-base text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-500" />
                <span>Why is verification required for video lesson access?</span>
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                Verification ensures enrolled students receive curriculum content matching their specific academic grade. An administrator reviews pending registrations and approves appropriate grade assignments.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10">
              <h4 className="font-bold text-base text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-500" />
                <span>Can a student access multiple grades?</span>
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                Yes! The multi-grade assignment feature allows administrators to assign a student to multiple course levels (for example, Grade 11 revision alongside Grade 10 fundamentals).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10">
              <h4 className="font-bold text-base text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-500" />
                <span>Can the LMS be installed as a mobile application?</span>
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                Yes, our LMS is built with Progressive Web App (PWA) standards. Click the "Install App" button in the top navigation bar on your Android, iOS, or PC browser to install it with an icon on your home screen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Start Learning with #ict_for_future Today
          </h2>
          <p className="text-indigo-100 max-w-2xl mx-auto text-sm sm:text-base mb-8 leading-relaxed">
            Join hundreds of ICT students achieving excellence through structured curriculum videos, free past papers, live exam timers, and transparent performance tracking.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-2xl bg-white text-indigo-700 font-bold shadow-xl hover:bg-indigo-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Register as Student
            </Link>
            <a
              href="https://chat.whatsapp.com/JCS7lR5yUye6oSBcybGJJn"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-2xl bg-white/15 hover:bg-white/20 border border-white/25 text-white font-semibold transition-all"
            >
              Join WhatsApp Community
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
                Modern educational management system empowering students and educators across Sri Lanka.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="text-indigo-400 font-medium">Platform Features</Link></li>
                <li><Link href="/past-papers" className="hover:text-white transition-colors">Past Papers Library</Link></li>
                <li><Link href="/exam-results" className="hover:text-white transition-colors">Exam Results Hub</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Student Login</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Student Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Portal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Student Dashboard</Link></li>
                <li><Link href="/admin/dashboard" className="hover:text-white transition-colors">Admin Dashboard</Link></li>
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
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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

