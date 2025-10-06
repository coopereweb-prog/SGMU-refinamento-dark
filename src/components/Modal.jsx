import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Modal({ isOpen, onClose, title, description, children, className }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card 
        className={cn(
          "relative w-full max-w-lg flex flex-col animate-in fade-in-0 zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto",
          className
        )}
        onClick={(e) => e.stopPropagation()}
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
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}