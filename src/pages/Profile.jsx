export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (error) {
      toast.error("Erro ao carregar perfil", { description: error.message });
    } else {
      setProfile(data);
    }
  };

  const handleUpdateProfile = async (values) => {
    setLoading(true);
    const { error } = await supabase.from('profiles').update(values).eq('id', user.id);
    if (error) {
      toast.error("Erro ao atualizar perfil", { description: error.message });
    } else {
      toast.success("Perfil atualizado com sucesso!");
      fetchProfile();
    }
    setLoading(false);
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>
            Gerencie suas informações pessoais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleUpdateProfile)} className="space-y-4">
            <div>
              <Label htmlFor="full_name">Nome completo</Label>
              <Input
                id="full_name"
                defaultValue={profile.full_name}
                {...register('full_name')}
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                defaultValue={profile.phone}
                {...register('phone')}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.email}
                disabled
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Atualizar perfil
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}