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
        const { data, error } = await supabase.from('points').select('*, pricing_tiers(*, tier_prices(*))');
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

  const addToCart = useCallback((point, details) => {
    if (cartItems.some(item => item.point_id === point.id)) {
      toast.warning("Este ponto já está no seu carrinho.");
      return;
    }
    
    if (typeof details.price !== 'number' || details.price <= 0) {
      toast.error("Preço inválido para o item selecionado.");
      return;
    }

    const newItem = { 
      point_id: point.id, 
      name: point.name, 
      price: details.price, 
      media_type: point.media_type,
      details: details 
    };
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

  const updateCartItemPeriod = useCallback((index, newPeriodDays) => {
    const itemToUpdate = cartItems[index];
    const point = points.find(p => p.id === itemToUpdate.point_id);
    if (!point || !point.pricing_tiers?.tier_prices) {
      toast.error("Não foi possível encontrar os detalhes do ponto para atualizar o preço.");
      return;
    }
    
    const newPriceOption = point.pricing_tiers.tier_prices.find(p => p.period_days === newPeriodDays);
    if (!newPriceOption) {
      toast.error("Período indisponível para este ponto.");
      return;
    }

    setCartItems(prev => prev.map((item, i) => 
      i === index 
        ? { ...item, price: newPriceOption.price, details: { ...item.details, days: newPeriodDays } } 
        : item
    ));
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
    points, // Expondo os pontos para uso no carrinho
  }), [cartItems, addToCart, removeFromCart, clearCart, updateCartItemPeriod, isCartModalOpen, isReservationFormOpen, points]);

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