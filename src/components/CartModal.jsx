import { Modal } from '@/components/Modal';
import { Cart } from '@/components/Cart';

export function CartModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  onRemoveFromCart, 
  onClearCart, 
  onUpdateCartItemPeriod, 
  onShowReservationForm 
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Seu Carrinho de Reservas"
      description={cartItems.length > 0 ? `Você tem ${cartItems.length} item(ns) no carrinho.` : 'Seu carrinho está vazio.'}
    >
      <Cart
        items={cartItems}
        onRemove={onRemoveFromCart}
        onClear={onClearCart}
        onUpdatePeriod={onUpdateCartItemPeriod}
        onShowReservationForm={onShowReservationForm}
      />
    </Modal>
  );
}