import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, MapPin } from 'lucide-react';

export function KanbanCard({ task }) {
  return (
    <Card className="mb-2 bg-card/80 hover:bg-accent transition-colors">
      <CardHeader className="p-3">
        <CardTitle className="text-sm font-semibold">{task.point_name || 'Ponto não encontrado'}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 text-xs text-muted-foreground space-y-2">
        <div className="flex items-center">
          <User className="h-3 w-3 mr-2" />
          <span>{task.customer_name || 'Cliente não encontrado'}</span>
        </div>
        {task.technician_name && (
          <div className="flex items-center">
            <MapPin className="h-3 w-3 mr-2" />
            <span>Téc: {task.technician_name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}