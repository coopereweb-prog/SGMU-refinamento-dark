import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getStatusBadge } from '../lib/utils';
import { PointForm } from '../components/PointForm';
import { Home, PlusCircle, Edit, Trash2 } from 'lucide-react';

function PointsManagementPage() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);

  const fetchPoints = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('points').select('*').order('name');
    if (error) {
      console.error('Error fetching points:', error);
      alert('Não foi possível carregar os pontos.');
    } else {
      setPoints(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  const handleSave = () => {
    setIsDialogOpen(false);
    setEditingPoint(null);
    fetchPoints();
  };

  const handleAddNew = () => {
    setEditingPoint(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (point) => {
    setEditingPoint(point);
    setIsDialogOpen(true);
  };

  const handleDelete = async (pointId) => {
    if (!window.confirm('Tem certeza que deseja excluir este ponto? Esta ação não pode ser desfeita.')) return;
    const { error } = await supabase.from('points').delete().eq('id', pointId);
    if (error) {
      alert(`Erro ao excluir ponto: ${error.message}`);
    } else {
      alert('Ponto excluído com sucesso.');
      fetchPoints();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gerenciamento de Pontos</h1>
          <p className="text-gray-600">Adicione, edite ou remova pontos de instalação.</p>
        </div>
        <Link to="/admin">
          <Button variant="outline"><Home className="h-4 w-4 mr-2" /> Voltar para Pedidos</Button>
        </Link>
      </header>

      <main>
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Pontos Cadastrados</span>
              <Button onClick={handleAddNew}><PlusCircle className="h-4 w-4 mr-2" /> Adicionar Novo Ponto</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <p>Carregando...</p> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Latitude</TableHead>
                    <TableHead>Longitude</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {points.map(point => {
                    const statusInfo = getStatusBadge(point.status);
                    return (
                      <TableRow key={point.id}>
                        <TableCell className="font-medium">{point.name}</TableCell>
                        <TableCell><Badge className={statusInfo.className}>{statusInfo.label}</Badge></TableCell>
                        <TableCell>{point.latitude}</TableCell>
                        <TableCell>{point.longitude}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(point)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(point.id)} disabled={point.status !== 'available'}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingPoint ? 'Editar Ponto' : 'Adicionar Novo Ponto'}</DialogTitle>
          </DialogHeader>
          <PointForm point={editingPoint} onSave={handleSave} onCancel={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PointsManagementPage;