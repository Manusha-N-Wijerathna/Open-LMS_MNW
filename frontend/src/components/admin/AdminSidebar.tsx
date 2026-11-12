'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export type AdminTab = 'users' | 'content' | 'past-papers' | 'exams' | 'exam-results' | 'broadcast'

interface AdminSidebarProps {
  activeTab: AdminTab
  isOpen: boolean
  onClose: () => void
  onTabChange?: (tab: AdminTab) => void
  pendingUsersCount?: number
  adminName?: string
}

export function AdminSidebar({
  activeTab,
  isOpen,
  onClose,
  onTabChange,
  pendingUsersCount = 0,
  adminName = 'Administrator',
}: AdminSidebarProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/admin/login')
    } catch (err) {
      console.error('Error signing out:', err)
      router.push('/admin/login')
    }
  }

  const handleItemClick = (tab: AdminTab) => {
    if (onTabChange) {
      onTabChange(tab)
    } else {
      router.push(`/admin/dashboard?tab=${tab}`)
    }
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onClose()
    }
  }

  const navItems = [
    {
      id: 'users' as AdminTab,
      label: 'Users Management',
      icon: (
        <svg className="w-5 h-5 transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.999-3.199a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      badge: pendingUsersCount > 0 ? (
        <span className="text-[10px] font-extrabold bg-indigo-500 text-white px-2 py-0.5 rounded-full ring-2 ring-slate-100 dark:ring-slate-900 group-hover:scale-105 transition-transform">
          {pendingUsersCount}
        </span>
      ) : null,
      activeColor: 'bg-gradient-to-r from-indigo-500/20 to-violet-500/10 border-l-2 border-indigo-500 text-indigo-600 dark:text-white shadow-lg shadow-indigo-500/5 font-bold',
    },
    {
      id: 'content' as AdminTab,
      label: 'Content Library',
      icon: (
        <svg className="w-5 h-5 transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
      badge: null,
      activeColor: 'bg-gradient-to-r from-indigo-500/20 to-violet-500/10 border-l-2 border-indigo-500 text-indigo-600 dark:text-white shadow-lg shadow-indigo-500/5 font-bold',
    },
    {
      id: 'past-papers' as AdminTab,
      label: 'Past Papers',
      icon: (
        <svg className="w-5 h-5 transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      ),
      activeColor: 'bg-gradient-to-r from-indigo-500/20 to-violet-500/10 border-l-2 border-indigo-500 text-indigo-600 dark:text-white shadow-lg shadow-indigo-500/5 font-bold',
    },
    {
      id: 'exams' as AdminTab,
      label: 'Exam Timers',
      icon: (
        <svg className="w-5 h-5 transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      activeColor: 'bg-gradient-to-r from-indigo-500/20 to-violet-500/10 border-l-2 border-indigo-500 text-indigo-600 dark:text-white shadow-lg shadow-indigo-500/5 font-bold',
    },
    {
      id: 'exam-results' as AdminTab,
      label: 'Exam Results',
      icon: (
        <svg className="w-5 h-5 transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-5.25 6.557c-.896-.248-1.783-.52-2.658-.814" />
        </svg>
      ),
      activeColor: 'bg-gradient-to-r from-indigo-500/20 to-violet-500/10 border-l-2 border-indigo-500 text-indigo-600 dark:text-white shadow-lg shadow-indigo-500/5 font-bold',
    },
  {
    id: 'broadcast' as AdminTab,
    label: 'Video Announcements',
    icon: (
      <svg className="w-5 h-5 transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
    activeColor: 'bg-gradient-to-r from-indigo-500/20 to-blue-500/10 border-l-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-lg shadow-indigo-500/5 font-bold',
  }]

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Collapsible Sidebar */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 bg-white/95 dark:bg-slate-900/40 backdrop-blur-xl border-r border-slate-200/80 dark:border-white/5 transition-all duration-300 flex flex-col justify-between overflow-hidden shrink-0 ${
          isOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full md:w-0 md:translate-x-0 border-r-0'
        }`}
      >
        <div className="w-72 flex flex-col justify-between h-full">
          <div>
            {/* Header/Logo */}
            <div className="h-20 border-b border-slate-200/80 dark:border-white/5 flex items-center justify-between px-6">
              <Link href="/admin/dashboard" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900 dark:text-white tracking-wide">#IFF LMS</h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Admin Panel</p>
                </div>
              </Link>
              {/* Close button */}
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Close sidebar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation Menu */}
            <nav className="p-4 space-y-2.5">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-3 mb-2">Management</p>

              {navItems.map((item) => {
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group cursor-pointer ${
                      isActive
                        ? item.activeColor
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.badge}
                  </button>
                )
              })}

            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-200/80 dark:border-white/5 bg-slate-50/80 dark:bg-slate-950/20">
            <div className="flex items-center gap-3 px-2 py-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-white/10 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{adminName}</p>
                <p className="text-[10px] text-slate-500 truncate font-mono">System Administrator</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/[0.03] hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 hover:border-red-500/20 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

