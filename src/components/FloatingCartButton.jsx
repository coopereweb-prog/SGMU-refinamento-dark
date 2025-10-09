import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function FloatingCartButton({ itemCount, onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-20 sm:top-24 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-black shadow-lg ring-2 ring-primary/50 transition-transform hover:scale-110 animate-pulse"
      aria-label="Abrir carrinho de compras"
    >
      <ShoppingCart className="h-8 w-8 text-primary" />
      {itemCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-6 w-6 justify-center rounded-full p-0 text-sm"
        >
          {itemCount}
        </Badge>
      )}
    </button>
  );
}