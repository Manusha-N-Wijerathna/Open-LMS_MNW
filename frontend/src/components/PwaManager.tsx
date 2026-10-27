'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Download, Monitor, Smartphone, X, Sparkles, Share2, PlusSquare } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function PwaManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const handleInstallClick = useCallback(async () => {
    if (isIos) {
      setShowIosGuide(true)
      return
    }

    if (!deferredPrompt) {
      // If prompt not available yet (e.g. desktop safari/firefox)
      alert('To install, open your browser menu and choose "Install App" or "Add to Home Screen".')
      return
    }

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt')
        setShowBanner(false)
      } else {
        console.log('[PWA] User dismissed the install prompt')
      }
      setDeferredPrompt(null)
    } catch (err) {
      console.error('[PWA] Install prompt error:', err)
    }
  }, [deferredPrompt, isIos])

  // Register Service Worker & Install Listeners
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check standalone mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true

    setIsStandalone(isStandaloneMode)

    if (isStandaloneMode) {
      return // Already in app mode, no need to show install banner
    }

    // Detect OS / Device
    const userAgent = window.navigator.userAgent.toLowerCase()
    const iosDevice = /iphone|ipad|ipod/.test(userAgent)
    const mobileDevice = /android|iphone|ipad|ipod|mobile/.test(userAgent)
    setIsIos(iosDevice)
    setIsMobile(mobileDevice)

    // Register service worker in production/browser
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] ServiceWorker registered with scope:', registration.scope)

            // Check for updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[PWA] New content is available; please refresh.')
                  }
                }
              }
            }
          })
          .catch((error) => {
            console.warn('[PWA] ServiceWorker registration failed:', error)
          })
      })
    }

    // Listen for beforeinstallprompt (Chromium on Desktop/Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Check if user dismissed banner recently
      const dismissedUntil = localStorage.getItem('pwa_prompt_dismissed_until')
      if (!dismissedUntil || Date.now() > parseInt(dismissedUntil, 10)) {
        setShowBanner(true)
      }
    }

    // Listen for appinstalled
    const handleAppInstalled = () => {
      console.log('[PWA] App successfully installed!')
      setIsInstalled(true)
      setShowBanner(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // For iOS users who haven't installed it
    if (iosDevice && !isStandaloneMode) {
      const dismissedUntil = localStorage.getItem('pwa_prompt_dismissed_until')
      if (!dismissedUntil || Date.now() > parseInt(dismissedUntil, 10)) {
        setShowBanner(true)
      }
    }

    const handleTriggerInstall = () => {
      handleInstallClick()
    }
    window.addEventListener('open-pwa-install', handleTriggerInstall)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('open-pwa-install', handleTriggerInstall)
    }
  }, [handleInstallClick])

  const dismissBanner = () => {
    setShowBanner(false)
    // Don't ask again for 7 days
    const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000
    localStorage.setItem('pwa_prompt_dismissed_until', nextWeek.toString())
  }

  if (isStandalone || !showBanner) {
    return null
  }

  return (
    <>
      {/* Floating PWA Install Prompt Banner */}
      <aside
        aria-label="Install App Banner"
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
      >
        <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 backdrop-blur-xl bg-slate-900/95 dark:bg-slate-950/95 border border-indigo-500/30 shadow-2xl shadow-indigo-950/50 text-white">
          {/* Subtle glowing ambient accent */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Dismiss button */}
          <button
            onClick={dismissBanner}
            className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Dismiss install banner"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/30">
              {isMobile ? (
                <Smartphone className="w-6 h-6 text-white" />
              ) : (
                <Monitor className="w-6 h-6 text-white" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Fast Standalone App
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-100">
                Install ICT for Future LMS
              </h4>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                {isMobile
                  ? 'Add to home screen for fast offline access, study reminders & instant papers.'
                  : 'Install on your desktop for high-speed offline navigation and windowed mode.'}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 mt-3.5">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 py-2 px-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 transition-transform active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isIos ? 'How to Install' : 'Install Now'}</span>
                </button>
                <button
                  onClick={dismissBanner}
                  className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* iOS Safari Installation Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setShowIosGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center mb-4 text-indigo-400">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">
              Install on iOS (iPhone / iPad)
            </h3>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Safari on iOS allows you to install this web app directly to your home screen with full fullscreen standalone support:
            </p>

            <ol className="space-y-3.5 text-xs text-slate-200">
              <li className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600/40 text-indigo-300 font-bold flex items-center justify-center text-xs">
                  1
                </span>
                <span>
                  Tap the <strong className="text-white">Share</strong> icon (<Share2 className="w-3.5 h-3.5 inline mx-0.5 text-cyan-400" />) at the bottom toolbar of Safari.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600/40 text-indigo-300 font-bold flex items-center justify-center text-xs">
                  2
                </span>
                <span>
                  Scroll down and choose <strong className="text-white">Add to Home Screen</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-cyan-400" />).
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600/40 text-indigo-300 font-bold flex items-center justify-center text-xs">
                  3
                </span>
                <span>
                  Tap <strong className="text-white">Add</strong> in the top-right corner.
                </span>
              </li>
            </ol>

            <button
              onClick={() => setShowIosGuide(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  )
}
