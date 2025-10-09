export default function ResetPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (values) => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });
    if (error) {
      toast.error("Erro ao redefinir senha", { description: error.message });
    } else {
      toast.success("Senha redefinida com sucesso!");
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Redefinir senha
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Digite sua nova senha abaixo.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(handleResetPassword)}>
          <div>
            <label htmlFor="password" className="sr-only">
              Nova senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nova senha"
              {...register('password')}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Redefinir senha'}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Voltar ao login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}