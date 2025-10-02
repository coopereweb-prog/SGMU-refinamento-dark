import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserForm } from '@/components/UserForm';
import { BaseModal } from '@/components/BaseModal';
import { BaseAlertDialog } from '@/components/BaseAlertDialog';
import { useToast } from "@/components/ui/use-toast";
import { Mail, Edit, Trash2 } from 'lucide-react';

export function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isInviteMode, setIsInviteMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: { users: userList }, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error('Error fetching users:', error);
      toast({ title: "Erro", description: "Não foi possível carregar os usuários.", variant: "destructive" });
    } else {
      setUsers(userList);
    }
    setLoading(false);
  };

  const handleInvite = () => {
    setEditingUser(null);
    setIsInviteMode(true);
    setIsFormOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsInviteMode(false);
    setIsFormOpen(true);
  };

  const handleSaveUser = async (formData) => {
    try {
      if (isInviteMode) {
        // Invite user
        const { data, error } = await supabase.auth.admin.inviteUserByEmail(formData.email, {
          data: {
            role: formData.role,
          }
        });
        if (error) throw error;
        toast({ title: "Sucesso", description: "Convite enviado para o usuário." });
      } else if (editingUser) {
        // Update user
        const { data: { user }, error } = await supabase.auth.admin.updateUserById(
          editingUser.id,
          {
            user_metadata: {
              full_name: formData.full_name,
              phone: formData.phone,
            },
            app_metadata: {
              role: formData.role
            }
          }
        );
        if (error) throw error;
        toast({ title: "Sucesso", description: "Usuário atualizado com sucesso." });
      }
      
      setIsFormOpen(false);
      setEditingUser(null);
      setIsInviteMode(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast({ title: "Erro", description: `Falha ao salvar o usuário: ${error.message}`, variant: "destructive" });
    }
  };

  const openDeleteDialog = (user) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const { error } = await supabase.auth.admin.deleteUser(userToDelete.id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Usuário excluído com sucesso." });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({ title: "Erro", description: `Falha ao excluir o usuário: ${error.message}`, variant: "destructive" });
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
        <Button onClick={handleInvite}>
          <Mail className="mr-2 h-4 w-4" /> Convidar Usuário
        </Button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.user_metadata?.full_name || 'N/A'}</TableCell>
                <TableCell>{user.app_metadata?.role || 'client'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(user)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <BaseModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={isInviteMode ? 'Convidar Usuário' : 'Editar Usuário'}
      >
        <UserForm
          user={editingUser}
          onSave={handleSaveUser}
          onCancel={() => setIsFormOpen(false)}
          isInvite={isInviteMode}
        />
      </BaseModal>

      <BaseAlertDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteUser}
        title="Você tem certeza?"
        description={`Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário "${userToDelete?.email}".`}
        confirmText="Excluir"
      />
    </div>
  );
}