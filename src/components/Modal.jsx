import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Modal({ isOpen, onClose, title, description, children, className }) {
  if (!isOpen) {
    return null;
  }

  // Gera um ID único para a descrição
  const descriptionId = title ? `modal-description-${title.replace(/\s/g, '-')}` : 'modal-description';

  return (
    <div 
      className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card 
        className={cn(
          "relative w-full max-w-lg flex flex-col animate-in fade-in-0 zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        // Adiciona o atributo aria-describedby para resolver o aviso de acessibilidade
        aria-describedby={descriptionId}
        role="dialog"
        aria-modal="true"
      >
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
        >
          <X className="h-5 w-5" />
        </Button>

        <CardHeader className="pr-12">
          <CardTitle>{title}</CardTitle>
          {/* Usa o ID gerado para a descrição */}
          {description && <CardDescription id={descriptionId}>{description}</CardDescription>}
          {!description && <CardDescription id={descriptionId} className="sr-only">Conteúdo do modal.</CardDescription>}
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}