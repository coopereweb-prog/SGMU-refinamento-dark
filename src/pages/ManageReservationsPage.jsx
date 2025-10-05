import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from '@/components/Modal';
import { ReservationDetails } from '@/components/ReservationDetails';
import { toast } from "sonner";
import { Loader2, Search } from 'lucide-react';

export function ManageReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  const fetchReservations = async () => {
    setLoading(true);
    let query = supabase
      .from('reservations')
      .select(`
        *,
        profiles (full_name, email, phone),
        reservation_items (
          *,
          points (name)
        )
      `)
      .order('created_at', { ascending: false });

    if (searchTerm) {
      query = query.ilike('profiles.full_name', `%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reservations:', error);
      toast.error("Erro ao buscar reservas", { description: error.message });
    } else {
      setReservations(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchReservations();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleManageClick = (reservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReservation(null);
  };

  const handleSaveStatus = async (reservationId, newStatus) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: newStatus })
        .eq('id', reservationId);

      if (error) throw error;

      toast.success("Status atualizado!", { description: "O status da reserva foi alterado com sucesso." });
      handleCloseModal();
      fetchReservations(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Erro ao atualizar status", { description: error.message });
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'confirmed': return 'default';
      case 'paid': return 'success';
      case 'cancelled': return 'destructive';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gerenciar Reservas</h1>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome do cliente..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell>{reservation.profiles?.full_name || 'N/A'}</TableCell>
                <TableCell>{new Date(reservation.created_at).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{Number(reservation.total_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(reservation.status)}>{reservation.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => handleManageClick(reservation)}>
                    Gerenciar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {selectedReservation && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={`Gerenciar Reserva #${selectedReservation.id.substring(0, 8)}`}
          description="Visualize os detalhes e atualize o status da reserva."
        >
          <ReservationDetails
            reservation={selectedReservation}
            onSave={handleSaveStatus}
            onCancel={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
}