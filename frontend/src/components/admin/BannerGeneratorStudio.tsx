'use client'

import React, { useState, useEffect, useRef, useId } from 'react'
import html2canvas from 'html2canvas-pro'
import QRCode from 'qrcode'
import api from '@/lib/api'
import { supabase } from '@/lib/supabase'
import {
    Tv,
    Video,
    Sparkles,
    Copy,
    Check,
    Download,
    Share2,
    RefreshCw,
    Plus,
    Trash2,
    ExternalLink,
    QrCode,
    Calendar,
    Palette,
    Tag,
    ListOrdered,
    Link as LinkIcon,
    Radio,
    Zap,
    Rocket,
    Send,
    Eye,
    SlidersHorizontal,
    CheckCircle2,
    AlertCircle,
    Info,
    Laptop,
    GraduationCap,
    BookOpen
} from 'lucide-react'

export interface LessonOption {
    id: number
    title: string
    description?: string | null
    created_at?: string
}

interface BannerGeneratorProps {
    initialLesson?: {
        title: string
        url?: string
    } | null
    availableLessons?: LessonOption[]
    onNotify?: (message: string, type: 'success' | 'error' | 'info') => void
}

type ThemeKey = 'cyberpunk' | 'emerald' | 'gold' | 'purple' | 'crimson' | 'midnight' | 'minimal'

interface ThemeConfig {
    id: ThemeKey
    name: string
    badge: string
    bgGradient: string
    borderColor: string
    accentText: string
    accentBg: string
    glowShadow: string
    pillClass: string
    headerText: string
    orbPrimary: string
    orbSecondary: string
    isDark: boolean
}

const THEMES: Record<ThemeKey, ThemeConfig> = {
    cyberpunk: {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        badge: 'from-cyan-500 to-blue-600',
        bgGradient: 'bg-gradient-to-br from-[#080d1a] via-[#0d1d33] to-[#132742]',
        borderColor: 'border-cyan-500/30',
        accentText: 'text-cyan-400',
        accentBg: 'bg-cyan-500',
        glowShadow: 'shadow-cyan-500/20',
        pillClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
        headerText: 'text-white',
        orbPrimary: 'bg-cyan-500/20',
        orbSecondary: 'bg-blue-600/20',
        isDark: true
    },
    emerald: {
        id: 'emerald',
        name: 'Emerald Matrix',
        badge: 'from-emerald-500 to-teal-600',
        bgGradient: 'bg-gradient-to-br from-[#022017] via-[#053828] to-[#0c4e38]',
        borderColor: 'border-emerald-500/30',
        accentText: 'text-emerald-400',
        accentBg: 'bg-emerald-500',
        glowShadow: 'shadow-emerald-500/20',
        pillClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        headerText: 'text-white',
        orbPrimary: 'bg-emerald-500/20',
        orbSecondary: 'bg-teal-500/20',
        isDark: true
    },
    gold: {
        id: 'gold',
        name: 'Royal Gold',
        badge: 'from-amber-500 to-yellow-600',
        bgGradient: 'bg-gradient-to-br from-[#161205] via-[#261d08] to-[#1b1406]',
        borderColor: 'border-amber-500/30',
        accentText: 'text-amber-400',
        accentBg: 'bg-amber-500',
        glowShadow: 'shadow-amber-500/20',
        pillClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        headerText: 'text-white',
        orbPrimary: 'bg-amber-500/20',
        orbSecondary: 'bg-yellow-600/20',
        isDark: true
    },
    purple: {
        id: 'purple',
        name: 'Galactic Violet',
        badge: 'from-purple-500 to-indigo-600',
        bgGradient: 'bg-gradient-to-br from-[#13091f] via-[#290d45] to-[#170926]',
        borderColor: 'border-purple-500/30',
        accentText: 'text-purple-300',
        accentBg: 'bg-purple-600',
        glowShadow: 'shadow-purple-500/20',
        pillClass: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
        headerText: 'text-white',
        orbPrimary: 'bg-purple-500/20',
        orbSecondary: 'bg-indigo-600/20',
        isDark: true
    },
    crimson: {
        id: 'crimson',
        name: 'Crimson Fire',
        badge: 'from-rose-500 to-red-600',
        bgGradient: 'bg-gradient-to-br from-[#1b060a] via-[#3d0b17] to-[#20060d]',
        borderColor: 'border-rose-500/30',
        accentText: 'text-rose-400',
        accentBg: 'bg-rose-500',
        glowShadow: 'shadow-rose-500/20',
        pillClass: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
        headerText: 'text-white',
        orbPrimary: 'bg-rose-500/20',
        orbSecondary: 'bg-red-600/20',
        isDark: true
    },
    midnight: {
        id: 'midnight',
        name: 'Deep Midnight',
        badge: 'from-indigo-500 to-slate-700',
        bgGradient: 'bg-gradient-to-br from-[#020617] via-[#091024] to-[#040817]',
        borderColor: 'border-indigo-500/30',
        accentText: 'text-indigo-400',
        accentBg: 'bg-indigo-600',
        glowShadow: 'shadow-indigo-500/20',
        pillClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
        headerText: 'text-white',
        orbPrimary: 'bg-indigo-500/20',
        orbSecondary: 'bg-blue-700/20',
        isDark: true
    },
    minimal: {
        id: 'minimal',
        name: 'Studio Light',
        badge: 'from-slate-200 to-slate-400',
        bgGradient: 'bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]',
        borderColor: 'border-slate-300',
        accentText: 'text-blue-600',
        accentBg: 'bg-blue-600',
        glowShadow: 'shadow-blue-500/10',
        pillClass: 'bg-blue-50 text-blue-700 border-blue-200',
        headerText: 'text-slate-900',
        orbPrimary: 'bg-blue-500/10',
        orbSecondary: 'bg-slate-400/15',
        isDark: false
    }
}

