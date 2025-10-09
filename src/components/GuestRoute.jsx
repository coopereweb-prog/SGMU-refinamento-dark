export default function GuestRoute({ children }) {
  const { user, session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUser();
  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If the user is logged in (and it's not a password recovery session), redirect them.
  if (user && profile && authEvent !== 'PASSWORD_RECOVERY') {
    const role = profile.role;
    let dashboardPath = '/';
    if (role === 'admin' || role === 'operations_manager') {
      dashboardPath = '/admin';
    } else if (role === 'client') {
      dashboardPath = '/dashboard';
    } else if (role === 'field_technician') {
      dashboardPath = '/technician-panel';
    }
    return <Navigate to={dashboardPath} replace />;
  }

  // Otherwise, show the guest page (e.g., Login)
  return children;
}