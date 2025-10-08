import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoPanel } from './InfoPanel';
import { TagFilter } from './TagFilter';
import { Cart } from './Cart';
import { Badge } from "@/components/ui/badge";

export function Sidebar({
  points,
  onFilterChange,
  cartItems,
  onRemoveFromCart,
  onClearCart,
  onUpdateCartItemPeriod,
  onShowReservationForm,
}) {
  return (
    <div className="w-full h-full bg-background border-l flex flex-col">
      <Tabs defaultValue="filter" className="flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="filter">Filtros e Info</TabsTrigger>
          <TabsTrigger value="cart">
            Carrinho
            {cartItems.length > 0 && (
              <Badge variant="secondary" className="ml-2">{cartItems.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="filter" className="flex-grow overflow-y-auto p-4 space-y-4">
          <InfoPanel points={points} />
          <TagFilter onFilterChange={onFilterChange} />
        </TabsContent>
        <TabsContent value="cart" className="flex-grow flex flex-col data-[state=inactive]:hidden">
          <Cart
            items={cartItems}
            onRemove={onRemoveFromCart}
            onClear={onClearCart}
            onUpdatePeriod={onUpdateCartItemPeriod}
            onShowReservationForm={onShowReservationForm}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}