import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { FilterPanel } from "@/components/FilterPanel";

export function FilterSheet({ isOpen, onOpenChange, points, onFilterChange }) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80%] flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle>Filtrar Pontos</SheetTitle>
          <SheetDescription>
            Selecione os critérios para refinar sua busca no mapa.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-grow overflow-hidden">
          <FilterPanel points={points} onFilterChange={onFilterChange} />
        </div>
      </SheetContent>
    </Sheet>
  );
}