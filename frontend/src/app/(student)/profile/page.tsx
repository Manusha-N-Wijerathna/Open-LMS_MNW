'use client'

import { useEffect, useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { ThemeToggle } from '@/components/ThemeToggle'
import api from '@/lib/api'
import {
  GraduationCap,
  ChevronLeft,
  Camera,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  User,
  Mail,
  KeyRound,
  Sparkles,
  Copy,
  Check,
  Calendar,
  LogOut,
  Info,
  Loader2,
} from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, loading, setProfile, setAvatarUrl, signOut } = useAuthStore()

  // Name form state
  const [fullName, setFullName] = useState('')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameSuccess, setNameSuccess] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSuccess, setPwSuccess] = useState<string | null>(null)
  const [pwError, setPwError] = useState<string | null>(null)

  // Avatar states
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name)
    } else if (user?.email) {
      setFullName(user.email.split('@')[0])
    }
  }, [profile, user])

  // Process & compress uploaded image client-side to keep localStorage small (~30-50KB)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError(null)
    setAvatarSuccess(null)
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file (JPEG, PNG, WebP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('File is too large. Please select an image under 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        // Resize image to max 400x400 on canvas
        const canvas = document.createElement('canvas')
        const MAX_DIM = 400
        let { width, height } = img

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width)
            width = MAX_DIM
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height)
            height = MAX_DIM
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setAvatarError('Unable to process image on this browser.')
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85)

        // Save in client store & localStorage for this account
        setAvatarUrl(compressedDataUrl)
        setAvatarSuccess('Profile photo updated successfully!')
        setTimeout(() => setAvatarSuccess(null), 4000)
      }
      img.onerror = () => {
        setAvatarError('Failed to read image file. Please try a different photo.')
      }
      img.src = event.target?.result as string
    }
    reader.onerror = () => {
      setAvatarError('Error loading file from your device.')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = () => {
    setAvatarError(null)
    setAvatarUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setAvatarSuccess('Profile photo removed. Reverted to default avatar.')
    setTimeout(() => setAvatarSuccess(null), 4000)
  }

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id)
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

  // Handle Name Update
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameError(null)
    setNameSuccess(null)

    const trimmed = fullName.trim()
    if (!trimmed) {
      setNameError('Full name cannot be empty.')
      return
    }

    if (trimmed.length > 100) {
      setNameError('Full name cannot exceed 100 characters.')
      return
    }

    setNameSaving(true)
    try {
      const res = await api.put('/content/profile/update', { fullName: trimmed })
      if (res.data?.profile) {
        // Keep current avatar_url in store
        const currentAvatar = profile?.avatar_url || null
        setProfile({ ...res.data.profile, avatar_url: currentAvatar })
      }
      setNameSuccess('Your name has been updated successfully!')
      setTimeout(() => setNameSuccess(null), 4000)
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to update name. Please try again.'
      setNameError(errorMsg)
    } finally {
      setNameSaving(false)
    }
  }

  // Handle Password Update
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError(null)
    setPwSuccess(null)

    if (!currentPassword) {
      setPwError('Please enter your current password.')
      return
    }

    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match. Please verify.')
      return
    }

    if (currentPassword === newPassword) {
      setPwError('New password must be different from your current password.')
      return
    }

    setPwSaving(true)
    try {
      await api.post('/content/profile/change-password', {
        currentPassword,
        newPassword,
      })
      setPwSuccess('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPwSuccess(null), 5000)
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to change password. Please check your current password.'
      setPwError(errorMsg)
    } finally {
      setPwSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent"></div>
          <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Loading profile...</span>
        </div>
      </div>
    )
  }

  const initialLetter = (profile?.full_name || user?.email || 'S')[0].toUpperCase()
  const avatarUrl = profile?.avatar_url

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors duration-300">
      {/* Background Mesh Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-10" />

      {/* Ambient Decorative Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-violet-600/10 dark:bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/5 px-6 py-4 transition-all">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.08] px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            <Link href="/dashboard" className="hidden sm:flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-base font-black tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                #ict_for_future
              </span>
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold px-3.5 py-2 rounded-xl transition duration-200"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Profile Body */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 relative z-10">
        
        {/* Profile Hero Header Card */}
        <section className="bg-gradient-to-r from-indigo-50 via-white to-violet-50 dark:from-indigo-950/30 dark:via-slate-900/50 dark:to-violet-950/30 border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 to-violet-500/10 rounded-full blur-3xl -z-10" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            {/* Avatar Uploader Section */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl relative bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={profile?.full_name || 'Profile Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl sm:text-5xl font-black select-none">
                    {initialLetter}
                  </span>
                )}

                {/* Hover overlay trigger */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1.5 cursor-pointer"
                  title="Upload profile picture"
                >
                  <Camera className="w-6 h-6" />
                  <span className="text-[11px] font-bold">Change Photo</span>
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Action buttons under avatar */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition-all active:scale-95"
                    title="Remove custom photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Student Info & Badges */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {/* Role Badge */}
                <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  {profile?.role === 'admin' ? 'Administrator' : 'Student Account'}
                </span>

                {/* Verification Badge */}
                {profile?.is_verified ? (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Pending Approval</span>
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {profile?.full_name || 'Student'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-0.5">
                  {user?.email}
                </p>
              </div>

              {/* Privacy badge notice */}
              <div className="inline-flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Profile photo is kept private to your own account on this device.</span>
              </div>

              {/* Feedback messages for Avatar */}
              {avatarSuccess && (
                <div className="p-3 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-medium">
                  {avatarSuccess}
                </div>
              )}
              {avatarError && (
                <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl font-medium">
                  {avatarError}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 2-Column Settings Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Personal Information & Password Form (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Card 1: Change Full Name */}
            <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/[0.06] pb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Personal Information
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Update your display name across lessons and progress records.
                  </p>
                </div>
              </div>

              {nameSuccess && (
                <div className="flex items-center gap-2 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{nameSuccess}</span>
                </div>
              )}

              {nameError && (
                <div className="flex items-center gap-2 p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-semibold">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{nameError}</span>
                </div>
              )}

              <form onSubmit={handleSaveName} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.08] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white transition placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Registered Email (Read-Only)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-white/[0.04] rounded-2xl px-4 py-3 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                    Your email address is permanently associated with your login credentials.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={nameSaving}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/25 transition active:scale-95 cursor-pointer"
                  >
                    {nameSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Name Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* Card 2: Security & Change Password */}
            <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/[0.06] pb-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Security & Password
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Change your account password to protect your learning progress.
                  </p>
                </div>
              </div>

              {pwSuccess && (
                <div className="flex items-center gap-2 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{pwSuccess}</span>
                </div>
              )}

              {pwError && (
                <div className="flex items-center gap-2 p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-semibold">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{pwError}</span>
                </div>
              )}

              <form onSubmit={handleSavePassword} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.08] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-2xl px-4 py-3 pr-11 text-sm text-slate-900 dark:text-white transition placeholder:text-slate-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min. 6 characters)"
                      className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.08] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-2xl px-4 py-3 pr-11 text-sm text-slate-900 dark:text-white transition placeholder:text-slate-400"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.08] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-2xl px-4 py-3 pr-11 text-sm text-slate-900 dark:text-white transition placeholder:text-slate-400"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={pwSaving}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-violet-600/25 transition active:scale-95 cursor-pointer"
                  >
                    {pwSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* Right Column: Account Summary & Metadata (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Account Metadata Card */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Account Summary
              </h3>

              {/* Status */}
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">Access Permission</span>
                <div className="flex items-center gap-2">
                  {profile?.is_verified ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Approved Student
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <ShieldAlert className="w-4 h-4" />
                      Pending Approval
                    </span>
                  )}
                </div>
              </div>

              {/* Unique ID */}
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">Account ID</span>
                <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2">
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate max-w-[190px]">
                    {user?.id}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                    title="Copy ID"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Member Since */}
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">Enrolled Date</span>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Recently Enrolled'}
                  </span>
                </div>
              </div>

              {/* Privacy Guarantee Card */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                <div className="flex items-start gap-2.5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/15 rounded-2xl p-3.5">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>
                    Your profile photo is kept private to your account only and is never stored in public databases.
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Navigation Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-3xl p-6 shadow-xl space-y-3">
              <h4 className="font-black text-lg">Curriculum Hub</h4>
              <p className="text-white/80 text-xs leading-relaxed">
                Ready to continue your lessons? Access video resources, unit materials, and progress tracks.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold text-xs px-4 py-2 rounded-xl shadow-md hover:bg-slate-100 transition active:scale-95"
              >
                <span>Go to Dashboard</span>
                <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
              </Link>
            </div>

          </div>
        </div>

      </main>
    </div>
  )
}
