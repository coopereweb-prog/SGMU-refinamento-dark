import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  email: string
  role: 'admin' | 'advertiser' | 'user'
  plan: 'free' | 'premium'
  created_at: string
  updated_at: string
}

export type Business = {
  id: string
  user_id: string
  name: string
  description: string
  category: string
  address: string
  latitude: number
  longitude: number
  phone: string
  email: string
  website?: string
  plan: 'free' | 'premium'
  is_active: boolean
  rating: number
  review_count: number
  created_at: string
  updated_at: string
}

export type Service = {
  id: string
  business_id: string
  name: string
  description: string
  price?: number
  duration?: number
  is_active: boolean
  created_at: string
}

export type Event = {
  id: string
  title: string
  description: string
  category: string
  start_date: string
  end_date: string
  location: string
  latitude: number
  longitude: number
  organizer: string
  is_approved: boolean
  created_at: string
}

export type News = {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  author: string
  image_url?: string
  is_featured: boolean
  is_approved: boolean
  view_count: number
  created_at: string
  updated_at: string
}