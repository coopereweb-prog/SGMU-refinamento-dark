import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Map } from '../components/Map';
import { PointList } from '../components/PointList';
import { FilterPanel } from '../components/FilterPanel';
import { Cart } from '../components/Cart';
import { Header } from '../components/Header';
import { getPoints, getTags, createOrder } from '../lib/supabase';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

function HomePage() {
  const [points, setPoints] = useState([]);
  const [tags, setTags] = useState([]);
  const [filteredPoints, setFilteredPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [cartItems, setCartItems] = useLocalStorage('cartItems', []);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { profile } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const pointsData = await getPoints();
      const tagsData = await getTags();
      setPoints(pointsData);
      setFilteredPoints(pointsData);
      setTags(tagsData);
    };
    fetchData();
  }, []);

  const handleFilterChange = (selectedTagIds) => {
    if (selectedTagIds.length === 0) {
      setFilteredPoints(points);
    } else {
      const newFilteredPoints = points.filter(point =>
        selectedTagIds.every(tagId =>
          point.tags.some(tag => tag.id === tagId)
        )
      );
      setFilteredPoints(newFilteredPoints);
    }
  };

  const handleAddToCart = (point, period) => {
    if (cartItems.some(item => item.point_id === point.id)) {
      toast.warning('Ponto já está no carrinho', {
        description: 'Você pode alterar o período de reserva no carrinho.',
      });
      return;
    }
    const newItem = {
      point_id: point.id,
      name: point.name,
      period_years: period,
      price: point.price,
    };
    setCartItems([...cartItems, newItem]);
    toast.success(`${point.name} adicionado ao carrinho!`);
  };

  const handleRemoveFromCart = (pointId) => {
    setCartItems(cartItems.filter(item => item.point_id !== pointId));
  };

  const handleUpdateCartItem = (pointId, newPeriod) => {
    setCartItems(cartItems.map(item =>
      item.point_id === pointId ? { ...item, period_years: newPeriod } : item
    ));
  };

  const handleFinalizeReservation = async () => {
    if (!user || !profile) {
      // Se não estiver logado, o modal já estará mostrando as opções de login/cadastro.
      // Esta função só será chamada pelo botão de confirmação se o usuário estiver logado.
      return;
    }
    
    setLoading(true);
    try {
      await createOrder({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      }, cartItems);

      toast.success('Reserva realizada com sucesso!', {
        description: 'Você será redirecionado para o seu painel.',
      });
      setCartItems([]);
      setIsCheckoutModalOpen(false);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      toast.error('Erro ao criar reserva', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const renderCheckoutModalContent = () => {
    if (user && profile) {
      // Usuário Logado
      return (
        <>
          <DialogHeader>
            <DialogTitle>Confirmar sua Reserva</DialogTitle>
            <DialogDescription>
              Revise os detalhes abaixo. A reserva será feita em nome de <strong>{profile.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Telefone:</strong> {profile.phone || 'Não informado'}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              Após a confirmação, você será redirecionado para o seu painel de cliente.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutModalOpen(false)} disabled={loading}>Cancelar</Button>
            <Button onClick={handleFinalizeReservation} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Confirmar Reserva'}
            </Button>
          </DialogFooter>
        </>
      );
    } else {
      // Usuário Não Logado
      return (
        <>
          <DialogHeader>
            <DialogTitle>Quase lá!</DialogTitle>
            <DialogDescription>
              Para finalizar sua reserva, você precisa ter uma conta.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <p>Faça login para continuar ou crie uma conta gratuitamente.</p>
          </div>
          <DialogFooter className="sm:justify-center gap-2">
            <Button asChild className="w-full sm:w-auto">
              <Link to="/login" state={{ from: { pathname: '/' } }}>Fazer Login</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/signup">Criar Conta</Link>
            </Button>
          </DialogFooter>
        </>
      );
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 p-4 overflow-y-auto">
          <FilterPanel tags={tags} onFilterChange={handleFilterChange} />
          <PointList
            points={filteredPoints}
            onPointSelect={setSelectedPoint}
            onAddToCart={handleAddToCart}
            cartItems={cartItems}
          />
        </div>
        <div className="w-2/3 relative">
          <Map points={filteredPoints} selectedPoint={selectedPoint} />
          <Cart
            items={cartItems}
            onRemove={handleRemoveFromCart}
            onUpdate={handleUpdateCartItem}
            onFinalize={() => setIsCheckoutModalOpen(true)}
          />
        </div>
      </div>
      <Dialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
        <DialogContent>
          {renderCheckoutModalContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default HomePage;