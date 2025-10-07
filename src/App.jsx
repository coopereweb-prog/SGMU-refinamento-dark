import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserProvider } from '@/contexts/UserContext';
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AppLayout } from '@/components/AppLayout';
import HomePage from '@/pages/HomePage';
import { AdminPage } from '@/pages/AdminPage';
import { ManagePointsPage } from '@/pages/ManagePointsPage';
import { ManageTagsPage } from '@/pages/ManageTagsPage';
import { ManageUsersPage } from '@/pages/ManageUsersPage';
import LoginPage from '@/pages/LoginPage';
import UpdatePasswordPage from '@/pages/UpdatePasswordPage';
import FieldTechnicianPage from '@/pages/FieldTechnicianPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ClientDashboardPage from '@/pages/ClientDashboardPage';
import { ManageOrdersPage } from '@/pages/ManageOrdersPage';
import { ManagePricingPage } from '@/pages/ManagePricingPage';
import OrderDetailPage from '@/pages/OrderDetailPage'; // Nova importação

function App() {
  const ADMIN_ROLES = ['admin', 'operations_manager'];
  const TECHNICIAN_ROLES = ['admin', 'operations_manager', 'field_technician'];

  return (
    <Router>
      <AuthProvider>
        <UserProvider>
          <Routes>
            {/* Rotas com o layout principal (cabeçalho, etc.) */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientDashboardPage />
                </ProtectedRoute>
              } />
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
              <Route path="/admin/orders" element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <ManageOrdersPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/orders/:orderId" element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <OrderDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/pricing" element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <ManagePricingPage />
                </ProtectedRoute>
              } />
            </Route>

            {/* Rotas de página inteira (sem o layout principal) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/update-password" element={<UpdatePasswordPage />} />
            <Route path="/technician-panel" element={
              <ProtectedRoute allowedRoles={TECHNICIAN_ROLES}>
                <FieldTechnicianPage />
              </ProtectedRoute>
            } />
          </Routes>
          <SonnerToaster />
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;