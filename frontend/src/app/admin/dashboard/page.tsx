'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import api from '@/lib/api'
import { formatDriveThumbnail, getLessonThumbnail, extractDriveFileId } from '@/lib/drive'
import { ThemeToggle } from '@/components/ThemeToggle'

interface Profile {
    id: string
    full_name: string | null
    role: string
    is_verified: boolean
    created_at: string
}
interface Grade {
    id: number
    name: string
    display_order: number
}
interface Unit {
    id: number
    name: string
    grade_id: number
    display_order: number
}
interface Lesson {
    id: number
    title: string
    description: string | null
    thumbnail_url: string | null
    drive_url: string
    unit_id: number
    display_order: number
    created_at: string
}

interface Toast {
    id: string
    message: string
    type: 'success' | 'error' | 'info'
}

export default function AdminDashboard() {
    const router = useRouter()

    // Auth & App state
    const [verifying, setVerifying] = useState(true)
    const [adminUser, setAdminUser] = useState<Profile | null>(null)
    const [activeTab, setActiveTab] = useState<'users' | 'content'>('users')
    const [sidebarOpen, setSidebarOpen] = useState(true)

    // Data lists
    const [users, setUsers] = useState<Profile[]>([])
    const [grades, setGrades] = useState<Grade[]>([])
    const [units, setUnits] = useState<Unit[]>([])
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [brokenThumbnails, setBrokenThumbnails] = useState<Record<number, boolean>>({})

    // Selections
    const [selectedGrade, setSelectedGrade] = useState<number | null>(null)
    const [selectedUnit, setSelectedUnit] = useState<number | null>(null)

    // Filtering & Searching
    const [userSearchQuery, setUserSearchQuery] = useState('')
    const [userFilter, setUserFilter] = useState<'all' | 'pending' | 'verified'>('all')

    // Toast Notifications
    const [toasts, setToasts] = useState<Toast[]>([])

    // Grade & Unit Modal State
    const [showAddGrade, setShowAddGrade] = useState(false)
    const [editingGrade, setEditingGrade] = useState<Grade | null>(null)
    const [newGradeName, setNewGradeName] = useState('')
    const [newGradeOrder, setNewGradeOrder] = useState(0)

    const [showAddUnit, setShowAddUnit] = useState(false)
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
    const [newUnitName, setNewUnitName] = useState('')
    const [newUnitOrder, setNewUnitOrder] = useState(0)

    // Content search
    const [lessonSearchQuery, setLessonSearchQuery] = useState('')

    // Lesson Modal State
    const [showLessonModal, setShowLessonModal] = useState(false)
    const [lessonModalMode, setLessonModalMode] = useState<'create' | 'edit'>('create')
    const [editingLessonId, setEditingLessonId] = useState<number | null>(null)
    const [lessonForm, setLessonForm] = useState({
        title: '',
        description: '',
        thumbnail_url: '',
        drive_url: '',
        display_order: 0
    })
    const [savingLesson, setSavingLesson] = useState(false)
    const [previewBroken, setPreviewBroken] = useState(false)

    // Custom Confirmation Dialog State
    const [confirmDialog, setConfirmDialog] = useState<{
        show: boolean
        title: string
        message: string
        confirmText?: string
        onConfirm: () => void
    }>({ show: false, title: '', message: '', onConfirm: () => {} })

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = Math.random().toString(36).substring(2, 9)
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 4000)
    }

    // Auth verification on mount
    useEffect(() => {
        let active = true
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) {
                    router.push('/admin/login')
                    return
                }
                const res = await api.get('/admin/users/me')
                if (res.data.role !== 'admin') {
                    await supabase.auth.signOut()
                    router.push('/admin/login')
                    return
                }
                if (active) {
                    setAdminUser(res.data)
                    await fetchUsers()
                    await fetchGrades()
                }
            } catch (err) {
                console.error("Auth check failed:", err)
                if (active) {
                    await supabase.auth.signOut()
                    router.push('/admin/login')
                }
            } finally {
                if (active) {
                    setVerifying(false)
                }
            }
        }
        checkAuth()
        return () => { active = false }
    }, [])

    // Grade change trigger
    useEffect(() => {
        if (selectedGrade !== null) {
            fetchUnits(selectedGrade)
        } else {
            setUnits([])
            setSelectedUnit(null)
        }
    }, [selectedGrade])

    // Unit change trigger
    useEffect(() => {
        if (selectedUnit !== null) {
            fetchLessons(selectedUnit)
        } else {
            setLessons([])
        }
    }, [selectedUnit])

    // Fetch lists
    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users')
            setUsers(res.data)
        } catch (err) {
            console.error("Error fetching users:", err)
            showToast("Failed to fetch users", "error")
        }
    }

    const fetchGrades = async () => {
        try {
            const res = await api.get('/content/grades')
            setGrades(res.data)
            if (res.data.length > 0 && selectedGrade === null) {
                setSelectedGrade(res.data[0].id)
            }
        } catch (err) {
            console.error("Error fetching grades:", err)
            showToast("Failed to fetch grades", "error")
        }
    }

    const fetchUnits = async (gradeId: number) => {
        try {
            const res = await api.get(`/content/grades/${gradeId}/units`)
            setUnits(res.data)
            if (res.data.length > 0) {
                setSelectedUnit(res.data[0].id)
            } else {
                setSelectedUnit(null)
            }
        } catch (err) {
            console.error("Error fetching units:", err)
            setUnits([])
            setSelectedUnit(null)
            showToast("Failed to fetch units", "error")
        }
    }

    const fetchLessons = async (unitId: number) => {
        try {
            const res = await api.get(`/content/units/${unitId}/lessons`)
            setLessons(res.data)
        } catch (err) {
            console.error("Error fetching lessons:", err)
            setLessons([])
            showToast("Failed to fetch lessons", "error")
        }
    }

    // User Operations
    const handleVerifyUser = async (id: string, name: string) => {
        try {
            await api.patch(`/admin/users/${id}/verify`)
            showToast(`${name || 'User'} has been verified!`, "success")
            setUsers(prev => prev.map(u => u.id === id ? { ...u, is_verified: true } : u))
            fetchUsers()
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { detail?: string; error?: string } } }
            const msg = axiosErr?.response?.data?.detail || axiosErr?.response?.data?.error || "Failed to verify user"
            showToast(msg, "error")
        }
    }

    const handleRejectUser = async (id: string, name: string) => {
        setConfirmDialog({
            show: true,
            title: "Revoke Video & Lesson Access",
            message: `Are you sure you want to revoke video viewing permissions for ${name || 'this student'}? They will no longer be able to watch lesson videos until re-approved.`,
            confirmText: "Revoke Access",
            onConfirm: async () => {
                try {
                    await api.patch(`/admin/users/${id}/reject`)
                    showToast(`Video viewing access revoked for ${name || 'User'}`, "info")
                    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_verified: false } : u))
                    fetchUsers()
                } catch (err: unknown) {
                    const axiosErr = err as { response?: { data?: { detail?: string; error?: string } } }
                    const msg = axiosErr?.response?.data?.detail || axiosErr?.response?.data?.error || "Failed to revoke verification"
                    showToast(msg, "error")
                }
                setConfirmDialog(prev => ({ ...prev, show: false }))
            }
        })
    }

    const handleDeleteUser = async (id: string, name: string) => {
        setConfirmDialog({
            show: true,
            title: "Delete Student Account",
            message: `Are you sure you want to permanently delete the account for ${name || 'this student'}? This will remove their credentials and profile completely. This action cannot be undone.`,
            confirmText: "Delete Account",
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/users/${id}`)
                    showToast(`Student account for "${name || 'User'}" has been permanently deleted`, "success")
                    setUsers(prev => prev.filter(u => u.id !== id))
                    fetchUsers()
                } catch (err: unknown) {
                    const axiosErr = err as { response?: { data?: { detail?: string; error?: string } } }
                    const msg = axiosErr?.response?.data?.detail || axiosErr?.response?.data?.error || "Failed to delete student account"
                    showToast(msg, "error")
                }
                setConfirmDialog(prev => ({ ...prev, show: false }))
            }
        })
    }

    // Grade Operations
    const openCreateGradeModal = () => {
        setEditingGrade(null)
        setNewGradeName('')
        setNewGradeOrder(grades.length + 1)
        setShowAddGrade(true)
    }

    const openEditGradeModal = (grade: Grade) => {
        setEditingGrade(grade)
        setNewGradeName(grade.name)
        setNewGradeOrder(grade.display_order)
        setShowAddGrade(true)
    }

    const handleSaveGrade = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newGradeName.trim()) return
        try {
            if (editingGrade) {
                const res = await api.put(`/admin/grades/${editingGrade.id}`, {
                    name: newGradeName,
                    display_order: newGradeOrder
                })
                showToast(`Grade "${res.data.name}" updated!`, "success")
            } else {
                const res = await api.post('/admin/grades', {
                    name: newGradeName,
                    display_order: newGradeOrder
                })
                showToast(`Grade "${res.data.name}" created!`, "success")
                setSelectedGrade(res.data.id)
            }
            setNewGradeName('')
            setNewGradeOrder(0)
            setShowAddGrade(false)
            setEditingGrade(null)
            await fetchGrades()
        } catch (err: any) {
            showToast(err?.response?.data?.detail || err?.response?.data?.error || "Failed to save grade", "error")
        }
    }

    const handleDeleteGrade = async (gradeId: number, gradeName: string) => {
        setConfirmDialog({
            show: true,
            title: "Delete Grade",
            message: `Are you sure you want to delete Grade: "${gradeName}"? This cannot be undone.`,
            confirmText: "Delete",
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/grades/${gradeId}`)
                    showToast(`Grade "${gradeName}" deleted successfully`, "success")
                    setSelectedGrade(null)
                    await fetchGrades()
                } catch (err: any) {
                    showToast(err?.response?.data?.detail || "Failed to delete grade. Make sure it has no units.", "error")
                }
                setConfirmDialog(prev => ({ ...prev, show: false }))
            }
        })
    }

    // Unit Operations
    const openCreateUnitModal = () => {
        setEditingUnit(null)
        setNewUnitName('')
        setNewUnitOrder(units.length + 1)
        setShowAddUnit(true)
    }

    const openEditUnitModal = (unit: Unit) => {
        setEditingUnit(unit)
        setNewUnitName(unit.name)
        setNewUnitOrder(unit.display_order)
        setShowAddUnit(true)
    }

    const handleSaveUnit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newUnitName.trim() || selectedGrade === null) return
        try {
            if (editingUnit) {
                const res = await api.put(`/admin/units/${editingUnit.id}`, {
                    name: newUnitName,
                    display_order: newUnitOrder,
                    grade_id: selectedGrade
                })
                showToast(`Unit "${res.data.name}" updated!`, "success")
            } else {
                const res = await api.post('/admin/units', {
                    name: newUnitName,
                    grade_id: selectedGrade,
                    display_order: newUnitOrder
                })
                showToast(`Unit "${res.data.name}" created!`, "success")
                setSelectedUnit(res.data.id)
            }
            setNewUnitName('')
            setNewUnitOrder(0)
            setShowAddUnit(false)
            setEditingUnit(null)
            await fetchUnits(selectedGrade)
        } catch (err: any) {
            showToast(err?.response?.data?.detail || err?.response?.data?.error || "Failed to save unit", "error")
        }
    }

    const handleDeleteUnit = async (unitId: number, unitName: string) => {
        if (selectedGrade === null) return
        setConfirmDialog({
            show: true,
            title: "Delete Unit",
            message: `Are you sure you want to delete Unit: "${unitName}"? This cannot be undone.`,
            confirmText: "Delete",
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/units/${unitId}`)
                    showToast(`Unit "${unitName}" deleted successfully`, "success")
                    setSelectedUnit(null)
                    await fetchUnits(selectedGrade)
                } catch (err: any) {
                    showToast(err?.response?.data?.detail || "Failed to delete unit. Make sure it has no lessons.", "error")
                }
                setConfirmDialog(prev => ({ ...prev, show: false }))
            }
        })
    }

    // Lesson Operations
    const openCreateLessonModal = () => {
        setLessonModalMode('create')
        setEditingLessonId(null)
        setPreviewBroken(false)
        setLessonForm({
            title: '',
            description: '',
            thumbnail_url: '',
            drive_url: '',
            display_order: lessons.length
        })
        setShowLessonModal(true)
    }

    const openEditLessonModal = (lesson: Lesson) => {
        setLessonModalMode('edit')
        setEditingLessonId(lesson.id)
        setPreviewBroken(false)
        setLessonForm({
            title: lesson.title,
            description: lesson.description || '',
            thumbnail_url: lesson.thumbnail_url || '',
            drive_url: lesson.drive_url,
            display_order: lesson.display_order
        })
        setShowLessonModal(true)
    }

    const handleSaveLesson = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!lessonForm.title.trim() || !lessonForm.drive_url.trim() || selectedUnit === null) {
            showToast("Title and Google Drive Link are required", "error")
            return
        }
        setSavingLesson(true)
        try {
            if (lessonModalMode === 'create') {
                await api.post('/admin/lessons', {
                    ...lessonForm,
                    unit_id: selectedUnit
                })
                showToast("Lesson created successfully", "success")
            } else if (lessonModalMode === 'edit' && editingLessonId !== null) {
                await api.put(`/admin/lessons/${editingLessonId}`, {
                    title: lessonForm.title,
                    description: lessonForm.description,
                    thumbnail_url: lessonForm.thumbnail_url,
                    drive_url: lessonForm.drive_url,
                    display_order: lessonForm.display_order
                })
                showToast("Lesson updated successfully", "success")
            }
            setShowLessonModal(false)
            await fetchLessons(selectedUnit)
        } catch (err: any) {
            showToast(err?.response?.data?.detail || "Failed to save lesson", "error")
        } finally {
            setSavingLesson(false)
        }
    }

    const handleDeleteLesson = (lessonId: number, lessonTitle: string) => {
        if (selectedUnit === null) return
        setConfirmDialog({
            show: true,
            title: "Delete Lesson",
            message: `Are you sure you want to delete lesson: "${lessonTitle}"? This cannot be undone.`,
            confirmText: "Delete",
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/lessons/${lessonId}`)
                    showToast(`Lesson "${lessonTitle}" deleted`, "success")
                    await fetchLessons(selectedUnit)
                } catch (err) {
                    showToast("Failed to delete lesson", "error")
                }
                setConfirmDialog(prev => ({ ...prev, show: false }))
            }
        })
    }

    const handleReorderLesson = async (lesson: Lesson, direction: 'up' | 'down') => {
        if (selectedUnit === null) return
        const sorted = [...lessons].sort((a, b) => a.display_order - b.display_order)
        const index = sorted.findIndex(l => l.id === lesson.id)
        if (index === -1) return
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= sorted.length) return

        const otherLesson = sorted[targetIndex]
        const currentOrder = lesson.display_order
        const otherOrder = otherLesson.display_order

        const newCurrentOrder = currentOrder === otherOrder
            ? (direction === 'up' ? otherOrder - 1 : otherOrder + 1)
            : otherOrder
        const newOtherOrder = currentOrder

        try {
            await Promise.all([
                api.put(`/admin/lessons/${lesson.id}`, { display_order: newCurrentOrder }),
                api.put(`/admin/lessons/${otherLesson.id}`, { display_order: newOtherOrder })
            ])
            await fetchLessons(selectedUnit)
            showToast("Lesson order updated", "success")
        } catch {
            showToast("Failed to update lesson order", "error")
        }
    }

    // Sign out handler
    const handleSignOut = async () => {
        await supabase.auth.signOut()
        showToast("Signed out successfully", "info")
        router.push('/admin/login')
    }

    // Filtering users lists
    const pendingUsers = users.filter(u => !u.is_verified && u.role !== 'admin')
    const verifiedUsers = users.filter(u => u.is_verified && u.role !== 'admin')

    const getFilteredUsers = () => {
        let result = users.filter(u => u.role !== 'admin')
        if (userFilter === 'pending') result = pendingUsers
        if (userFilter === 'verified') result = verifiedUsers

        if (userSearchQuery.trim()) {
            const query = userSearchQuery.toLowerCase()
            result = result.filter(u =>
                (u.full_name || '').toLowerCase().includes(query) ||
                u.id.toLowerCase().includes(query)
            )
        }
        return result
    }

    // Stats calculations
    const stats = {
        totalStudents: users.filter(u => u.role !== 'admin').length,
        pendingApprovals: pendingUsers.length,
        totalGrades: grades.length,
        selectedUnitLessons: lessons.length
    }

    // Render loading state
    if (verifying) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                    <p className="text-slate-400 font-medium tracking-wide animate-pulse">Verifying administrative access...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex relative overflow-hidden transition-colors duration-300">
            {/* Animated Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(99,102,241,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.015)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

            {/* Glowing orbs */}
            <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-violet-600/5 dark:bg-violet-600/10 rounded-full blur-3xl pointer-events-none animate-pulse [animation-delay:2s]" />

            {/* Mobile Backdrop Overlay */}
            {sidebarOpen && (
                <div 
                    onClick={() => setSidebarOpen(false)} 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" 
                />
            )}

            {/* Collapsible Sidebar */}
            <aside className={`fixed md:relative inset-y-0 left-0 z-40 bg-white/95 dark:bg-slate-900/40 backdrop-blur-xl border-r border-slate-200/80 dark:border-white/5 transition-all duration-300 flex flex-col justify-between overflow-hidden shrink-0 ${
                sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full md:w-0 md:translate-x-0 border-r-0'
            }`}>
                <div className="w-72 flex flex-col justify-between h-full">
                    <div>
                        {/* Header/Logo */}
                        <div className="h-20 border-b border-slate-200/80 dark:border-white/5 flex items-center justify-between px-6">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="font-extrabold text-slate-900 dark:text-white tracking-wide">ICT LMS</h2>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Admin Panel</p>
                                </div>
                            </div>
                            {/* Close button */}
                            <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="p-4 space-y-2.5">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-3 mb-2">Management</p>

                            <button
                                onClick={() => { 
                                    setActiveTab('users'); 
                                    if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                                    activeTab === 'users'
                                        ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/10 border-l-2 border-indigo-500 text-indigo-600 dark:text-white shadow-lg shadow-indigo-500/5 font-bold'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.02]'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.999-3.199a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                    </svg>
                                    <span>Users Management</span>
                                </div>
                                {pendingUsers.length > 0 && (
                                    <span className="text-[10px] font-extrabold bg-indigo-500 text-white px-2 py-0.5 rounded-full ring-2 ring-slate-100 dark:ring-slate-900 group-hover:scale-105 transition-transform">
                                        {pendingUsers.length}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => { 
                                    setActiveTab('content'); 
                                    if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                                    activeTab === 'content'
                                        ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/10 border-l-2 border-indigo-500 text-indigo-600 dark:text-white shadow-lg shadow-indigo-500/5 font-bold'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.02]'
                                }`}
                            >
                                <svg className="w-5 h-5 transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                </svg>
                                <span>Content Library</span>
                            </button>
                        </nav>
                    </div>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-slate-200/80 dark:border-white/5 bg-slate-50/80 dark:bg-slate-950/20">
                        <div className="flex items-center gap-3 px-2 py-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-white/10 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                                {adminUser?.full_name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{adminUser?.full_name || 'Admin User'}</p>
                                <p className="text-[10px] text-slate-500 truncate font-mono">System Administrator</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="w-full mt-2 flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/[0.03] hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 hover:border-red-500/20 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
                {/* Header */}
                <header className="h-16 sm:h-20 border-b border-slate-200/80 dark:border-white/5 flex items-center justify-between px-4 sm:px-6 md:px-10 shrink-0 bg-white/80 dark:bg-slate-950/40 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)} 
                            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center justify-center"
                            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                            aria-label="Toggle sidebar"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white capitalize truncate">
                            {activeTab === 'users' ? 'Users Management' : 'Content Library'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Admin Theme Toggle */}
                        <ThemeToggle />

                        {/* Quick Server Status */}
                        <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium font-mono">
                            <span className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-ping" />
                            <span>System API Active</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full">
                    {/* Top Stats Bar */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {/* Card 1: Total Students */}
                        <div className="bg-white dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.05] rounded-2xl p-5 flex items-center gap-4 relative group hover:border-indigo-500/20 transition-all duration-300 shadow-sm dark:shadow-none">
                            <div className="absolute inset-0 bg-indigo-500/2 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</p>
                                <h3 className="text-2xl font-black mt-0.5 text-slate-900 dark:text-white tracking-tight">{stats.totalStudents}</h3>
                            </div>
                        </div>

                        {/* Card 2: Pending Approvals */}
                        <div className="bg-white dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.05] rounded-2xl p-5 flex items-center gap-4 relative group hover:border-yellow-500/20 transition-all duration-300 shadow-sm dark:shadow-none">
                            <div className="absolute inset-0 bg-yellow-500/2 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${
                                stats.pendingApprovals > 0 ? 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 animate-pulse' : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500'
                            }`}>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</p>
                                <h3 className={`text-2xl font-black mt-0.5 tracking-tight ${
                                    stats.pendingApprovals > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-900 dark:text-white'
                                }`}>{stats.pendingApprovals}</h3>
                            </div>
                        </div>

                        {/* Card 3: Course Grades */}
                        <div className="bg-white dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.05] rounded-2xl p-5 flex items-center gap-4 relative group hover:border-violet-500/20 transition-all duration-300 shadow-sm dark:shadow-none">
                            <div className="absolute inset-0 bg-violet-500/2 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
                            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-inner">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.9c4.956-1.54 9.435-4.003 13.01-7.106m-22.96 0A48.474 48.474 0 015.753 8.284m12.446.084A48.474 48.474 0 0118.242 18m2.46-12.03a60.47 60.47 0 00-4.918-3.472m-1.077-1.168A48.554 48.554 0 0012 3c-2.202 0-4.312.273-6.328.791m10.262 1.636A48.67 48.67 0 0012 6c-1.343 0-2.65-.107-3.928-.314m8.54 1.135a59.842 59.842 0 01-3.642 12.286" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Grades</p>
                                <h3 className="text-2xl font-black mt-0.5 text-slate-900 dark:text-white tracking-tight">{stats.totalGrades}</h3>
                            </div>
                        </div>

                        {/* Card 4: Unit Lessons */}
                        <div className="bg-white dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.05] rounded-2xl p-5 flex items-center gap-4 relative group hover:border-emerald-500/20 transition-all duration-300 shadow-sm dark:shadow-none">
                            <div className="absolute inset-0 bg-emerald-500/2 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-7.5c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125zm0-4.5h7.5c.621 0 1.125-.504 1.125-1.125V12.375c0-.621-.504-1.125-1.125-1.125h-7.5c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125zm0-4.5h7.5C12 9.375 12.5 8.87 12.5 8.25v-1.5c0-.621-.504-1.125-1.125-1.125h-7.5C3.25 5.625 2.75 6.13 2.75 6.75v1.5C2.75 8.87 3.25 9.375 3.375 9.375zm10.5 10.125h7.5c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-7.5c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125zm0-4.5h7.5c.621 0 1.125-.504 1.125-1.125V12.375c0-.621-.504-1.125-1.125-1.125h-7.5c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125zm0-4.5h7.5C22.75 9.375 23.25 8.87 23.25 8.25v-1.5c0-.621-.504-1.125-1.125-1.125h-7.5c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Unit Lessons</p>
                                <h3 className="text-2xl font-black mt-0.5 text-slate-900 dark:text-white tracking-tight">{selectedUnit ? stats.selectedUnitLessons : '—'}</h3>
                            </div>
                        </div>
                    </div>

                    {/* ──────────────── USERS TAB ──────────────── */}
                    {activeTab === 'users' && (
                        <div className="space-y-6">
                            {/* Search and Filters */}
                            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04] p-4 rounded-2xl backdrop-blur-md shadow-sm dark:shadow-none">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search students by name or ID..."
                                        value={userSearchQuery}
                                        onChange={e => setUserSearchQuery(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-sm placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                                    />
                                </div>

                                <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-white/5">
                                    {(['all', 'pending', 'verified'] as const).map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setUserFilter(mode)}
                                            className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                                                userFilter === mode
                                                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                            }`}
                                        >
                                            {mode} ({
                                                mode === 'all' ? users.filter(u => u.role !== 'admin').length :
                                                mode === 'pending' ? pendingUsers.length : verifiedUsers.length
                                            })
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Pending Verifications Section */}
                            {(userFilter === 'all' || userFilter === 'pending') && pendingUsers.length > 0 && (
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-ping" />
                                        <h2 className="text-md font-bold tracking-wide text-white uppercase text-xs">Awaiting Approvals ({pendingUsers.length})</h2>
                                    </div>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {pendingUsers.map(u => (
                                            <div key={u.id} className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-yellow-500/10 hover:border-yellow-500/30 rounded-2xl p-5 backdrop-blur-xl relative transition-all group shadow-lg">
                                                <div className="absolute top-4 right-4 text-[10px] font-mono text-slate-600">{new Date(u.created_at).toLocaleDateString()}</div>
                                                <div className="flex items-start gap-3.5">
                                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/10 flex items-center justify-center text-yellow-400 font-extrabold text-sm border border-yellow-500/20 shadow-inner">
                                                        {u.full_name?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-white truncate text-sm">{u.full_name || 'Anonymous User'}</h4>
                                                        <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">{u.id}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2.5 mt-5 border-t border-white/5 pt-4">
                                                    <button
                                                        onClick={() => handleVerifyUser(u.id, u.full_name || '')}
                                                        className="flex-1 bg-green-500/20 hover:bg-green-500 text-green-300 hover:text-white border border-green-500/20 hover:border-transparent py-2 rounded-xl text-xs font-bold transition-all shadow-inner flex items-center justify-center gap-1.5"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                        </svg>
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectUser(u.id, u.full_name || '')}
                                                        className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/10 hover:border-transparent px-3 py-2 rounded-xl text-xs font-bold transition-all"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Main User List Card */}
                            <div className="bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05] rounded-2xl overflow-hidden backdrop-blur-xl shadow-md dark:shadow-2xl">
                                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200/80 dark:border-white/5 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wider">Student Registry</h3>
                                    <span className="text-[11px] sm:text-xs text-slate-500 font-mono">Count: {getFilteredUsers().length}</span>
                                </div>

                                {getFilteredUsers().length === 0 ? (
                                    <div className="py-16 sm:py-20 text-center px-4">
                                        <div className="text-4xl mb-4 opacity-50">👥</div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">No registry matching filters found.</p>
                                        <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">Try refining search parameters or filters.</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Mobile Card List (< md) */}
                                        <div className="block md:hidden divide-y divide-slate-200/60 dark:divide-white/[0.04] p-3 space-y-3">
                                            {getFilteredUsers().map(u => (
                                                <div key={u.id} className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04] rounded-xl p-3.5 space-y-3 shadow-xs">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border shrink-0 ${
                                                                u.is_verified
                                                                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                                                                    : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
                                                            }`}>
                                                                {u.full_name?.charAt(0).toUpperCase() || '?'}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">{u.full_name || 'Anonymous Student'}</p>
                                                                <p className="text-[10px] text-slate-500 font-mono truncate">{u.id}</p>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            {u.is_verified ? (
                                                                <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                                                                    <span className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full" />
                                                                    Verified
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                                                                    <span className="w-1.5 h-1.5 bg-yellow-500 dark:bg-yellow-400 rounded-full animate-pulse" />
                                                                    Pending
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 dark:border-white/[0.04]">
                                                        <span>Joined: {new Date(u.created_at).toLocaleDateString()}</span>
                                                        <div className="flex items-center gap-2">
                                                            {u.is_verified ? (
                                                                <button
                                                                    onClick={() => handleRejectUser(u.id, u.full_name || '')}
                                                                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 transition-all cursor-pointer"
                                                                    title="Revoke video viewing permission"
                                                                >
                                                                    Revoke Access
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleVerifyUser(u.id, u.full_name || '')}
                                                                    className="text-xs font-bold bg-green-600 text-white px-2.5 py-1.5 rounded-lg shadow-md shadow-green-600/20 transition-all cursor-pointer"
                                                                    title="Approve access to lessons & videos"
                                                                >
                                                                    Approve Access
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteUser(u.id, u.full_name || '')}
                                                                className="text-xs font-bold text-red-500 dark:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg border border-red-500/20 transition-all cursor-pointer flex items-center gap-1"
                                                                title="Permanently delete student account"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                                </svg>
                                                                <span>Delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Desktop Table (>= md) */}
                                        <div className="hidden md:block overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-200/80 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.01]">
                                                        <th className="px-6 py-4 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Student Information</th>
                                                        <th className="px-6 py-4 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                                                        <th className="px-6 py-4 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Enrollment Date</th>
                                                        <th className="px-6 py-4 text-right"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.03]">
                                                    {getFilteredUsers().map(u => (
                                                        <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.01] transition-colors group">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs border ${
                                                                        u.is_verified
                                                                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                                                                            : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
                                                                    }`}>
                                                                        {u.full_name?.charAt(0).toUpperCase() || '?'}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-slate-900 dark:text-white text-sm">{u.full_name || 'Anonymous Student'}</p>
                                                                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{u.id}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {u.is_verified ? (
                                                                    <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                                                                        Verified
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                                                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                                                                        Pending
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                                                                {new Date(u.created_at).toLocaleDateString(undefined, {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    {u.is_verified ? (
                                                                        <button
                                                                            onClick={() => handleRejectUser(u.id, u.full_name || '')}
                                                                            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all cursor-pointer"
                                                                            title="Revoke permission to watch videos"
                                                                        >
                                                                            Revoke Access
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => handleVerifyUser(u.id, u.full_name || '')}
                                                                            className="text-xs font-bold bg-green-500/10 hover:bg-green-600 text-green-600 dark:text-green-400 hover:text-white border border-green-500/20 hover:border-transparent px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                                                                            title="Approve access to curriculum & videos"
                                                                        >
                                                                            Approve Access
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => handleDeleteUser(u.id, u.full_name || '')}
                                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                                                                        title="Permanently delete student account"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ──────────────── CONTENT TAB ──────────────── */}
                    {activeTab === 'content' && (() => {
                        const selectedGradeObj = grades.find(g => g.id === selectedGrade)
                        const selectedUnitObj = units.find(u => u.id === selectedUnit)
                        const filteredLessons = lessons.filter(l => 
                            l.title.toLowerCase().includes(lessonSearchQuery.toLowerCase()) || 
                            (l.description && l.description.toLowerCase().includes(lessonSearchQuery.toLowerCase()))
                        )
                        const sortedLessons = [...filteredLessons].sort((a, b) => a.display_order - b.display_order)

                        return (
                            <div className="space-y-6">
                                {/* Curriculum Navigation & Breadcrumb Banner */}
                                <div className="bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05] rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-sm dark:shadow-none flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                                            <span>Curriculum Studio</span>
                                        </div>

                                        <svg className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>

                                        {/* Grade Badge */}
                                        {selectedGradeObj ? (
                                            <button 
                                                onClick={() => setSelectedUnit(null)}
                                                className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-2.5 py-1 rounded-lg hover:brightness-110 transition cursor-pointer"
                                                title="Current Grade (click to view units)"
                                            >
                                                <span>📚 {selectedGradeObj.name}</span>
                                            </button>
                                        ) : (
                                            <span className="text-slate-500 dark:text-slate-500 italic">Select a Grade</span>
                                        )}

                                        {selectedGradeObj && (
                                            <>
                                                <svg className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>

                                                {/* Unit Badge */}
                                                {selectedUnitObj ? (
                                                    <span className="inline-flex items-center gap-1.5 font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 px-2.5 py-1 rounded-lg">
                                                        <span>📁 {selectedUnitObj.name}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-500 dark:text-slate-500 italic">Select a Unit</span>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Quick Creation Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={openCreateGradeModal}
                                            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/5 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                                        >
                                            <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7-7H5" />
                                            </svg>
                                            <span>New Grade</span>
                                        </button>

                                        {selectedGrade !== null && (
                                            <button
                                                onClick={openCreateUnitModal}
                                                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/5 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                                            >
                                                <svg className="w-3.5 h-3.5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7-7H5" />
                                                </svg>
                                                <span>New Unit</span>
                                            </button>
                                        )}

                                        {selectedUnit !== null && (
                                            <button
                                                onClick={openCreateLessonModal}
                                                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7-7H5" />
                                                </svg>
                                                <span>Add Lesson</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Main Studio 2-Column Split */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                    {/* Left Column: Grade & Unit Navigation */}
                                    <div className="lg:col-span-4 space-y-6">
                                        {/* 1. Grades Card */}
                                        <div className="bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05] rounded-2xl p-4 shadow-sm dark:shadow-none backdrop-blur-xl space-y-3">
                                            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70 dark:border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider">1. Grades</h3>
                                                    <span className="text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                                                        {grades.length}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={openCreateGradeModal}
                                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                                                >
                                                    + Add Grade
                                                </button>
                                            </div>

                                            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                                                {grades.length === 0 ? (
                                                    <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                                                        No grades created yet.
                                                    </div>
                                                ) : (
                                                    grades.map(g => (
                                                        <div
                                                            key={g.id}
                                                            onClick={() => {
                                                                setSelectedGrade(g.id)
                                                                setSelectedUnit(null)
                                                            }}
                                                            className={`w-full flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border text-left group ${
                                                                selectedGrade === g.id
                                                                    ? 'bg-gradient-to-r from-indigo-500/15 to-violet-500/10 border-indigo-500/40 text-slate-900 dark:text-white shadow-sm ring-1 ring-indigo-500/30'
                                                                    : 'bg-slate-50/60 dark:bg-white/[0.01] border-slate-200/80 dark:border-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.03] hover:border-slate-300 dark:hover:border-white/10'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                <span className={`w-2 h-2 rounded-full shrink-0 ${
                                                                    selectedGrade === g.id ? 'bg-indigo-500 animate-pulse ring-2 ring-indigo-500/30' : 'bg-slate-300 dark:bg-slate-700'
                                                                }`} />
                                                                <span className="font-bold text-xs sm:text-sm truncate">{g.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded bg-slate-200/50 dark:bg-white/5">
                                                                    #{g.display_order}
                                                                </span>
                                                                {/* Edit Grade Button */}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        openEditGradeModal(g)
                                                                    }}
                                                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/10 transition p-1 rounded-md cursor-pointer"
                                                                    title="Edit Grade"
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                                    </svg>
                                                                </button>
                                                                {/* Delete Grade Button */}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleDeleteGrade(g.id, g.name)
                                                                    }}
                                                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition p-1 rounded-md"
                                                                    title="Delete Grade"
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        {/* 2. Units Card */}
                                        <div className="bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05] rounded-2xl p-4 shadow-sm dark:shadow-none backdrop-blur-xl space-y-3">
                                            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70 dark:border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                                                        2. Units {selectedGradeObj ? `(${selectedGradeObj.name})` : ''}
                                                    </h3>
                                                    {selectedGrade !== null && (
                                                        <span className="text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                                                            {units.length}
                                                        </span>
                                                    )}
                                                </div>
                                                {selectedGrade !== null && (
                                                    <button
                                                        onClick={openCreateUnitModal}
                                                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                                                    >
                                                        + Add Unit
                                                    </button>
                                                )}
                                            </div>

                                            {selectedGrade === null ? (
                                                <div className="bg-slate-50/60 dark:bg-white/[0.01] border border-dashed border-slate-300 dark:border-white/10 rounded-xl py-8 px-4 text-center">
                                                    <span className="text-2xl block mb-2 opacity-50">👈</span>
                                                    <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold">Select a grade above</p>
                                                    <p className="text-slate-400 dark:text-slate-600 text-[11px] mt-0.5">Click any grade to view and manage its units.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                                                    {units.length === 0 ? (
                                                        <div className="py-8 text-center px-4">
                                                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">No units in {selectedGradeObj?.name}.</p>
                                                            <button
                                                                onClick={openCreateUnitModal}
                                                                className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                                            >
                                                                Create the first unit
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        units.map(u => (
                                                            <div
                                                                key={u.id}
                                                                onClick={() => setSelectedUnit(u.id)}
                                                                className={`w-full flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border text-left group ${
                                                                    selectedUnit === u.id
                                                                        ? 'bg-gradient-to-r from-violet-500/15 to-indigo-500/10 border-violet-500/40 text-slate-900 dark:text-white shadow-sm ring-1 ring-violet-500/30'
                                                                        : 'bg-slate-50/60 dark:bg-white/[0.01] border-slate-200/80 dark:border-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.03] hover:border-slate-300 dark:hover:border-white/10'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                                                                        selectedUnit === u.id ? 'bg-violet-500 animate-pulse ring-2 ring-violet-500/30' : 'bg-slate-300 dark:bg-slate-700'
                                                                    }`} />
                                                                    <span className="font-bold text-xs sm:text-sm truncate">{u.name}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 shrink-0">
                                                                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded bg-slate-200/50 dark:bg-white/5">
                                                                        #{u.display_order}
                                                                    </span>
                                                                    {/* Edit Unit Button */}
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            openEditUnitModal(u)
                                                                        }}
                                                                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-white/10 transition p-1 rounded-md cursor-pointer"
                                                                        title="Edit Unit"
                                                                    >
                                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                                        </svg>
                                                                    </button>
                                                                    {/* Delete Unit Button */}
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            handleDeleteUnit(u.id, u.name)
                                                                        }}
                                                                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition p-1 rounded-md"
                                                                        title="Delete Unit"
                                                                    >
                                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Column: Lessons Studio Stage */}
                                    <div className="lg:col-span-8 min-w-0 space-y-4">
                                        {selectedUnit === null ? (
                                            /* No Unit Selected Empty Studio */
                                            <div className="bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05] rounded-3xl p-10 sm:p-14 text-center shadow-sm dark:shadow-none backdrop-blur-xl">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400 shadow-lg shadow-indigo-500/10">
                                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Curriculum Lesson Studio</h3>
                                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                                                    {selectedGrade === null 
                                                        ? 'Select a Grade on the left to start browsing and managing lessons.'
                                                        : `Grade "${selectedGradeObj?.name}" selected. Now choose or create a Unit to view and edit its video lessons.`
                                                    }
                                                </p>
                                            </div>
                                        ) : (
                                            /* Active Unit Lesson Studio */
                                            <div className="space-y-4">
                                                {/* Studio Header Bar */}
                                                <div className="bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05] rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-none backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                                                                {selectedUnitObj?.name}
                                                            </h3>
                                                            <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full shrink-0">
                                                                {lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                            Curriculum path: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedGradeObj?.name}</span> &gt; {selectedUnitObj?.name}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-2.5">
                                                        {/* Search within lessons */}
                                                        {lessons.length > 2 && (
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search lessons..."
                                                                    value={lessonSearchQuery}
                                                                    onChange={e => setLessonSearchQuery(e.target.value)}
                                                                    className="w-36 sm:w-48 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                                />
                                                                <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                                </svg>
                                                                {lessonSearchQuery && (
                                                                    <button 
                                                                        onClick={() => setLessonSearchQuery('')}
                                                                        className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}

                                                        <button
                                                            onClick={openCreateLessonModal}
                                                            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer active:scale-95 shrink-0"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7-7H5" />
                                                            </svg>
                                                            <span>Add Lesson</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Lessons Cards List */}
                                                <div className="space-y-3">
                                                    {sortedLessons.length === 0 ? (
                                                        <div className="bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05] rounded-2xl py-14 text-center px-4 shadow-sm dark:shadow-none">
                                                            <div className="text-3xl mb-3 opacity-40">🎬</div>
                                                            {lessonSearchQuery ? (
                                                                <>
                                                                    <p className="text-slate-700 dark:text-slate-300 text-xs font-bold">No lessons matched &quot;{lessonSearchQuery}&quot;</p>
                                                                    <button 
                                                                        onClick={() => setLessonSearchQuery('')}
                                                                        className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                                                                    >
                                                                        Clear search query
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <p className="text-slate-700 dark:text-slate-300 text-xs font-bold">No lessons in this unit yet.</p>
                                                                    <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-0.5">Attach your first Google Drive video lesson to this unit.</p>
                                                                    <button
                                                                        onClick={openCreateLessonModal}
                                                                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-md shadow-indigo-600/20 cursor-pointer"
                                                                    >
                                                                        + Create First Lesson
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        sortedLessons.map((lesson, idx) => (
                                                            <div 
                                                                key={lesson.id} 
                                                                className="bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05] hover:border-indigo-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center shadow-xs hover:shadow-md transition-all duration-200 group"
                                                            >
                                                                {/* Video Thumbnail Box */}
                                                                <div className="w-full sm:w-28 h-32 sm:h-20 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-inner relative group-hover:ring-1 group-hover:ring-indigo-500/30 transition">
                                                                    {getLessonThumbnail(lesson.thumbnail_url, lesson.drive_url) && !brokenThumbnails[lesson.id] ? (
                                                                        <img 
                                                                            src={getLessonThumbnail(lesson.thumbnail_url, lesson.drive_url)!} 
                                                                            alt={lesson.title} 
                                                                            referrerPolicy="no-referrer"
                                                                            onError={(e) => {
                                                                                const fileId = extractDriveFileId(lesson.thumbnail_url || lesson.drive_url)
                                                                                const target = e.currentTarget
                                                                                if (fileId && !target.dataset.triedLh3) {
                                                                                    target.dataset.triedLh3 = 'true'
                                                                                    target.src = `https://lh3.googleusercontent.com/d/${fileId}`
                                                                                    return
                                                                                }
                                                                                setBrokenThumbnails(prev => ({ ...prev, [lesson.id]: true }))
                                                                            }}
                                                                            className="w-full h-full object-cover" 
                                                                        />
                                                                    ) : (
                                                                        <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                                                            <svg className="w-7 h-7 text-indigo-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                                                                            </svg>
                                                                            <span className="text-[9px] mt-1 font-mono uppercase">Video</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Content Details */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                                                                            Lesson #{lesson.display_order}
                                                                        </span>

                                                                        <a
                                                                            href={lesson.drive_url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/20 hover:brightness-105 transition"
                                                                            title="Open Google Drive video in new tab"
                                                                        >
                                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                                                                            </svg>
                                                                            <span>Drive Video</span>
                                                                        </a>
                                                                    </div>

                                                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                                                                        {lesson.title}
                                                                    </h4>

                                                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                                                                        {lesson.description || 'No description provided for this lesson.'}
                                                                    </p>
                                                                </div>

                                                                {/* Action Controls & Reordering */}
                                                                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto justify-end border-slate-100 dark:border-white/5">
                                                                    {/* Move Up */}
                                                                    <button
                                                                        onClick={() => handleReorderLesson(lesson, 'up')}
                                                                        disabled={idx === 0}
                                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                                                                        title="Move lesson up"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                                                                        </svg>
                                                                    </button>

                                                                    {/* Move Down */}
                                                                    <button
                                                                        onClick={() => handleReorderLesson(lesson, 'down')}
                                                                        disabled={idx === sortedLessons.length - 1}
                                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                                                                        title="Move lesson down"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                                        </svg>
                                                                    </button>

                                                                    {/* Edit Button */}
                                                                    <button
                                                                        onClick={() => openEditLessonModal(lesson)}
                                                                        className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] transition flex items-center gap-1 cursor-pointer"
                                                                    >
                                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                                        </svg>
                                                                        <span>Edit</span>
                                                                    </button>

                                                                    {/* Delete Button */}
                                                                    <button
                                                                        onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition rounded-lg cursor-pointer"
                                                                        title="Delete Lesson"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })()}
                </main>
            </div>

            {/* ── ADD GRADE MODAL ── */}
            {showAddGrade && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                    📚
                                </div>
                                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                                    {editingGrade ? 'Edit Grade' : 'Create New Grade'}
                                </h3>
                            </div>
                            <button
                                onClick={() => {
                                    setShowAddGrade(false)
                                    setEditingGrade(null)
                                }}
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition p-1 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveGrade} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                                    Grade Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Grade 12 (Advanced ICT)"
                                    value={newGradeName}
                                    onChange={e => setNewGradeName(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    value={newGradeOrder}
                                    onChange={e => setNewGradeOrder(parseInt(e.target.value) || 0)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">Controls sorting in student curriculum views.</p>
                            </div>

                            <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-200 dark:border-white/5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddGrade(false)
                                        setEditingGrade(null)
                                    }}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer"
                                >
                                    {editingGrade ? 'Save Changes' : 'Create Grade'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── ADD / EDIT UNIT MODAL ── */}
            {showAddUnit && selectedGrade !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                                    📁
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                                        {editingUnit ? 'Edit Unit' : 'Create New Unit'}
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        Target: {grades.find(g => g.id === selectedGrade)?.name}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowAddUnit(false)
                                    setEditingUnit(null)
                                }}
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition p-1 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveUnit} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                                    Unit Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Unit 1: Programming Concepts"
                                    value={newUnitName}
                                    onChange={e => setNewUnitName(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    value={newUnitOrder}
                                    onChange={e => setNewUnitOrder(parseInt(e.target.value) || 0)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">Controls order inside the parent grade.</p>
                            </div>

                            <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-200 dark:border-white/5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddUnit(false)
                                        setEditingUnit(null)
                                    }}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/20 transition cursor-pointer"
                                >
                                    {editingUnit ? 'Save Changes' : 'Create Unit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── LESSON MODAL OVERLAY ── */}
            {showLessonModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-3 sm:p-4 animate-fade-in overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col my-auto">
                        <div className="px-6 py-4.5 border-b border-slate-200/80 dark:border-white/5 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-white/[0.01]">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center text-sm shadow-md shadow-indigo-500/20">
                                    📹
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                                        {lessonModalMode === 'create' ? 'Create New Lesson' : 'Edit Lesson'}
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        Unit: {units.find(u => u.id === selectedUnit)?.name || 'Current Unit'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowLessonModal(false)}
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveLesson} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                                    Lesson Title *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Introduction to Python Functions"
                                    value={lessonForm.title}
                                    onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    placeholder="Summary of topics covered, prerequisites, or notes..."
                                    value={lessonForm.description}
                                    onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 h-20 resize-none"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                                    Google Drive Video Link *
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://drive.google.com/file/d/..."
                                    value={lessonForm.drive_url}
                                    onChange={e => {
                                        setPreviewBroken(false)
                                        setLessonForm({ ...lessonForm, drive_url: e.target.value })
                                    }}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                                    required
                                />
                                <p className="text-[11px] text-slate-400 mt-1">Paste any Google Drive share link to the video file.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                            Thumbnail URL
                                        </label>
                                        {lessonForm.drive_url && !lessonForm.thumbnail_url && (
                                            <button
                                                type="button"
                                                onClick={() => setLessonForm({ ...lessonForm, thumbnail_url: lessonForm.drive_url })}
                                                className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                                            >
                                                Use Drive Link
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type="url"
                                        placeholder="Google Drive link or Image URL"
                                        value={lessonForm.thumbnail_url}
                                        onChange={e => {
                                            setPreviewBroken(false)
                                            setLessonForm({ ...lessonForm, thumbnail_url: e.target.value })
                                        }}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={lessonForm.display_order}
                                        onChange={e => setLessonForm({ ...lessonForm, display_order: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                                    />
                                </div>
                            </div>

                            {/* Live Thumbnail Preview & Status */}
                            {(lessonForm.thumbnail_url || lessonForm.drive_url) && (
                                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-white/10 rounded-2xl p-3.5 flex gap-3.5 items-center">
                                    <div className="w-20 h-14 rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-white/10 flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner">
                                        {getLessonThumbnail(lessonForm.thumbnail_url, lessonForm.drive_url) && !previewBroken ? (
                                            <img 
                                                src={getLessonThumbnail(lessonForm.thumbnail_url, lessonForm.drive_url)!} 
                                                alt="Thumbnail preview" 
                                                referrerPolicy="no-referrer"
                                                onError={(e) => {
                                                    const fileId = extractDriveFileId(lessonForm.thumbnail_url || lessonForm.drive_url)
                                                    const target = e.currentTarget
                                                    if (fileId && !target.dataset.triedLh3) {
                                                        target.dataset.triedLh3 = 'true'
                                                        target.src = `https://lh3.googleusercontent.com/d/${fileId}`
                                                        return
                                                    }
                                                    setPreviewBroken(true)
                                                }}
                                                onLoad={() => setPreviewBroken(false)}
                                                className="w-full h-full object-cover" 
                                            />
                                        ) : (
                                            <div className="text-[10px] text-slate-400 font-mono text-center px-1">
                                                {previewBroken ? "No Preview" : "Loading..."}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                                            {extractDriveFileId(lessonForm.thumbnail_url || lessonForm.drive_url) ? (
                                                <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-bold">
                                                    <span>📁 Google Drive File Detected</span>
                                                </span>
                                            ) : (
                                                <span className="text-slate-600 dark:text-slate-300">Custom Image Link</span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                            {!previewBroken 
                                                ? "✅ Thumbnail preview ready for student dashboard" 
                                                : "⚠️ Preview not available. Please verify the Google Drive file is shared to 'Anyone with the link' (Viewer)"
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Google Drive Tip Box */}
                            <div className="bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
                                <span className="text-base shrink-0">💡</span>
                                <div>
                                    <strong className="text-slate-800 dark:text-slate-200">Google Drive Access Notice:</strong> Ensure the file&apos;s General Access in Google Drive is set to <span className="text-indigo-600 dark:text-indigo-400 font-bold">&quot;Anyone with the link&quot; (Viewer)</span> so verified students can stream the video.
                                </div>
                            </div>

                            <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-200/80 dark:border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setShowLessonModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingLesson}
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 text-white shadow-md shadow-indigo-600/20 transition disabled:opacity-50 cursor-pointer"
                                >
                                    {savingLesson ? 'Saving...' : 'Save Lesson'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── CUSTOM CONFIRMATION DIALOG OVERLAY ── */}
            {confirmDialog.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md px-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight mb-2">{confirmDialog.title}</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-6">{confirmDialog.message}</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmDialog(prev => ({ ...prev, show: false }))}
                                className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 px-4 py-2 rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDialog.onConfirm}
                                className="text-xs font-bold bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-red-600/20 transition cursor-pointer"
                            >
                                {confirmDialog.confirmText || 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TOAST STACK ── */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`p-4 rounded-xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 transition-all duration-300 animate-slide-in ${
                            t.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-300' :
                            t.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-300' :
                            'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                        }`}
                    >
                        {t.type === 'success' && (
                            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        {t.type === 'error' && (
                            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                        )}
                        {t.type === 'info' && (
                            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                        )}
                        <p className="text-xs font-semibold leading-relaxed flex-1">{t.message}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}