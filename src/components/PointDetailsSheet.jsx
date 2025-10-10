import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { PointDetails } from "@/components/PointDetails";

export function PointDetailsSheet({ point, isOpen, onOpenChange, onAddToCart }) {
  if (!point) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col" aria-describedby={undefined}>
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>{point.name}</SheetTitle>
          {point.description && (
            <SheetDescription>{point.description}</SheetDescription>
          )}
        </SheetHeader>
        <div className="flex-grow overflow-y-auto p-6 pt-0">
          <PointDetails point={point} onAddToCart={onAddToCart} />
        </div>
      </SheetContent>
    </Sheet>
  );
}