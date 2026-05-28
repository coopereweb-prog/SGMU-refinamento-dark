import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

export function MobileFilterButton({ onClick }) {
  return (
    <div className="md:hidden fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-10">
      <Button
        onClick={onClick}
        className="bg-background/80 backdrop-blur-sm text-foreground shadow-lg hover:bg-primary hover:text-primary-foreground"
      >
        <Filter className="mr-2 h-4 w-4" />
        Filtrar Pontos
      </Button>
    </div>
  );
}