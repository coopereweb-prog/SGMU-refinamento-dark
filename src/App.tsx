import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores'

// Páginas
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import SignUpPage from '@/pages/SignUpPage'

// Componentes
import Header from '@/components/Header'
import ProtectedRoute from '@/components/ProtectedRoute'

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
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
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
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  )
}

export default App