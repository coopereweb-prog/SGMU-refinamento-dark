import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

export function MobileFilterButton({ onClick }) {
  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-10">
      <Button
        onClick={onClick}
        className="w-full bg-background/80 backdrop-blur-sm text-foreground shadow-lg"
        size="lg"
      >
        <Filter className="mr-2 h-4 w-4" />
        Filtrar Pontos
      </Button>
    </div>
  );
}