import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Star, Users, Calendar, Megaphone, TrendingUp, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [featuredBusinesses, setFeaturedBusinesses] = useState([])
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalUsers: 0,
    totalEvents: 0,
    totalNews: 0
  })

  useEffect(() => {
    loadHomeData()
  }, [])

  const loadHomeData = async () => {
    try {
      // Buscar empresas em destaque (Premium)
      const { data: businesses } = await supabase
        .from('businesses')
        .select('*')
        .eq('plan', 'premium')
        .eq('is_active', true)
        .limit(6)

      if (businesses) {
        setFeaturedBusinesses(businesses)
      }

      // Buscar estatísticas
      const [
        { count: businessCount },
        { count: userCount },
        { count: eventCount },
        { count: newsCount }
      ] = await Promise.all([
        supabase.from('businesses').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('news').select('*', { count: 'exact', head: true })
      ])

      setStats({
        totalBusinesses: businessCount || 0,
        totalUsers: userCount || 0,
        totalEvents: eventCount || 0,
        totalNews: newsCount || 0
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/busca?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Bem-vindo ao <span className="text-orange-400">SGMU</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Sistema de Gerenciamento de Mobiliário Urbano - Gestão eficiente de pontos de propaganda
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="O que você está procurando?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-6 text-lg"
                />
              </div>
              <Button type="submit" size="lg" className="bg-orange-500 hover:bg-orange-600">
                Buscar
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalBusinesses}</div>
              <div className="text-gray-600">Empresas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-2">{stats.totalUsers}</div>
              <div className="text-gray-600">Usuários</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalEvents}</div>
              <div className="text-gray-600">Eventos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalNews}</div>
              <div className="text-gray-600">Notícias</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Businesses */}
      {featuredBusinesses.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Empresas em Destaque
              </h2>
              <p className="text-lg text-gray-600">
                Conheça nossos anunciantes premium
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBusinesses.map((business) => (
                <Card key={business.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{business.name}</CardTitle>
                    <CardDescription>{business.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {business.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {business.address}
                        </span>
                      </div>
                      {business.rating > 0 && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{business.rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <Link to={`/empresa/${business.id}`}>
                        <Button className="w-full" variant="outline">
                          Ver Detalhes
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Por que escolher o SGMU?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Localização Inteligente</h3>
              <p className="text-gray-600">Encontre serviços próximos a você</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Conteúdo Verificado</h3>
              <p className="text-gray-600">Empresas e eventos aprovados</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Crescimento Local</h3>
              <p className="text-gray-600">Apoie o comércio da sua cidade</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Megaphone className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Anúncios Inteligentes</h3>
              <p className="text-gray-600">IA para melhorar sua experiência</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Quer anunciar seu negócio?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Alcance mais clientes com nossos planos premium e recursos de IA
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
              Comece Agora
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage