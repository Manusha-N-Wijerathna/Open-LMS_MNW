'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminPastPapersRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin/dashboard?tab=past-papers')
  }, [router])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <AdminSidebar
        activeTab="past-papers"
        isOpen={true}
        onClose={() => {}}
      />
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <p className="mt-4 text-sm text-slate-400 font-medium tracking-wide animate-pulse">
          Opening Past Papers Archive in Admin Dashboard...
        </p>
      </div>
    </div>
  )
}
