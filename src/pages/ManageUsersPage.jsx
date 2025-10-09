export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      toast.error("Erro ao buscar usuários", { description: error.message });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInvite = async (values) => {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(values.email, {
      data: { role: values.role },
    });
    if (error) {
      toast.error("Erro ao convidar usuário", { description: error.message });
    } else {
      toast.success("Convite enviado!", { description: `Um e-mail de convite foi enviado para ${values.email}.` });
      fetchUsers();
      setIsInviteModalOpen(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleUpdate = async (values) => {
    const { data, error } = await supabase.auth.admin.updateUserById(selectedUser.id, {
      user_metadata: { full_name: values.full_name, phone: values.phone },
      app_metadata: { role: values.role },
    });
    if (error) {
      toast.error("Erro ao atualizar usuário", { description: error.message });
    } else {
      toast.success("Usuário atualizado com sucesso!");
      fetchUsers();
      setIsModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    const { error } = await supabase.auth.admin.deleteUser(selectedUser.id);
    if (error) {
      toast.error("Erro ao deletar usuário", { description: error.message });
    } else {
      toast.success("Usuário deletado com sucesso!");
      fetchUsers();
      setIsAlertOpen(false);
      setSelectedUser(null);
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: "destructive",
      operations_manager: "default",
      field_technician: "secondary",
      client: "outline",
    };
    return <Badge variant={variants[role] || "outline"}>{role}</Badge>;
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gerenciar Usuários</CardTitle>
          <Button onClick={() => setIsInviteModalOpen(true)}>
            <Mail className="mr-2 h-4 w-4" /> Convidar Usuário
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.app_metadata?.role)}</TableCell>
                    <TableCell>
                      <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                        {user.email_confirmed_at ? "Confirmado" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(user)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Convite */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Convidar Novo Usuário"
        description="Envie um convite por e-mail para um novo membro se juntar à plataforma."
      >
        <UserForm onSave={handleInvite} onCancel={() => setIsInviteModalOpen(false)} isInvite={true} />
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        title="Editar Usuário"
        description="Modifique as informações do usuário abaixo."
      >
        <UserForm user={selectedUser} onSave={handleUpdate} onCancel={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }} />
      </Modal>

      {/* Alerta de Deleção */}
      <Modal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title="Você tem certeza?"
        description={`Esta ação não pode ser desfeita. Isso irá deletar permanentemente o usuário ${selectedUser?.email}.`}
      >
        <div className="flex justify-end space-x-4 pt-4">
          <Button variant="outline" onClick={() => setIsAlertOpen(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={confirmDelete}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
}