import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores'

// Páginas
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import SignUpPage from '@/pages/SignUpPage'
import BusinessSearchPage from '@/pages/BusinessSearchPage'
import BusinessProfilePage from '@/pages/BusinessProfilePage'
import AdminDashboardPage from '@/pages/AdminDashboardPage'
import AdvertiserDashboardPage from '@/pages/AdvertiserDashboardPage'

// Componentes
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProtectedRoute from '@/components/ProtectedRoute'
import LoadingSpinner from '@/components/LoadingSpinner'

function App() {
  const { setUser, setLoading } = useAuthStore()
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Buscar dados completos do usuário
        fetchUserData(session.user.id)
      } else {
        setLoading(false)
        setIsInitializing(false)
      }
    })

    // Ouvir mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserData(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
      setIsInitializing(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      if (data) {
        setUser(data)
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error)
    } finally {
      setLoading(false)
      setIsInitializing(false)
    }
  }

  if (isInitializing) {
    return <LoadingSpinner />
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/busca" element={<BusinessSearchPage />} />
            <Route path="/empresa/:id" element={<BusinessProfilePage />} />
            
            {/* Rotas Protegidas */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            } />
            
            <Route path="/anunciante" element={
              <ProtectedRoute allowedRoles={['advertiser', 'admin']}>
                <AdvertiserDashboardPage />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </Router>
  )
}

export default App