import { create } from 'zustand'
import { User } from '@/lib/supabase'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: () => set({ user: null, isAuthenticated: false, isLoading: false })
}))

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  toast: {
    open: boolean
    title: string
    description: string
    variant: 'default' | 'destructive'
  }
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  showToast: (title: string, description: string, variant?: 'default' | 'destructive') => void
  hideToast: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  theme: 'light',
  toast: {
    open: false,
    title: '',
    description: '',
    variant: 'default'
  },
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
  showToast: (title, description, variant = 'default') => 
    set({ toast: { open: true, title, description, variant } }),
  hideToast: () => set({ toast: { ...useUIStore.getState().toast, open: false } })
}))

interface BusinessState {
  businesses: any[]
  categories: string[]
  selectedCategory: string
  searchQuery: string
  isLoading: boolean
  setBusinesses: (businesses: any[]) => void
  setCategories: (categories: string[]) => void
  setSelectedCategory: (category: string) => void
  setSearchQuery: (query: string) => void
  setLoading: (loading: boolean) => void
}

export const useBusinessStore = create<BusinessState>((set) => ({
  businesses: [],
  categories: [],
  selectedCategory: '',
  searchQuery: '',
  isLoading: false,
  setBusinesses: (businesses) => set({ businesses }),
  setCategories: (categories) => set({ categories }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setLoading: (loading) => set({ isLoading: loading })
}))