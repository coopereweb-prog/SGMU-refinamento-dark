const handleAddToCart = useCallback((point, periodYears) => {
    // Verificação rigorosa antes de adicionar ao carrinho
    if (point.status !== 'available' || point.is_available !== true) {
      toast.error('Este ponto não está mais disponível para reserva.');
      return;
    }
    
    let price;
    switch (periodYears) {
      case 1: price = point.price_1y; break;
      case 2: price = point.price_2y; break;
      case 3: price = point.price_3y; break;
      case 4: price = point.price_4y; break;
      case 5: price = point.price_5y; break;
      default: price = 0;
    }

    const cartItem = {
      point: point,
      point_id: point.id,
      name: point.name,
      period_years: periodYears,
      price: price
    };
    
    setCartItems(prev => [...prev, cartItem]);
    toast.success('Ponto adicionado ao carrinho!');
  }, []);