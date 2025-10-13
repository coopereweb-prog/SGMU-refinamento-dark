import { useCart } from '@/contexts/CartContext';
import { FloatingCartButton } from '@/components/FloatingCartButton';
import { CartModal } from '@/components/CartModal';
import { Modal } from '@/components/Modal';
import { EnhancedReservationForm } from '@/components/EnhancedReservationForm';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';

const HIDDEN_ROLES = ['admin', 'operations_manager', 'field_technician'];
const HIDDEN_PATHS = ['/admin', '/technician-panel'];

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

  // Não mostra nada enquanto carrega para evitar um "flash" do botão
  if (isLoading) {
    return null;
  }

  // Oculta se a rota atual for uma rota de admin/técnico
  const isHiddenPath = HIDDEN_PATHS.some(path => location.pathname.startsWith(path));
  if (isHiddenPath) {
    return null;
  }

  // Oculta se o usuário logado tiver uma função que não deve ver o carrinho
  if (user && profile && HIDDEN_ROLES.includes(profile.role)) {
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