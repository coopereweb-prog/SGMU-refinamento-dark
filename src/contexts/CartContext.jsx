import { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [points, setPoints] = useState([]);
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('sgmu-cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      return [];
    }
  });
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isReservationFormOpen, setIsReservationFormOpen] = useState(false);

  // Busca todos os pontos para cálculos de preço
  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const { data, error } = await supabase.from('points').select('*');
        if (error) throw error;
        setPoints(data);
      } catch (error) {
        console.error('Erro ao buscar pontos para o carrinho:', error);
      }
    };
    fetchPoints();
  }, []);

  // Salva o carrinho no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sgmu-cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error("Falha ao salvar carrinho no localStorage:", error);
    }
  }, [cartItems]);

  const addToCart = useCallback((point, period) => {
    if (cartItems.some(item => item.point_id === point.id)) {
      toast.warning("Este ponto já está no seu carrinho.");
      return;
    }
    const price = point[`price_${period}y`];
    if (typeof price !== 'number' || price <= 0) {
      toast.error("Preço inválido para o período selecionado.");
      return;
    }
    const newItem = { point_id: point.id, name: point.name, price, period_years: period };
    setCartItems(prevItems => [...prevItems, newItem]);
    toast.success(`${point.name} adicionado ao carrinho!`);
  }, [cartItems]);

  const removeFromCart = useCallback((index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setIsCartModalOpen(false);
  }, []);

  const updateCartItemPeriod = useCallback((index, newPeriod) => {
    const itemToUpdate = cartItems[index];
    const point = points.find(p => p.id === itemToUpdate.point_id);
    if (!point) {
      toast.error("Não foi possível encontrar os detalhes do ponto para atualizar o preço.");
      return;
    }
    const newPrice = point[`price_${newPeriod}y`];
    if (typeof newPrice !== 'number' || newPrice <= 0) {
      toast.error("Período indisponível para este ponto.");
      return;
    }
    setCartItems(prev => prev.map((item, i) => i === index ? { ...item, period_years: newPeriod, price: newPrice } : item));
  }, [cartItems, points]);

  const openCartModal = () => setIsCartModalOpen(true);
  const closeCartModal = () => setIsCartModalOpen(false);

  const openReservationForm = () => {
    closeCartModal();
    setIsReservationFormOpen(true);
  };
  const closeReservationForm = () => setIsReservationFormOpen(false);

  const onReservationSuccess = () => {
    closeReservationForm();
    setCartItems([]);
  };

  const value = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    updateCartItemPeriod,
    isCartModalOpen,
    openCartModal,
    closeCartModal,
    isReservationFormOpen,
    openReservationForm,
    closeReservationForm,
    onReservationSuccess,
  }), [cartItems, addToCart, removeFromCart, clearCart, updateCartItemPeriod, isCartModalOpen, isReservationFormOpen]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}