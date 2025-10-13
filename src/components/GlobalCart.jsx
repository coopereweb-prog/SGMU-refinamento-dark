import { useCart } from '@/contexts/CartContext';
import { FloatingCartButton } from '@/components/FloatingCartButton';
import { CartModal } from '@/components/CartModal';
import { Modal } from '@/components/Modal';
import { EnhancedReservationForm } from '@/components/EnhancedReservationForm';

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