import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface Profile {
    id: string
    full_name: string | null
    role: string
    is_verified: boolean
    created_at: string
    avatar_url?: string | null
    email?: string
}

interface AuthState {
    user: User | null
    profile: Profile | null
    loading: boolean
    setUser: (user: User | null) => void
    setProfile: (profile: Profile | null) => void
    setAvatarUrl: (url: string | null) => void
    setLoading: (loading: boolean) => void
    signOut: () => Promise<void>
}

const getLocalAvatar = (userId?: string): string | null => {
    if (typeof window === 'undefined' || !userId) return null
    try {
        return localStorage.getItem(`lms_avatar_${userId}`)
    } catch {
        return null
    }
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    profile: null,
    loading: true,
    setUser: (user) => {
        set((state) => {
            const avatar = user ? getLocalAvatar(user.id) : null
            const updatedProfile = state.profile
                ? { ...state.profile, avatar_url: avatar || state.profile.avatar_url, email: user?.email || state.profile.email }
                : null
            return { user, profile: updatedProfile }
        })
    },
    setProfile: (profile) => {
        set((state) => {
            if (!profile) return { profile: null }
            const userId = profile.id || state.user?.id
            const avatar = getLocalAvatar(userId) || profile.avatar_url || null
            const email = profile.email || state.user?.email
            return { profile: { ...profile, avatar_url: avatar, email } }
        })
    },
    setAvatarUrl: (url: string | null) => {
        const state = get()
        const userId = state.profile?.id || state.user?.id
        if (typeof window !== 'undefined' && userId) {
            try {
                if (url) {
                    localStorage.setItem(`lms_avatar_${userId}`, url)
                } else {
                    localStorage.removeItem(`lms_avatar_${userId}`)
                }
            } catch (err) {
                console.warn('Failed to save avatar to localStorage:', err)
            }
        }
        set((state) => ({
            profile: state.profile ? { ...state.profile, avatar_url: url } : null
        }))
    },
    setLoading: (loading) => set({ loading }),
    signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, profile: null, loading: false })
    },
}))