import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Modal({ isOpen, onClose, title, description, children, className }) {
  // O componente Dialog do shadcn/ui (Radix) gerencia o estado de abertura/fechamento
  // e o backdrop, então não precisamos do div condicional externo.

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "sm:max-w-lg max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        <DialogHeader className="pr-8">
          <DialogTitle>{title}</DialogTitle>
          {/* O DialogDescription é obrigatório para acessibilidade, mesmo que vazio */}
          <DialogDescription>
            {description || 'Informações detalhadas.'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {children}
        </div>
        
        {/* O botão de fechar já é nativo do DialogContent, mas vamos mantê-lo explícito se necessário, 
            ou confiar no botão 'X' padrão do DialogContent. 
            Removendo o botão 'X' customizado para usar o padrão do DialogContent, que é mais acessível.
        */}
      </DialogContent>
    </Dialog>
  );
}