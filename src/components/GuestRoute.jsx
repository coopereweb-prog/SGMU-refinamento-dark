import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { Loader2 } from 'lucide-react';

export function GuestRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUser();

  const isLoading = authLoading || (user && profileLoading);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If the user is logged in, redirect them.
  if (user && profile) {
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