const PRESET_TOPICS = [
    {
        header: '🎬 NEW RECORDING AVAILABLE',
        topic: 'Python Data Structures & Algorithms - Session 04',
        date: 'October 14, 2026 | 7:00 PM',
        instructions: [
            'Click the LMS link provided above or scan the QR code.',
            'Log in using your registered student credentials.',
            'Navigate to your enrolled course to view the updated lecture.'
        ]
    },
    {
        header: '🚀 LIVE SESSION REPLAY READY',
        topic: 'Web Development Masterclass: React 19 & Tailwind CSS',
        date: 'October 15, 2026 | 6:30 PM',
        instructions: [
            'Sign in to your student dashboard.',
            'Open Module 4: Front-end Frameworks.',
            'Watch the live stream recording and download lecture slides.'
        ]
    },
    {
        header: '📢 NEW LESSON & LAB PUBLISHED',
        topic: 'Database Systems: SQL Queries & Schema Design',
        date: 'October 16, 2026 | 8:00 PM',
        instructions: [
            'Access the LMS coursework tab.',
            'Review the database diagram worksheet PDF attached.',
            'Complete the interactive practice query quiz.'
        ]
    },
    {
        header: '⚡ URGENT REVISION BROADCAST',
        topic: 'Cybersecurity Fundamentals: Network Security & Firewalls',
        date: 'October 18, 2026 | 7:30 PM',
        instructions: [
            'Access the student portal with your student ID.',
            'Download the lab assignment resources.',
            'Submit your practice findings before the deadline.'
        ]
    }
]

const DEFAULT_RECORDINGS: LessonOption[] = [
    { id: 4, title: 'Number system - Part 03', created_at: '2026-10-14T19:00:00Z' },
    { id: 3, title: 'Number System Part - 02', created_at: '2026-10-13T19:00:00Z' },
    { id: 2, title: 'Number system - Part 01', created_at: '2026-10-12T19:00:00Z' }
]

