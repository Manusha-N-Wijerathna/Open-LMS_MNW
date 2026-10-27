'use client'
import './globals.css'
import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { ThemeProvider } from '@/components/ThemeProvider'
import { TechAnimatedBackground } from '@/components/TechAnimatedBackground'
import { InitialLoadingScreen } from '@/components/InitialLoadingScreen'
import { PwaManager } from '@/components/PwaManager'
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
        <title>ICT for Future - LMS Platform</title>
        <meta name="description" content="Interactive Learning Management System with past papers, study resources, and exam countdowns." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />

        {/* PWA Web App Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Apple iOS Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ICT Future LMS" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />

        {/* Android / Windows / Browser Theming */}
        <meta name="application-name" content="ICT Future LMS" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#4f46e5" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#090d16" media="(prefers-color-scheme: dark)" />
        <meta name="msapplication-TileColor" content="#4f46e5" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />

        {/* Favicons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />

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
          <InitialLoadingScreen />
          <TechAnimatedBackground />
          <PwaManager />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}