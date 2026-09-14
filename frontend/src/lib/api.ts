import axios from 'axios'
import { supabase } from './supabase'

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
})

// Attach Supabase JWT to every request automatically
api.interceptors.request.use(async (config) => {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`
        }
    } catch (e) {
        console.warn('Error fetching auth session for request:', e)
    }
    return config
})

// Auto refresh session on 401 and retry once
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true
            try {
                const { data: { session }, error: refreshError } = await supabase.auth.refreshSession()
                if (session?.access_token && !refreshError) {
                    originalRequest.headers.Authorization = `Bearer ${session.access_token}`
                    return api(originalRequest)
                }
            } catch (refreshErr) {
                console.warn('Failed to refresh session on 401:', refreshErr)
            }
        }
        return Promise.reject(error)
    }
)

export default api