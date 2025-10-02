import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserProvider } from '@/contexts/UserContext';
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { AppLayout } from '@/components/AppLayout';
import HomePage from '@/pages/HomePage';
import { AdminPage } from '@/pages/AdminPage';
import { ManagePointsPage } from '@/pages/ManagePointsPage';
import { ManageTagsPage } from '@/pages/ManageTagsPage';
import { ManageUsersPage } from '@/pages/ManageUsersPage';
import LoginPage from '@/pages/LoginPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ClientDashboardPage from '@/pages/ClientDashboardPage';

function App() {
  const ADMIN_ROLES = ['admin', 'operations_manager'];

  return (
    <AuthProvider>
      <UserProvider>
        <Router>
          <Routes>
            <Route element={<AppLayout />}>
              {/* Rotas Públicas */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Rotas Protegidas para Clientes */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientDashboardPage />
                </ProtectedRoute>
              } />

              {/* Rotas Protegidas para Admin */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <AdminPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/points" element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <ManagePointsPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/tags" element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <ManageTagsPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageUsersPage />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </Router>
        <ShadcnToaster />
        <SonnerToaster />
      </UserProvider>
    </AuthProvider>
  );
}

export default App;