export function BannerGeneratorStudio({
    initialLesson,
    availableLessons = [],
    onNotify
}: BannerGeneratorProps) {
    const bannerCanvasRef = useRef<HTMLDivElement>(null)

    const [dbLessons, setDbLessons] = useState<LessonOption[]>([])
    const [fetchingDb, setFetchingDb] = useState(false)

    // Load the latest videos directly from database
    const loadLatestFromDatabase = React.useCallback(async () => {
        setFetchingDb(true)
        try {
            const res = await api.get('/admin/lessons')
            if (Array.isArray(res.data) && res.data.length > 0) {
                setDbLessons(res.data)
                return
            }
        } catch {
            // Fallback to client-side Supabase query
        }

        try {
            const { data, error } = await supabase
                .from('lessons')
                .select('id, title, description, created_at')
                .order('id', { ascending: false })
                .limit(10)

            if (!error && data && data.length > 0) {
                setDbLessons(data)
            }
        } catch (err) {
            console.error('Failed to load lessons from database:', err)
        } finally {
            setFetchingDb(false)
        }
    }, [])

    useEffect(() => {
        loadLatestFromDatabase()
    }, [loadLatestFromDatabase])

    // Compute the latest 3 uploaded videos from the database (sorted newest first)
    const latestRecordings = React.useMemo(() => {
        const source = dbLessons.length > 0 
            ? dbLessons 
            : (availableLessons.length > 0 ? availableLessons : DEFAULT_RECORDINGS)

        return [...source]
            .sort((a, b) => {
                if (a.created_at && b.created_at) {
                    const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    if (diff !== 0) return diff
                }
                return (b.id || 0) - (a.id || 0)
            })
            .slice(0, 3)
    }, [dbLessons, availableLessons])

    const [selectedRecordingId, setSelectedRecordingId] = useState<number | null>(null)

    // Main Content State
    const [theme, setTheme] = useState<ThemeKey>('cyberpunk')
    const [header, setHeader] = useState('🎬 NEW RECORDING AVAILABLE')
    const [topic, setTopic] = useState('Number system - Part 03')
    const [date, setDate] = useState('October 14, 2026 | 7:00 PM')
    const [lmsLink, setLmsLink] = useState('https://ictforfuturelms.vercel.app/')
    const [instructions, setInstructions] = useState<string[]>([
        'Click the LMS link provided above or scan the QR code.',
        'Log in using your registered student credentials.',
        'Navigate to your enrolled course to view the updated lecture.'
    ])

    // Tags & Features
    const [tags, setTags] = useState({
        recording: true,
        important: true,
        branding: true,
        qr: true
    })

    // QR Code Image Data URL
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')

    // Mobile View Toggle ('editor' | 'preview')
    const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor')

    // Copying & Downloading State
    const [copied, setCopied] = useState(false)
    const [downloading, setDownloading] = useState(false)

    // Populate initial lesson if passed, or default to the latest uploaded recording
    useEffect(() => {
        if (initialLesson?.title) {
            setTopic(initialLesson.title)
            if (initialLesson.url) {
                setLmsLink(initialLesson.url)
            }
        } else if (latestRecordings.length > 0) {
            const latest = latestRecordings[0]
            setSelectedRecordingId(latest.id)
            setTopic(latest.title)
            setHeader('🎬 NEW RECORDING AVAILABLE')
            if (latest.created_at) {
                try {
                    const d = new Date(latest.created_at)
                    setDate(`${d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} | ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`)
                } catch {
                    // keep current
                }
            }
        }
    }, [initialLesson, latestRecordings])

    // Generate QR Code Data URL whenever lmsLink changes
    useEffect(() => {
        let isMounted = true
        const generateQR = async () => {
            try {
                const targetUrl = lmsLink.trim() || 'https://ictforfuturelms.vercel.app/'
                const dataUrl = await QRCode.toDataURL(targetUrl, {
                    width: 256,
                    margin: 1,
                    color: {
                        dark: '#0b0f17',
                        light: '#ffffff'
                    },
                    errorCorrectionLevel: 'H'
                })
                if (isMounted) {
                    setQrCodeDataUrl(dataUrl)
                }
            } catch (err) {
                console.error('Failed to generate QR code', err)
            }
        }
        generateQR()
        return () => {
            isMounted = false
        }
    }, [lmsLink])

    const activeTheme = THEMES[theme]

    // Notification Helper
    const notify = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
        if (onNotify) {
            onNotify(msg, type)
        }
    }

    // Handlers for Instruction steps
    const handleAddInstruction = () => {
        if (instructions.length >= 5) {
            notify('Maximum 5 instruction steps allowed for optimal banner proportions.', 'info')
            return
        }
        setInstructions(prev => [...prev, 'New instruction step here'])
    }

    const handleUpdateInstruction = (index: number, val: string) => {
        setInstructions(prev => {
            const next = [...prev]
            next[index] = val
            return next
        })
    }

    const handleRemoveInstruction = (index: number) => {
        if (instructions.length <= 1) {
            notify('Must keep at least 1 instruction step.', 'info')
            return
        }
        setInstructions(prev => prev.filter((_, i) => i !== index))
    }

    // Randomize Content
    const handleRandomize = () => {
        const randomItem = PRESET_TOPICS[Math.floor(Math.random() * PRESET_TOPICS.length)]
        setHeader(randomItem.header)
        setTopic(randomItem.topic)
        setDate(randomItem.date)
        setInstructions([...randomItem.instructions])
        setSelectedRecordingId(null)
        notify('Sample announcement preset applied!', 'success')
    }

    // Import from Latest LMS Recordings
    const handleSelectLmsLesson = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const lessonId = parseInt(e.target.value)
        if (!lessonId) return
        setSelectedRecordingId(lessonId)
        const found = latestRecordings.find(l => l.id === lessonId)
        if (found) {
            setTopic(found.title)
            setHeader('🎬 NEW RECORDING AVAILABLE')
            if (found.created_at) {
                try {
                    const d = new Date(found.created_at)
                    setDate(`${d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} | ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`)
                } catch {
                    // keep current
                }
            }
            notify(`Loaded recording: "${found.title}"`, 'success')
        }
    }

    // Generate WhatsApp / Telegram formatted text
    const generateFormattedMessage = () => {
        let text = `${header}\n\n`
        text += `📌 *Topic:* ${topic}\n`
        text += `📅 *Date/Time:* ${date}\n`
        text += `🔗 *LMS Access:* ${lmsLink}\n\n`
        text += `*Instructions to Watch:*\n`
        instructions.forEach((step, idx) => {
            if (step.trim()) {
                text += `${idx + 1}. ${step.trim()}\n`
            }
        })
        text += `\n✨ _Happy Learning!_\n*ICT For Future LMS*`
        return text
    }

    // Copy to Clipboard
    const handleCopyText = async () => {
        const formatted = generateFormattedMessage()
        try {
            await navigator.clipboard.writeText(formatted)
            setCopied(true)
            notify('Formatted message copied to clipboard!', 'success')
            setTimeout(() => setCopied(false), 2500)
        } catch {
            // Fallback
            const el = document.createElement('textarea')
            el.value = formatted
            document.body.appendChild(el)
            el.select()
            document.execCommand('copy')
            document.body.removeChild(el)
            setCopied(true)
            notify('Formatted message copied to clipboard!', 'success')
            setTimeout(() => setCopied(false), 2500)
        }
    }

    // Share directly via WhatsApp Web / App
    const handleShareWhatsApp = () => {
        const text = encodeURIComponent(generateFormattedMessage())
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
    }

    // Native Web Share API if available
    const handleNativeShare = async () => {
        const text = generateFormattedMessage()
        if (navigator.share) {
            try {
                await navigator.share({
                    title: topic,
                    text: text,
                    url: lmsLink
                })
            } catch (err) {
                // Ignore user cancellation
            }
        } else {
            handleCopyText()
        }
    }

    // Download High-Resolution Banner PNG
    const handleDownloadBanner = async () => {
        if (!bannerCanvasRef.current) return
        setDownloading(true)
        notify('Rendering 1200x675 high-res banner...', 'info')

        try {
            // Wait for next tick to ensure rendering is settled
            await new Promise(res => setTimeout(res, 80))

            const canvas = await html2canvas(bannerCanvasRef.current, {
                scale: 2.5, // 2.5x crisp resolution (approx 1920x1080)
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
                logging: false,
                imageTimeout: 15000,
                onclone: (clonedDoc, clonedElement) => {
                    // Extra safety normalization: convert any oklab/oklch colors to standard RGB/HEX
                    try {
                        const tempCanvas = clonedDoc.createElement('canvas')
                        const ctx = tempCanvas.getContext('2d')
                        if (!ctx) return

                        const normalize = (colorVal: string) => {
                            if (!colorVal || (!colorVal.includes('okl') && !colorVal.includes('lab('))) return colorVal
                            try {
                                ctx.fillStyle = colorVal
                                return ctx.fillStyle || colorVal
                            } catch {
                                return colorVal
                            }
                        }

                        const allElements = clonedElement.querySelectorAll('*')
                        allElements.forEach(el => {
                            const htmlEl = el as HTMLElement
                            const cs = clonedDoc.defaultView?.getComputedStyle(htmlEl)
                            if (!cs) return
                            if (cs.color && (cs.color.includes('okl') || cs.color.includes('lab('))) {
                                htmlEl.style.color = normalize(cs.color)
                            }
                            if (cs.backgroundColor && (cs.backgroundColor.includes('okl') || cs.backgroundColor.includes('lab('))) {
                                htmlEl.style.backgroundColor = normalize(cs.backgroundColor)
                            }
                            if (cs.borderColor && (cs.borderColor.includes('okl') || cs.borderColor.includes('lab('))) {
                                htmlEl.style.borderColor = normalize(cs.borderColor)
                            }
                        })
                    } catch {
                        // let html2canvas-pro handle natively
                    }
                }
            })

            const cleanFileName = topic
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '_')
                .replace(/_+/g, '_')
                .slice(0, 35) || 'announcement_banner'

            const image = canvas.toDataURL('image/png')
            const link = document.createElement('a')
            link.download = `lms_${cleanFileName}.png`
            link.href = image
            link.click()

            notify('Banner graphic downloaded successfully!', 'success')
        } catch (error) {
            console.error('Export error:', error)
            notify('Failed to generate banner image. Please try again.', 'error')
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* ── Top Header Banner with Live Actions ── */}
            <div className="bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05] rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-sm dark:shadow-none flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 shrink-0">
                        <Radio className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                Video Update & Announcement Studio
                            </h2>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Generate beautiful high-res social media banners, scannable QR cards, and auto-formatted WhatsApp broadcast messages.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    {/* Randomize Preset Button */}
                    <button
                        onClick={handleRandomize}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/5 transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                        title="Load sample content"
                    >
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-500" />
                        <span className="hidden sm:inline">Randomize</span>
                    </button>
                </div>
            </div>

            {/* ── Mobile View Segmented Tab Switcher (Visible only on <lg screens) ── */}
            <div className="flex lg:hidden bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                <button
                    onClick={() => setMobileTab('editor')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${
                        mobileTab === 'editor'
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Editor Controls</span>
                </button>
                <button
                    onClick={() => setMobileTab('preview')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${
                        mobileTab === 'preview'
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    <Eye className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Live Preview & Share</span>
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                </button>
            </div>

            {/* ── Main Workspace Grid (Left: Configurator, Right: Preview Canvas & Formatted Output) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* ──────────────── LEFT COLUMN: Form Configurator (5 cols) ──────────────── */}
                <div className={`lg:col-span-5 space-y-5 ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
                    <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-sm dark:shadow-none space-y-5">
                        
                        {/* Section Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                                <Palette className="w-4 h-4 text-cyan-500" />
                                <span>Theme & Style Palette</span>
                            </div>
                            <span className="text-[11px] font-mono text-cyan-500 font-semibold uppercase">
                                {activeTheme.name}
                            </span>
                        </div>

                        {/* Theme Buttons */}
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                                Select Visual Atmosphere
                            </label>
                            <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-4 xl:grid-cols-7 gap-2">
                                {(Object.keys(THEMES) as ThemeKey[]).map(tKey => {
                                    const t = THEMES[tKey]
                                    const isSelected = theme === tKey
                                    return (
                                        <button
                                            key={tKey}
                                            type="button"
                                            onClick={() => setTheme(tKey)}
                                            className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all group ${
                                                isSelected
                                                    ? 'border-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20 ring-2 ring-cyan-500/30 shadow-md'
                                                    : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-white/20'
                                            }`}
                                            title={t.name}
                                        >
                                            <span className={`w-5 h-5 rounded-full bg-gradient-to-tr ${t.badge} block shadow-inner shrink-0 group-hover:scale-110 transition-transform`} />
                                            <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 truncate w-full text-center">
                                                {t.name.split(' ')[0]}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Text Fields */}
                        <div className="space-y-3.5 pt-1">
                            {/* Select LMS Recording Dropdown (Latest 3 Uploads) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <Video className="w-3.5 h-3.5 text-cyan-500" />
                                        <span>Select LMS Recording (Latest 3 in Database)</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            await loadLatestFromDatabase()
                                            notify('Synced latest recordings from database!', 'success')
                                        }}
                                        disabled={fetchingDb}
                                        className="text-[10px] text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 font-semibold flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
                                        title="Fetch latest updates from database"
                                    >
                                        <RefreshCw className={`w-2.5 h-2.5 ${fetchingDb ? 'animate-spin' : ''}`} />
                                        <span>{fetchingDb ? 'Syncing...' : 'Sync DB'}</span>
                                    </button>
                                </label>
                                <select
                                    value={selectedRecordingId ?? ''}
                                    onChange={handleSelectLmsLesson}
                                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer shadow-xs"
                                >
                                    <option value="" disabled>
                                        📚 Choose from Latest 3 Uploads...
                                    </option>
                                    {latestRecordings.map((l, idx) => (
                                        <option key={l.id} value={l.id}>
                                            {idx === 0 ? `🔥 [Latest] ${l.title}` : `📹 ${l.title}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Header Announcement Pill
                                </label>
                                <input
                                    type="text"
                                    value={header}
                                    onChange={e => setHeader(e.target.value)}
                                    placeholder="e.g. 🎬 NEW RECORDING AVAILABLE"
                                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Lesson Topic / Class Subject Title
                                </label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                    placeholder="e.g. Python Data Structures & Algorithms - Session 04"
                                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-cyan-500" />
                                        <span>Class Date / Time</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        placeholder="October 14, 2026 | 7:00 PM"
                                        className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                                        <LinkIcon className="w-3 h-3 text-cyan-500" />
                                        <span>LMS Portal URL</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={lmsLink}
                                        onChange={e => setLmsLink(e.target.value)}
                                        placeholder="https://ictforfuturelms.vercel.app/"
                                        className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Instructions Builder */}
                        <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <ListOrdered className="w-3.5 h-3.5 text-cyan-500" />
                                    <span>Numbered Steps to Watch ({instructions.length}/5)</span>
                                </label>
                                {instructions.length < 5 && (
                                    <button
                                        type="button"
                                        onClick={handleAddInstruction}
                                        className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <Plus className="w-3 h-3" />
                                        <span>Add Step</span>
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2">
                                {instructions.map((step, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 shrink-0">
                                            {idx + 1}
                                        </span>
                                        <input
                                            type="text"
                                            value={step}
                                            onChange={e => handleUpdateInstruction(idx, e.target.value)}
                                            placeholder={`Step ${idx + 1} instructions...`}
                                            className="flex-1 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveInstruction(idx)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                                            title="Remove step"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Badges & Tags Selector */}
                        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-white/5">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Banner Tag Badges & QR Code
                            </label>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition ${
                                    tags.recording
                                        ? 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 font-semibold'
                                        : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40 text-slate-500'
                                }`}>
                                    <input
                                        type="checkbox"
                                        checked={tags.recording}
                                        onChange={e => setTags(t => ({ ...t, recording: e.target.checked }))}
                                        className="rounded text-red-500 focus:ring-0"
                                    />
                                    <span>🔴 Live Recording</span>
                                </label>

                                <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition ${
                                    tags.important
                                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                                        : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40 text-slate-500'
                                }`}>
                                    <input
                                        type="checkbox"
                                        checked={tags.important}
                                        onChange={e => setTags(t => ({ ...t, important: e.target.checked }))}
                                        className="rounded text-amber-500 focus:ring-0"
                                    />
                                    <span>⚡ Priority / Alert</span>
                                </label>

                                <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition ${
                                    tags.branding
                                        ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold'
                                        : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40 text-slate-500'
                                }`}>
                                    <input
                                        type="checkbox"
                                        checked={tags.branding}
                                        onChange={e => setTags(t => ({ ...t, branding: e.target.checked }))}
                                        className="rounded text-cyan-500 focus:ring-0"
                                    />
                                    <span>🚀 ICT For Future</span>
                                </label>

                                <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition ${
                                    tags.qr
                                        ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                                        : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40 text-slate-500'
                                }`}>
                                    <input
                                        type="checkbox"
                                        checked={tags.qr}
                                        onChange={e => setTags(t => ({ ...t, qr: e.target.checked }))}
                                        className="rounded text-indigo-500 focus:ring-0"
                                    />
                                    <span>📱 Dynamic QR Code</span>
                                </label>
                            </div>
                        </div>

                        {/* Quick Action Buttons on Desktop */}
                        <div className="pt-3 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={handleCopyText}
                                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-xs"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-cyan-500" />}
                                <span>{copied ? 'Copied Text!' : 'Copy Text'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadBanner}
                                disabled={downloading}
                                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-cyan-500/20 disabled:opacity-50"
                            >
                                {downloading ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        <span>Exporting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Download PNG</span>
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </div>

                {/* ──────────────── RIGHT COLUMN: Live Banner Canvas Preview & Formatted Output (7 cols) ──────────────── */}
                <div className={`lg:col-span-7 space-y-6 ${mobileTab === 'editor' ? 'hidden lg:block' : 'block'}`}>
                    
                    <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-sm dark:shadow-none space-y-5">
                        
                        {/* Header bar */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                                    Live Banner Canvas Preview
                                </h3>
                            </div>
                            <div className="flex items-center gap-2">
                            </div>
                        </div>

                        {/* ──────────────── THE RENDERABLE BANNER CANVAS ──────────────── */}
                        {/* Outer Frame with crisp border and responsive aspect ratio */}
                        <div className="w-full overflow-hidden rounded-2xl border border-slate-700/60 shadow-2xl relative select-none">
                            <div
                                ref={bannerCanvasRef}
                                className={`w-full min-h-[440px] sm:min-h-[460px] p-6 sm:p-8 md:p-10 relative overflow-hidden transition-all duration-300 flex flex-col justify-between ${activeTheme.bgGradient} ${activeTheme.borderColor} ${activeTheme.isDark ? 'text-white' : 'text-slate-900'}`}
                                style={{
                                    backgroundImage: undefined
                                }}
                            >
                                {/* Background Ambient Radial Grid */}
                                <div 
                                    className="absolute inset-0 pointer-events-none opacity-20"
                                    style={{
                                        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)',
                                        backgroundSize: '24px 24px'
                                    }}
                                />

                                {/* Ambient Glowing Background Orbs */}
                                <div className={`absolute -top-24 -right-24 w-80 h-80 rounded-full ${activeTheme.orbPrimary} blur-3xl pointer-events-none`} />
                                <div className={`absolute -bottom-24 -left-24 w-80 h-80 rounded-full ${activeTheme.orbSecondary} blur-3xl pointer-events-none`} />

                                {/* ── Top Row: Brand & Live Badges ── */}
                                <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${activeTheme.accentBg} flex items-center justify-center text-white text-lg font-black shadow-lg ${activeTheme.glowShadow} shrink-0`}>
                                            <Laptop className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm sm:text-base tracking-tight leading-none uppercase">
                                                ICT FOR FUTURE
                                            </h4>
                                            <p className="text-[10px] sm:text-[11px] opacity-75 font-semibold tracking-wider mt-0.5 uppercase">
                                                LEARNING MANAGEMENT SYSTEM
                                            </p>
                                        </div>
                                    </div>

                                    {/* Dynamic Badges */}
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {tags.recording && (
                                            <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1.5 shadow-sm">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                                                Live Recording
                                            </span>
                                        )}
                                        {tags.important && (
                                            <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-sm">
                                                <Zap className="w-3 h-3 text-amber-300" />
                                                Priority
                                            </span>
                                        )}
                                        {tags.branding && (
                                            <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 shadow-sm">
                                                <Rocket className="w-3 h-3 text-cyan-300" />
                                                Batch 2026
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* ── Middle Row: Main Announcement Content ── */}
                                <div className="relative z-10 my-4 sm:my-6 space-y-3.5">
                                    {/* Header Pill */}
                                    <div className="inline-block">
                                        <span className={`px-3 py-1 rounded-lg text-[11px] sm:text-xs font-black uppercase tracking-wider border backdrop-blur-md ${activeTheme.pillClass}`}>
                                            {header || '🎬 NEW RECORDING AVAILABLE'}
                                        </span>
                                    </div>

                                    {/* Main Topic Title */}
                                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-snug line-clamp-2">
                                        {topic || 'Class Subject Title'}
                                    </h2>

                                    {/* Date / Time */}
                                    <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold opacity-90 pt-0.5">
                                        <Calendar className={`w-4 h-4 ${activeTheme.accentText} shrink-0`} />
                                        <span>{date || 'October 14, 2026 | 7:00 PM'}</span>
                                    </div>

                                    {/* Instructions list */}
                                    <div className="pt-2">
                                        <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider opacity-70 mb-2">
                                            How to Access this Lecture:
                                        </p>
                                        <ul className="space-y-1.5 text-xs sm:text-sm opacity-95">
                                            {instructions.filter(s => s.trim().length > 0).map((step, i) => (
                                                <li key={i} className="flex items-start gap-2.5">
                                                    <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${activeTheme.accentBg} text-white flex items-center justify-center text-[10px] sm:text-[11px] font-black shrink-0 mt-0.5 shadow-xs`}>
                                                        {i + 1}
                                                    </span>
                                                    <span className="leading-tight">{step}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* ── Footer Row: Portal Link & Dynamic QR Code ── */}
                                <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-60">
                                            Official Student Portal
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <ExternalLink className={`w-3.5 h-3.5 ${activeTheme.accentText}`} />
                                            <span className="font-mono text-xs sm:text-sm font-bold underline underline-offset-4 opacity-95 truncate max-w-[240px] sm:max-w-md">
                                                {lmsLink || 'https://ictforfuturelms.vercel.app/'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* QR Code Container */}
                                    {tags.qr && qrCodeDataUrl && (
                                        <div className="flex items-center gap-2.5 bg-white/95 p-1.5 sm:p-2 rounded-xl shadow-lg border border-white/40 shrink-0">
                                            <img
                                                src={qrCodeDataUrl}
                                                alt="QR Code"
                                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-md object-contain"
                                            />
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* ──────────────── SHARE & EXPORT ACTION STRIP ──────────────── */}
                        <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={handleDownloadBanner}
                                disabled={downloading}
                                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-cyan-500/25 disabled:opacity-50"
                            >
                                {downloading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>Generating 1080p Image...</span>
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        <span>Download Banner Image</span>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleShareWhatsApp}
                                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-emerald-600/20"
                            >
                                <Send className="w-4 h-4" />
                                <span>Share to WhatsApp</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleCopyText}
                                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-cyan-500" />}
                                <span>{copied ? 'Copied to Clipboard!' : 'Copy Formatted Text'}</span>
                            </button>
                        </div>

                        {/* ──────────────── AUTO-FORMATTED TEXT PREVIEW BOX ──────────────── */}
                        <div className="pt-2">
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                                    <span>Formatted Message (WhatsApp & Telegram Ready)</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={handleCopyText}
                                    className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                                >
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                </button>
                            </div>
                            <pre className="w-full bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-800 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
                                {generateFormattedMessage()}
                            </pre>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    )
}
