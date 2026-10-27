'use client'

import React, { useEffect, useState } from 'react'
import { Download, Smartphone, Monitor, CheckCircle2, Share2, PlusSquare, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

interface InstallButtonProps {
  className?: string
  showText?: boolean
  variant?: 'solid' | 'outline' | 'subtle'
}

export function InstallButton({
  className = '',
  showText = true,
  variant = 'solid'
}: InstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [showIosModal, setShowIosModal] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    setIsStandalone(standalone)

    const ua = window.navigator.userAgent.toLowerCase()
    setIsIos(/iphone|ipad|ipod/.test(ua))

    const handlePrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handlePrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleClick = async () => {
    if (installed || isStandalone) {
      alert('ICT for Future LMS is already installed on your device!')
      return
    }

    if (isIos) {
      setShowIosModal(true)
      return
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setInstalled(true)
      }
      setDeferredPrompt(null)
    } else {
      // In case browser has native install in address bar (e.g. desktop Chrome)
      alert('To install this app on your device:\n\n• On Chrome/Edge Desktop: Click the Install icon in the address bar (top right)\n• On Android: Tap "Install App" or "Add to Home Screen" in your browser menu\n• On iOS: Tap Share and choose "Add to Home Screen"')
    }
  }

  // If already standalone, we can optionally hide it or show an installed badge
  if (isStandalone) {
    return null
  }

  const baseStyles = "inline-flex items-center gap-1.5 font-semibold transition-all duration-200 cursor-pointer"
  
  let variantStyles = ""
  if (variant === 'solid') {
    variantStyles = "px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs shadow-md shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98]"
  } else if (variant === 'outline') {
    variantStyles = "px-3.5 py-1.5 rounded-xl border border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs hover:bg-indigo-500/20"
  } else {
    variantStyles = "px-3 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`${baseStyles} ${variantStyles} ${className}`}
        title="Install ICT for Future LMS as an App"
      >
        <Download className="w-3.5 h-3.5" />
        {showText && <span>Install App</span>}
      </button>

      {/* iOS Safari Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 text-white shadow-2xl relative text-left">
            <button
              onClick={() => setShowIosModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center mb-3.5 text-indigo-400">
              <Smartphone className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-white mb-1.5">
              Install on iOS
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Install this app directly to your home screen:
            </p>

            <ol className="space-y-3 text-xs text-slate-200">
              <li className="flex items-center gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600/40 text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>
                  Tap Safari&apos;s <strong className="text-white">Share</strong> button (<Share2 className="w-3 h-3 inline mx-0.5 text-cyan-400" />).
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600/40 text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>
                  Select <strong className="text-white">Add to Home Screen</strong> (<PlusSquare className="w-3 h-3 inline mx-0.5 text-cyan-400" />).
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600/40 text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>
                  Tap <strong className="text-white">Add</strong> in the top right.
                </span>
              </li>
            </ol>

            <button
              onClick={() => setShowIosModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
