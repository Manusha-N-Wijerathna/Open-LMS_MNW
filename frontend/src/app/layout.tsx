'use client'
import './globals.css'
import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { ThemeProvider } from '@/components/ThemeProvider'
import { TechAnimatedBackground } from '@/components/TechAnimatedBackground'
import api from '@/lib/api'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading } = useAuthStore()

  const fetchProfile = useCallback(async (accessToken: string) => {
    try {
      const res = await api.get('/content/profile/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      setProfile(res.data)
    } catch {
      // Profile fetch error handled gracefully
    } finally {
      setLoading(false)
    }
  }, [setProfile, setLoading])

  useEffect(() => {
    // Check session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.access_token)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          fetchProfile(session.access_token)
        } else {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [fetchProfile, setUser, setProfile, setLoading])

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('lms_theme');
                if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else if (saved === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        <ThemeProvider>
          <TechAnimatedBackground />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}