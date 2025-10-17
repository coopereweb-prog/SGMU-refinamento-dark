import { useCart } from '@/contexts/CartContext';
import { FloatingCartButton } from '@/components/FloatingCartButton';
import { CartModal } from '@/components/CartModal';
import { Modal } from '@/components/Modal';
import { EnhancedReservationForm } from '@/components/EnhancedReservationForm';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';

export function GlobalCart() {
  const {
    cartItems,
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
  } = useCart();

  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUser();
  const location = useLocation();

  const isLoading = authLoading || (user && profileLoading);

  // Define as rotas exatas onde o carrinho deve ser visível
  const allowedPaths = ['/', '/dashboard'];
  const isVisiblePath = allowedPaths.includes(location.pathname);

  // Não mostra nada enquanto carrega para evitar um "flash" do botão
  if (isLoading) {
    return null;
  }

  // Se a rota atual não estiver na lista de permitidas, não renderiza nada
  if (!isVisiblePath) {
    return null;
  }

  return (
    <>
      <FloatingCartButton itemCount={cartItems.length} onClick={openCartModal} />
      
      <CartModal
        isOpen={isCartModalOpen}
        onClose={closeCartModal}
        cartItems={cartItems}
        onRemoveFromCart={removeFromCart}
        onClearCart={clearCart}
        onUpdateCartItemPeriod={updateCartItemPeriod}
        onShowReservationForm={openReservationForm}
      />

      <Modal
        isOpen={isReservationFormOpen}
        onClose={closeReservationForm}
        title="Finalizar Reserva"
        description="Preencha seus dados para concluir a reserva dos pontos."
      >
        <EnhancedReservationForm
          cartItems={cartItems}
          onClose={closeReservationForm}
          onReservationSuccess={onReservationSuccess}
        />
      </Modal>
    </>
  );
}